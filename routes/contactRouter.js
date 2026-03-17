import express from "express";
import { createContact, deleteContact, getContacts } from "../controllers/contactController.js";

const contactRouter = express.Router();

contactRouter.post("/", createContact);
contactRouter.get("/", getContacts);
contactRouter.delete("/:id", deleteContact);

export default contactRouter;