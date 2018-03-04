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
  			post = sync.await(Post.findOne({_id: queryPostId}).populate('topic').exec(sync.defer()));
  		}

      var categories = sync.await(Category.find({}).sort({name: 1}).lean().exec(sync.defer()));



      var category = (post.topic ? post.topic.category : null) || req.query.category;
      if (!category) {
        for (var i=0; i<categories.length; i++) {
          if (categories[i].name == 'Uncategorized') {
            console.debug('Uncategorized selected.');
            category = categories[i]._id.toString();
            break;
          }
        }
      }


      //console.log('!!!!', post, category);

  		res.renderFile(path.join(pluginConf.viewsDir, 'forums-post.html'), 
        { post: post, 
          category: category,
          categories: categories,
          pluginConf: pluginConf });
  	});
    
  }],

  post: [web.auth.loginUtils.handleLogin, function(req, res) {
    sync.fiber(function() {
      var topic = new Topic();
      topic.title = req.body.title;
      topic.category = req.body.category;

      var tags = [];
      var arrUncleanTags = req.body.tags.split(',');
      for (var i in arrUncleanTags) {
        var cleanTag = arrUncleanTags[i].trim().toLowerCase();
        if (!web.stringUtils.isEmpty(cleanTag)) {
          tags.push(cleanTag);
        }
        
      }
      topic.tags = tags;

      topic.createBy = req.user._id;
      topic.updateBy = req.user._id;
      topic.updateDt = new Date();

      sync.await(topic.save(sync.defer()));

      var post = new Post();
      post.topic = topic._id;
      post.msg = req.body.msg;
      post.userProfile = req.forumsUserProfile._id;


      post.createBy = req.user._id;
      post.updateBy = req.user._id;
      post.updateDt = new Date();

      sync.await(post.save(sync.defer()));

      req.flash('info', 'Message posted');
      res.redirect('/forums/topic?_id=' + topic._id);

    });
  }]
}