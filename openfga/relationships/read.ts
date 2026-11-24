import client from "../client.ts";

async function main() {
  const { tuples } = await client.read();

  console.log(tuples);
}

main();
