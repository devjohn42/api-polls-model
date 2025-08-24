import type { FastifyInstance } from "fastify"
import z from "zod"
import { prisma } from "../../lib/prisma.js"

export const createPoll = async (app: FastifyInstance) => {
  app.post('/poll', async (request, reply) => {
    const createPollBodySchema = z.object({
      title: z.string(),
      options: z.array(z.string())
    })

    const { title, options } = createPollBodySchema.parse(request.body)

    const poll = await prisma.poll.create({
      data: {
        title,
        options: {
          createMany: {
            data: options.map(option => {
              return { title: option }
            })
          }
        }
      }
    })

    return reply.status(201).send({
      pollId: poll.id
    })

  })
}