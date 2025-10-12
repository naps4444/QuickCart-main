import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
export const inngest = new Inngest({ id: "fulloppstore" });

// Inngest function to save user data to the database
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const userData = {
        _id: id,
        name: `${first_name} ${last_name}`,
        email: email_addresses?.[0]?.email_address || "",
        imageUri: image_url,
      };

      await connectDB();
      await User.create(userData);

      console.log("✅ User created:", userData._id);
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw error;
    }
  }
);

// Inngest function to update user data in the database
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const userData = {
        name: `${first_name} ${last_name}`,
        email: email_addresses?.[0]?.email_address || "",
        imageUri: image_url,
      };

      await connectDB();
      await User.findByIdAndUpdate(id, userData, { new: true });

      console.log("✅ User updated:", id);
    } catch (error) {
      console.error("❌ Error updating user:", error);
      throw error;
    }
  }
);

// Inngest function to delete user data from the database
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const { id } = event.data;

      await connectDB();
      await User.findByIdAndDelete(id);

      console.log("✅ User deleted:", id);
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      throw error;
    }
  }
);
