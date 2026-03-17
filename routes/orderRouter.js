import express from 'express';
import { cancelOrder, createOrder, getOrders, getUserOrders, updateOrderStatus } from '../controllers/orderController.js';
import { verifyToken } from '../middleware/auth.js';

const orderRouter = express.Router();

orderRouter.post("/", createOrder)
orderRouter.get("/",getOrders)
orderRouter.put("/status/:orderID",updateOrderStatus)
orderRouter.get("/", verifyToken, getUserOrders);
orderRouter.put("/cancel/:orderID", verifyToken, cancelOrder);
export default orderRouter;