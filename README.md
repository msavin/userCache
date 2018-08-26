# Meteor.userCache 

Meteor.userCache builds upon three simple premises:
1. Every time you run Meteor.user() on the server, it has to call the database to retrieve the user document
2. Every time a user account connects to your server, Meteor automatically subscribes for to their user document
3. Whenever a subscription is running, the documents that are part of that subscription are cached to the server

Thus, instead of querying the database every time that `Meteor.user()` is ran, we could first see if it's sufficient to retrieve it from the server-side cache (also known as MergeBox). Since MergeBox is fast and real-time (in fact, it gets the data before the client), the risk of stale data may be insignificant.

The benefit of using `Meteor.userCache()` over `Meteor.user()` is 
 - fewer database queries
 - greater performance
 - faster response time

## How to Use

First, add to the package to your application:

```bash
meteor add msavin:usercache
```

Second, use `Meteor.userCache()` as you would use `Meteor.user()`:

```js
Meteor.methods({
	"posts/create": function (content) {
		var userDoc = Meteor.userCache() || Meteor.user();

		if (!userDoc.profile.roles.includes("banned")) {
			Posts.insert({
				user: Meteor.userId(),
				date: new Date(),
				content: content
			})
		}
	}
})
```

In the example above, instead of querying the database for the user document every time a post is made, we can:
 - first, try to get the cached user data
 - second, revert to a database call if no cache is available
 - third, authorize the request
 
Not only would this reduce a significant amount of database queries, but it also speeds up how quickly messages are inserted into the database and sent out to the other users.

## Status

This package works fine, but is currently out as a proof of concept. 
