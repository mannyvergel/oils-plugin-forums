const pluginConf = web.plugins['oils-plugin-forums'].conf;
const Post = web.models('ForumsPost');

const path = require('path');
const Topic = web.models('ForumsTopic');
const Category = web.models('ForumsCategory');

module.exports = {
  get: [web.auth.loginUtils.handleLogin, async function(req, res) {
  	
  	let queryPostId = req.query._id;

    let post = await Post.findOne({_id: queryPostId}).populate('topic').lean().exec();

    let topic = null;
    if (post) {
      topic = post.topic;
    }

    let categoryId = (topic ? topic.category : null) || req.query.category;

    let category = await Category.findOne({_id: categoryId}).lean().exec();
    let categories = await Category.find({}).sort({name: 1}).lean().exec();


    //console.log('!!!!', post, category);

  	res.renderFile(path.join(pluginConf.viewsDir, 'forums-post.html'), 
      { post: post, 
        category: category,
        topic: topic,
        categories: categories,
        pluginConf: pluginConf });
  	
  }],

  post: [web.auth.loginUtils.handleLogin, async function(req, res) {
   
      //TODO: checker for double posts

      let topic = new Topic();
      topic.title = req.body.title;
      topic.category = req.body.category;

      let tags = [];
      let tagStr = req.body.tags;
      let arrUncleanTags;
      
      if (tagStr.indexOf("#") != -1) {
        arrUncleanTags = tagStr.split('#');
      } else {
        arrUncleanTags = tagStr.split(',');
      }

      for (let i in arrUncleanTags) {
        let cleanTag = arrUncleanTags[i].trim().toLowerCase();
        if (!web.stringUtils.isEmpty(cleanTag)) {
          tags.push(cleanTag);
        }
        
      }
      topic.tags = tags;

      topic.createBy = req.user._id;
      topic.updateBy = req.user._id;
      topic.updateDt = new Date();

      await topic.save();

      let post = new Post();
      post.topic = topic._id;
      post.msg = req.body.msg;
      post.user = req.user._id;


      post.createBy = req.user._id;
      post.updateBy = req.user._id;
      post.updateDt = new Date();

      await post.save();

      Category.addActiveUser(topic.category, req.user);
      Topic.addActiveUser(topic._id, req.user);

      req.flash('info', 'Message posted');
      res.redirect('/forums/topic?_id=' + topic._id);

  }]
}