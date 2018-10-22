var _original = Meteor.user;

var _getCache = function () {
	var result = undefined;
	var instance = DDP._CurrentMethodInvocation.get() || DDP._CurrentPublicationInvocation.get();

	if (!instance.userId) {
		return result;
	}

	var connectionId = instance.connection.id;
	var connectionData = Meteor.default_server.sessions[connectionId];
	var collectionViews = connectionData.collectionViews.users.documents[instance.userId];
	var data = collectionViews && collectionViews.dataByKey || [];


	Object.keys(data).forEach(function (item) {
		if (!result) {
			result = {};
		}

		result[item] = data[item][0].value;
	});

	return result;
}

var _getField = function (doc, field) {
	field = field.split('.');

	for (var i = 0; i < field.length; i++) {
		if (!doc[field[i]]) {
			return;
		}
		doc = doc[field[i]];
	}

	return !!doc;
}

Meteor.user = function (input) {
	if (typeof input === "undefined") {
		return _original();
	}

	if (input === true) {
		return _getCache()
	}


	if (typeof input === "string") {
		input = [input];
	} 

	if (typeof input === "object") {
		var cache = _getCache()
		var innocent = true;

		input.forEach(function (item) {
			if (!_getField(cache, item)) {
				innocent = false;
			}
		})

		if (innocent) {
			return cache;
		} else {
			return _original()
		}
	}
}
