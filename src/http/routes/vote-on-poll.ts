import type { FastifyInstance } from "fastify"
import { randomUUID } from "node:crypto"
import z from "zod"
import { prisma } from "../../lib/prisma.js"
import { redis } from "../../lib/redis.js"
import { voting } from "../../utils/voting-pub-sub.js"


export const voteOnPoll = async (app: FastifyInstance) => {
  app.post('/poll/:pollId/vote', async (request, reply) => {
    const voteOnPollBodySchema = z.object({
      pollOptionId: z.uuid()
    })

    const voteOnPollParams = z.object({
      pollId: z.uuid()
    })

    const { pollId } = voteOnPollParams.parse(request.params)
    const { pollOptionId } = voteOnPollBodySchema.parse(request.body)

    let { sessionId } = request.cookies

    if (sessionId) {
      const userPreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId
          }
        }
      })

      if (userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId !== pollOptionId) {
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnPoll.id
          }
        })

        const votes = await redis.zincrby(pollId, -1, userPreviousVoteOnPoll.pollOptionId)

        voting.publish(pollId, {
          pollOptionId: userPreviousVoteOnPoll.pollOptionId,
          votes: Number(votes)
        })

      } else if (userPreviousVoteOnPoll) {
        return reply.status(400).send({ message: 'You already voted on this poll' })
      }
    }

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        signed: true,
        httpOnly: true
      })
    }

    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId
      }
    })

    const votes = await redis.zincrby(pollId, 1, pollOptionId)

    voting.publish(pollId, {
      pollOptionId,
      votes: Number(votes)
    })

    return reply.status(201).send({ sessionId })
  })
}