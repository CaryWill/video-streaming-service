const express = require("express");
const app = express();
const fs = require("fs");

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// 1. 支持 range
app.get("/video", function (req, res) {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }
  const videoPath = "videos/testing.mp4";
  const videoSize = fs.statSync("videos/testing.mp4").size;

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

// 2. 不支持 range
var onHeaders = require("on-headers");
function unsetCacheHeaders() {
  this.removeHeader("Content-Length");
}
app.use(
  "/videos",
  express.static("videos", {
    acceptRanges: false,
    setHeaders: (res) => {
      onHeaders(res, unsetCacheHeaders);
    },
  })
);

// 3. 支持 range
app.use(
  "/videos2",
  express.static("videos", {
    acceptRanges: true,
  })
);

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});
