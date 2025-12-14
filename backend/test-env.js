import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("CWD:", process.cwd());
console.log("__dirname:", __dirname);

const envPath = path.join(__dirname, '.env');
console.log("Target .env path:", envPath);
console.log("File exists?", fs.existsSync(envPath));

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Dotenv Error:", result.error);
}

console.log("MONGO_URI:", process.env.MONGO_URI ? "Defined (starts with " + process.env.MONGO_URI.substring(0, 5) + "...)" : "UNDEFINED");
