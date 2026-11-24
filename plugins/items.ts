import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import openFga from "../openfga/client.ts";
import { Item, type ItemType } from "../schemas/items.ts";
import { ObjectId } from "@fastify/mongodb";

const user = `john`;

async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  if (!fastify.mongo.db) throw new Error("MongoDB unavailable");

  const collection = fastify.mongo.db.collection("items");

  const schema = {
    body: Item,
  };

  fastify.post<{ Body: ItemType }>(
    "/items",
    { schema },
    async (request, reply) => {
      const { name } = request.body;

      const { insertedId } = await collection.insertOne({ name });

      try {
        await openFga.write({
          writes: [
            {
              user: `user:${user}`,
              relation: "owner",
              object: `item:${insertedId.toString()}`,
            },
          ],
        });
      } catch (error: any) {
        await collection.deleteOne({ _id: insertedId });
        return reply.code(500).send({
          statusCode: 500,
          error: "FGA error",
          message: error.message,
        });
      }

      return { insertedId };
    },
  );

  fastify.get("/items", async (request, reply) => {
    const { objects } = await openFga.listObjects({
      user: `user:${user}`,
      relation: "can_view",
      type: "item",
    });
    const ids = objects.map((o) => new ObjectId(o.replace("item:", "")));
    return await collection.find({ _id: { $in: ids } }).toArray();
  });

  fastify.get<{ Params: { id: string } }>(
    "/items/:id",
    async (request, reply) => {
      const { id } = request.params;

      const { allowed } = await openFga.check({
        user: `user:${user}`,
        relation: "can_view",
        object: `item:${id}`,
      });

      if (!allowed)
        return reply.code(403).send({
          statusCode: 403,
          error: "Forbidden",
          message: "You do not have permission to access this resource",
        });

      return await collection.findOne({ _id: new ObjectId(id) });
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    "/items/:id",
    async (request, reply) => {
      const { id } = request.params;

      const { allowed } = await openFga.check({
        user: `user:${user}`,
        relation: "can_delete",
        object: `item:${id}`,
      });

      if (!allowed)
        return reply.code(403).send({
          statusCode: 403,
          error: "Forbidden",
          message: "You do not have permission to access this resource",
        });

      return await collection.deleteOne({ _id: new ObjectId(id) });
    },
  );
}

export default routes;
