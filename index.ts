import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.ORIGIN || "*",
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});