'use strict';

const pluginConf = web.plugins['oils-plugin-forums'].conf;
const Post = web.models('ForumsPost');

const path = require('path');
const Topic = web.models('ForumsTopic');
const Category = web.models('ForumsCategory');
const userUtils = require('../lib/userUtils.js');

module.exports = {
  get: [web.auth.loginUtils.handleLogin, async function(req, res) {
	
		let queryPostId = req.query._id;

		let post = {};
		if (queryPostId) {
			post = await Post.findOne({_id: queryPostId}).lean().populate('topic').exec();
      if (!req.user._id.equals(post.user)) {
        throw new Error("Topic not found.. invalid request.");
      }
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
    const topicIdStr = req.body.topicId;

    let topic = await Topic.findOne({_id: topicIdStr});
    if (!topic) {
      throw new Error("Topic not found.");
    }

    let post;
    if (req.query._id) {
      post = await Post.findOne({_id: req.body._id});
      if (!post) {
        throw new Error("Post not found.");
      }
      if (!req.user._id.equals(post.user)) {
        throw new Error("Topic not found.. invalid request.");
      }
      post.isEdited = "Y";
    } else {
      post = new Post();
      post.createBy = req.user._id;
    }

    post.topic = topic._id;
    post.msg = req.body.msg && req.body.msg.trim();
    post.user = req.user._id;

    if (web.stringUtils.isEmpty(post.msg)) {
      throw new Error("Message cannot be empty.");
    }

    post.updateBy = req.user._id;
    post.updateDt = new Date();

    await post.save();

    Topic.addActiveUser(topic._id, req.user);
    Topic.updateReplyCount(topic._id);

    afterPosting(post, topic, req);

    req.flash('info', 'Reply posted');
    res.redirect('/forums/topic/' + topicIdStr + '/' + topic.titleSlug + '?forumspost_p=last#lastPost');

  }]
}


async function afterPosting(post, topic, req) {
  const pluginConf = web.plugins['oils-plugin-forums'].conf;
  // const forumTitle = req.defaultForum.name || "Forums";
  const forumTitle = pluginConf.defaultForumsName;
  const listId = pluginConf.defaultForumsId + '_topic_' + post.topic;

  try {
    await web.huhumails.subscribe({
      listIds: [listId],
      emails: [req.user.email],
    })

    await web.huhumails.emailToList({
      listId: listId,
      exclude: [req.user.email],
      
      subj: `New Post for ${topic.title} - ${forumTitle}`,
      body: `Hi,

  A new reply has been posted for the topic <a href="${pluginConf.hostUrl}/forums/topic/${topic._id}/${topic.titleSlug}?forumspost_p=last#lastPost">${topic.title}.

  ${forumTitle}
  `,
      conf: {
        replaceNewLineWithBr: true
      },
    })

  } catch (ex) {
    console.error("Error after reply subs", ex);
  }

}