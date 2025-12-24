import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { IncomingMessage } from "http";
import { getUserEntitlements } from "./entitlements";
import { db } from "./db";
import { users, contentDocuments } from "@shared/schema";
import { eq } from "drizzle-orm";
import cookie from "cookie";
import { createHmac, timingSafeEqual } from "crypto";
import { Pool } from "@neondatabase/serverless";

interface CollaborationClient {
  ws: WebSocket;
  documentId: string;
  userId: string;
  userEmail: string;
  userName: string;
  cursor?: { blockId: string; position: number };
}

interface CollaborationMessage {
  type: "join" | "leave" | "cursor" | "update" | "presence" | "sync";
  documentId: string;
  userId?: string;
  userName?: string;
  data?: any;
}

const documentClients: Map<string, Set<CollaborationClient>> = new Map();
const clientsBySocket: Map<WebSocket, CollaborationClient> = new Map();
const authenticatedSockets: Map<WebSocket, { userId: string; userEmail: string; userName: string }> = new Map();

function verifySignedCookie(signedValue: string, secret: string): string | null {
  if (!signedValue.startsWith('s:')) return null;
  
  const value = signedValue.slice(2);
  const dotIndex = value.lastIndexOf('.');
  if (dotIndex === -1) return null;
  
  const sessionId = value.slice(0, dotIndex);
  const signature = value.slice(dotIndex + 1);
  
  const expectedSignature = createHmac('sha256', secret)
    .update(sessionId)
    .digest('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  try {
    const sigBuffer = Buffer.from(signature, 'base64');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64');
    
    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;
    
    return sessionId;
  } catch {
    return null;
  }
}

async function verifySessionFromCookie(req: IncomingMessage): Promise<{ userId: string; email: string; firstName?: string; lastName?: string } | null> {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;
    
    const cookies = cookie.parse(cookieHeader);
    const signedSessionId = cookies['connect.sid'];
    if (!signedSessionId) return null;
    
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
      console.error("[Collaboration] SESSION_SECRET not configured");
      return null;
    }
    
    const sessionId = verifySignedCookie(signedSessionId, sessionSecret);
    if (!sessionId) {
      console.warn("[Collaboration] Invalid session signature");
      return null;
    }
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query(
      'SELECT sess, expire FROM session WHERE sid = $1',
      [sessionId]
    );
    await pool.end();
    
    if (result.rows.length === 0) return null;
    
    const { sess: sessionData, expire } = result.rows[0];
    
    if (new Date(expire) < new Date()) {
      console.warn("[Collaboration] Session expired");
      return null;
    }
    
    if (sessionData.passport?.user?.claims) {
      const claims = sessionData.passport.user.claims;
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, claims.sub))
        .limit(1);
      
      if (user) {
        return {
          userId: user.id,
          email: user.email || claims.email,
          firstName: user.firstName || claims.first_name,
          lastName: user.lastName || claims.last_name,
        };
      }
    }
    
    if (sessionData.userId) {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, sessionData.userId))
        .limit(1);
      
      if (user) {
        return {
          userId: user.id,
          email: user.email || '',
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("[Collaboration] Session verification error:", error);
    return null;
  }
}

