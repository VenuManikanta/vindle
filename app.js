const express = require("express");
const multer = require("multer");
const exec = require("child_process").exec;
var fs = require("fs");
const { error } = require("console");
const app = express();
const port = 5000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/files");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("uploaded_file"), (req, res, next) => {
  console.log(req.file.path);
  convert(req.file.originalname, (error, stderr) => {
    if (error !== null || stderr.length !== 0) {
      res.send("500 Error");
      return;
    }
    const nameArray = req.file.originalname.split('.');
    nameArray.pop();
    var kfxFileName = nameArray.join('.') + ".kfx";
    var kfxFilePath = __dirname + "/files/" + kfxFileName;
    console.log(kfxFilePath);
    var file = fs.createReadStream(kfxFilePath);
    var stat = fs.statSync(kfxFilePath);
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Type", "application/kfx");
    res.setHeader("Content-Disposition", "attachment; filename=" + kfxFileName);
    file.pipe(res);
  });
});

app.get("/success", (req, res) => {
  res.send("<p>Download successful</p>");
});

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});

function convert(fileName, myCallback) {
    const nameArray = fileName.split('.');
    nameArray.pop();
    var kfxFileName = nameArray.join('.') + ".kfx";
  exec(
    __dirname +
      "/pdf.sh " +
      "files \"" +
      fileName +
      "\" \"" +
      kfxFileName+"\"",
    (error, stdout, stderr) => {
      if (error !== null) {
        console.log(error);
        console.log("stdout: " + stdout);
        console.log("stderr: " + stderr);
      } else {
        console.log("stdout: " + stdout);
        console.log("stderr: " + stderr);
      }
      myCallback(error, stderr);
    }
  );
}
