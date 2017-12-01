var pluginConf = web.plugins['oils-plugin-forums'].conf;
var path = require('path');
var sync = require('synchronize');
var Category = web.models('ForumsCategory');

module.exports = {
  get: function(req, res) {
  	sync.fiber(function() {
  		var categories = sync.await(Category.find({}).lean().sort({seq: 1}).exec(sync.defer()));
  		res.renderFile(path.join(pluginConf.viewsDir, 'forums-index.html'), {categories: categories, pluginConf: pluginConf}); 
  	});
  }
}