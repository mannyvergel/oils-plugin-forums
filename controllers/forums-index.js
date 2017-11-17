var pluginConf = web.plugins['oils-plugin-forums'].conf;
var path = require('path');
module.exports = {
  get: function(req, res) {
    res.renderFile(path.join(pluginConf.viewsDir, 'forums-index.html'), {pluginConf: pluginConf}); 
  }
}