// Machine Booking System API Routes
import { Router } from "express";
import { db } from "./db";
import { 
  machineBookings, 
  bookingSettings,
  machineAssets,
  machineSlots,
  laundromats,
  users,
  insertMachineBookingSchema,
  insertBookingSettingsSchema,
  insertMachineSlotSchema
} from "@shared/schema";
import { eq, and, gte, lte, desc, asc, inArray, or, sql } from "drizzle-orm";
import { isAuthenticated } from "./replitAuth";
import crypto from "crypto";

const router = Router();

// Generate unique check-in code
function generateCheckInCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// Helper to format time string
function formatTime(hour: number, minute: number = 0): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// ============================================================================
// PUBLIC ROUTES (Customer Booking)
// ============================================================================

// Get available locations for booking
router.get("/api/bookings/locations", async (req, res) => {
  try {
    const locations = await db
      .select({
        id: laundromats.id,
        name: laundromats.name,
        address: laundromats.address,
        city: laundromats.city,
        state: laundromats.state,
      })
      .from(laundromats)
      .where(eq(laundromats.isActive, true))
      .orderBy(asc(laundromats.name));
    
    res.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Get machines available for booking at a location
router.get("/api/bookings/machines/:locationId", async (req, res) => {
  try {
    const { locationId } = req.params;
    const { type } = req.query;
    
    let query = db
      .select({
        id: machineAssets.id,
        machineNumber: machineAssets.machineNumber,
        machineName: machineAssets.machineName,
        machineType: machineAssets.machineType,
        manufacturer: machineAssets.manufacturer,
        model: machineAssets.model,
        capacity: machineAssets.capacity,
        status: machineAssets.status,
      })
      .from(machineAssets)
      .where(
        and(
          eq(machineAssets.laundromatId, locationId),
          eq(machineAssets.status, "operational"),
          type ? eq(machineAssets.machineType, type as string) : undefined
        )
      )
      .orderBy(asc(machineAssets.machineNumber));
    
    const machines = await query;
    res.json(machines);
  } catch (error) {
    console.error("Error fetching machines:", error);
    res.status(500).json({ error: "Failed to fetch machines" });
  }
});

// Get availability for a specific machine on a date
router.get("/api/bookings/availability/:machineId/:date", async (req, res) => {
  try {
    const { machineId, date } = req.params;
    
    // Get machine info
    const [machine] = await db
      .select()
      .from(machineAssets)
      .where(eq(machineAssets.id, machineId));
    
    if (!machine) {
      return res.status(404).json({ error: "Machine not found" });
    }
    
    // Default settings for the location
    const slotDuration = 60;
    const openTime = "06:00";
    const closeTime = "22:00";
    const maxAdvanceBookingDays = 7;
    const gracePeriodMinutes = 10;
    const peakHours = "17:00-20:00";
    const standardRate = "3.00";
    const peakRate = "4.50";
    
    // Get existing bookings for this machine on this date
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);
    
    const existingBookings = await db
      .select({
        id: machineBookings.id,
        startTime: machineBookings.startTime,
        endTime: machineBookings.endTime,
        status: machineBookings.status,
      })
      .from(machineBookings)
      .where(
        and(
          eq(machineBookings.machineId, machineId),
          eq(machineBookings.bookingDate, startOfDay),
          inArray(machineBookings.status, ["pending", "confirmed", "checked_in"])
        )
      )
      .orderBy(asc(machineBookings.startTime));
    
    // Generate available slots
    const slots = [];
    const [openHour, openMin] = openTime.split(":").map(Number);
    const [closeHour, closeMin] = closeTime.split(":").map(Number);
    
    // Parse peak hours
    const peakStart = 17;
    const peakEnd = 20;
    
    let currentHour = openHour;
    let currentMin = openMin;
    
    const now = new Date();
    const isToday = date === now.toISOString().split('T')[0];
    
    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
      const slotStartTime = formatTime(currentHour, currentMin);
      const slotEndHour = Math.floor((currentHour * 60 + currentMin + slotDuration) / 60);
      const slotEndMin = (currentHour * 60 + currentMin + slotDuration) % 60;
      const slotEndTime = formatTime(slotEndHour, slotEndMin);
      
      const slotStartDate = new Date(`${date}T${slotStartTime}:00`);
      const slotEndDate = new Date(`${date}T${slotEndTime}:00`);
      
      // Check if slot is in the past
      const isPast = isToday && slotStartDate <= now;
      
      // Check if slot is booked
      const isBooked = existingBookings.some(booking => {
        return slotStartTime === booking.startTime || 
          (slotStartTime > (booking.startTime || "") && slotStartTime < (booking.endTime || ""));
      });
      
      // Determine pricing type
      const isPeak = currentHour >= peakStart && currentHour < peakEnd;
      const pricingType = isPeak ? "peak" : "standard";
      const rate = isPeak ? peakRate : standardRate;
      
      slots.push({
        startTime: slotStartDate.toISOString(),
        endTime: slotEndDate.toISOString(),
        duration: slotDuration,
        available: !isBooked && !isPast,
        pricingType,
        isBlocked: false,
        isBooked,
        isPast,
        rate,
      });
      
      // Move to next slot
      currentMin += slotDuration;
      while (currentMin >= 60) {
        currentHour++;
        currentMin -= 60;
      }
    }
    
    res.json({
      machine: {
        id: machine.id,
        machineNumber: machine.machineNumber,
        machineName: machine.machineName,
        machineType: machine.machineType,
        manufacturer: machine.manufacturer,
        model: machine.model,
        capacity: machine.capacity,
        status: machine.status,
      },
      date,
      settings: {
        slotDuration,
        openTime,
        closeTime,
        gracePeriodMinutes,
        maxAdvanceBookingDays,
      },
      slots,
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// Create a new booking
router.post("/api/bookings", async (req, res) => {
  try {
    const { 
      machineId, 
      startTime, 
      endTime, 
      duration, 
      amount,
      pricingType,
      customerName,
      customerEmail,
      customerPhone,
      isPaid
    } = req.body;
    
    // Validate required fields
    if (!machineId || !startTime || !endTime || !duration) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Get machine info
    const [machine] = await db
      .select()
      .from(machineAssets)
      .where(eq(machineAssets.id, machineId));
    
    if (!machine) {
      return res.status(404).json({ error: "Machine not found" });
    }
    
    // Generate check-in code
    const checkInCode = generateCheckInCode();
    
    // Get booking date
    const bookingDate = new Date(startTime);
    bookingDate.setHours(0, 0, 0, 0);
    
    // Format start/end times as HH:MM
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const startTimeStr = formatTime(startDate.getHours(), startDate.getMinutes());
    const endTimeStr = formatTime(endDate.getHours(), endDate.getMinutes());
    
    // Get user ID if authenticated
    const userId = (req as any).user?.claims?.sub || null;
    
    // Check for overlapping bookings (overbooking protection)
    const existingBookings = await db
      .select()
      .from(machineBookings)
      .where(
        and(
          eq(machineBookings.machineId, machineId),
          eq(machineBookings.bookingDate, bookingDate),
          eq(machineBookings.startTime, startTimeStr),
          inArray(machineBookings.status, ["pending", "confirmed", "checked_in"])
        )
      );
    
    if (existingBookings.length > 0) {
      return res.status(409).json({ error: "This time slot is already booked" });
    }
    
    // Create booking
    const [newBooking] = await db
      .insert(machineBookings)
      .values({
        userId: userId || machine.laundromatId, // Fallback to laundromat ID if no user
        machineId,
        customerId: userId,
        bookingDate,
        startTime: startTimeStr,
        endTime: endTimeStr,
        duration,
        customerName,
        customerPhone,
        customerEmail,
        status: "confirmed",
        bookingFee: amount || "0",
        notes: `Check-in Code: ${checkInCode}`,
      })
      .returning();
    
    res.status(201).json({
      id: newBooking.id,
      machineId: newBooking.machineId,
      startTime: newBooking.startTime,
      endTime: newBooking.endTime,
      duration: newBooking.duration,
      status: newBooking.status,
      checkInCode,
      createdAt: newBooking.createdAt,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// Get customer's bookings
router.get("/api/bookings/my-bookings", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    
    const bookings = await db
      .select({
        booking: machineBookings,
        machine: {
          id: machineAssets.id,
          machineNumber: machineAssets.machineNumber,
          machineName: machineAssets.machineName,
          machineType: machineAssets.machineType,
        },
      })
      .from(machineBookings)
      .leftJoin(machineAssets, eq(machineBookings.machineId, machineAssets.id))
      .where(eq(machineBookings.customerId, userId))
      .orderBy(desc(machineBookings.bookingDate));
    
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Cancel a booking
router.post("/api/bookings/:bookingId/cancel", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    const [booking] = await db
      .select()
      .from(machineBookings)
      .where(eq(machineBookings.id, bookingId));
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    if (booking.status === "cancelled") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }
    
    if (booking.status === "completed") {
      return res.status(400).json({ error: "Cannot cancel a completed booking" });
    }
    
    const [updatedBooking] = await db
      .update(machineBookings)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: reason || "Cancelled by user",
      })
      .where(eq(machineBookings.id, bookingId))
      .returning();
    
    res.json(updatedBooking);
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

// Check-in for a booking
router.post("/api/bookings/:bookingId/check-in", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { code } = req.body;
    
    const [booking] = await db
      .select()
      .from(machineBookings)
      .where(eq(machineBookings.id, bookingId));
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    if (booking.status !== "confirmed") {
      return res.status(400).json({ error: `Cannot check-in. Booking status is ${booking.status}` });
    }
    
    const [updatedBooking] = await db
      .update(machineBookings)
      .set({
        status: "checked_in",
        checkedInAt: new Date(),
      })
      .where(eq(machineBookings.id, bookingId))
      .returning();
    
    res.json({
      ...updatedBooking,
      message: "Check-in successful. Your machine is ready to use.",
    });
  } catch (error) {
    console.error("Error checking in:", error);
    res.status(500).json({ error: "Failed to check in" });
  }
});

// Check-in by code
router.post("/api/bookings/check-in-by-code", async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: "Check-in code is required" });
    }
    
    // Find booking with this code in notes
    const bookings = await db
      .select()
      .from(machineBookings)
      .where(
        and(
          sql`${machineBookings.notes} LIKE ${`%${code}%`}`,
          eq(machineBookings.status, "confirmed")
        )
      );
    
    if (bookings.length === 0) {
      return res.status(404).json({ error: "No booking found with this code" });
    }
    
    const booking = bookings[0];
    
    const [updatedBooking] = await db
      .update(machineBookings)
      .set({
        status: "checked_in",
        checkedInAt: new Date(),
      })
      .where(eq(machineBookings.id, booking.id))
      .returning();
    
    res.json({
      ...updatedBooking,
      message: "Check-in successful. Your machine is ready to use.",
    });
  } catch (error) {
    console.error("Error checking in by code:", error);
    res.status(500).json({ error: "Failed to check in" });
  }
});

// ============================================================================
// OPERATOR MANAGEMENT ROUTES (Protected)
// ============================================================================

// Get booking statistics
router.get("/api/booking-management/stats", isAuthenticated, async (req: any, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all bookings counts
    const [allBookings] = await db
      .select({ count: sql<number>`count(*)` })
      .from(machineBookings);
    
    const [todayBookings] = await db
      .select({ count: sql<number>`count(*)` })
      .from(machineBookings)
      .where(gte(machineBookings.bookingDate, today));
    
    const [confirmedBookings] = await db
      .select({ count: sql<number>`count(*)` })
      .from(machineBookings)
      .where(eq(machineBookings.status, "confirmed"));
    
    const [completedBookings] = await db
      .select({ count: sql<number>`count(*)` })
      .from(machineBookings)
      .where(eq(machineBookings.status, "completed"));
    
    const [noShows] = await db
      .select({ count: sql<number>`count(*)` })
      .from(machineBookings)
      .where(eq(machineBookings.status, "no_show"));
    
    const [cancelledBookings] = await db
      .select({ count: sql<number>`count(*)` })
      .from(machineBookings)
      .where(eq(machineBookings.status, "cancelled"));
    
    // Calculate revenue from completed bookings
    const [revenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(${machineBookings.bookingFee} AS DECIMAL)), 0)` })
      .from(machineBookings)
      .where(eq(machineBookings.status, "completed"));
    
    res.json({
      totalBookings: Number(allBookings?.count || 0),
      todayBookings: Number(todayBookings?.count || 0),
      confirmedBookings: Number(confirmedBookings?.count || 0),
      completedBookings: Number(completedBookings?.count || 0),
      noShows: Number(noShows?.count || 0),
      cancelledBookings: Number(cancelledBookings?.count || 0),
      revenue: Number(revenue?.total || 0),
    });
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    res.status(500).json({ error: "Failed to fetch booking statistics" });
  }
});

// Get all bookings for management
router.get("/api/booking-management/bookings", isAuthenticated, async (req: any, res) => {
  try {
    const { locationId, date, status } = req.query;
    
    let whereConditions: any[] = [];
    
    if (locationId && locationId !== "all") {
      whereConditions.push(eq(machineAssets.laundromatId, locationId as string));
    }
    
    if (date) {
      const selectedDate = new Date(date as string);
      selectedDate.setHours(0, 0, 0, 0);
      whereConditions.push(eq(machineBookings.bookingDate, selectedDate));
    }
    
    if (status && status !== "all") {
      whereConditions.push(eq(machineBookings.status, status as string));
    }
    
    const bookings = await db
      .select({
        booking: machineBookings,
        machine: {
          id: machineAssets.id,
          machineNumber: machineAssets.machineNumber,
          machineName: machineAssets.machineName,
          machineType: machineAssets.machineType,
        },
        location: {
          id: laundromats.id,
          name: laundromats.name,
        },
        customer: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(machineBookings)
      .leftJoin(machineAssets, eq(machineBookings.machineId, machineAssets.id))
      .leftJoin(laundromats, eq(machineAssets.laundromatId, laundromats.id))
      .leftJoin(users, eq(machineBookings.customerId, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(machineBookings.bookingDate), asc(machineBookings.startTime))
      .limit(100);
    
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings for management:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Mark booking as no-show
router.post("/api/booking-management/:bookingId/no-show", isAuthenticated, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const [booking] = await db
      .select()
      .from(machineBookings)
      .where(eq(machineBookings.id, bookingId));
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    const [updatedBooking] = await db
      .update(machineBookings)
      .set({
        status: "no_show",
        updatedAt: new Date(),
      })
      .where(eq(machineBookings.id, bookingId))
      .returning();
    
    res.json(updatedBooking);
  } catch (error) {
    console.error("Error marking booking as no-show:", error);
    res.status(500).json({ error: "Failed to mark booking as no-show" });
  }
});

// Complete a booking
router.post("/api/booking-management/:bookingId/complete", isAuthenticated, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const [booking] = await db
      .select()
      .from(machineBookings)
      .where(eq(machineBookings.id, bookingId));
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    const [updatedBooking] = await db
      .update(machineBookings)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(machineBookings.id, bookingId))
      .returning();
    
    res.json(updatedBooking);
  } catch (error) {
    console.error("Error completing booking:", error);
    res.status(500).json({ error: "Failed to complete booking" });
  }
});

// ============================================================================
// SLOT BLOCKING ROUTES (Maintenance/Operator Management)
// ============================================================================

// Get blocked slots for a machine
router.get("/api/booking-management/blocked-slots/:machineId", isAuthenticated, async (req: any, res) => {
  try {
    const { machineId } = req.params;
    const { date } = req.query;
    
    let whereConditions = [eq(machineSlots.machineId, machineId)];
    
    if (date) {
      const selectedDate = new Date(date as string);
      selectedDate.setHours(0, 0, 0, 0);
      whereConditions.push(eq(machineSlots.date, selectedDate));
    }
    
    const blockedSlots = await db
      .select()
      .from(machineSlots)
      .where(and(...whereConditions, eq(machineSlots.isBlocked, true)))
      .orderBy(asc(machineSlots.date), asc(machineSlots.startTime));
    
    res.json(blockedSlots);
  } catch (error) {
    console.error("Error fetching blocked slots:", error);
    res.status(500).json({ error: "Failed to fetch blocked slots" });
  }
});

// Block a time slot for maintenance
router.post("/api/booking-management/block-slot", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { machineId, date, startTime, endTime, blockReason } = req.body;
    
    if (!machineId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);
    
    // Check if there are existing bookings in this time slot
    const conflictingBookings = await db
      .select()
      .from(machineBookings)
      .where(
        and(
          eq(machineBookings.machineId, machineId),
          eq(machineBookings.bookingDate, slotDate),
          inArray(machineBookings.status, ["pending", "confirmed"]),
          or(
            and(
              gte(machineBookings.startTime, startTime),
              lte(machineBookings.startTime, endTime)
            ),
            and(
              gte(machineBookings.endTime, startTime),
              lte(machineBookings.endTime, endTime)
            )
          )
        )
      );
    
    if (conflictingBookings.length > 0) {
      return res.status(400).json({ 
        error: "Cannot block slot with existing bookings",
        conflictingBookings: conflictingBookings.length
      });
    }
    
    // Create blocked slot
    const [blockedSlot] = await db
      .insert(machineSlots)
      .values({
        userId: userId,
        machineId,
        date: slotDate,
        startTime,
        endTime,
        isBlocked: true,
        blockReason: blockReason || "Maintenance",
      })
      .returning();
    
    res.json(blockedSlot);
  } catch (error) {
    console.error("Error blocking slot:", error);
    res.status(500).json({ error: "Failed to block slot" });
  }
});

// Unblock a time slot
router.delete("/api/booking-management/block-slot/:slotId", isAuthenticated, async (req, res) => {
  try {
    const { slotId } = req.params;
    
    const [deletedSlot] = await db
      .delete(machineSlots)
      .where(eq(machineSlots.id, slotId))
      .returning();
    
    if (!deletedSlot) {
      return res.status(404).json({ error: "Slot not found" });
    }
    
    res.json({ success: true, deletedSlot });
  } catch (error) {
    console.error("Error unblocking slot:", error);
    res.status(500).json({ error: "Failed to unblock slot" });
  }
});

// Get all blocked slots for a location (for calendar view)
router.get("/api/booking-management/all-blocked-slots", isAuthenticated, async (req: any, res) => {
  try {
    const { locationId, startDate, endDate } = req.query;
    
    let whereConditions: any[] = [eq(machineSlots.isBlocked, true)];
    
    if (startDate) {
      const start = new Date(startDate as string);
      whereConditions.push(gte(machineSlots.date, start));
    }
    
    if (endDate) {
      const end = new Date(endDate as string);
      whereConditions.push(lte(machineSlots.date, end));
    }
    
    const blockedSlots = await db
      .select({
        slot: machineSlots,
        machine: {
          id: machineAssets.id,
          machineNumber: machineAssets.machineNumber,
          machineType: machineAssets.machineType,
        },
      })
      .from(machineSlots)
      .leftJoin(machineAssets, eq(machineSlots.machineId, machineAssets.id))
      .where(and(...whereConditions))
      .orderBy(asc(machineSlots.date), asc(machineSlots.startTime));
    
    res.json(blockedSlots);
  } catch (error) {
    console.error("Error fetching all blocked slots:", error);
    res.status(500).json({ error: "Failed to fetch blocked slots" });
  }
});

export default router;
