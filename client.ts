import "dotenv/config";
import { OpenFgaClient } from "@openfga/sdk";

const {
  FGA_API_URL = "http://127.0.0.1:8080",
  FGA_STORE_ID,
  FGA_MODEL_ID,
} = process.env;

if (!FGA_STORE_ID || !FGA_MODEL_ID) throw new Error("Invalid config");

export default new OpenFgaClient({
  apiUrl: FGA_API_URL,
  storeId: FGA_STORE_ID,
  authorizationModelId: FGA_MODEL_ID,
});
