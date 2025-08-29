import type { FastifyInstance } from "fastify";
import z from "zod";
import { voting } from "../../utils/voting-pub-sub.js";

export const pollResults = async (app: FastifyInstance) => {
  app.get('/poll/:pollId/results', { websocket: true }, (connection, request) => {
    try {
      const getPollParams = z.object({
        pollId: z.uuid()
      })

      const { pollId } = getPollParams.parse(request.params)

      voting.subscribe(pollId, (message) => {
        connection.send(JSON.stringify(message))
      })

    } catch (error) {
      console.error("Erro no websocket:", error);
      connection.send(JSON.stringify({ error: "Invalid request" }));
    }
  })
}