"use strict";

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const defaultOptions = {
	path: '.',
	glob: '**/*',
	test: true
};

const getOptions = function (options) {
	var result = {};
	for (var prop in defaultOptions) {
		result[prop] = defaultOptions[prop];
	}
	for (var prop in options) {
		result[prop] = options[prop];
	}
	return result;
};

const testFunction = function (test) {
	if (typeof test === 'function') {
		return test;
	} else if (test instanceof RegExp) {
		return path => test.test(path);
	} else if (typeof test === 'boolean') {
		return path => test;
	} else {
		throw "FileCopyPlugin: test type not supported";
	}
};

class NgtemplatesAutoLoaderPlugin {
	constructor(options) {
		this.options = getOptions(options);
		this.options.testFunction = testFunction(this.options.test);
	}

	apply(compiler) {
		const options = this.options;

		compiler.plugin('emit', (compilation, callback) => {
			glob(options.glob, { cwd: options.path, nodir: true }, (err, files) => {
				if (err) {
					throw 'FileCopyPlugin: Error occured searching for files.';
				}

				for (let file of files) {
					if (options.testFunction(file)) {
						let fullPath = path.join(options.path, file);
						let asset = fs.readFileSync(fullPath);
						compilation.assets[file] = {
							source: () => asset,
							size: () => asset.length
						};
					}
				}

				console.log(`FileCopyPlugin: ${files.length} files emitted`);

				callback();
			});
		});
	}
}

module.exports = NgtemplatesAutoLoaderPlugin;
