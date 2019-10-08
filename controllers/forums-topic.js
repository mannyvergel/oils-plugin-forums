'use strict';

const pluginConf = web.plugins['oils-plugin-forums'].conf;
const Topic = web.models('ForumsTopic');
const Post = web.models('ForumsPost');

const path = require('path');
const forumUtils = web.plugins['oils-plugin-forums'].utils
const forumConstants = web.plugins['oils-plugin-forums'].constants;
const marked = web.require('marked');

module.exports = {
  get: async function(req, res) {
 
		const queryTopicId = req.query._id || req.params.TOPIC_ID;
    const paramTopicTitleSlug = req.params.TITLE_SLUG;

		let topic = null;
		if (queryTopicId) {
			topic = await Topic.findOne({_id: queryTopicId}).populate('category').lean().exec();
		}

    if (!topic) {
      //TODO: improve
      res.status(404).send("Topic not found");
      return;
    }

    if (!web.stringUtils.isEmpty(topic.titleSlug) && paramTopicTitleSlug !== topic.titleSlug) {
      res.redirect('/forums/topic/' + topic._id + '/' + topic.titleSlug);
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

          let editStrArr = [];

          if (req.user && record.user && req.user._id.equals(record.user._id)) {
            editStrArr.push('<a href="/forums/reply?topic=' 
              + queryTopicId + '&_id=' 
              + record._id + '" title="Edit"><i class="fa fa-pencil" style=""></i> Edit</a>');
          }

          editStrArr.push(`<a href="/forums/action/flag?postId=${record._id.toString()}&flag=i" onclick="return confirm(\'Are you sure you want to flag this post?\')" title="Flag"><i class="fa fa-flag"></i> Flag as Inappropriate</a>`);

          let contentStr = 
          `
          ${markedMsg}

          <div class="header-sep"></div> 

          <div class="row header-topic">
             <div class="small-8 columns post-left-container">by ${userStr} ${dateModStr}</div>
             <div class="small-4 columns post-opts-container">
               <div class="edit-post"><a href="#" onclick="showPopup(this); return false;"><i class="fa fa-gear"></i></a></div>
               <div class="mypopup">${editStrArr.join(' ')}</div>

             </div>
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