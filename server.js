Meteor.userCache = function () {
	var instance = DDP._CurrentMethodInvocation.get() || DDP._CurrentPublicationInvocation.get();

	if (!instance.userId) {
		return;
	}

	var connectionId = instance.connection.id;
	var connectionData = Meteor.default_server.sessions[connectionId];
	var collectionViews = connectionData.collectionViews.users.documents[instance.userId];
	var data = collectionViews.dataByKey || [];
	var result = false;

	Object.keys(data).forEach(function (item) {
		// does anyone else feel like this is risky in JS haha (I'm looking at you null!)
		if (typeof result !== "object") {
			result = {}
		}

		result[item] = data[item][0].value
	});

	return result;
}