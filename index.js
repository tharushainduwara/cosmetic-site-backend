import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import jwt from "jsonwebtoken";
import productRouter from "./routes/productRouter.js";
import cors from "cors";
import dotenv from "dotenv";
import orderRouter from "./routes/orderRouter.js";
import subscribeRouter from "./routes/subscribeRouter.js";
import contactRouter from "./routes/contactRouter.js";
import reviewRouter from "./routes/reviewRouter.js"; // ← NEW

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Global JWT middleware
app.use((req, res, next) => {
  let token = req.header("Authorization");

  if (token != null) {
    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (decoded == null) {
        res.json({ message: "Invalid token please login again" });
        return;
      } else {
        req.user = decoded;
      }
    });
  }
  next();
});

const connectionString = process.env.MONGO_URI;

mongoose
  .connect(connectionString)
  .then(() => console.log("Database Connected"))
  .catch(() => console.log("Database Connection Failed"));

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/subscribe", subscribeRouter);
app.use("/api/contact", contactRouter);
app.use("/api/reviews", reviewRouter); 

app.listen(5000, () => console.log("Server is started"));