import GraphQLHTTPWSServer from "graphql-http-ws-server";
import graphQLEventServerSchema from "./graphQLEventServerSchema";

export default async (config) => {
	new GraphQLHTTPWSServer(graphQLEventServerSchema, config.server);
}