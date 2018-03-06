
exports.addActiveUser = function (topicOrCatId, user, callback) {
    var ModelObj = this;
    this.findOne({_id: topicOrCatId}, function(err, rec) {
        if (rec) {
            var arrActiveUsers = rec.activeUsers;

            //insert in top most
            arrActiveUsers.splice(0, 0, {_id: user._id, username: user.username, avatar: user.avatar});

            //remove duplicate user
            for (var i=1; i<arrActiveUsers.length; i++) {
                if (arrActiveUsers[i]._id.equals(user._id)) {
                    arrActiveUsers.splice(i, 1);
                    break;
                }
            }

            //limit to n users
            var forumConstants = web.plugins['oils-plugin-forums'].constants;
            var activeUsersCount = forumConstants.activeUsersCount;
            if (arrActiveUsers.length > activeUsersCount) {
                arrActiveUsers.splice(activeUsersCount, arrActiveUsers.length - activeUsersCount);
            }

            ModelObj.update({_id: topicOrCatId}, {$set: {activeUsers: arrActiveUsers}}, function(err, count) {
                if (err) {
                    console.error(err);
                }

                if (callback) {
                    callback(err);
                }
            });
        }
    })
};

exports.incrementViewCount = function (topicOrCatId, callback) {
    var setOnInsert = null;
    callback = callback || function(){};
    
  return this.findOneAndUpdate({_id: topicOrCatId}, { $inc: { viewCount: 1 }, $setOnInsert: setOnInsert}, 
    {new: true, upsert: true, select: {viewCount: 1}}, callback);
};