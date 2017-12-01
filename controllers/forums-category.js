var pluginConf = web.plugins['oils-plugin-forums'].conf;
var path = require('path');
var sync = require('synchronize');
var Category = web.models('ForumsCategory');

module.exports = {
  get: function(req, res) {
  	sync.fiber(function() {
  		var queryCatId = req.query._id;
  		var category = sync.await(Category.findOne({_id: queryCatId}).lean().sort({seq: 1}).exec(sync.defer()));

  		
  		res.renderFile(path.join(pluginConf.viewsDir, 'forums-category.html'), {category: category, pluginConf: pluginConf}); 
  	});
  }
}