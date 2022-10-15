import express from "express";
import cors from "cors";
import "./init.js"; // for side effects
import merkleTree from "./routes/merkle-tree.js";
import residence from "./routes/residence.js";
import sybilResistance from "./routes/sybil-resistance.js";

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

app.use("/merkle-tree", merkleTree);
app.use("/residence", residence);
app.use("/sybil-resistance", sybilResistance);

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
