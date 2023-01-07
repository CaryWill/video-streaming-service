const express = require("express");
const app = express();
const fs = require("fs");

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// more code will go in here just befor the listening function

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});

app.get("/video", function (req, res) {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }
  const videoPath = "testing.mp4";
  const videoSize = fs.statSync("testing.mp4").size;

  // request header range likes this:
  // chrome: `bytes=0-`
  // safari: `bytes=0-1`
  const start = Number(range.split("=")[1].split("-")[0]);
  const end = Number(range.split("=")[1].split("-")[1]) || videoSize - 1;
  console.log(range, start, end, "range");

  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});
