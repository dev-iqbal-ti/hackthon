// backend/src/config/db.js
import { connect } from "mongoose";

const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGODB_URI, {});

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
