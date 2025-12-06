import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import answerRoutes from "./routes/answerRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import client from "prom-client";
client.collectDefaultMetrics();
import { register } from "prom-client";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const METRICS_USER = process.env.METRICS_USER;
const METRICS_PASS = process.env.METRICS_PASS;

function checkBasicAuth(req, res) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Basic ")) {
    res.set("WWW-Authenticate", 'Basic realm="Metrics"');
    return false;
  }

  const base64 = header.split(" ")[1];
  const [user, pass] = Buffer.from(base64, 'base64').toString().split(":");

  return user === METRICS_USER && pass === METRICS_PASS;
}


app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/notifications", notificationRoutes);


app.get("/metrics", async (req, res) => {
  if (!checkBasicAuth(req, res)) {
    return res.status(401).send("Unauthorized");
  }

  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});


app.get("/", (req, res) => {
  res.send("Askly Backend is running!");
});

// app.listen(PORT, "0.0.0.0",() => {
//   console.log(`Server is listening on port ${PORT}`);
// });

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

export default app;
