'use strict';

const pluginConf = web.plugins['oils-plugin-forums'].conf;
const path = require('path');
const Category = web.models('ForumsCategory');
const Topic = web.models('ForumsTopic');

module.exports = {
  get: async function(req, res) {
	 res.redirect('/forums/tab/latest');
  }
}