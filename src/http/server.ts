import cookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';
import fastify from "fastify";
import { createPoll } from "./routes/create-poll.js";
import { getPoll } from "./routes/get-poll.js";
import { voteOnPoll } from "./routes/vote-on-poll.js";
import { pollResults } from './ws/poll-results.js';

const app = fastify()

app.register(cookie, {
  secret: "poll-test-poll-test",
  hook: "onRequest",
})

app.register(fastifyWebsocket)

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)

app.register(pollResults)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server running!')
})