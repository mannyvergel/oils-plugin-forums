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
      query: {topic: queryTopicId, status: 'A'},
      sort: {createDt: 1},
      columns: ['msg'],
      labels: ['Message'],
      populate: 'user',
      addtlTableClass: "forums-topic",
      handlers: {
        msg: function(record, column, escapedVal, callback) {

          let userStr = "";
          if (record.user) {
             userStr = record.user.nickname || record.user.username;
          }

          userStr = web.stringUtils.escapeHTML(userStr);
          
          let markedMsg = marked(record.msg);

          let dateStr = web.dateUtils.formatReadableDateTime(record.updateDt);
          let dateModStr = dateStr;
          if (record.isEdited == "Y") {
            dateModStr += " (Edited)";
          }

          let editStr = "";

          if (req.user && record.user && req.user._id.equals(record.user._id)) {
            editStr = '<a href="/forums/reply?topic=' + queryTopicId + '&_id=' + record._id + '">Edit</a>'
          }

          let contentStr = 
          `
          ${markedMsg}

          <div class="header-sep"></div> 

          <div class="row header-topic">
             <div class="small-8 columns">by ${userStr} ${dateModStr}</div>
             <div class="small-4 columns" style="text-align: right;">${editStr}</div>
           </div>
          
            
          `;

          callback(null, contentStr);
        },
      },
    });

		res.renderFile(path.join(pluginConf.viewsDir, 'forums-topic.html'), 
      {table: table, 
        topic: topic, 
        pluginConf: pluginConf
      });

    forumUtils.incrementViewCountForTopic(req, topic);

     
  }
}