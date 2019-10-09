'use strict';

exports.addActiveUser = function (topicOrCatId, user, callback) {
    let ModelObj = this;
    this.findOne({_id: topicOrCatId}, function(err, rec) {
        if (rec) {
            let arrActiveUsers = rec.activeUsers;

            //insert in top most
            arrActiveUsers.splice(0, 0, {_id: user._id, username: user.username, avatar: user.avatar});

            //remove duplicate user
            for (let i=1; i<arrActiveUsers.length; i++) {
                if (arrActiveUsers[i]._id.equals(user._id)) {
                    arrActiveUsers.splice(i, 1);
                    break;
                }
            }

            //limit to n users
            let forumConstants = web.plugins['oils-plugin-forums'].constants;
            let activeUsersCount = forumConstants.activeUsersCount;
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
    let setOnInsert = null;
    callback = callback || function(){};
    
  return this.findOneAndUpdate({_id: topicOrCatId}, { $inc: { viewCount: 1 }, $setOnInsert: setOnInsert}, 
    {new: true, upsert: true, select: {viewCount: 1}}, callback);
};


exports.validateCategoryAccessLevel = function(categoryAccessLevel, req, res) {
    const reqUser = req.user;
    if (categoryAccessLevel > 0) {
      if (!reqUser) {
        req.flash('error', 'Login required.');
        res.redirect('/login?r=' + encodeURIComponent(req.url));
        //renderUnauthorized(req, res, new Error("Sorry you must be logged in to access this page."));
        return false;
      }

      if (req.user.accessLevel < categoryAccessLevel) {
        renderUnauthorized(req, res, new Error("Sorry you cannot access this page. [2]"));
        return false;
      }
    }

    return true;
}

function renderUnauthorized(req, res, err) {
    console.error("Showing renderUnauthorized with err", err, req.user && req.user._id, req.user && req.user.username);
    res.status(403); //forbidden
    res.render('500.html',{err: err});
}

