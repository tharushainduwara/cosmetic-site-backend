import express from "express";
import {
  createReview,
  deleteReview,
  getAllReviews,
  getMyReviews,
  getReviewsByProduct,
  updateReviewStatus,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

// Customer routes
reviewRouter.post("/", createReview);                          // Submit a review (requires login via global middleware)
reviewRouter.get("/my", getMyReviews);                         // My reviews
reviewRouter.get("/product/:productID", getReviewsByProduct);  // Public: approved reviews for a product

// Admin routes
reviewRouter.get("/", getAllReviews);                           // All reviews (admin) — optional ?status=pending
reviewRouter.put("/:id/status", updateReviewStatus);           // Approve / reject
reviewRouter.delete("/:id", deleteReview);                     // Delete

export default reviewRouter;