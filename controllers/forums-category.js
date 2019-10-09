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
		  sort: {updateDt: -1},
      noRecordsFoundLabel: 'No posts yet.',
      tableTemplate: path.join(pluginConf.pluginPath, '/conf/templates/forums-table-template.html'),
		  columns: ['title', 'replyCount', 'activeUsers', 'viewCount', 'activity'],
		  labels: ['', 'Replies', 'Users', 'Views', 'Activity'],
      handlers: {
        title: function(record, column, escapedVal, callback) {
          callback(null, '<a class="topic-title" href="/forums/topic/' + record._id + '/' + record.titleSlug + '">' + escapedVal + '</a>');
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


		res.renderFile(path.join(pluginConf.viewsDir, 'forums-category.html'), 
      {category: category, table: table, pluginConf: pluginConf}); 

  }
}