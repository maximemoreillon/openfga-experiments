import client from "../client.ts";

async function main() {
  const response = await client.write({
    writes: [
      {
        user: `user:alice`,
        relation: "viewer",
        object: `item:6b0626520feee9fc7ca504b8`,
      },
    ],
  });

  console.log(response);
}

main();
