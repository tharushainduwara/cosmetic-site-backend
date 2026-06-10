import Review from "../models/review.js";
import { isAdmin } from "./userController.js";

// POST /api/reviews  — logged-in customer submits a review
export async function createReview(req, res) {
  if (req.user == null) {
    return res.status(401).json({ message: "Please login to submit a review" });
  }

  try {
    const { productID, rating, comment } = req.body;

    if (!productID || !rating || !comment) {
      return res.status(400).json({ message: "productID, rating, and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // One review per user per product
    const existing = await Review.findOne({ productID, userEmail: req.user.email });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = new Review({
      productID,
      userEmail: req.user.email,
      userName: req.user.firstName + " " + req.user.lastName,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit review" });
  }
}

// GET /api/reviews/product/:productID  — anyone can see approved reviews for a product
export async function getReviewsByProduct(req, res) {
  try {
    const reviews = await Review.find({
      productID: req.params.productID,
      status: "approved",
    }).sort({ createdAt: -1 });

    // Average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({ reviews, avgRating: parseFloat(avgRating.toFixed(1)), total: reviews.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
}

// GET /api/reviews  — admin sees all reviews (any status)
export async function getAllReviews(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    const { status } = req.query; // optional filter: ?status=pending
    const filter = status ? { status } : {};
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
}

// PUT /api/reviews/:id/status  — admin approves or rejects a review
export async function updateReviewStatus(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const { status } = req.body;
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    await Review.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: `Review ${status} successfully` });
  } catch (err) {
    res.status(500).json({ message: "Failed to update review status" });
  }
}

// DELETE /api/reviews/:id  — admin deletes a review
export async function deleteReview(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete review" });
  }
}

// GET /api/reviews/my  — logged-in user sees their own reviews
export async function getMyReviews(req, res) {
  if (req.user == null) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const reviews = await Review.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your reviews" });
  }
}