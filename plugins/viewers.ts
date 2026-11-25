import type { FastifyInstance } from "fastify";
import openFga from "../openfga/client.ts";
import requirePermission from "../utils/requirePermission.ts";

async function routes(fastify: FastifyInstance) {
  fastify.addHook<{ Params: { _id: string } }>(
    "preHandler",
    requirePermission("can_share", "item"),
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
