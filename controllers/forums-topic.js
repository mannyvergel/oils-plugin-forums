var pluginConf = web.plugins['oils-plugin-forums'].conf;
var Topic = web.models('ForumsTopic');
var Post = web.models('ForumsPost');
var sync = require('synchronize');
var path = require('path');
var forumUtils = web.plugins['oils-plugin-forums'].utils
var forumConstants = web.plugins['oils-plugin-forums'].constants;

module.exports = {
  get: function(req, res) {
  	sync.fiber(function() {
  		var queryTopicId = req.query._id;

  		var topic = null;
  		if (queryTopicId) {
  			topic = sync.await(Topic.findOne({_id: queryTopicId}).populate('category').lean().exec(sync.defer()));
  		}

      if (!topic) {
        //TODO: improve
        res.status(404).send("Topic not found");
        return;
      }

      var table = sync.await(web.renderTable(req, Post, {
        query: {topic: queryTopicId},
        sort: {createDt: 1},
        columns: ['msg'],
        labels: ['Message'],
      }, sync.defer()))

  		res.renderFile(path.join(pluginConf.viewsDir, 'forums-topic.html'), {table: table, topic: topic, pluginConf: pluginConf});

      forumUtils.incrementViewCountForTopic(topic);

      
  	});
    
  }
}