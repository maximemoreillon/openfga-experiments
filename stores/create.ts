import fgaClient from "../client.ts";

async function main() {
  const body = {
    name: "The Jungle",
  };
  const response = await fgaClient.createStore(body);
  console.log(response);
}

main();
