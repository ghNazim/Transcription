const express = require("express");
const path = require("path");
const multer = require("multer");
const cors = require("cors");
const mongoose = require("mongoose");
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
    console.log(req.body)
    
    req.body.filename = uuid + file.originalname;
    return cb(null, uuid + file.originalname);
  },
});

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
  console.log({ task, timeStamp, uuid, filename });
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
app.get("/process/:id",async (req,res)=>{
  const uuid = req.params.id;
  const obj = await Data.find({ UUID: uuid });
   
  if (obj[0].Progress === "Done") {
    return res.status(200).send({ done: 100 });
  } else {
    return res.status(200).send({ done: 25 });
  }
})

app.get("/download/:id",(req,res)=>{
  const uuid = req.params.id
  //const filePath = path.join(__dirname, "/uploads/${filename}.csv")
  const filePath = path.join(__dirname, "/uploads/responseTranscript.csv");
  return res.status(200).sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Error sending file");
    }
  });
})
app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
