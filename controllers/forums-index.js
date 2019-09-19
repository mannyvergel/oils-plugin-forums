'use strict';

const pluginConf = web.plugins['oils-plugin-forums'].conf;
const path = require('path');
const Category = web.models('ForumsCategory');
const Topic = web.models('ForumsTopic');

module.exports = {
  get: async function(req, res) {
		let categories = await Category.find({}).lean().sort({seq: 1}).exec();

    if (categories) {
      for (let cat of categories) {
        var arrLastActiveTopics = await Topic.find({category: cat._id, status: 'A'})
          .lean().sort({updateDt:-1}).limit(1).exec();

        if (arrLastActiveTopics) {
          cat.lastActiveTopic = arrLastActiveTopics[0];
        }
      }
    }

    let subTab = req.query.subTab || 'latest';
    let topTopics = null;
    if (subTab == 'latest') {
      topTopics = await Topic.find({status:'A'}).sort({createDt: -1}).lean().limit(10);
    } else {
      subTab = 'mostViewed'; //re-assign just in case
      topTopics = await Topic.find({status:'A'}).sort({viewCount: -1}).lean().limit(10);

    }
    
		res.renderFile(path.join(pluginConf.viewsDir, 'forums-index.html'), 
			{categories: categories, 
        pluginConf: pluginConf, 
        topTopics: topTopics,
        subTab: subTab
      }); 

  }
}