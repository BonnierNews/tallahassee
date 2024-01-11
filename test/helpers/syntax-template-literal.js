'use strict';

module.exports = {
	html: syntaxTemplateLiteral,
};

function syntaxTemplateLiteral (strings, ...values) {
	return String.raw({ raw: strings }, ...values);
}
