import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

export const inngest = new Inngest({ id: "fulloppstore" });

/* -----------------------------
   🟢 CREATE USER (Clerk → Mongo)
------------------------------ */
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      await connectDB();

      const userData = {
        clerkId: id, // ✅ store Clerk’s ID safely
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        email: email_addresses?.[0]?.email_address || "",
        imageUri: image_url,
      };

      await User.create(userData);

      console.log("✅ User created:", userData.clerkId);
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw error;
    }
  }
);

/* -----------------------------
   🟡 UPDATE USER (Clerk → Mongo)
------------------------------ */
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      await connectDB();

      const updateData = {
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        email: email_addresses?.[0]?.email_address || "",
        imageUri: image_url,
      };

      const updatedUser = await User.findOneAndUpdate(
        { clerkId: id },   // ✅ match Clerk ID
        updateData,
        { new: true }
      );

      console.log("✅ User updated:", updatedUser?.clerkId || id);
    } catch (error) {
      console.error("❌ Error updating user:", error);
      throw error;
    }
  }
);

/* -----------------------------
   🔴 DELETE USER (Clerk → Mongo)
------------------------------ */
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const { id } = event.data;

      await connectDB();

      await User.findOneAndDelete({ clerkId: id }); // ✅ delete by Clerk ID

      console.log("✅ User deleted:", id);
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      throw error;
    }
  }
);
