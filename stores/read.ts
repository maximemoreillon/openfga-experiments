import fgaClient from "../client.ts";

async function main() {
  const { stores } = await fgaClient.listStores();
  console.log(stores);
}

main();
