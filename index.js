import express from "express";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import passport from "passport";
import connectDB from "./config/db.js";
import cp from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import routes from "./src/routes/routes.js";
import session from "express-session";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();
connectDB();
const app = express();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.use(
  cors({
    origin: "https://stunning-tiramisu-06eb8c.netlify.app",
    credentials: true,
  })
);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(express.json({limit: "5mb"}));
app.use(cp());


app.use("/", routes);
app.use(
  session({
    secret: process.env.SECRET_KEY, 
    resave: false,
    saveUninitialized: false,
  })
);



app.get("/auth/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "user has successfully authenticated",
      user: req.user,
      cookies: req.cookies,
    });
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  req.session = null;
  res.redirect("http://localhost:5173");
  res.clearCookie("connect.sid" , {path: "/" , httpOnly: true , sameSite: "none" , secure: false});
});

app.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "user failed to authenticate.",
  });
});

app.get("/", (req, res) => {
  res.send("API is running....");
});

app.use(errorHandler);


const PORT = process.env.PORT || 8000;

app.listen(PORT, console.log(`Server running on port ${PORT} `));