'use strict';

module.exports = function setup (server) {
	let resolvePendingServerOrigin;
	const pendingServerOrigin = new Promise(resolve => {
		resolvePendingServerOrigin = resolve;
	});

	before('server is ready', () => {
		server.listen(0, () => {
			resolvePendingServerOrigin(`http://localhost:${server.address().port}`);
		});
	});

	after('server is closed', () => {
		server.closeAllConnections();
		server.close();
	});

	return pendingServerOrigin;
};
