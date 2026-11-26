import "dotenv/config";
import Fastify from "fastify";
import items from "./plugins/items/index.ts";
import db from "./plugins/db.ts";
import authn from "./plugins/authn.ts";

const fastify = Fastify({
  logger: true,
});

fastify.register(db);
fastify.register(authn);
fastify.register(items, { prefix: "/items" });

fastify.listen({ port: 7000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
