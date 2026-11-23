import client from "../client.ts";

async function main() {
  const body = {
    user: "monkey:maximus",
    relation: "owner",
    object: "banana:golden-banana",
  };

  const response = await client.check(body);

  console.log(response);
}

main();
