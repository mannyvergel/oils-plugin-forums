'use strict';

const PostLikeEmoji = web.models('ForumsPostLikeEmoji');

module.exports = {
  get: [web.auth.loginUtils.handleLogin, async function(req, res) {
    const params = req.query;
    const postId = params.postId;
    const emoji = params.emoji;
    const unlike = params.unlike === 'Y';


    if (!postId) {
      throw new Error("Invalid request [p1]");
    }

    let data;
    if (unlike) {
      data = await PostLikeEmoji.decrementAndRemoveUser(postId, req.user, emoji);
    } else {
      data = await PostLikeEmoji.incrementAndAddUser(postId, req.user, emoji);  
    }
    

    console.log("Liked post", !unlike, postId, req.user._id, req.user.nickname, " ::: data", data);

    res.json({
      status: 200,
      data: {
        modified: data.obj.modified,
        likeCount: data.obj.likeCount
      }
    })

  }]
}