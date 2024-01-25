import express from "express";
import cors from "cors";
import "./init.js"; // for side effects
import residence from "./routes/residence.js";
import sybilResistance from "./routes/sybil-resistance.js";
import snapshotStrategies from "./routes/snapshot-strategies.js";
import metrics from "./routes/metrics.js";

// ----------------------------
// Setup express app
// ----------------------------

const app = express();

var corsOptions = {
  origin: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/residence", residence);
app.use("/sybil-resistance", sybilResistance);
app.use("/snapshot-strategies", snapshotStrategies);
app.use("/metrics", metrics);

app.get("/", (req, res) => {
  console.log(`${new Date().toISOString()} GET /`);
  const routes = [
    "GET /residence/country/us",
    "GET /sybil-resistance/gov-id",
    "GET /snapshot-strategies/residence/country/us",
    "GET /snapshot-strategies/sybil-resistance",
  ];
  res.status(200).json({ routes: routes });
});

app.get("/aws-health", (req, res) => {
  return res.status(200).json({ healthy: true });
});

// ----------------------------
// Run server
// ----------------------------

const PORT = 3010;
const server = app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Server running, exposed at http://127.0.0.1:${PORT}`);
});

function terminate() {
  console.log(`Closing server`);
  server.close(() => {
    console.log(`Closed server`);
    process.exit(0);
  });
}
process.on("SIGTERM", terminate);
process.on("SIGINT", terminate);
