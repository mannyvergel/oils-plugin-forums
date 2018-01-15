var pluginConf = web.plugins['oils-plugin-forums'].conf;
var Post = web.models('ForumsPost');
var sync = require('synchronize');
var path = require('path');
var ForumsPost = web.models('ForumsPost');
var ForumsTopic = web.models('ForumsTopic');

module.exports = {
  get: function(req, res) {
  	sync.fiber(function() {
  		var queryPostId = req.query._id;

  		var post = {};
  		if (queryPostId) {
  			post = sync.await(Post.findOne({_id: queryPostId}).exec(sync.defer()));
  		}

  		res.renderFile(path.join(pluginConf.viewsDir, 'forums-post.html'), {post: post, pluginConf: pluginConf});
  	});
    
  },

  post: function(req, res) {
    sync.fiber(function() {
      var topic = new ForumsTopic();
      topic.title = req.body.title;
      topic.category = req.body.category;
      topic.tags = req.body.tags;

      sync.await(topic.save(sync.defer()));

      var post = new ForumsPost();
      post.topic = topic._id;
      post.msg = req.body.msg;
      post.userProfile = req.forumsUserProfile._id;

      sync.await(post.save(sync.defer()));

      req.flash('info', 'Message posted');
      res.redirect('/forums/topic?_id=' + topic._id);

    });
  }
}