import { createRequestHandler } from "@remix-run/express";
import express from "express";

const app = express();
app.use(express.static("build/client"));

const build = await import("./build/server/index.js");

app.all("*", createRequestHandler({ build }));

app.listen(5173, "0.0.0.0", () => {
  console.log("App listening on http://localhost:5173");
});
