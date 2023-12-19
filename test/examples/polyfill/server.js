'use strict';

const http = require('http');
const fs = require('fs/promises');
const path = require('path');

module.exports = http.createServer(async (req, res) => {
	try {
		let document;
		if (req.url === '/secondary-content') {
			document = '<h1>Secondary content</h1>\n…';
		}
		else {
			const documentPath = path.resolve('./test/examples/polyfill/document.html');
			document = await fs.readFile(documentPath, 'utf8');
		}
		res
			.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
			.end(document);
	}
	catch (err) {
		res.writeHead(500).end(err.stack);
	}
});
