const pluginConf = web.plugins['oils-plugin-forums'].conf;
const Topic = web.models('ForumsTopic');
const Post = web.models('ForumsPost');

const path = require('path');
const forumUtils = web.plugins['oils-plugin-forums'].utils
const forumConstants = web.plugins['oils-plugin-forums'].constants;
const marked = web.require('marked');

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
  });

module.exports = {
  get: async function(req, res) {
 
		let queryTopicId = req.query._id;

		let topic = null;
		if (queryTopicId) {
			topic = await Topic.findOne({_id: queryTopicId}).populate('category').lean().exec();
		}

    if (!topic) {
      //TODO: improve
      res.status(404).send("Topic not found");
      return;
    }

    let table = await web.renderTable(req, Post, {
      query: {topic: queryTopicId},
      sort: {createDt: 1},
      columns: ['user', 'msg'],
      labels: ['User', 'Message'],
      populate: 'user',
      handlers: {
        user: function(record, column, escapedVal, callback) {
          let userStr = "";
          if (record.user) {
            userStr = record.user.nickname;
          }
          
          userStr = web.templateEngine.filters.escape(userStr);
          callback(null, '<p>' + userStr + '</p>');
        },
        msg: function(record, column, escapedVal, callback) {
          callback(null, marked(record.msg));
        },
      },
    });

		res.renderFile(path.join(pluginConf.viewsDir, 'forums-topic.html'), {table: table, topic: topic, pluginConf: pluginConf});

    forumUtils.incrementViewCountForTopic(req, topic);

     
  }
}