module.exports = function(pluginConf, web, done) {
  pluginConf = Object.assign(require('./conf/conf.js'), pluginConf);
  web.plugins['oils-plugin-forums'].conf = pluginConf;

  var routes = require('./conf/routes.js');

  web.applyRoutes(routes);

  done();
}