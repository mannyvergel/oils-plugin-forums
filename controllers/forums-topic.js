'use strict';

const pluginConf = web.plugins['oils-plugin-forums'].conf;
const Topic = web.models('ForumsTopic');
const Post = web.models('ForumsPost');
const PostLikeEmoji = web.models('ForumsPostLikeEmoji');

const path = require('path');
const forumUtils = web.plugins['oils-plugin-forums'].utils
const forumConstants = web.plugins['oils-plugin-forums'].constants;
const marked = web.require('marked');
const commonFuncs = require('../lib/commonFuncs.js');

const beTheFirstStr = 'Be the first to like';

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

    if (!(commonFuncs.validateCategoryAccessLevel(topic.category.accessLevel, req, res))) {
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
      tableTemplate: path.join(pluginConf.pluginPath, '/conf/templates/forums-table-template.html'),
      populate: ['user', 'postLikeEmoji'],
      addtlTableClass: "forums-topic",
      handlers: {
        msg: async function(record, column, escapedVal, callback) {
          const post = record;
          post.postLikeEmoji = post.postLikeEmoji || {}


          let userStr = "";
          if (post.user) {
             userStr = post.user.nickname || post.user.username;
          }

          userStr = web.stringUtils.escapeHTML(userStr);

          let markedMsg = marked(post.msg);

          let dateStr = web.dateUtils.formatReadableDateTime(post.updateDt);
          let dateModStr = dateStr;
          if (post.isEdited == "Y") {
            dateModStr += " (Edited)";
          }

          let editStrArr = [];

          if (req.user && post.user && req.user._id.equals(post.user._id)) {
            if (post.isFirst === 'Y') {
              editStrArr.push('<a href="/forums/post?_id=' 
                + post._id + '" title="Edit"><i class="fa fa-pencil" style=""></i> Edit</a>');
            } else {
              editStrArr.push('<a href="/forums/reply?topic=' 
                + queryTopicId + '&_id=' 
                + post._id + '" title="Edit"><i class="fa fa-pencil" style=""></i> Edit</a>');  
              
            }
            
          }

          const postIdStr = post._id.toString();

          let likeRow = "";
          if (post.isFirst === 'Y') {
            let isSubscribed;
            const listId = "peso_topic_" + queryTopicId;

            if (req.user) {
              isSubscribed = await web.huhumails.isSubscribed({
                listId: listId,
                email: req.user.email
              });
            } else {
              isSubscribed = false;
            }
            

            if (isSubscribed) {
              const sUrl = '/forums/action/subscribe-wredirect?unsubscribe=Y&listId=' + encodeURIComponent(listId) + '&r=' + encodeURIComponent(req.url);
              editStrArr.push(`<a href="${sUrl}" title="Unsubscribe"><i class="fa fa-bell-slash-o"></i> Unsubscribe</a>`);
            } else {
              const sUrl = '/forums/action/subscribe-wredirect?listId=' + encodeURIComponent(listId) + '&r=' + encodeURIComponent(req.url);
              editStrArr.push(`<a href="${sUrl}" title="Subscribe"><i class="fa fa-bell"></i> Subscribe</a>`);
            }

            let likeCountStr;
            let addtlFrmsLikeClass = "";
            if (post.postLikeEmoji.likeCount > 0) {
              likeCountStr = `<span id="LIKE_COUNTER_${postIdStr}" class="counter">${post.postLikeEmoji.likeCount}</span>`;
              addtlFrmsLikeClass = " likes-active";
            } else {
              likeCountStr = `<span id="LIKE_COUNTER_${postIdStr}" class="counter be-the-first">${beTheFirstStr}</span>`;
            }

            let dataLiked = "N";
            if (post.postLikeEmoji.likeUserMap && req.user && post.postLikeEmoji.likeUserMap[req.user._id]) {
              dataLiked = "Y";
            }

            likeRow = `<div id="POST_LIKES_${postIdStr}" class="frms-likes-ct${addtlFrmsLikeClass}" data-liked="${dataLiked}">
                        <a href="#" onclick="forumsPostLike('${postIdStr}'); return false;"><i class="fa fa-thumbs-o-up"></i> ${likeCountStr}</a> 
                      </div>`
          }

          editStrArr.push(`<a href="/forums/action/flag?postId=${postIdStr}&flag=i" onclick="return confirm(\'Are you sure you want to flag this post?\')" title="Flag"><i class="fa fa-flag"></i> Flag as Inappropriate</a>`);

          let contentStr = 
          `
          ${markedMsg}

          ${likeRow}

          <div class="header-sep"></div> 

          <div class="header-topic">
             <div class="small-8 columns post-left-container">by ${userStr} ${dateModStr}</div>
             <div class="small-4 columns post-opts-container">
               <div class="edit-post"><a title="Options" href="#" onclick="showPopup(this); return false;"><i class="fa fa-gear"></i></a></div>
               <div class="mypopup">${editStrArr.join(' ')}</div>

             </div>
           </div>
          
            
          `;

          return contentStr;
        },
      },
    });

		res.renderFile(path.join(pluginConf.viewsDir, 'forums-topic.html'), {
      table: table, 
      topic: topic, 
      pluginConf: pluginConf,
      beTheFirstStr: beTheFirstStr,
      _subscribed: false,
    });

    forumUtils.incrementViewCountForTopic(req, topic);

     
  }
}