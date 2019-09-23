'use strict';

const forumPlugin = web.plugins['oils-plugin-forums'];
const pluginConf = forumPlugin.conf;
const path = require('path');
const Topic = web.models('ForumsTopic');
const dateUtils = require('../lib/dateUtils.js');
const title = 'Welcome to the Forums!';

module.exports = {
  get: async function(req, res) {
    const tabMap = forumPlugin.constants.indexTab;
    const selectedTab = req.params['tab'];

    if (selectedTab === tabMap.latest.id) {
      handleGetLatest(req, res, tabMap, selectedTab);
    } else if (selectedTab == tabMap.mostviewed.id) {
      handleGetMostViewed(req, res, tabMap, selectedTab);
    } else if (selectedTab == tabMap.categories.id) {
      handleGetCategories(req, res, tabMap, selectedTab);
    } else {
      throw new Error("Invalid tab");
    }

  }
}

async function handleGetLatest(req, res, tabMap, selectedTab) {

  let table = await getTable({req, query:{status:'A'}, sort:{createDt: -1}})

  res.renderFile(path.join(pluginConf.viewsDir, 'tab/forums-latest-mostviewed.html'), 
      {
        table: table,
        pluginConf: pluginConf, 
        tabs: Object.values(tabMap),
        selectedTab: selectedTab,
        title: title,
        tabDesc: tabMap[selectedTab].desc,
      }); 

}

async function handleGetMostViewed(req, res, tabMap, selectedTab) {
  let table = await getTable({req, query:{status:'A'}, sort:{viewCount: -1}})

  res.renderFile(path.join(pluginConf.viewsDir, 'tab/forums-latest-mostviewed.html'), 
      {
        table: table, 
        pluginConf: pluginConf, 
        tabs: Object.values(tabMap),
        selectedTab: selectedTab,
        title: title,
        tabDesc: tabMap[selectedTab].desc,
      }); 
}

async function handleGetCategories(req, res, tabMap, selectedTab) {
  const Category = web.models('ForumsCategory');
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

  res.renderFile(path.join(pluginConf.viewsDir, 'tab/forums-categories.html'), 
      {categories: categories, 
        pluginConf: pluginConf, 
        tabs: Object.values(tabMap),
        selectedTab: selectedTab,
        title: title,
        tabDesc: tabMap[selectedTab].desc,
      }); 

}

async function getTable({req, query, sort}) {
  let table = await web.renderTable(req, Topic, {
      query: query,
      sort: sort,
      tableTemplate: path.join(pluginConf.pluginPath, '/conf/templates/forums-table-template.html'),
      columns: ['title', 'activeUsers', 'viewCount', 'activity'],
      labels: ['', 'Users', 'Views', 'Activity'],
      handlers: {
        title: function(record, column, escapedVal, callback) {
          callback(null, '<a class="topic-title" href="/forums/topic?_id=' + record._id + '">' + escapedVal + '</a>');
        },
        activeUsers: function(record, column, escapedVal, callback) {
          let str = "";
          if (record.activeUsers && record.activeUsers.length > 0) {
            let uLength = record.activeUsers.length;
            for (let i=0; i<uLength; i++) {
              let user = record.activeUsers[i];
              str = str + " " + user.username;
              if (uLength > 1) {
                str += ",";
              }
            }
          }
          callback(null, str);
        },
        activity: function(record, column, escapedVal, callback) {
          let activityStr = "";

          if (record.lastPost && record.lastPost.createBy) {
            activityStr = dateUtils.formatDateSince(record.lastPost.createDt);
          }

          callback(null, activityStr);
        }
      }
    });

  return table;
}

