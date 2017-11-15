var pluginConf = web.plugins['oils-plugin-forums'].conf;

module.exports = {
  get: function(req, res) {
    res.renderFile(pluginConf.viewsDir + 'forums-index.html', {pluginConf: pluginConf}); 
  }
}