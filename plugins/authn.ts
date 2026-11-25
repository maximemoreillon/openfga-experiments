import fastifyPlugin from "fastify-plugin";
import type { FastifyPluginOptions, FastifyInstance } from "fastify";

// Tell TypeScript that every request has a `user` property (set by the hook below)
declare module "fastify" {
  interface FastifyRequest {
    user: string;
  }
}

async function authn(fastify: FastifyInstance) {
  fastify.decorateRequest("user", "");

  fastify.addHook("onRequest", async (request, reply) => {
    const user = request.headers["x-user"]; // later: verify a JWT and use its `sub`
    if (typeof user !== "string" || !user)
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Unauthenticated",
      });
    request.user = user;
  });
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
export default fastifyPlugin(authn);
