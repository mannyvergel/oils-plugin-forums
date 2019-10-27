'use strict';

const mongoose = web.require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const stringUtils = require('../lib/stringUtils.js');

module.exports = {
  schema: {
    title: {type: String, required: true, trim: true},
    titleSlug: {type: String, required: true},
    category: {type: ObjectId, ref: 'ForumsCategory', required: true},
    tags: [{type: String}],
    replyCount: {type: Number, default: 0},
    viewCount: {type: Number, default: 0},
    activeUsers: [{_id: {type: ObjectId}, username: {type: String}, nickname: {type: String}, avatar: {type: String}}],
    lastPost: {_id:{type:ObjectId}, createBy:String, createDt: Date},
    status: {type: String, default: 'A', required: true, index: true}, //[A]ctive, [C]losed, X - Deleted

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'},
    createDt: {type: Date, default: Date.now},
    createBy: {type: String, default: 'SYSTEM'}
  },
  initSchema: function(schema) {

      let commonFuncs = require('../lib/commonFuncs.js');

      schema.statics.incrementViewCount = commonFuncs.incrementViewCount;
      schema.statics.addActiveUser = commonFuncs.addActiveUser;


      schema.index({createDt: -1});
      schema.index({'lastPost.createDt': -1});

      schema.statics.updateReplyCount = async function(topicId) {
        const Post = web.models('ForumsPost');
        const replyCount = await Post.count({topic: topicId});
        await this.updateOne({_id: topicId}, { $set: { replyCount: replyCount }});
        return replyCount;
      }

      schema.pre('validate', function(next) {

        if (web.stringUtils.isEmpty(this.titleSlug)) {
          this.titleSlug = encodeURIComponent(stringUtils.convertToSlug(this.title));
        }

        next();
      })

      schema.pre('save', async function (next) {
        this.wasNew = this.isNew;

        const self = this;
        const isInsert = self.isNew;

        const lastTopicArr = await self.constructor.find({}).limit(1).sort({createDt:-1}).lean().exec();

        if (isInsert) {
            if (lastTopicArr && lastTopicArr.length === 1
                && lastTopicArr[0].createBy == self.createBy
                && lastTopicArr[0].title === self.title
                && lastTopicArr[0].category.equals(self.category)) {
                throw new Error("This was already posted.");
            }
        }

      });

      schema.post('save', function () {
        if (this.wasNew) {
          // web.subs.newSubscription(this._id, "ForumsTopic", this.title);
        }
      });
   }
}