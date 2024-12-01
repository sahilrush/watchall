import express from "express";
import router from "./routes";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express(); 



app.use(cors()); 
app.use(cookieParser()); 
app.use(express.json()); 


app.get("/", (req, res) => {
  res.send("Dev Test");
});

app.use("/api/", router); 


app.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening");
});

export default app;
