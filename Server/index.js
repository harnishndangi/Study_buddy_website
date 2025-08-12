
import "dotenv/config";
import { connectDB } from "./library/db.js";
import app from "./app.js";
import serverless from "serverless-http";

let isConnected = false;

const handler = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};

export default serverless(handler);

