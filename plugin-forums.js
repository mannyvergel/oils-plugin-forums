var fs = require('fs');
var path = require('path');

module.exports = function(pluginConf, web, done) {
  
  pluginConf = Object.assign(require('./conf/conf.js'), pluginConf);
  web.plugins['oils-plugin-forums'].conf = pluginConf;

  loadModels(pluginConf);

  var routes = require('./conf/routes.js');

  web.applyRoutes(routes);

  loadDummyData(function() {
    done();
  });

  
}

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

function loadDummyData(cb) {
  var Forum = web.models('ForumsForum');
  Forum.find({}).limit(2).exec(function(err, forums) {
    if (err) {
      cb(err);
      return;
    }

    if (!forums || forums.length == 0) {
      var forum = new Forum();
      forum.tz = 'Asia/Manila';
      //TODO: make this web based config
      forum.forumId = 'main';
      forum.save(function(err) {
        console.log("Created main forum for the first time");
        cb(err);
      })
      
    } else {
      cb(null);
    }

    
  })
}