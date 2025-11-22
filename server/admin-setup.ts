// Admin account setup script
// Run: npx tsx server/admin-setup.ts

import { storage } from "./storage";
import * as bcrypt from "bcrypt";

const ADMIN_ACCOUNTS = [
  {
    email: "nick@washbizhub.com",
    password: "admin2024",
    firstName: "Nick",
    lastName: "Admin",
  },
  {
    email: "larry@washbizhub.com",
    password: "admin2025",
    firstName: "Larry",
    lastName: "Larsen",
  },
];

async function setupAdmins() {
  console.log("Setting up admin accounts...");
  
  try {
    for (const account of ADMIN_ACCOUNTS) {
      console.log(`Creating admin: ${account.email}`);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(account.password, 10);
      
      // Create admin user
      await storage.upsertUser({
        id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        isAdmin: true,
        // Store hashed password in a custom field (you'd need to add this to schema)
        // For now, we'll use username as a flag
        username: `admin:${hashedPassword}`,
      });
      
      console.log(`✓ Admin created: ${account.email}`);
    }
    
    console.log("✓ All admin accounts created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up admins:", error);
    process.exit(1);
  }
}

setupAdmins();
