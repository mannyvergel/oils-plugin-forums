'use strict';

const pluginConf = web.plugins['oils-plugin-forums'].conf;
const path = require('path');
const Category = web.models('ForumsCategory');
const Topic = web.models('ForumsTopic');
const dateUtils = require('../lib/dateUtils.js');
const commonFuncs = require('../lib/commonFuncs.js');

module.exports = {
  get: async function(req, res) {
		const queryCatId = req.query._id || req.params.CAT_ID;

		let category = await Category.findOne({_id: queryCatId}).lean().sort({seq: 1}).exec();

    if (!category) {
      throw new Error("Category not found.");
    }

    if (!(commonFuncs.validateCategoryAccessLevel(category.accessLevel, req, res))) {
      return;
    }
    
    const paramsSlug = req.params.SLUG;
    if (!web.stringUtils.isEmpty(category.slug) && category.slug !== paramsSlug) {
      res.redirect('/forums/category/' + queryCatId + '/' + category.slug);
      return;
    }
    
		let table = await web.renderTable(req, Topic, {
		  query: {category: queryCatId},
		  sort: {'lastPost.createDt': -1},
      noRecordsFoundLabel: 'No posts yet.',
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


		res.renderFile(path.join(pluginConf.viewsDir, 'forums-category.html'), 
      {category: category, table: table, pluginConf: pluginConf}); 

  }
}