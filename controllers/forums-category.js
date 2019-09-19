'use strict';

const pluginConf = web.plugins['oils-plugin-forums'].conf;
const path = require('path');
const Category = web.models('ForumsCategory');
const Topic = web.models('ForumsTopic');
const dateUtils = require('../lib/dateUtils.js');

module.exports = {
  get: async function(req, res) {
		let queryCatId = req.query._id;
		let category = await Category.findOne({_id: queryCatId}).lean().sort({seq: 1}).exec();
    
		let table = await web.renderTable(req, Topic, {
		  query: {category: queryCatId},
		  sort: {updateDt: -1},
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


		res.renderFile(path.join(pluginConf.viewsDir, 'forums-category.html'), 
      {category: category, table: table, pluginConf: pluginConf}); 

  }
}