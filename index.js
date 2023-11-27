import dotenv from "dotenv";
dotenv.config({
  path: "./env",
});

import app from "./app.js";
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error("ERROR!!", err);
      throw err;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`App is listening on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed!!", err);
  });
