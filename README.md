# userCache for Meteor

userCache builds upon three simple premises:
1. Every time you run Meteor.user() on the server, it has to call the database to retrieve the user document
2. Every time a user account connects to your server, Meteor automatically subscribes for to their user document
3. Whenever a subscription is running, the documents that are part of that subscription are cached to the server

Thus, instead of querying the database every time that `Meteor.user()` is ran, we could first see if it's sufficient to retrieve it from the server-side cache (also known as MergeBox). Since MergeBox is fast and real-time (in fact, it gets the data before the client), the risk of stale data may be insignificant.

The benefit of using userCache are:
 - fewer database queries and the associated overhead
 - faster performance and response time
 - complete backwards compatiblity

## How to Use

To add the package, run:

```bash
meteor add msavin:usercache
```

Once you add the package, Meteor.user() will be enhanced with new properties.

```javascript
Meteor.user()                              // works as usual
Meteor.user(true)                          // gets data from mergebox
Meteor.user("profile.name")				   // verifies if the fields are in MergeBox. If not, it retrieves the document from the database
Meteor.user(['profile.name', 'email'])     // verifies if the fields are in MergeBox. If not, it retrieves the document from the database
```

## Example

In the example below, we are using `Meteor.user()` for a roles check to ensure that the user is not banned. Typically, this would require us to ping the database. However, with the userCache package, we can bypass that entire query, and all the processing that comes with it. By doing so, we improve performance and speed up response time.  

```js
Meteor.methods({
	"posts/create": function (content) {
		var userDoc = Meteor.user(["profile.roles"])

		var authorization = function () {
			return !!userDoc.profile.roles.includes("banned");
		}

		if (authorization()) {
			Posts.insert({
				user: Meteor.userId(),
				date: new Date(),
				content: content
			})
		}
	}
})
```