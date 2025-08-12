import "dotenv/config";
import { connectDB } from "./library/db.js";
import app from "./app.js";

const port = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

start();

