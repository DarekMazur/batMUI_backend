import {Pool} from "pg";
import process from "node:process";
require('dotenv').config()

export const pool = new Pool({
	user: process.env.DATABASE_USER || 'postgres',
	host: process.env.DATABASE_HOST || 'localhost',
	database: process.env.DATABASE_NAME || 'postgres',
	password: process.env.DATABASE_PASSWORD || 'postgres',
	port: Number(process.env.DATABASE_PORT) || 5432,
})