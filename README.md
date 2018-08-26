# Meteor.userCache 

Meteor.userCache builds upon three simple premises:
1. Every time you run Meteor.user() on the server, it has to call the database to retrieve the user document.
2. Every time a user account connects to your server, Meteor automatically subscribes for their user document.
3. Every time a subscription is started, the documents of subscription are cached on the server.

Instead of querying the database every time that `Meteor.user()` is executed, we should first see if it's sufficient to retrieve it from the server-side cache (MergeBox). Since the server-side cache is updated in real-time, the risk of stale data may be insignificant.

The result is: 
 - fewer database queries
 - better performance
 - faster response time

## How to Use

First, add to the package to your application:

```bash
meteor add msavin:usercache
```

Second, use `Meteor.userCache()` as you would use `Meteor.user()` inside of a Method or Publication

```js
Meteor.methods({
	"posts/create": function (content) {
		var userDoc = Meteor.userCache() || Meteor.user();

		if (!userDoc.profile.roles.includes("banned")) {
			Posts.insert({
				user: userDoc._id,
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

This package works fine, but is currently out as a proof of concept. 
