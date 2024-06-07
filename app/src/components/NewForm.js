import React, { useState } from "react";
import "./NewForm.css";
import logo from "../logo.svg";
import DataTable from "./DataTable";
function NewForm() {
  const [task, setTask] = useState("");
  const [timeStamp, setTimeStamp] = useState("");
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [uuid, setuuid] = useState("");
  const [error, setError] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [serverErrorText, setServerErrorText] = useState(false);
  const [finished, setFinished] = useState(false);
  const [filename, setFilename] = useState("");
  const [audioDuration, setAudioDuration] = useState(null);
  const [srtText, setSrtText] = useState([]);

  const handleChoice1Change = (event) => {
    setTask(event.target.value);
  };

  const handleChoice2Change = (event) => {
    setTimeStamp(event.target.value);
  };

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(event.target.files[0]);
    const audio = new Audio(URL.createObjectURL(uploadedFile));
    audio.addEventListener("loadedmetadata", () => {
      setAudioDuration(audio.duration);
      console.log(audio.duration);
    });
  };
  const handleDownload = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/download/${filename}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }
      );

      // if (!response.ok) {

      // }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transcript.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (task === "" || timeStamp === "" || file === null) {
      setError(true);
      return;
    } else {
      setError(false);
    }
    const uniqueId = Date.now() + "-" + Math.round(Math.random() * 1000);
    setuuid(uniqueId);
    const formData = new FormData();
    formData.append("task", task);
    formData.append("timeStamp", timeStamp);
    formData.append("uuid", uniqueId);
    formData.append("audioFile", file);

    try {
      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        console.log("Form submitted successfully");
        setSubmitted(true);
        setFilename(data.filename);
        setServerError(false);

        const i1 = setInterval(async () => {
          const response2 = await fetch(
            `http://localhost:4000/process/?uuid=${uniqueId}&filename=${filename}`,
            {
              method: "GET",
            }
          );
          const data = await response2.json();
          console.log(data);
          setSrtText(data.srtText)
          if (data.done === 100) {
            setFinished(true);
            clearInterval(i1);
          }
        }, 10000);
      } else {
        console.error("Error submitting form");
        setServerError(true);
        const text = await response.json();
        setServerErrorText(text);
      }
    } catch (error) {
      setServerError(true);
      setServerErrorText(error.message + ". \n Problem with the server");
    }
  };
  return (
    <div className="container">
      <div className="left">
        <div className="leftbox">
          <>
            <h2>Transcription Tool</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <p>
                  <b>Do you want to transcribe or translate ?</b>
                </p>
                <input
                  type="radio"
                  id="choice1Option1"
                  value="Transcribe"
                  checked={task === "Transcribe"}
                  onChange={handleChoice1Change}
                  disabled={submitted}
                />
                <label
                  htmlFor="choice1Option1"
                  className={task === "Transcribe" ? "selected" : "deseleceted"}
                >
                  Transcribe
                </label>
                <br />
                <input
                  type="radio"
                  id="choice1Option2"
                  value="Translate"
                  checked={task === "Translate"}
                  onChange={handleChoice1Change}
                  disabled={submitted}
                />
                <label
                  htmlFor="choice1Option2"
                  className={task === "Translate" ? "selected" : "deseleceted"}
                >
                  Translate
                </label>
              </div>
              <div>
                <p>
                  <b>Type of timestamp needed:</b>
                </p>
                <input
                  type="radio"
                  id="choice2Option1"
                  value="True"
                  checked={timeStamp === "True"}
                  onChange={handleChoice2Change}
                  disabled={submitted}
                />
                <label
                  htmlFor="choice2Option1"
                  className={timeStamp === "True" ? "selected" : "deseleceted"}
                >
                  Word-Level Timestamps
                </label>
                <br />
                <input
                  type="radio"
                  id="choice2Option2"
                  value="False"
                  checked={timeStamp === "False"}
                  onChange={handleChoice2Change}
                  disabled={submitted}
                />
                <label
                  htmlFor="choice2Option2"
                  className={timeStamp === "False" ? "selected" : "deseleceted"}
                >
                  Sentence-Level Timestamps
                </label>
                <br />
                <input
                  type="radio"
                  id="choice2Option3"
                  value="No Timestamps"
                  checked={timeStamp === "No Timestamps"}
                  onChange={handleChoice2Change}
                  disabled={submitted}
                />
                <label
                  htmlFor="choice2Option3"
                  className={
                    timeStamp === "No Timestamps" ? "selected" : "deseleceted"
                  }
                >
                  No Timestamps
                </label>
              </div>
              <div className="upload">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  disabled={submitted}
                />
              </div>
              {error && <div className="error">**fields can not be empty</div>}
              {!submitted && (
                <button type="submit" className="btn">
                  Submit
                </button>
              )}
            </form>
          </>

          {submitted && !finished && (
            <>
              <div>Processing... </div>
              <img src={logo} className="spinner" alt="dhd kjsghgcd" />
            </>
          )}
          {serverError && (
            <>
              <div className="error">{serverErrorText}</div>
            </>
          )}
          {finished && (
            <>
              <div>
                <b>Transcript Processed</b>
              </div>
              <button onClick={handleDownload} className="btn">
                Download transcript
              </button>
            </>
          )}
        </div>
      </div>
      <div className="divider"></div>
      <div className="right">
        {srtText.length > 0 && <DataTable data={srtText} />}
      </div>
    </div>
  );
}

export default NewForm;
