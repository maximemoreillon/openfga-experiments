import fgaClient from "../client.ts";

async function main() {
  const response = await fgaClient.deleteStore({
    storeId: "01M82Q0EPSMSKH3G6NXYAK3WYB",
  });
  console.log(response);
}

main();
