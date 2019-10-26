'use strict';

const pluginConf = web.plugins['oils-plugin-forums'].conf;
const Post = web.models('ForumsPost');

const path = require('path');
const Topic = web.models('ForumsTopic');
const Category = web.models('ForumsCategory');

module.exports = {
  get: [web.auth.loginUtils.handleLogin, async function(req, res) {

  	let queryPostId = req.query._id;

    // await validatePostAuth(req, queryPostId);

    let post = await Post.findOne({_id: queryPostId}).populate('topic').lean().exec();

    if (queryPostId && !post) {
      throw new Error("Invalid request [p8]")
    }

    let topic = null;
    if (post) {
      if (!req.user._id.equals(post.user)) {
        console.error("Someone attempted to edit a post that's not them", req.user, post)
        throw new Error("Invalid request [5]");
      }

      topic = post.topic;
    }

    let categoryId = (topic ? topic.category : null) || req.query.category;

    renderForumsPost(req, res, post, topic, categoryId)
  	
  }],

  post: [web.auth.loginUtils.handleLogin, async function(req, res) {

    const params = req.body;
    const queryPostId = req.query._id;
    const isCreateMode = !queryPostId;
    let post, topic;

    if (queryPostId) {
      post = await Post.findOne({_id: queryPostId}).populate('topic').exec();
      if (!req.user._id.equals(post.user)) {
        console.error("Someone attempted to edit a post that's not them", req.user, post)
        throw new Error("Invalid request [5]");
      }
      post.isEdited = 'Y';

      topic = post.topic;
    } else {
      post = new Post();
      topic = new Topic();
      topic.createBy = req.user._id;
      post.createBy = req.user._id;
    }
    

    topic.title = req.body.title || "";
    topic.title = topic.title.trim();

    post.isFirst = 'Y';

    post.topic = topic._id;
    post.msg = req.body.msg || "";
    post.msg = post.msg.trim();

    let category = req.body.category;

    try {

      if (web.stringUtils.isEmpty(topic.title)) {
        throw new Error("Title is required.");
      }

      if (topic.title.length > 80) {
        throw new Error("Title is too long. Please limit to 80 characters.")
      }

      if (web.stringUtils.isEmpty(post.msg)) {
        throw new Error("Message is required.");
      }

      topic.category = category;

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
        if (!web.stringUtils.isEmpty(cleanTag) && tags.indexOf(cleanTag) == -1) {
          tags.push(cleanTag);
        }
        
      }

      topic.tags = tags;

      topic.updateBy = req.user._id;
      topic.updateDt = new Date();

      await topic.save();


      post.user = req.user._id;
      post.updateBy = req.user._id;
      post.updateDt = new Date();

      await post.save();

      Topic.addActiveUser(topic._id, req.user);

      // web.subs.subscribe('topic_' + post.topic, req.user._id);

      try {
        const listId = 'peso_topic_' + post.topic;
        await web.huhumails.ensureMailingList({
          listId,
          listDesc: 'Pesobility Topic ' + topic.title
        });

        await web.huhumails.subscribe({
          listIds: [listId],
          emails: [req.user.email],
        })
      } catch (ex) {
        console.error("Error in mailing list", ex);
      }

      req.flash('info', 'Topic posted');
      res.redirect('/forums/topic/' + topic._id + '/' + topic.titleSlug);


    } catch (ex) {
      console.error(ex);
      req.flash('error', ex.message);

      if (isCreateMode) {
        topic._id = null;
        post._id = null;
      }
      
      renderForumsPost(req, res, post, topic, category);
    }

  }]
}


async function renderForumsPost(req, res, post, topic, categoryId) {

  let category = await Category.findOne({_id: categoryId}).lean().exec();
  if (!category) {
    category = await Category.findOne({name:'Uncategorized'}).lean().exec();
  }
  let categories = await Category.find({}).sort({seq: 1, name: 1}).lean().exec();

  let numOfPostsOfUser = await Post.find({user: req.user._id}).limit(1).estimatedDocumentCount().exec();
  let hasPostedBefore = numOfPostsOfUser > 0;

  res.renderFile(path.join(pluginConf.viewsDir, 'forums-post.html'), 
      { post: post, 
        category: category,
        topic: topic,
        hasPostedBefore: hasPostedBefore,
        categories: categories,
        pluginConf: pluginConf });
}