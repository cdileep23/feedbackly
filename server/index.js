import express from "express"
import AdminRouter from "./routes/admin.route.js"
import FeedbackFormRouter1 from './routes/Feedback1.route.js'
import responseRouter from './routes/feedbackresponse.route.js'
import dotenv from "dotenv"
import connectDB from "./db.js"
import cookieParser from "cookie-parser"
import cors from 'cors'
dotenv.config({})
const app=express()

app.use(cookieParser())
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://feedbackly-sooty.vercel.app"],
    credentials: true,
  })
);
app.use('/api/v1/admin', AdminRouter)
app.use("/api/v1/feedback", FeedbackFormRouter1);
app.use("/api/v1/response", responseRouter);
app.use("/", (req, res) => {
  res.send("Hello from Backed");
});
const PORT=process.env.PORT
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`server started at ✅ ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
startServer();