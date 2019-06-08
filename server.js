var _original = Meteor.user;
// check meteor version.  Be forwards compatible for future major and minor versions also.
// Note that 1.10 < 1.8 so need to convert to 110 and 108 for comparison
var isMeteor1_8 = Meteor.release.match(/(\d+)\.(\d+)/);
isMeteor1_8 = (isMeteor1_8[1]*100 + isMeteor1_8[2]*1) >= 108;

var _getCache = function () {
	var result = undefined;
	var instance = DDP._CurrentMethodInvocation.get() || DDP._CurrentPublicationInvocation.get();

	if (!instance.userId) {
		return result;
	}

	var connectionId = instance.connection.id;
	var connectionData = isMeteor1_8 ? Meteor.default_server.sessions.get(connectionId) : Meteor.default_server.sessions[connectionId];
	// https://github.com/msavin/userCache/issues/5#issuecomment-498835713
	if (!connectionData) {
		return result;
	}
	var collectionViews = isMeteor1_8 ? connectionData.collectionViews.get('users').documents.get(instance.userId) : connectionData.collectionViews.users.documents[instance.userId];
	var data = collectionViews && collectionViews.dataByKey || [];
	var source = isMeteor1_8 ? Array.from(data.entries()) : Object.keys(data);

	source.forEach(function (item) {
		if (!result) {
			// ensure the _id field is included https://github.com/msavin/userCache/issues/9
			result = {_id: instance.userId};
		}
		var key = isMeteor1_8 ? item[0] : item;
        result[key] = isMeteor1_8 ? item[1][0].value : data[item][0].value;
	});

	return result;
}

var _getField = function (doc, field) {
	field = field.split('.');

	for (var i = 0; i < field.length; i++) {
		if (Array.isArray(doc)) {
			// https://github.com/msavin/userCache/issues/8
			if (!doc.length) {
				return;
			}
			if (field[i] === "[]") {
				// Skip to next field, only required if requested field is eg "emails.[].address"
				continue;
			}
			doc = doc[0];
		}
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
		return _getCache();
	}

	if (typeof input === "string") {
		input = [input];
	}

	if (typeof input === "object") {
		var cache = _getCache();
		// some instances of _getCache() returning null inside a reactive publish (when logging out?)
		// https://github.com/msavin/userCache/issues/5#issuecomment-498835713
		var innocent = !!cache;
		var fields = {}; // for storing list of required fields for later

		input.forEach(function (item) {
			fields[item] = 1;
			if (innocent && typeof _getField(cache, item) === "undefined") {
				innocent = false;
			}
		})

		// console.log({innocent, input});
		if (innocent) {
			return cache;
		} else {
			// fetch only the required fields to reduce data transfer
			// https://github.com/msavin/userCache/issues/7
			const userId = Meteor.userId();
			return userId ? Meteor.users.findOne(userId, {fields}) : null;
		}
	}
}
