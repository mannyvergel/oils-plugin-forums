var pluginConf = web.plugins['oils-plugin-forums'].conf;
var controllersDir = pluginConf.controllersDir;
var path = require('path');

module.exports = {
  '/forums': require(path.join(controllersDir, 'forums-naked.js')),
  '/forums/:forumId': require(path.join(controllersDir, 'forums-index.js')),
  '/forums/:forumId/post/:postId': require(path.join(controllersDir, 'forums-post.js')),
}