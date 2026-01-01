// server/utils/webhook-cache.ts

// Idempotency cache to prevent duplicate processing of the same webhook
const processedWebhookEvents = new Map<string, number>();
const WEBHOOK_EVENT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function isEventProcessed(eventId: string): boolean {
  const processedAt = processedWebhookEvents.get(eventId);
  if (processedAt) {
    console.log(`⚠️ Duplicate webhook event detected: ${eventId}`);
    return true;
  }
  return false;
}

export function markEventProcessed(eventId: string): void {
  processedWebhookEvents.set(eventId, Date.now());
  
  // Clean up cache every 100 events
  if (processedWebhookEvents.size % 100 === 0) {
    const now = Date.now();
    for (const [id, timestamp] of processedWebhookEvents.entries()) {
      if (now - timestamp > WEBHOOK_EVENT_TTL_MS) {
        processedWebhookEvents.delete(id);
      }
    }
  }
}