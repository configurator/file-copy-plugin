"use strict";

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const defaultOptions = {
	// Path to look in
	path: '.',

	// Glob for files to find in path
	glob: '**/*',

	// A function to run on each found file to decide whether or not to include it
	// Can also be a boolean to include/exclude all files
	test: true,

	// Only copy a single file
	singleFile: false,

	// Only valid in combination with singleFile; the name for the output file
	outputFileName: '',

	// Set to true to disable console output
	verbose: false,
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

class FileCopyPlugin {
	constructor(options) {
		this.options = getOptions(options);
		this.options.testFunction = testFunction(this.options.test);
	}

	apply(compiler) {
		const options = this.options;

		compiler.plugin('emit', (compilation, callback) => {
			const generateFiles = function (files) {
				for (let { filename, fullPath } of files) {
					if (options.testFunction(filename)) {
						let asset = fs.readFileSync(fullPath);
						compilation.assets[filename] = {
							source: () => asset,
							size: () => asset.length
						};
					}
				}

				if (options.verbose) {
					console.log(`FileCopyPlugin: ${files.length} files emitted`);
				}
			}

			if (options.singleFile) {
				generateFiles([{
					filename: options.outputFileName,
					fullPath: options.path
				}]);

				callback();
			} else {
				glob(options.glob, { cwd: options.path, nodir: true }, (err, files) => {
					if (err) {
						throw 'FileCopyPlugin: Error occured searching for files.';
					}

					generateFiles(files.map(file => ({
						filename: file,
						fullPath: path.join(options.path, file)
					})));

					callback();
				});
			}
		});
	}
}

module.exports = FileCopyPlugin;
