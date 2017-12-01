var pluginConf = web.plugins['oils-plugin-forums'].conf;
var controllersDir = pluginConf.controllersDir;
var path = require('path');
var forwarder = require('../controllers/forums-forwarder.js');

module.exports = {
  '/forums': web.include(path.join(controllersDir, 'forums-index.js')),
  '/forums/post/:postId': web.include(path.join(controllersDir, 'forums-post.js')),
  //'/admin/forums/categories': web.include(path.join(controllersDir, 'admin/forums-categories.js')),
  '/admin/forums/categories': forwarder('/admin/dbedit/list?model=ForumsCategory&cols=' 
  								+ encodeURIComponent('["name", "desc"]') 
  								+ '&displayName=Category&saveParams=' 
  								+ encodeURIComponent('saveView=' + pluginConf.pluginPath + '/views/admin/categories-save.html' 
  									+ '&displayName=Category')),
//'/admin/forums/categories': forwarder('/admin/dbedit/list'),

}