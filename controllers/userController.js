import jwt from "jsonwebtoken";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import axios from "axios";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import OTP from "../models/otp.js";

dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD,
  },
});

export function createUser(req, res) {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  const user = new User({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hashedPassword,
  });

  user
    .save()
    .then(() => {
      res.json({
        message: "User created succesfully",
      });
    })
    .catch(() => {
      res.json({
        message: "Failed to create user",
      });
    });
}

export function loginUser(req, res) {
  User.findOne({
    email: req.body.email,
  }).then((user) => {
    if (user == null) {
      res.status(404).json({
        message: "User not found",
      });
    } else {
      if (user.isBlock) {
        res.status(403).json({
          message: "Your account has been blocked.Please contact admin",
        });
        return;
      }
      const isPasswordMatching = bcrypt.compareSync(
        req.body.password,
        user.password,
      );
      if (isPasswordMatching) {
        const token = jwt.sign(
          {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            image: user.image,
          },
          process.env.JWT_SECRET,
        );
        res.json({
          message: "Login Successfull",
          token: token,
          user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
        });
      } else {
        res.status(401).json({
          message: "Invalid password",
        });
      }
    }
  });
}

export function isAdmin(req) {
  if (req.user == null) {
    return false;
  }
  if (req.user.role != "admin") {
    return false;
  }
  return true;
}

export function getUser(req, res) {
  if (req.user == null) {
    res.status(401).json({
      message: "Unauthorized User",
    });
    return;
  } else {
    res.json(req.user);
  }
}

export async function googleLogin(req, res) {
  const token = req.body.token;
  if (token == null) {
    res.status(400).json({
      message: "Token is required",
    });
    return;
  }

  try {
    const googleResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const googleUser = googleResponse.data;

    const user = await User.findOne({
      email: googleUser.email,
    });

    if (user == null) {
      const newUser = new User({
        email: googleUser.email,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        password: "abcf322",
        isEmailVerified: googleUser.email_verified,
        image: googleUser.picture,
      });

      let savedUser = await newUser.save();
      const jwtToken = jwt.sign(
        {
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: savedUser.role,
          isEmailVerified: savedUser.isEmailVerified,
          image: savedUser.image,
        },
        process.env.JWT_SECRET,
      );
      res.json({
        message: "Login successfull",
        token: jwtToken,
        user: {
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: savedUser.role,
          isEmailVerified: savedUser.isEmailVerified,
          image: savedUser.image,
        },
      });
      return;
    } else {
      if (user.isBlock) {
        res.status(403).json({
          message: "Your account has been blocked.Please contact admin",
        });
        return;
      }
      const jwtToken = jwt.sign(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          image: user.image,
        },
        process.env.JWT_SECRET,
      );
      res.json({
        message: "Login successfull",
        token: jwtToken,
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          image: user.image,
        },
      });
      return;
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to login with google",
    });
  }
}

export async function getAllUsers(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "Forbidden",
    });
    return;
  }
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get users",
    });
  }
}

export async function blockOrUnblockUser(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "Forbidden",
    });
    return;
  }

  if (req.user.email === req.params.email) {
    res.status(400).json({
      message: "You cannot block yourself",
    });
    return;
  }

  try {
    await User.updateOne(
      {
        email: req.params.email,
      },
      {
        isBlock: req.body.isBlock,
      },
    );
    res.json({ message: "User status updated" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to block/unblock user",
    });
  }
}

export async function sendOTP(req, res) {
  const email = req.params.email;
  if (email == null) {
    res.status(400).json({
      message: "Email is required",
    });
    return;
  }

  //100000 - 999999
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    await OTP.deleteMany({
      email: email,
    });

    const newOTP = new OTP({
      email: email,
      otp: otp,
    });
    await newOTP.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `
  <div style="background:#FAF3E1;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:500px;margin:auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.1);">   
      <!-- Header -->
      <div style="
        background: linear-gradient(135deg,#A33A3A,#7A2626);
        padding:28px 20px;
        text-align:center;
        border-bottom:3px solid #FAF3E1;
      ">
        <h1 style="
          color:#FAF3E1;
          margin:0;
          font-size:24px;
          letter-spacing:1.5px;
          font-weight:600;
          font-family: 'Segoe UI', Arial, sans-serif;
        ">
          Beauty Shop
        </h1>

        <p style="
          margin:6px 0 0 0;
          font-size:13px;
          color:#F3E7D2;
          letter-spacing:2px;
          text-transform:uppercase;
        ">
          Password Reset
        </p>
      </div>

      <!-- Body -->
      <div style="padding:30px;text-align:center;color:#222222;">
        <p style="font-size:16px;margin-bottom:20px;">
          We received a request to reset your password.
        </p>

        <p style="font-size:14px;margin-bottom:15px;">
          Use the following One-Time Password (OTP) to continue:
        </p>

        <!-- OTP Box -->
        <div style="font-size:32px;font-weight:bold;letter-spacing:6px;
                    background:#FAF3E1;border:2px dashed #A33A3A;
                    padding:15px;border-radius:8px;color:#A33A3A;
                    display:inline-block;margin-bottom:20px;">
          ${otp}
        </div>

        <p style="font-size:14px;color:#555;">
          This OTP is valid for <b>10 minutes</b>.
        </p>

        <p style="font-size:13px;color:#777;margin-top:25px;">
          If you did not request this password reset, please ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#222222;color:white;text-align:center;padding:12px;font-size:12px;">
        © ${new Date().getFullYear()} Beauty Shop. All rights reserved.
      </div>

    </div>
  </div>
  `,
    });
    res.json({
      message: "OTP sent to your email",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to send OTP",
    });
  }
}

export async function changePasswordViaOTP(req, res) {
  const email = req.body.email;
  const otp = req.body.otp;
  const newPassword = req.body.newPassword;
  try {
    const otpRecord = await OTP.findOne({
      email: email,
      otp: otp,
    });
    if (otpRecord == null) {
      res.status(400).json({
        message: "Invalid OTP",
      });
      return;
    }

    await OTP.deleteMany({
      email: email,
    });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await User.updateOne(
      {
        email: email,
      },
      {
        password: hashedPassword,
      },
    );
    res.json({
      message: "Password changed succesfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to change password",
    });
  }
}
