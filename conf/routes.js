'use strict';

const pluginConf = web.plugins['oils-plugin-forums'].conf;
const controllersDir = pluginConf.controllersDir;
const path = require('path');
const forwarder = require('../controllers/forums-forwarder.js');

const forumsTopicController = web.include(path.join(controllersDir, 'forums-topic.js'));
const forumsCategoryController = web.include(path.join(controllersDir, 'forums-category.js'));

module.exports = {
  '/forums': web.include(path.join(controllersDir, 'forums-index.js')),

  '/forums/tab/:tab': web.include(path.join(controllersDir, 'forums-index-tab.js')),

  '/forums/public/forums-main.css': function(req, res, next) {web.utils.serveStaticFile(pluginConf.pluginPath + '/public/forums-main.css', res)},

  '/forums/post': web.include(path.join(controllersDir, 'forums-post.js')),

  '/forums/topic/:TOPIC_ID/:TITLE_SLUG': forumsTopicController,
  '/forums/topic/:TOPIC_ID':forumsTopicController ,
  '/forums/topic': forumsTopicController,

  '/forums/reply': web.include(path.join(controllersDir, 'forums-reply.js')),

  '/forums/category/:CAT_ID/:SLUG': forumsCategoryController,
  '/forums/category/:CAT_ID': forumsCategoryController,
  '/forums/category': forumsCategoryController,
  
  //transferred to cdn
  //'/forums/public/simplemde/simplemde.min.css': function(req, res) {res.sendFile(path.join(web.conf.baseDir, pluginConf.pluginPath, 'public/simplemde/simplemde.min.css'))},
  //'/forums/public/simplemde/simplemde.min.js': function(req, res) {res.sendFile(path.join(web.conf.baseDir, pluginConf.pluginPath, 'public/simplemde/simplemde.min.js'))},
  
  '/admin/forums': forwarder('/admin/dbedit/list?model=ForumsForum&displayName=Forum'),

  '/admin/forums/categories': forwarder('/admin/dbedit/list?model=ForumsCategory&cols=' 
  								+ encodeURIComponent('["name", "desc"]') 
  								+ '&sort=' + encodeURIComponent('{"seq": 1}')
  								+ '&displayName=Category' 
  								+ '&saveParams=' 
  								+ encodeURIComponent('saveView=' + pluginConf.pluginPath + '/views/admin/categories-save.html' 
  										+ '&displayName=Category')),


  '/forums/action/flag': web.include(path.join(controllersDir, 'action', 'forums-flag.js')),
  '/forums/action/is-subscribed': web.include(path.join(controllersDir, 'action', 'forums-is-subscribed.js')),
  '/forums/action/subscribe': web.include(path.join(controllersDir, 'action', 'forums-subscribe.js')),
  '/forums/action/subscribe-wredirect': web.include(path.join(controllersDir, 'action', 'forums-subscribe-wredirect.js')),
  '/forums/action/unsubscribe': web.include(path.join(controllersDir, 'action', 'forums-unsubscribe.js')),
  '/forums/action/post-like': web.include(path.join(controllersDir, 'action', 'forums-post-like.js')),
  '/forums/action/post-like-wredirect': web.include(path.join(controllersDir, 'action', 'forums-post-like-wredirect.js')),

}

