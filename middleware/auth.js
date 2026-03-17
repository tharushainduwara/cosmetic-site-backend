import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains user id, email, etc.
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}