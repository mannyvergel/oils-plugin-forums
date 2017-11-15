var pluginConf = web.plugins['oils-plugin-forums'].conf;
var controllersDir = pluginConf.controllersDir;

module.exports = {
  '/forums': require(controllersDir + 'forums-naked.js'),
  '/forums/:id': require(controllersDir + 'forums-index.js'),
}