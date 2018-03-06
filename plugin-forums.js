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
    pluginConf.userProfileNeedsUpdating = true;

    web.plugins['oils-plugin-forums'].conf = pluginConf;
    web.plugins['oils-plugin-forums'].constants = require('./conf/constants.js');
    web.plugins['oils-plugin-forums'].utils = require('./lib/utils.js');

    loadModels(pluginConf);

    web.cms.adminMenu.push({
      headerText:'Forums',
      permissions: ['ADMIN'],
      items:[
        { text: 'Forum', link:'/admin/forums'},
        { text: 'Categories', link:'/admin/forums/categories'},
      ]
    })

    web.app.use(defaultForumMiddleware);
    web.app.use(forumUserProfileMiddleware)
    web.addRoutes(require('./conf/routes.js'));

    web.on('beforeRender', function(view, options, callback, req, res) {
      options = options || {};
      options.defaultForum = req.defaultForum;
    });

    loadDummyData();

    done();

  });

  
}

var defaultForumCache = null;

function forumUserProfileMiddleware(req, res, next) {
  sync.fiber(function(){
    if (!web.stringUtils.startsWith(req.url, '/forums')) {
      //console.log('!!!!!!Skipping', req.forumsUserProfile);

      next();
      return;
    }
    //remove req user forums profile if user is logged out
    if (!req.user && req.forumsUserProfile) {
      req.forumsUserProfile = null;
    }

    //remove req user profile from cache if different user
    if (req.user && req.forumsUserProfile && !req.user._id.equals(forumsUserProfile.user)) {
      req.forumsUserProfile = null;
    }

    //if forums profile doesn't exist and logged in
    if (!req.forumsUserProfile && req.user) {
      var ForumsUserProfile = web.models('ForumsUserProfile');
      var forumsUserProfile = sync.await(ForumsUserProfile.findOne({user:req.user._id}).lean().exec(sync.defer()));

      if (!forumsUserProfile) {
        console.log("Creating forums user profile for the first time:", req.user.username);
        forumsUserProfile = new ForumsUserProfile();
        forumsUserProfile.user = req.user._id;
        sync.await(forumsUserProfile.save(sync.defer()));

        forumsUserProfile = forumsUserProfile.toObject();
      }

      req.forumsUserProfile = forumsUserProfile;

      //console.log('!!!!!!', req.forumsUserProfile);
    
      //web.plugins['oils-plugin-forums'].conf.userProfileNeedsUpdating = false;
    }
    

    next();
  });
}

function defaultForumMiddleware(req, res, next) {
      sync.fiber(function(){
        //if (req.url.indexOf('/admin/forums') == 0 && req.url.indexOf('/forums') == 0) {
        if (!defaultForumCache) {
          var Forum = web.models('ForumsForum');

          var forumParams = {};
          var forumId = req.query.forumId;
          if (forumId) {
            //TODO: permission to get this forum!!
            forumParams = {forumId: forumId};
          } else {
            forumFinder = Forum.find({}).limit(2);

          }

          var forums = sync.await(Forum.find(forumParams).limit(2).lean().exec(sync.defer()));

          if (!forums) {
            throw new Error("Default forum not found!");
          } else {
            //get the one default forum if forum ID is not specified
            if (forums.length > 1) {
              throw new Error("There are multiple forums found! Need to specify forumId");
            } else {
              defaultForumCache = forums[0];
            }
          }
        }

        req.defaultForum = defaultForumCache;

        next();
      });
    }
