import "dotenv/config";
import { connectDB } from "../Server/library/db.js";
import app from "../Server/app.js";

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
}
