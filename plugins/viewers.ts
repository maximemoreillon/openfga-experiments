import type { FastifyInstance } from "fastify";
import openFga from "../openfga/client.ts";

async function routes(fastify: FastifyInstance) {
  fastify.addHook<{ Params: { _id: string } }>(
    "preHandler",
    async (request, reply) => {
      const {
        user,
        params: { _id },
      } = request;

      const { allowed } = await openFga.check({
        user: `user:${user}`,
        relation: "can_share",
        object: `item:${_id}`,
      });

      if (!allowed)
        return reply.code(403).send({
          statusCode: 403,
          error: "Forbidden",
          message: "You do not have permission to do this",
        });
    },
  );

  fastify.get<{ Params: { _id: string } }>("/", async (request, reply) => {
    const { _id } = request.params;
    const { tuples } = await openFga.read({
      object: `item:${_id}`,
      relation: "viewer",
    });
    return { tuples };
  });

  fastify.put<{ Params: { _id: string; user_id: string } }>(
    "/:user_id",
    async (request, reply) => {
      const {
        params: { _id, user_id },
      } = request;

      return await openFga.write({
        writes: [
          {
            user: `user:${user_id}`,
            object: `item:${_id}`,
            relation: "viewer",
          },
        ],
      });
    },
  );

  fastify.delete<{ Params: { _id: string; user_id: string } }>(
    "/:user_id",
    async (request, reply) => {
      const {
        params: { _id, user_id },
      } = request;

      return await openFga.write({
        deletes: [
          {
            user: `user:${user_id}`,
            object: `item:${_id}`,
            relation: "viewer",
          },
        ],
      });
    },
  );
}

export default routes;
