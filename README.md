# file-copy-plugin
Copies files directly to the output path

## Installation

	npm install --save-dev file-copy-plugin

## Usage

	const path = require('path');
	const FileCopyPlugin = require('ngtemplates-autoloader-plugin');

	// ...

	plugins: [
		// This example will copy all files ending in .ext in the assets folder, if their pathnames include the string 'copy'.
		new FileCopyPlugin({
			// Path to look for files to copy in
			path: path.join(__dirname, 'assets'),

			// File glob
			glob: '**/*.ext',

			// A function or regex to filter which files to include.
			// Can also be a boolean; true will include all files that match
			// the glob, and false will completely disable the plugin.
			test: file => file.include('copy')
		})
	]
