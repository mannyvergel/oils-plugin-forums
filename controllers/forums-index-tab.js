'use strict';

const forumPlugin = web.plugins['oils-plugin-forums'];
const pluginConf = forumPlugin.conf;
const path = require('path');
const Topic = web.models('ForumsTopic');
const dateUtils = require('../lib/dateUtils.js');
const dmsUtils = web.cms.utils;

module.exports = {
  get: async function(req, res) {
    const tabMap = forumPlugin.constants.indexTab;
    const selectedTab = req.params['tab'];

    const addtlRenderParams = {};

    const docForums = await dmsUtils.retrieveDoc('/forums.json');
    const _forums = JSON.parse(docForums.content.toString() || "{}");
    
    // console.debug("Retrieving forum dms setting", _forums)

    addtlRenderParams.indexAnnouncement = _forums.indexAnnouncement;

    addtlRenderParams.title = _forums.indexTitle || "Forums";

    if (selectedTab === tabMap.latest.id) {
      handleGetLatest(req, res, tabMap, selectedTab, addtlRenderParams);
    } else if (selectedTab == tabMap.mostviewed.id) {
      handleGetMostViewed(req, res, tabMap, selectedTab, addtlRenderParams);
    } else if (selectedTab == tabMap.categories.id) {
      handleGetCategories(req, res, tabMap, selectedTab, addtlRenderParams);
    } else {
      throw new Error("Invalid tab");
    }

  }
}

async function handleGetLatest(req, res, tabMap, selectedTab, addtlRenderParams) {

  let table = await getTable({req, query:{status:'A'}, sort:{'lastPostDt': -1}});

  const renderParams = {};
  Object.assign(renderParams,
  {
    table: table,
    pluginConf: pluginConf, 
    tabs: Object.values(tabMap),
    selectedTab: selectedTab,
    tabDesc: tabMap[selectedTab].desc,
  },
  addtlRenderParams);

  res.renderFile(path.join(pluginConf.viewsDir, 'tab/forums-latest-mostviewed.html'), renderParams); 

}

async function handleGetMostViewed(req, res, tabMap, selectedTab, addtlRenderParams) {
  let table = await getTable({req, query:{status:'A'}, sort:{viewCount: -1}});

  const renderParams = {};
  Object.assign(renderParams,
  {
    table: table, 
    pluginConf: pluginConf, 
    tabs: Object.values(tabMap),
    selectedTab: selectedTab,
    tabDesc: tabMap[selectedTab].desc, 
  },
  addtlRenderParams);

  res.renderFile(path.join(pluginConf.viewsDir, 'tab/forums-latest-mostviewed.html'), renderParams); 
}

async function handleGetCategories(req, res, tabMap, selectedTab, addtlRenderParams) {
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

  const renderParams = {};
  Object.assign(renderParams, 
    {
      categories: categories, 
      pluginConf: pluginConf, 
      tabs: Object.values(tabMap),
      selectedTab: selectedTab,
      tabDesc: tabMap[selectedTab].desc,
    }, 
    addtlRenderParams);

  res.renderFile(path.join(pluginConf.viewsDir, 'tab/forums-categories.html'), renderParams); 

}

async function getTable({req, query, sort}) {
  let table = await web.renderTable(req, Topic, {
      query: query,
      sort: sort,
      pageLimit: pluginConf.forumsIndexPageLimit,
      rowsPerPage: pluginConf.forumsIndexRowsPerPage,
      noRecordsFoundLabel: 'No posts yet.',
      populate: ['lastPost'],
      tableTemplate: path.join(pluginConf.pluginPath, '/conf/templates/forums-table-template.html'),
      columns: ['title', 'replyCount', 'viewCount', 'activity'],
      labels: ['', 'Replies', 'Views', 'Activity'],
      handlers: {
        title: function(record, column, escapedVal, callback) {
          callback(null, '<a class="topic-title" href="/forums/topic/' + record._id + '/' + record.titleSlug + '">' + escapedVal + '</a>');
        },

        activeUsers: function(record, column, escapedVal, callback) {
          let str = "";
          if (record.activeUsers && record.activeUsers.length > 0) {
            str = record.activeUsers.map(rec => rec.nickname).join(', ');
          }
          callback(null, str);
        },
        activity: function(record, column, escapedVal, callback) {
          let activityStr = "";

          if (record.lastPost && record.lastPost.createBy) {
            activityStr = dateUtils.formatDateSince(record.lastPost.createDt);
          }

          callback(null, '<a title="Go to last post" href="/forums/topic/' + record._id + '/' + record.titleSlug + '?forumspost_p=last#lastPost">' + activityStr + '</a>');
        }
      }
    });

  return table;
}

