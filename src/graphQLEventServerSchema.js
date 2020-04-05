import { makeExecutableSchema } from 'graphql-tools';
import gql from 'graphql-tag'
import EventEmitterAsyncIterator from 'event-emitter-async-iterator';
import GraphQLObjectOrPrimitiveType from "./GraphQLObjectOrPrimitiveType";

const channelsCallbacks = new Map();

const typeDefs = gql(`
	scalar ObjectOrPrimitive

	type Channel {
		id: String!
	}
	
	type Query {
		ping: String!
	}
	
	type Mutation {
		event(channel: String!, source: String!, event: ObjectOrPrimitive!): Boolean
	}
	
	type Subscription {
		event(channel: String!, excludeSource: String): ObjectOrPrimitive!
	}
`);

const resolvers = {
	ObjectOrPrimitive: GraphQLObjectOrPrimitiveType,

	Mutation: {
		event: (obj, args, context, info) => {
			const channel = args.channel;
			if(channelsCallbacks.has(channel)) {
				const channelCallbacks = channelsCallbacks.get(channel);
				for(let callback of channelCallbacks) {
					callback({
						channel: channel,
						source: args.source,
						event: args.event
					});
				}
			}
		}
	},
	Query: {
		ping: (obj, args, context) => {
			return (new Date()).toISOString();
		}
	},
	Subscription: {
		event: {
			subscribe: (obj, args, context, info) => {
				const asyncIterator = new EventEmitterAsyncIterator();

				const channel = args.channel;
				const callback = (event) => {
					if(!args.hasOwnProperty('excludeSource') || event.source !== args.excludeSource) {
						asyncIterator.pushValue({
							event: event.event
						});
					}
				};

				if(!channelsCallbacks.has(channel))
					channelsCallbacks.set(channel, new Set());

				channelsCallbacks.get(channel).add(callback);

				asyncIterator.once('return', () => {
					channelsCallbacks.get(channel).delete(callback);
					if(channelsCallbacks.get(channel).size === 0)
						channelsCallbacks.delete(channel);
				});

				return asyncIterator;
			}
		}
	}
};

export default makeExecutableSchema({
	typeDefs,
	resolvers,
});