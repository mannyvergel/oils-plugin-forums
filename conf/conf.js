'use strict';

const path = require('path');
const pluginConf = web.plugins['oils-plugin-forums'].conf;

module.exports = {
  hostUrl: 'http://localhost:8080',
  emailReplaceNewLineWithBr: true,
  mainTemplate: 'templates/main.html',
  defaultForumsName: 'Forums',
  defaultForumsId: 'forum',
  controllersDir: path.join(pluginConf.pluginPath,  'controllers'),
  modelsDir: path.join(pluginConf.pluginPath,  'models'),
  viewsDir: path.join(pluginConf.pluginPath, 'views'),
  forumsIndexPageLimit: 1,
  forumsIndexRowsPerPage: 20,
}