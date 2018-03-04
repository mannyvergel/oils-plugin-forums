var pluginConf = web.plugins['oils-plugin-forums'].conf;
var path = require('path');
var sync = require('synchronize');
var Category = web.models('ForumsCategory');
var Topic = web.models('ForumsTopic');

module.exports = {
  get: function(req, res) {
  	sync.fiber(function() {
  		var queryCatId = req.query._id;
  		var category = sync.await(Category.findOne({_id: queryCatId}).lean().sort({seq: 1}).exec(sync.defer()));
      
  		var table = sync.await(web.renderTable(req, Topic, {
  		  query: {category: queryCatId},
  		  sort: {updateDt: -1},
  		  columns: ['title'],
  		  labels: ['Title'],
        handlers: {
          title: function(record, column, escapedVal, callback) {
            callback(null, '<a href="/forums/topic?_id=' + record._id + '">' + escapedVal + '</a>');
          }
        }
  		}, sync.defer()));


  		res.renderFile(path.join(pluginConf.viewsDir, 'forums-category.html'), 
        {category: category, table: table, pluginConf: pluginConf}); 
  	});
  }
}