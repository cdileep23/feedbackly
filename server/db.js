import { connect } from "mongoose";

const connectDB = async () => {
  const DB_URL = process.env.DATABSE_URL;
  try {
    await connect(DB_URL);
    console.log("DATABASE CONNECTED ✅");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
