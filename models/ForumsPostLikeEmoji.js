'use strict';

const mongoose = web.require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


// separated because of locking concerns and data even tho 1 Post = 1 PostLikeEmoji
module.exports = {
  schema: {
    post: {type: ObjectId, ref: 'ForumsPost', required: true, index: true, unique: true},
    likeCount: {type: Number, default: 0},
    likeUserMap: {
      // "userId": {emoji: String, createDt: Date, nickname: nickname}
      // this is not 100% reliable, but it should be okay
    },
    // emojis: {
    //   // "__": {nickname1:{}, nickname2:{}, nickname3:{}}, // means no emoji
    //   // this is not 100% reliable, but it's okay
    // }, 
    createDt: {type: Date, default: Date.now}
  },

  initSchema: function(mySchema) {

    mySchema.statics.incrementAndAddUser = async function(postId, user, emoji) {
      return await incDecEmoji(true, postId, user, emoji);
    };

    mySchema.statics.decrementAndRemoveUser = async function(postId, user) {
      return await incDecEmoji(false, postId, user);
    };

    
  }
}


async function incDecEmoji(isInc, postId, user, emoji) {
  const ForumsPostLikeEmoji = web.models('ForumsPostLikeEmoji');
  emoji = emoji || "__";

  if (!user) {
    throw new Error("User not found");
  }

  const userId = user._id.toString();
  const nickname = user.nickname || user.fullname.split(' ')[0];

  let myPost = await ForumsPostLikeEmoji.findOne({post:postId}).exec();
  if (!myPost) {
    myPost = new ForumsPostLikeEmoji();
  }

  const dtNow = new Date();

  myPost.likeUserMap = myPost.likeUserMap || {};
  myPost.postId = postId;
  //myPost.emojis = myPost.emojis || {};

  const returnObj = {};

  if (isInc && !myPost.likeUserMap[userId]) {
    myPost.likeUserMap[userId] = {emoji: emoji, createDt: dtNow, nickname: nickname};


    console.debug("Incrementing", postId, myPost._id);

    const updatedLikes = await ForumsPostLikeEmoji.findOneAndUpdate({post: postId}, { 
      $inc: { likeCount: 1 },
      $set: { likeUserMap: myPost.likeUserMap }, 
      $setOnInsert: {post: postId, createDt: dtNow} 
     }, 
    {new: true, upsert: true, useFindAndModify: false, select: {likeCount: 1}}).exec();

    returnObj.modified = true;
    returnObj.obj = updatedLikes;
  } else if (!isInc && myPost.likeUserMap[userId]) {
    console.debug("Decrementing", myPost._id);
    myPost.likeUserMap[userId] = null;
    
    const updatedLikes = await ForumsPostLikeEmoji.findOneAndUpdate({post: postId}, 
    { 
      $inc: { likeCount: -1 },
      $set: { likeUserMap: myPost.likeUserMap},
    }, 
    {new: true, upsert: false, useFindAndModify: false, select: {likeCount: 1}}).exec();

    returnObj.modified = true;
    returnObj.obj = updatedLikes;
  } else {
    console.warn("Doing nothing for post like emoji", user._id, postId);
    returnObj.modified = false;
    returnObj.obj = myPost;
  }
  
  return returnObj;
  
}