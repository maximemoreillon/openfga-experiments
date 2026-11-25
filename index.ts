import "dotenv/config";
import Fastify from "fastify";
import items from "./plugins/items.ts";
import db from "./plugins/db.ts";
import auth from "./plugins/auth.ts";

const fastify = Fastify({
  logger: true,
});

fastify.register(db);
fastify.register(auth);
fastify.register(items);

fastify.listen({ port: 7000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
