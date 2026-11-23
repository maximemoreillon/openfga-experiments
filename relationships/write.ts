import client from "../client.ts";

async function main() {
  const body = {
    writes: [
      {
        user: "monkey:maximus",
        relation: "owner",
        object: "banana:golden-banana",
      },
    ],
  };

  const response = await client.write(body);

  console.log(response);
}

main();
