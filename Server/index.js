
import "dotenv/config";
import { connectDB } from "./library/db.js";
import { app } from "./app.js";
import serverless from "serverless-http";


let isConnected = false;

const connectOnce = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

const handler = async (event, context) => {
  await connectOnce();
  return serverless(app)(event, context);
};

export default handler;

