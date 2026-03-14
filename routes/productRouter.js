import express from "express";
import { createProduct, deleteProduct, getProductID, getProducts, getProductsBySearch, updateProduct } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/",getProducts)
productRouter.post("/",createProduct)
productRouter.delete("/:productID",deleteProduct)
productRouter.put("/:productID",updateProduct)
productRouter.get("/search/:query",getProductsBySearch)
productRouter.get("/:productID",getProductID)

export default productRouter;