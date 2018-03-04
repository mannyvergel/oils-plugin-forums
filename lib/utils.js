
var forumConstants = web.plugins['oils-plugin-forums'].constants;

exports.incrementViewCountForTopic = function(topic) {
	if (!topic.category._id) {
		throw new Error("category is not populated in topic");
	}

	var id = topic._id.toString();
	var viewTypeTopic = forumConstants.viewType.topic;
	web.counters.get(viewTypeTopic + '_EXP_' + id, function(err, counter) {
        if (!counter) {

          web.counters.incrementAndExpire(viewTypeTopic + '_EXP_' + id, forumConstants.viewExpiryInSeconds);

          web.models('ForumsTopic').incrementViewCount(id, function(err, topicCounter) {
            console.debug('View count incremented for', viewTypeTopic, id, topicCounter);
          });

          
          web.models('ForumsCategory').incrementViewCount(topic.category._id);
        }
      });
}

exports.getViewCount = function(viewType, id, cb) {
	web.counters.get(viewType + '_' + id, cb);
}