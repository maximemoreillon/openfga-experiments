import "dotenv/config";
import { OpenFgaClient } from "@openfga/sdk";

const {
  FGA_API_URL = "http://localhost",
  FGA_STORE_ID,
  FGA_MODEL_ID,
} = process.env;

const client = new OpenFgaClient({
  apiUrl: FGA_API_URL,
});

if (FGA_STORE_ID) client.storeId = FGA_STORE_ID;
if (FGA_MODEL_ID) client.authorizationModelId = FGA_MODEL_ID;

export default client;
