const express = require("express");
const path = require("path");
const multer = require("multer");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const { type } = require("os");
mongoose.connect("mongodb://localhost:27017/auditing");
const app = express();
const PORT = 4000;
const dataSchema = mongoose.Schema({
  UUID: {
    type: String,
    required: true,
  },

  Project_Identifier: {
    type: String,
    required: true,
    enum: ["http_transcribe", "http_translate"],
  },
  Media_Path: {
    type: String,
    required: true,
  },
  word_level_TS: {
    type: String,
    required: true,
  },
  Task: {
    type: String,
    required: true,
    enum: ["Transcribe", "Translate"],
  },
  Progress: {
    type: String,
    required: true,
    enum: ["Running", "Done"],
  },
});

const Data = mongoose.model("Queue_Urgent_01", dataSchema);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const {uuid} = req.body;
    
    req.body.filename = uuid + file.originalname;
    return cb(null,
      uuid + file.originalname
    );
  },
});

function parsetocsv(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  })}
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
const upload = multer({ storage });
app.get("/", (req, res) => {
  return res.render("homepage");
});
app.post("/upload", upload.single("audioFile"), async (req, res) => {
  
  const { task, timeStamp, uuid, filename } = req.body;
  const rdata = new Data({
    UUID: uuid,
    Project_Identifier: "http_transcribe",
    Media_Path: `//winupdatesrv/Render_In/Manjunath/http/transcribe/${filename}.mp3`,
    word_level_TS: timeStamp,
    Task: task,
    Progress: "Running",
  });
  try {
    await rdata.save();
    return res.status(201).send({ message: "Entry created Successfully",filename:filename });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});
app.get("/process",async (req,res)=>{
  const { uuid, filename } = req.query;
  const obj = await Data.find({ UUID: uuid });
  //const filepath = `./uploads/${filename}.csv`
  const filepath = "./uploads/responseTranscript.csv";
  parsetocsv(filepath)
    .then((results) => {
      
      if (obj[0].Progress === "Done") {
        return res.status(200).send({ done: 100, srtText: results });
      } else {
        return res.status(200).send({ done: 25, srtText: results });
      }
    })
    .catch((error) => {
      console.error("Error parsing CSV file:", error);
    });
  
  
})

app.get("/download/:id",(req,res)=>{
  const filename = req.params.id
  //const filePath = path.join(__dirname, "/uploads/${filename}.csv")
  const filePath = path.join(__dirname, "/uploads/responseTranscript.csv");
  return res.status(200).sendFile(filePath, (err) => {
    if (err) {
      res.status(500).send(err.message);
    }
  });
})
app.listen(PORT, () => {
  console.log("Server is running on port 3000");
  
});
