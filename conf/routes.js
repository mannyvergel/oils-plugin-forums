var pluginConf = web.plugins['oils-plugin-forums'].conf;
var controllersDir = pluginConf.controllersDir;
var path = require('path');
var forwarder = require('../controllers/forums-forwarder.js');

module.exports = {
  '/forums': web.include(path.join(controllersDir, 'forums-index.js')),
  '/forums/post': web.include(path.join(controllersDir, 'forums-post.js')),
  '/forums/category': web.include(path.join(controllersDir, 'forums-category.js')),
  
  '/admin/forums': forwarder('/admin/dbedit/list?model=ForumsForum'),

  '/admin/forums/categories': forwarder('/admin/dbedit/list?model=ForumsCategory&cols=' 
  								+ encodeURIComponent('["name", "desc"]') 
  								+ '&sort=' + encodeURIComponent('{"seq": 1}')
  								+ '&displayName=Category' 
  								+ '&saveParams=' 
  								+ encodeURIComponent('saveView=' + pluginConf.pluginPath + '/views/admin/categories-save.html' 
  										+ '&displayName=Category')),

}