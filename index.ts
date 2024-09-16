import express, {Response} from "express";
import cors from "cors";
import * as process from "node:process";
require('dotenv').config()

import { Pool } from "pg"

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.ORIGIN || "*",
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));

export const pool = new Pool({
  user: process.env.DATABASE_USER || 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  database: process.env.DATABASE_NAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  port: Number(process.env.DATABASE_PORT) || 5432,
})

app.get('/', (_req, res) => {
  res.status(200).send('Server is running');
})

app.get('/api', (_req, res) => {
  res.status(204).send('Nothing to send');
})

const getFromDatabase = async (table: string, res: Response) => {
  const client = await pool.connect()
  if (client) {
    console.log('Connected to database');
    const result = await client.query(`SELECT * FROM ${table}`);
    if (result !== undefined) {
      res.status(200).send(result.rows);
      console.log('Results sent')
      client.release()
      console.log('Client released');
    } else {
      res.status(400).send('No such results');
    }
  } else {
    res.status(500).send('Connection failed');
  }
}

app.get('/api/questions', async (_req, res) => {
  getFromDatabase('questions', res)
})

app.get('/api/score', async (_req, res) => {
  getFromDatabase('results', res)
})

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});