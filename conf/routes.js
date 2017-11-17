var pluginConf = web.plugins['oils-plugin-forums'].conf;
var controllersDir = pluginConf.controllersDir;
var path = require('path');

module.exports = {
  '/forums': web.include(path.join(controllersDir, 'forums-naked.js')),
  '/forums/:forumId': web.include(path.join(controllersDir, 'forums-index.js')),
  '/forums/:forumId/post/:postId': web.include(path.join(controllersDir, 'forums-post.js')),
}