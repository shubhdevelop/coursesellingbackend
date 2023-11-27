import mongoose from "mongoose";
import { DB_NAME } from "../utils/constants.js";

const connectDB = async () => {
  try {
    console.log(process.env.MONGO_URI);
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      connectionInstance.connection.host,
      "Connected to the DataBase Successfuly!!"
    );
  } catch (error) {
    console.log("MONGODB connection FAILED: ", error);
    process.exit(1);
  }
};

export default connectDB;
