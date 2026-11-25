import type { FastifyInstance, FastifyPluginOptions } from "fastify";

import openFga from "../openfga/client.ts";
import { Item, type ItemType } from "../schemas/items.ts";
import { ObjectId } from "@fastify/mongodb";

async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  if (!fastify.mongo.db) throw new Error("MongoDB unavailable");

  const collection = fastify.mongo.db.collection("items");

  const schema = {
    body: Item,
  };

  fastify.post<{ Body: ItemType; Headers: { "x-user": string } }>(
    "/items",
    { schema },
    async (request, reply) => {
      const user = request.headers["x-user"];
      if (!user)
        return reply.code(401).send({
          statusCode: 401,
          error: "Unauthenticated",
          message: "Unauthenticated",
        });
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

  fastify.get<{ Headers: { "x-user": string } }>(
    "/items",
    async (request, reply) => {
      const user = request.headers["x-user"];
      if (!user)
        return reply.code(401).send({
          statusCode: 401,
          error: "Unauthenticated",
          message: "Unauthenticated",
        });
      const { objects } = await openFga.listObjects({
        user: `user:${user}`,
        relation: "can_view",
        type: "item",
      });
      const ids = objects.map((o) => new ObjectId(o.replace("item:", "")));
      return await collection.find({ _id: { $in: ids } }).toArray();
    },
  );

  fastify.get<{ Params: { _id: string }; Headers: { "x-user": string } }>(
    "/items/:_id",
    async (request, reply) => {
      const user = request.headers["x-user"];
      if (!user)
        return reply.code(401).send({
          statusCode: 401,
          error: "Unauthenticated",
          message: "Unauthenticated",
        });
      const { _id } = request.params;

      const { allowed } = await openFga.check({
        user: `user:${user}`,
        relation: "can_view",
        object: `item:${_id}`,
      });

      if (!allowed)
        return reply.code(403).send({
          statusCode: 403,
          error: "Forbidden",
          message: "You do not have permission to access this resource",
        });

      return await collection.findOne({ _id: new ObjectId(_id) });
    },
  );

  fastify.delete<{ Params: { _id: string }; Headers: { "x-user": string } }>(
    "/items/:_id",
    async (request, reply) => {
      const user = request.headers["x-user"];
      if (!user)
        return reply.code(401).send({
          statusCode: 401,
          error: "Unauthenticated",
          message: "Unauthenticated",
        });
      const { _id } = request.params;

      const { allowed } = await openFga.check({
        user: `user:${user}`,
        relation: "can_delete",
        object: `item:${_id}`,
      });

      if (!allowed)
        return reply.code(403).send({
          statusCode: 403,
          error: "Forbidden",
          message: "You do not have permission to access this resource",
        });

      await collection.deleteOne({ _id: new ObjectId(_id) });
      // Delete all tuples
      const { tuples } = await openFga.read({ object: `item:${_id}` });
      if (tuples.length) await openFga.deleteTuples(tuples.map((t) => t.key));

      return { _id };
    },
  );
}

export default routes;
