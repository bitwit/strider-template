#!/usr/bin/env node

var start = function (pluginTitle, pluginId) {
	function makeControllerName(string) {
		var name;
		name = string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
		name = name.charAt(0).toUpperCase() + name.slice(1);
		name += "Ctrl";
		return name;
	}
	function makeSafeId(string){
		return string.replace(/-/g,'');
	}

	var fs = require('fs');
	var controllerName = makeControllerName(pluginId);

	//Rewrite package.json
	fs.readFile("package.json", 'utf8', function (err, data) {
		if (err) throw err;

		var packageJSON = JSON.parse(data);
		packageJSON.name = "strider-" + pluginId;
		packageJSON.strider.title = pluginTitle;
		packageJSON.strider.id = pluginId;
		packageJSON.strider.config.controller = controllerName;

		fs.writeFile("package.json", JSON.stringify(packageJSON, undefined, 2), function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log("package.json was updated.");
			}
		});
	});

	//Rewrite webapp.js
	fs.readFile("webapp.js", 'utf8', function (err, data) {
		if (err) throw err;

		var webappJS = data;
		webappJS = webappJS.replace(/template/g, pluginId);

		fs.writeFile("webapp.js", webappJS, function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log("webapp.js was updated.");
			}
		});
	});

	//Rewrite config.js
	fs.readFile("config/config.js", 'utf8', function (err, data) {
		if (err) throw err;

		var configJS = data;
		configJS = configJS.replace(/template/g, pluginId);
		configJS = configJS.replace(/TemplateCtrl/g, controllerName);

		fs.writeFile("config/config.js", configJS, function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log("config/config.js was updated.");
			}
		});
	});

};

// Parse Arguments and run...

// Note: nom nom doesnt play nice with `rc`. this means that passing config
// options to strider via CLI params will not work as expected. For example:
// bin/strider --db_uri=mongo://localhost addUser -l foo@example.com -p 123 -a
var parser = require('nomnom')
	, version = require('./package.json').version;

parser.command('start')
	.option('title', {
		abbr: 't', help: "Plugin Title (don't include Strider in name)"
	})
	.option('id', {
		abbr: 'i', help: "Plugin ID (no spaces, all lowercase)"
	})
	.callback(function (opts) {
		console.log('Title', opts.title);
		console.log('ID', opts.id);
		start(opts.title, opts.id);
	})
	.help("Personalize this template (find/replace with your plugin name and slug)");

if (!module.parent) {
	parser.parse();
}

module.exports = start;