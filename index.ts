import express, {Response} from "express";
import cors from "cors";
import * as process from "node:process";
import dotenv from "dotenv";
import https from 'https'
import fs from 'fs'

dotenv.config()

import {pool} from "./client";
import {IScoreTypes} from "./lib/types";
import {SCORES_TO_DISPLAY, TOKEN_EXPIRATION_TIME} from "./lib/vars";
import jwt from 'jsonwebtoken'

const privateKey  = fs.readFileSync('/etc/letsencrypt/live/batquiz.nerdistry.pl/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/batquiz.nerdistry.pl/fullchain.pem', 'utf8');

const credentials = {key: privateKey, cert: certificate};

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.ORIGIN || "*",
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));

function ensureSecure(req: { secure: any; hostname: string; originalUrl: string; }, res: {
  redirect: (arg0: string) => void;
}, next: () => any) {
  if (req.secure) {
    return next();
  }
  res.redirect('https://' + req.hostname + req.originalUrl);
}

app.use(ensureSecure);

const bestScores: IScoreTypes[] = []

const getScores = async () => {
  const client = await pool.connect()
  if (client) {
    console.log('Connected to database');
    const result = await client.query('SELECT * FROM results');
    if (result !== undefined) {
      result.rows.forEach((row) => {
        bestScores.push(row);
      });
      client.release()
      console.log('Client released');
    } else {
      console.error('Cannot get results from database');
    }
  } else {
    console.error('Connection failed');
  }
}

const generateAccessToken = (login: { login: string }) => {
  return jwt.sign(login, process.env.API_TOKEN as string, { expiresIn: TOKEN_EXPIRATION_TIME });
}

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

getScores();

app.get('/', (_req, res) => {
  res.status(200).send('Server is running');
})

app.get('/api', (_req, res) => {
  res.status(204).send('Nothing to send');
})

app.get("/api/token", (_req, res) => {
  const temporaryToken = generateAccessToken({ login: process.env.API_USER as string });
  if (temporaryToken !== undefined) {
    res.status(200).send(JSON.stringify(temporaryToken));
  } else {
    res.status(500).send('Connection failed');
  }
})

app.get('/api/questions', async (_req, res) => {
  console.log('test')
  getFromDatabase('questions', res)
})

app.get('/api/score', async (_req, res) => {
  getFromDatabase('results', res)
})

app.post('/api/score', async (req, res) => {
  if (req.header('Authorization')){
    try {
      const decoded = jwt.verify((req.header('Authorization') as string).split(' ')[1], process.env.API_TOKEN as string);
      // @ts-ignore
      const signed: string = decoded.login

      if (signed !== process.env.API_USER as string) {
        res.status(401).send('Authentication failed').end();
      } else {
        if (bestScores.length >= SCORES_TO_DISPLAY && req.body.score < bestScores.sort((a, b) => b.score - a.score)[bestScores.length - 1].score)  {
          console.log('The result is too low to be on the list of the best scores');
          res.status(403).send('The result is too low to be on the list of the best scores');
        } else if (bestScores.length >= SCORES_TO_DISPLAY && req.body.score === bestScores.sort((a, b) => b.score - a.score)[bestScores.length - 1] && req.body.time <= bestScores.sort((a, b) => b.score - a.score)[bestScores.length - 1].time) {
          console.log('The result is too low to be on the list of the best scores');
          res.status(403).send('The result is too low to be on the list of the best scores');
        } else {
          const newScore: IScoreTypes = {
            username: req.body.username,
            score: req.body.score,
            time: req.body.time,
            level: req.body.level,
          };
            bestScores.push(newScore);

            const lowestScoreOnList = bestScores.sort((a, b) => {
              if (a.score < b.score) {
                return 1;
              } else if (a.score > b.score) {
                return -1
              }

              return a.time - b.time;
            })[bestScores.length - 1]

            const client = await pool.connect()
            if (client) {
              console.log('Connected to database');
              console.log(lowestScoreOnList.id)
              await client.query(`DELETE FROM results WHERE id=($1)::uuid`, [
                lowestScoreOnList.id
              ])
              await client.query(`INSERT INTO results (username, score, level, time) VALUES ('${newScore.username}', '${newScore.score}', '${newScore.level}', '${newScore.time}') ON CONFLICT DO NOTHING;`)
                .then(() => {
                  res.status(200).send(newScore).end();
                  console.log('New score sent to database');
                  client.release()
                  console.log('Client released');
                })
                .catch((err) => {
                  res.status(500).send('Sending error');
                  console.error('Sending error' + err);
                })
            } else {
              res.status(500).send('Connection failed');
            }
        }
      }
    } catch(err) {
      console.log(err.message);
      res.status(403).send(err.message);
    }
  } else {
    res.status(500).send('Connection failed');
  }
})

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
  console.log(`server started on port ${port}`);
});
