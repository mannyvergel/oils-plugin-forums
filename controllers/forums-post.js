var pluginConf = web.plugins['oils-plugin-forums'].conf;
var Post = web.models('ForumsPost');
var sync = require('synchronize');

module.exports = {
  get: function(req, res) {
  	sync.fiber(function() {
  		var queryPostId = req.query._id;

  		var post = {};
  		if (queryPostId) {
  			post = sync.await(Post.findOne({_id: queryPostId}).exec(sync.defer()));
  		}

  		res.renderFile(pluginConf.viewsDir + 'forums-post.html', {post: post, pluginConf: pluginConf});
  	});
    
  }
}