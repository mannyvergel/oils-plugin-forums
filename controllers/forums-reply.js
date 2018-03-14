var pluginConf = web.plugins['oils-plugin-forums'].conf;
var Post = web.models('ForumsPost');
var sync = require('synchronize');
var path = require('path');
var Topic = web.models('ForumsTopic');
var Category = web.models('ForumsCategory');

module.exports = {
  get: [web.auth.loginUtils.handleLogin, function(req, res) {
  	sync.fiber(function() {
  		var queryPostId = req.query._id;

  		var post = {};
  		if (queryPostId) {
  			post = sync.await(Post.findOne({_id: queryPostId}).lean().populate('topic').exec(sync.defer()));
  		}

      if (!req.query.topic) {
        throw new Error("Topic ID not found!");
      }
      
      var topic = sync.await(Topic.findOne({_id: req.query.topic}).lean().exec(sync.defer()));
      if (!topic) {
        throw new Error("Topic not found!");
      }
      
      //console.log('!!!!', post, category);

  		res.renderFile(path.join(pluginConf.viewsDir, 'forums-reply.html'), 
        { post: post, 
          topic: topic,
          pluginConf: pluginConf });
  	});
    
  }],

  post: [web.auth.loginUtils.handleLogin, function(req, res) {
    sync.fiber(function() {

      //TODO: checker for double posts

      var topic = sync.await(Topic.findOne({_id: req.body.topicId}, sync.defer()));
      if (!topic) {
        throw new Error("Topic not found.");
      }

      var post;
      if (req.query._id) {
        post = sync.await(Post.findOne({_id: req.body._id}, sync.defer()));
        if (!post) {
          throw new Error("Post not found.");
        }
      } else {
        post = new Post();
        post.createBy = req.user._id;
      }

      post.topic = topic._id;
      post.msg = req.body.msg;
      post.user = req.user._id;


      post.updateBy = req.user._id;
      post.updateDt = new Date();

      sync.await(post.save(sync.defer()));

      Category.addActiveUser(topic.category, req.user);
      Topic.addActiveUser(topic._id, req.user);

      req.flash('info', 'Reply posted');
      res.redirect('/forums/topic?_id=' + topic._id);

    });
  }]
}