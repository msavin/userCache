Package.describe({
  name: "msavin:usercache",
  summary: "The one simple trick that can save you millions of database requests!",
  version: '1.0.0',
  git: "https://github.com/msavin/userCache.git",
  documentation: "README.md",
});

Package.onUse(function(api) {
	api.addFiles("server.js", "server");
	api.versionsFrom("1.5");

	api.use([
		'ddp',
	], 'server');

});