const pluginConf = web.plugins['oils-plugin-forums'].conf;
const Post = web.models('ForumsPost');

const path = require('path');
const Topic = web.models('ForumsTopic');
const Category = web.models('ForumsCategory');

module.exports = {
  get: [web.auth.loginUtils.handleLogin, async function(req, res) {
	
		let queryPostId = req.query._id;

		let post = {};
		if (queryPostId) {
			post = await Post.findOne({_id: queryPostId}).lean().populate('topic').exec();
		}

    if (!req.query.topic) {
      throw new Error("Topic ID not found!");
    }
    
    let topic = await Topic.findOne({_id: req.query.topic}).lean().exec();

    if (!topic) {
      throw new Error("Topic not found!");
    }
    
    //console.log('!!!!', post, category);

		res.renderFile(path.join(pluginConf.viewsDir, 'forums-reply.html'), 
      { post: post, 
        topic: topic,
        pluginConf: pluginConf });
  	
    
  }],

  post: [web.auth.loginUtils.handleLogin, async function(req, res) {
    
    //TODO: checker for double posts

    let topic = await Topic.findOne({_id: req.body.topicId});
    if (!topic) {
      throw new Error("Topic not found.");
    }

    let post;
    if (req.query._id) {
      post = await Post.findOne({_id: req.body._id});
      if (!post) {
        throw new Error("Post not found.");
      }
      post.isEdited = "Y";
    } else {
      post = new Post();
      post.createBy = req.user._id;
    }

    post.topic = topic._id;
    post.msg = req.body.msg;
    post.user = req.user._id;


    post.updateBy = req.user._id;
    post.updateDt = new Date();

    await post.save();

    Topic.addActiveUser(topic._id, req.user);

    web.subs.subscribe(post.topic, req.user._id);

    req.flash('info', 'Reply posted');
    res.redirect('/forums/topic?_id=' + topic._id);

  }]
}