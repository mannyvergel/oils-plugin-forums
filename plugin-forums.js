'use strict';

const fs = require('fs');
const path = require('path');


function loadModels(pluginConf) {
  let modelsDir = pluginConf.modelsDir;
  let arrFiles = fs.readdirSync(path.join(web.conf.baseDir, modelsDir));
  //console.log('!', arrFiles)
  for (let i=arrFiles.length-1; i>=0; i--) {
    if (web.stringUtils.endsWith(arrFiles[i], '.js')) {
      //console.log('!!!!', arrFiles[i])
      web.includeModel(path.join(modelsDir, arrFiles[i]));
    }
    
  }
}

async function loadDummyData() {
  let Forum = web.models('ForumsForum');
  let forums = await Forum.find({}).limit(2).exec();
  if (!forums || forums.length == 0) {
    let forum = new Forum();
    forum.tz = 'Asia/Manila';
    //TODO: make this web based config
    forum.forumId = 'main';
    await forum.save();

    console.log("Created main forum for the first time");
  }
}

module.exports = async function(pluginConf, web, done) {

  
  pluginConf = Object.assign(require('./conf/conf.js'), pluginConf);
  pluginConf.userProfileNeedsUpdating = true;

  let pluginForums = web.plugins['oils-plugin-forums'];

  pluginForums.conf = pluginConf;
  pluginForums.constants = require('./conf/constants.js');
  pluginForums.utils = require('./lib/utils.js');

  //subscription
  pluginForums.subs = web.subs || { 
    //later can be customised

  };

  //convenience
  web.forums = pluginForums;

  loadModels(pluginConf);

  web.cms.adminMenu.push({
    headerText:'Forums',
    permissions: ['ADMIN'],
    items:[
      { text: 'Forum', link:'/admin/forums'},
      { text: 'Categories', link:'/admin/forums/categories'},
      { text: 'All Posts', link:'/admin/dbedit/list?model=ForumsPost&sort=%7B%22createDt%22%3A-1%7D&displayName=All%20Posts'},
      { text: 'Pending Posts', link:'/admin/dbedit/list?model=ForumsPost&filter=%7B%22status%22%3A%22P%22%7D&displayName=Pending%20Posts&saveParams=filterCols%3Dstatus%2Cmsg%2Cuser%26readOnly%3Dmsg%2Cuser&showAddButton=N'},
      { text: 'Flagged Posts', link:'/admin/dbedit/list?model=ForumsPost&filter=%7B%22lastFlagDt%22%3A%7B%22%24ne%22%3Anull%7D%7D&displayName=Flagged+Posts&sort=%7B%22lastFlagDt%22%3A+-1%7D&saveParams=filterCols%3Dstatus%2Cmsg%2Cuser%26readOnly%3Dmsg%2Cuser&showAddButton=N'},
    ]
  })

  web.app.use(defaultForumMiddleware);
  web.app.use(forumUserProfileMiddleware)
  web.addRoutes(require('./conf/routes.js'));

  web.on('beforeRender', function(view, options, callback, req, res) {
    options = options || {};
    options.defaultForum = req.defaultForum;
  });

  await loadDummyData();

  done();

}

let defaultForumCache = null;

async function forumUserProfileMiddleware(req, res, next) {
  
  if (!web.stringUtils.startsWith(req.url, '/forums')) {
    //console.log('!!!!!!Skipping', req.forumsUserProfile);

    next();
    return;
  }
  //remove req user forums profile if user is logged out
  if (!req.user && req.forumsUserProfile) {
    req.forumsUserProfile = null;
  } else if (req.user) {
    req.forumsUserProfile = req.session.forumsUserProfile;
  }

  //remove req user profile from cache if different user
  if (req.user && req.forumsUserProfile && !req.user._id.equals(req.forumsUserProfile.user)) {
    req.forumsUserProfile = null;
    console.warn("Different user profile, this shouldn't happen!");
  }

  //if forums profile doesn't exist and logged in
  if (!req.forumsUserProfile && req.user) {
    let ForumsUserProfile = web.models('ForumsUserProfile');
    let forumsUserProfile = await ForumsUserProfile.findOne({user:req.user._id}).lean().exec();

    if (!forumsUserProfile) {
      console.log("Creating forums user profile for the first time:", req.user.username);
      forumsUserProfile = new ForumsUserProfile();
      forumsUserProfile.user = req.user._id;
      await forumsUserProfile.save();

      let User = web.models('User');
      User.update({_id: req.user._id}, {$set: {'addtlData.forumsUserProfile': forumsUserProfile._id}}, function(err, count) {
        if (err) {
          console.error(err);
        }
      });

      forumsUserProfile = forumsUserProfile.toObject();
    }

    req.session.forumsUserProfile = forumsUserProfile;
    req.forumsUserProfile = forumsUserProfile;

    //console.log('!!!!!!', req.forumsUserProfile);
  
    //web.plugins['oils-plugin-forums'].conf.userProfileNeedsUpdating = false;
  }
  

  next();
  
}

async function defaultForumMiddleware(req, res, next) {
  
      //if (req.url.indexOf('/admin/forums') == 0 && req.url.indexOf('/forums') == 0) {
      if (!defaultForumCache) {
        let Forum = web.models('ForumsForum');

        let forumParams = {};
        let forumId = req.query.forumId;
        if (forumId) {
          //TODO: permission to get this forum!!
          forumParams = {forumId: forumId};
        } 
        let forums = await Forum.find(forumParams).limit(2).lean().exec();

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
     
    }
