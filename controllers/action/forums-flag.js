'use strict';

const Topic = web.models('ForumsTopic');
const Post = web.models('ForumsPost');

module.exports = {
  get: [web.auth.loginUtils.handleLogin, async function(req, res) {
    const params = req.query;
    const postId = params.postId;
    const flag = params.flag;
    const user = req.user;

    if (flag !== 'i') {
      throw new Error("Invalid request [f]");
    }

    const post = await Post.findOne({_id: postId}).exec();

    if (!post) {
      throw new Error("Invalid request [t]");
    }

    post.flags = post.flags || [];

    for (let flagObj of post.flags) {
      if (user._id.equals(flagObj.flaggedBy)) {
        req.flash('error', 'Already flagged.');
        res.redirect('/forums/topic/' + post.topic);
        return;
      }
    }
    const dtNow = new Date();
    post.flags.push({flag: flag, flaggedBy: user._id, flagDt: dtNow});
    post.lastFlagDt = dtNow;

    await post.save();

    console.log("Flagged as", flag, post, req.user._id, req.user.nickname);

    req.flash('info', 'You have successfully flagged the post');
    res.redirect('/forums/topic/' + post.topic);

  }]
}