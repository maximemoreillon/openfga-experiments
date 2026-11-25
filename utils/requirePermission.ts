import type { FastifyReply, FastifyRequest } from "fastify";
import openFga from "../openfga/client.ts";

export default function requirePermission(relation: string, type: string) {
  return async (
    request: FastifyRequest<{ Params: { _id: string } }>,
    reply: FastifyReply,
  ) => {
    const { allowed } = await openFga.check({
      user: `user:${request.user}`,
      relation,
      object: `${type}:${request.params._id}`,
    });

    if (!allowed)
      return reply.code(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: `Missing permission: ${relation}`,
      });
  };
}
