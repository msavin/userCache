Meteor.userCache = function () {
	var instance = DDP._CurrentMethodInvocation.get() || DDP._CurrentPublicationInvocation.get();

	if (!instance.userId) {
		return;
	}

	var connectionId = instance.connection.id;
	var connectionData = Meteor.default_server.sessions[connectionId];
	var collectionViews = connectionData.collectionViews.users.documents[instance.userId];
	var data = collectionViews && collectionViews.dataByKey || [];
	var result = undefined;

	Object.keys(data).forEach(function (item) {
		if (!result) {
			result = {};
		}

		result[item] = data[item][0].value;
	});

	return result;
}
