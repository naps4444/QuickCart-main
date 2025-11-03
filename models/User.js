import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    imageUri: { type: String, required: true },
    cartItems: { type: Object, default: {} },
    role: { type: String, default: "user" },
  isSeller: { type: Boolean, default: false },
  },
  { minimize: false }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
