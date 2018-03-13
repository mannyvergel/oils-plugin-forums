var pluginConf = web.plugins['oils-plugin-forums'].conf;
var path = require('path');
var sync = require('synchronize');
var Category = web.models('ForumsCategory');
var Topic = web.models('ForumsTopic');
var dateUtils = require('../lib/dateUtils.js');

module.exports = {
  get: function(req, res) {
  	sync.fiber(function() {
  		var queryCatId = req.query._id;
  		var category = sync.await(Category.findOne({_id: queryCatId}).lean().sort({seq: 1}).exec(sync.defer()));
      
  		var table = sync.await(web.renderTable(req, Topic, {
  		  query: {category: queryCatId},
  		  sort: {updateDt: -1},
  		  columns: ['title', 'activeUsers', 'viewCount', 'activity'],
  		  labels: ['Title', 'Users', 'Views', 'Activity'],
        handlers: {
          title: function(record, column, escapedVal, callback) {
            callback(null, '<a class="topic-title" href="/forums/topic?_id=' + record._id + '">' + escapedVal + '</a>');
          },
          activeUsers: function(record, column, escapedVal, callback) {
            var str = "";
            if (record.activeUsers && record.activeUsers.length > 0) {
              var uLength = record.activeUsers.length;
              for (var i=0; i<uLength; i++) {
                var user = record.activeUsers[i];
                str = str + " " + user.username;
                if (uLength > 1) {
                  str += ",";
                }
              }
            }
            callback(null, str);
          },
          activity: function(record, column, escapedVal, callback) {
            var activityStr = "";

            if (record.lastPost && record.lastPost.createBy) {
              activityStr = dateUtils.formatDateSince(record.lastPost.createDt);
            }

            callback(null, activityStr);
          }
        }
  		}, sync.defer()));


  		res.renderFile(path.join(pluginConf.viewsDir, 'forums-category.html'), 
        {category: category, table: table, pluginConf: pluginConf}); 
  	});
  }
}