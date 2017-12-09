var pluginConf = web.plugins['oils-plugin-forums'].conf;
var Topic = web.models('ForumsTopic');
var sync = require('synchronize');

module.exports = {
  get: function(req, res) {
  	sync.fiber(function() {
  		var queryTopicId = req.query._id;

  		var topic = {};
  		if (queryPostId) {
  			topic = sync.await(Topic.findOne({_id: queryPostId}).exec(sync.defer()));
  		}

  		res.renderFile(pluginConf.viewsDir + 'forums-post.html', {post: post, pluginConf: pluginConf});
  	});
    
  }
}