import type { FastifyInstance } from "fastify";
import viewers from "./viewers.ts";
import openFga from "../openfga/client.ts";
import { Item, type ItemType } from "../schemas/items.ts";
import { ObjectId } from "@fastify/mongodb";
import requirePermission from "../utils/requirePermission.ts";

async function routes(fastify: FastifyInstance) {
  if (!fastify.mongo.db) throw new Error("MongoDB unavailable");

  fastify.register(viewers, { prefix: "/:_id/viewers" });

  const collection = fastify.mongo.db.collection("items");

  const schema = {
    body: Item,
  };

  fastify.post<{ Body: ItemType }>("/", { schema }, async (request, reply) => {
    const {
      user,
      body: { name },
    } = request;

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
  });

  fastify.get<{ Headers: { "x-user": string } }>(
    "/",
    async (request, reply) => {
      const { user } = request;

      const { objects } = await openFga.listObjects({
        user: `user:${user}`,
        relation: "can_view",
        type: "item",
      });
      const ids = objects.map((o) => new ObjectId(o.replace("item:", "")));
      return await collection.find({ _id: { $in: ids } }).toArray();
    },
  );

  fastify.get<{ Params: { _id: string } }>(
    "/:_id",
    { preHandler: requirePermission("can_view", "item") },
    async (request, reply) => {
      const { _id } = request.params;

      return await collection.findOne({ _id: new ObjectId(_id) });
    },
  );

  fastify.delete<{ Params: { _id: string } }>(
    "/:_id",
    { preHandler: requirePermission("can_delete", "item") },

    async (request, reply) => {
      const { _id } = request.params;

      await collection.deleteOne({ _id: new ObjectId(_id) });
      // Delete all tuples
      const { tuples } = await openFga.read({ object: `item:${_id}` });
      if (tuples.length) await openFga.deleteTuples(tuples.map((t) => t.key));

      return { _id };
    },
  );
}

export default routes;
