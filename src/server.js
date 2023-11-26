const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const compression = require('compression');
const schema = require('./schema').default;
const { GraphQLError } = require('graphql');
const { authenticateToken } = require('./middlewares/AuthenticateTokenMiddleware');
const { logger } = require('./middlewares/LoggingMiddleware');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv')

dotenv.config();

/**
 * Express app 생성 및 미들웨어 적용 
 */
const app = express();
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(compression());
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
}))
app.use(authenticateToken);
app.use(logger);

/**
 * Apollo server 생성 
 */
const server = new ApolloServer({ 
  schema,
  playground: true,
  context: ({ req, res }) => {
    if (req.err) {
      const err = req.err;
      throw new GraphQLError(err.message, { extensions: { http: { status: err.status, code: err.code, message: err.message } } })
    }
    return { req, res };
  },
  formatError: (err) => {
    console.log(err);
    return err;
  }
});

/**
 * Express app에 Apollo 연결 
 */
const con = async() => {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql", cors: { origin: 'http://localhost:5173', credentials: true } });
}
con();

/**
 * application 실행 확인 
 */
app.listen({port: 4000}, () => {
	console.log('Now browse to http://localhost:4000' + server.graphqlPath) 
})