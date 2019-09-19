'use strict';

const forumConstants = web.plugins['oils-plugin-forums'].constants;

exports.incrementViewCountForTopic = function(req, topic) {
	if (!topic.category._id) {
		throw new Error("category is not populated in topic");
	}

	let id = topic._id.toString();
	let viewTypeTopic = forumConstants.viewType.topic;

	let userIdentifier = req.user ? req.user._id.toString() : (req.header('x-forwarded-for') || req.connection.remoteAddress);
	let expCheckStr = viewTypeTopic + '_EXP_' + id + '_' + userIdentifier;

	web.counters.get(expCheckStr, function(err, counter) {
        if (!counter) {

          web.counters.incrementAndExpire(expCheckStr, forumConstants.viewExpiryInSeconds);

          web.models('ForumsTopic').incrementViewCount(id, function(err, counter) {
          	if (web.conf.isDebug) {
	            console.debug('View count incremented for', viewTypeTopic, id, counter, expCheckStr);
	        }
          });

          
          web.models('ForumsCategory').incrementViewCount(topic.category._id);
        }
      });
}

exports.getViewCount = function(viewType, id, cb) {
	web.counters.get(viewType + '_' + id, cb);
}