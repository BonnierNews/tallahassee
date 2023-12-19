'use strict';

const http = require('http');
const fs = require('fs/promises');
const path = require('path');

module.exports = http.createServer(async (req, res) => {
	try {
		const documentPath = path.resolve('./test/examples/source-code-resource/document.html');
		const document = await fs.readFile(documentPath, 'utf8');
		res
			.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
			.end(document);
	}
	catch (err) {
		res.writeHead(500).end(err.stack);
	}
});
