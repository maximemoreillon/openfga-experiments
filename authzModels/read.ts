import client from "../client.ts";

async function main() {
  const response = await client.readAuthorizationModels();

  console.log(response);
}

main();
