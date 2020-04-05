# graphql-event-server
Simple GraphQL-based pub/sub server

## Example subscription

    subscription {
      event(channel: "mychannel", excludeSource: "sender1") {
        event
        source
      }
    }

    mutation {
      event(channel:"mychannel",event:12345,source:"sender2")
    }