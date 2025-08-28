import type { FastifyInstance } from "fastify";

export const pollResults = async (app: FastifyInstance) => {
  app.get('/poll/:pollId/results', { websocket: true }, (connection, request) => {
    connection.socket.on('message', (message: string) => {
      connection.socket.send('you send: ' + message)

    })
  })
}