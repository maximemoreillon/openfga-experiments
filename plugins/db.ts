import fastifyPlugin from "fastify-plugin";
import fastifyMongo from "@fastify/mongodb";
import type { FastifyPluginOptions, FastifyInstance } from "fastify";

const { MONGODB_URL = "mongodb://localhost:27017/openfga-fastify" } =
  process.env;

async function dbConnector(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.register(fastifyMongo, {
    url: MONGODB_URL,
  });
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
export default fastifyPlugin(dbConnector);
