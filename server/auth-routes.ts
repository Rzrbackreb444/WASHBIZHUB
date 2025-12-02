import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

const router = Router();

// Generate a random token
function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// Register with email/password
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    
    if (existingUser.length > 0) {
      // Check if they have a password (email/password user) or just OAuth
      if (existingUser[0].passwordHash) {
        return res.status(400).json({ error: "An account with this email already exists. Please sign in." });
      } else {
        // User exists via OAuth, add password to their account
        const passwordHash = await bcrypt.hash(password, 12);
        await db.update(users)
          .set({ 
            passwordHash,
            firstName: firstName || existingUser[0].firstName,
            lastName: lastName || existingUser[0].lastName,
          })
          .where(eq(users.id, existingUser[0].id));
        
        // Set session
        (req as any).session.userId = existingUser[0].id;
        
        return res.json({ 
          success: true, 
          message: "Password added to your account",
          user: { 
            id: existingUser[0].id, 
            email: existingUser[0].email,
            firstName: existingUser[0].firstName,
            lastName: existingUser[0].lastName,
          }
        });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create new user
    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase(),
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      emailVerified: false,
    }).returning();

    // Set session
    (req as any).session.userId = newUser.id;

    res.json({ 
      success: true, 
      message: "Account created successfully",
      user: { 
        id: newUser.id, 
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// Login with email/password
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ 
        error: "This account uses social login. Please sign in with Replit or set a password." 
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Set session
    (req as any).session.userId = user.id;

    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isPro: user.isPro,
        subscriptionTier: user.subscriptionTier,
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// Get current user (for email/password sessions)
router.get("/me", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      profileImageUrl: user.profileImageUrl,
      isPro: user.isPro,
      isAdmin: user.isAdmin,
      subscriptionTier: user.subscriptionTier,
      cleanbiTier: user.cleanbiTier,
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Logout
router.post("/logout", (req: Request, res: Response) => {
  (req as any).session.destroy((err: any) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

export default router;
