import dotenv from "dotenv";
import PayOS from "@payos/node";

dotenv.config();

const clientId = process.env.PAYOS_CLIENT_ID;
const apiKey = process.env.PAYOS_API_KEY;
const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

if (!clientId || !apiKey || !checksumKey) {
  throw new Error("Missing PayOS environment variables. Please check .env file.");
}

export const payOS = new PayOS(clientId, apiKey, checksumKey);
