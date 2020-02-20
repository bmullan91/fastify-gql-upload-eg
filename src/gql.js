const GQL = require("fastify-gql");
const { GraphQLUpload, processRequest } = require("graphql-upload");
const fs = require("fs");
const util = require("util");
const stream = require("stream");
const path = require("path");

const pipeline = util.promisify(stream.pipeline);
const uploadsDir = path.resolve(__dirname, "../uploads");

const schema = /* GraphQL */ `
  scalar Upload

  type Query {
    add(x: Int, y: Int): Int
  }

  type Mutation {
    uploadImage(image: Upload): Boolean
  }
`;

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    add: async (_, { x, y }) => {
      return x + y;
    }
  },
  Mutation: {
    uploadImage: async (_, { image }) => {
      const { filename, createReadStream } = await image;
      const rs = createReadStream();
      const ws = fs.createWriteStream(path.join(uploadsDir, filename));
      await pipeline(rs, ws);
      return true;
    }
  }
};

module.exports = function(fastify, options, done) {
  // doesn't work when it's a plugin
  // not sure why, Im guessing fastify encapsulation?
  // fastify.register(require('./fastify-gql-upload'), {})

  fastify.addContentTypeParser("multipart", (req, done) => {
    req.isMultipart = true;
    done();
  });

  fastify.addHook("preValidation", async function(request, reply) {
    if (!request.req.isMultipart) {
      return;
    }

    request.body = await processRequest(request.req, reply.res, options);
  });

  fastify.register(GQL, {
    schema,
    resolvers,
    graphiql: true
  });

  done();
};
