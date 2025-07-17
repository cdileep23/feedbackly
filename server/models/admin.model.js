import mongoose from "mongoose";
const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const  adminModel=mongoose.model("admin",adminSchema)
export default adminModel;

