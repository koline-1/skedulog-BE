const { makeExecutableSchema } = require('@graphql-tools/schema');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
const { loadFilesSync } = require('@graphql-tools/load-files');


const loadedTypes = loadFilesSync(`${__dirname}/**/*.typeDefs.js`);

const loadedResolvers = loadFilesSync(
    [
        `${__dirname}/**/*.scalars.js`,
        `${__dirname}/**/*/*.{queries,mutations}.js`
    ]
);

const typeDefs = mergeTypeDefs(loadedTypes);

const resolvers = mergeResolvers(loadedResolvers);

const schema = makeExecutableSchema({ 
    typeDefs,
    resolvers
});

export default schema;
