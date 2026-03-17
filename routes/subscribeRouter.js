import express from "express";
import Subscriber from "../models/subscriber.js";
import { Resend } from "resend";

const subscribeRouter = express.Router();
const resend = new Resend("re_7X6Yyug5_fmJNSa45Jk3RUmngGdFxFq3H");

subscribeRouter.post("/", async (req, res) => {

  try {

    const { email } = req.body;

    const subscriber = new Subscriber({
      email: email
    });
    

    await subscriber.save();

    //Welcome email
    await resend.emails.send({
      from: "Beauty Store <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to our Beauty Shop 💄",
      html: `
        <h1>Welcome to our Beauty Community!</h1>
        <p>Thank you for subscribing to our newsletter.</p>
        <p>You will receive updates about:</p>
        <ul>
          <li>New beauty products</li>
          <li>Exclusive discounts</li>
          <li>Beauty tips</li>
        </ul>
        <p>Stay beautiful ✨</p>
      `
    });

    res.json({
      message: "Subscribed successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: "Subscription failed"
    });

  }

});

export default subscribeRouter;