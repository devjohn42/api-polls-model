import type { FastifyInstance } from "fastify"
import z from "zod"
import { prisma } from "../../lib/prisma.js"

export const getPoll = async (app: FastifyInstance) => {
  app.get('/poll/:pollId', async (request, reply) => {
    const getPollParams = z.object({
      pollId: z.uuid()
    })

    const { pollId } = getPollParams.parse(request.params)

    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId
      },
      include: {
        options: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return reply.send({
      poll
    })

  })
}