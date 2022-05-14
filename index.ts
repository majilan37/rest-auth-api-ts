import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoute from "./routes/users";
import dotenv from "dotenv";
import { deserializedUser } from "./middleware/deseralizedUser";
dotenv.config();

// app config
const app = express();
const PORT = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(deserializedUser);

// api routes
app.get("/", (req, res) => {
  res.send("Welcome to my api");
});

app.use("/api/users", userRoute);

// DB config
mongoose.connect(process.env.MONGO_URI as string, () =>
  console.log("connected to Mongo DB")
);

// listener
app.listen(PORT, () => console.log("app runnig on port: ", PORT));
