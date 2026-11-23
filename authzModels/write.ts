import client from "../client.ts";

async function main() {
  const response = await client.writeAuthorizationModel({
    schema_version: "1.1",
    type_definitions: [
      {
        type: "monkey",
      },
      {
        type: "banana",
        relations: {
          owner: {
            this: {},
          },
        },
        metadata: {
          relations: {
            owner: {
              directly_related_user_types: [
                {
                  type: "monkey",
                },
              ],
            },
          },
        },
      },
    ],
  });

  console.log(response);
}

main();
