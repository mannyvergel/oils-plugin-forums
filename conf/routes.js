var pluginConf = web.plugins['oils-plugin-forums'].conf;
var controllersDir = pluginConf.controllersDir;
var path = require('path');
var forwarder = require('../controllers/forums-forwarder.js');

module.exports = {
  '/forums': web.include(path.join(controllersDir, 'forums-index.js')),
  '/forums/post': web.include(path.join(controllersDir, 'forums-post.js')),
  '/forums/category': web.include(path.join(controllersDir, 'forums-category.js')),
  
  //transferred to cdn
  //'/forums/public/simplemde/simplemde.min.css': function(req, res) {res.sendFile(path.join(web.conf.baseDir, pluginConf.pluginPath, 'public/simplemde/simplemde.min.css'))},
  //'/forums/public/simplemde/simplemde.min.js': function(req, res) {res.sendFile(path.join(web.conf.baseDir, pluginConf.pluginPath, 'public/simplemde/simplemde.min.js'))},
  
  '/admin/forums': forwarder('/admin/dbedit/list?model=ForumsForum'),

  '/admin/forums/categories': forwarder('/admin/dbedit/list?model=ForumsCategory&cols=' 
  								+ encodeURIComponent('["name", "desc"]') 
  								+ '&sort=' + encodeURIComponent('{"seq": 1}')
  								+ '&displayName=Category' 
  								+ '&saveParams=' 
  								+ encodeURIComponent('saveView=' + pluginConf.pluginPath + '/views/admin/categories-save.html' 
  										+ '&displayName=Category')),

}