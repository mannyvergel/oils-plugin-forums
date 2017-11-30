var fs = require('fs');
var path = require('path');

var sync = require('synchronize');



function loadModels(pluginConf) {
  var modelsDir = pluginConf.modelsDir;
  var arrFiles = fs.readdirSync(path.join(web.conf.baseDir, modelsDir));
  //console.log('!', arrFiles)
  for (var i=0; i<arrFiles.length; i++) {
    if (web.stringUtils.endsWith(arrFiles[i], '.js')) {
      //console.log('!!!!', arrFiles[i])
      web.includeModel(path.join(modelsDir, arrFiles[i]));
    }
    
  }
}

function loadDummyData() {
  var Forum = web.models('ForumsForum');
  var forums = sync.await(Forum.find({}).limit(2).exec(sync.defer()));
  if (!forums || forums.length == 0) {
    var forum = new Forum();
    forum.tz = 'Asia/Manila';
    //TODO: make this web based config
    forum.forumId = 'main';
    sync.await(forum.save(sync.defer()));

    console.log("Created main forum for the first time");
  }
}

module.exports = function(pluginConf, web, done) {

  sync.fiber(function(){
  
    pluginConf = Object.assign(require('./conf/conf.js'), pluginConf);
    web.plugins['oils-plugin-forums'].conf = pluginConf;

    loadModels(pluginConf);

    if (pluginConf.addToMenu) {
      web.cms.adminMenu.push({
        headerText:'Forums',
        permissions: ['ADMIN'],
        items:[
          { text: 'Categories', link:'/admin/forums/categories'},
        ]
      })
    }

    var routes = require('./conf/routes.js');

    web.applyRoutes(routes);

    loadDummyData();

    done();

  });

  
}