export function setupCollaborationServer(server: Server) {
  const wss = new WebSocketServer({ 
    server, 
    path: "/ws/collaboration",
  });

  wss.on("connection", (ws: WebSocket, req) => {
    console.log("[Collaboration] New WebSocket connection");

    ws.on("message", async (data) => {
      try {
        const message: CollaborationMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case "join":
            await handleJoin(ws, message, req);
            break;
          case "leave":
            handleLeave(ws);
            break;
          case "cursor":
            handleCursor(ws, message);
            break;
          case "update":
            handleUpdate(ws, message);
            break;
          default:
            console.warn("[Collaboration] Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("[Collaboration] Error processing message:", error);
      }
    });

    ws.on("close", () => {
      handleLeave(ws);
      authenticatedSockets.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("[Collaboration] WebSocket error:", error);
      handleLeave(ws);
      authenticatedSockets.delete(ws);
    });
  });

  console.log("✅ Real-time collaboration WebSocket server initialized");
  return wss;
}

async function handleJoin(ws: WebSocket, message: CollaborationMessage, req?: IncomingMessage) {
  const { documentId } = message;
  
  if (!documentId) {
    ws.send(JSON.stringify({ type: "error", message: "Missing documentId" }));
    return;
  }
  
  if (!req) {
    ws.send(JSON.stringify({ type: "error", message: "Invalid connection" }));
    ws.close();
    return;
  }
  
  const sessionUser = await verifySessionFromCookie(req);
  if (!sessionUser) {
    ws.send(JSON.stringify({ type: "error", message: "Authentication required" }));
    ws.close();
    return;
  }
  
  const { userId, email: userEmail, firstName, lastName } = sessionUser;
  const userName = [firstName, lastName].filter(Boolean).join(' ') || userEmail || "Anonymous";
  
  try {
    const entitlements = await getUserEntitlements(userId, userEmail);
    if (!entitlements.features.realTimeCollab) {
      ws.send(JSON.stringify({ 
        type: "error", 
        message: "Real-time collaboration requires Enterprise subscription" 
      }));
      ws.close();
      return;
    }
    
    const [doc] = await db.select()
      .from(contentDocuments)
      .where(eq(contentDocuments.id, documentId))
      .limit(1);
    
    if (!doc) {
      ws.send(JSON.stringify({ type: "error", message: "Document not found" }));
      ws.close();
      return;
    }
    
    const isAuthor = doc.authorId === userId || doc.authorEmail === userEmail;
    const isCollaborator = doc.collaboratorIds?.includes(userId) || doc.collaboratorIds?.includes(userEmail);
    
    if (!isAuthor && !isCollaborator) {
      ws.send(JSON.stringify({ type: "error", message: "Access denied to this document" }));
      ws.close();
      return;
    }
  } catch (error) {
    console.error("[Collaboration] Entitlement check failed:", error);
    ws.send(JSON.stringify({ type: "error", message: "Authorization failed" }));
    ws.close();
    return;
  }

  const client: CollaborationClient = {
    ws,
    documentId,
    userId,
    userEmail,
    userName,
  };

  clientsBySocket.set(ws, client);
  authenticatedSockets.set(ws, { userId, userEmail, userName });

  if (!documentClients.has(documentId)) {
    documentClients.set(documentId, new Set());
  }
  documentClients.get(documentId)!.add(client);

  const presence = getDocumentPresence(documentId);
  
  ws.send(JSON.stringify({
    type: "sync",
    documentId,
    data: { presence },
  }));

  broadcastToDocument(documentId, {
    type: "presence",
    documentId,
    data: { 
      action: "joined",
      userId,
      userName,
      presence,
    },
  }, ws);

  console.log(`[Collaboration] ${userName} (${userEmail}) joined document ${documentId}`);
}

function handleLeave(ws: WebSocket) {
  const client = clientsBySocket.get(ws);
  if (!client) return;

  const { documentId, userId, userName } = client;
  
  documentClients.get(documentId)?.delete(client);
  clientsBySocket.delete(ws);

  if (documentClients.get(documentId)?.size === 0) {
    documentClients.delete(documentId);
  }

  broadcastToDocument(documentId, {
    type: "presence",
    documentId,
    data: { 
      action: "left",
      userId,
      userName,
      presence: getDocumentPresence(documentId),
    },
  });

  console.log(`[Collaboration] ${userName} left document ${documentId}`);
}

function handleCursor(ws: WebSocket, message: CollaborationMessage) {
  const client = clientsBySocket.get(ws);
  if (!client) return;

  client.cursor = message.data?.cursor;

  broadcastToDocument(client.documentId, {
    type: "cursor",
    documentId: client.documentId,
    userId: client.userId,
    userName: client.userName,
    data: { cursor: client.cursor },
  }, ws);
}

function handleUpdate(ws: WebSocket, message: CollaborationMessage) {
  const client = clientsBySocket.get(ws);
  if (!client) return;

  broadcastToDocument(client.documentId, {
    type: "update",
    documentId: client.documentId,
    userId: client.userId,
    userName: client.userName,
    data: message.data,
  }, ws);
}

function broadcastToDocument(documentId: string, message: CollaborationMessage, exclude?: WebSocket) {
  const clients = documentClients.get(documentId);
  if (!clients) return;

  const messageStr = JSON.stringify(message);
  
  clients.forEach(client => {
    if (client.ws !== exclude && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
}

function getDocumentPresence(documentId: string): Array<{ userId: string; userName: string; cursor?: any }> {
  const clients = documentClients.get(documentId);
  if (!clients) return [];

  return Array.from(clients).map(client => ({
    userId: client.userId,
    userName: client.userName,
    cursor: client.cursor,
  }));
}

export function getActiveCollaborators(documentId: string): number {
  return documentClients.get(documentId)?.size || 0;
}
