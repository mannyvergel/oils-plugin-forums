'use strict';

const mongoose = web.require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    title: {type: String, required: true, trim: true},
    user: {type: ObjectId, required: true, ref: 'User'},
    titleSlug: {type: String, required: true},
    category: {type: ObjectId, ref: 'ForumsCategory', required: true},
    tags: [{type: String}],
    replyCount: {type: Number, default: 0},
    viewCount: {type: Number, default: 0},
    activeUsers: [{_id: {type: ObjectId}, username: {type: String}, nickname: {type: String}, avatar: {type: String}}],
    lastPost: {type: Object, ref: 'ForumsPost'},
    lastPostDt: {type: Date},
    firstPost: {type: Object, ref: 'ForumsPost'},
    status: {type: String, default: 'A', required: true, index: true}, //[A]ctive, [C]losed, X - Deleted, [P]ending for approval

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'},
    createDt: {type: Date, default: Date.now},
    createBy: {type: String, default: 'SYSTEM'}
  },
  initSchema: function(schema) {

      let commonFuncs = require('../lib/commonFuncs.js');
      const stringUtils = require('../lib/stringUtils.js');

      schema.statics.incrementViewCount = commonFuncs.incrementViewCount;
      schema.statics.addActiveUser = commonFuncs.addActiveUser;


      schema.index({createDt: -1});
      schema.index({'lastPostDt': -1});

      schema.statics.updateReplyCount = async function(topicId) {
        const Post = web.models('ForumsPost');
        let replyCount = await Post.countDocuments({topic: topicId, status: 'A'});
        if (replyCount > 0) {
          // do not add original post
          replyCount -= 1;
        }
        await this.updateOne({_id: topicId}, { $set: { replyCount: replyCount }}).exec();
        return replyCount;
      }

      schema.virtual('link').get(function() {
        const self = this;
        return '/forums/topic/' + self._id + '/' + encodeURIComponent(self.titleSlug);
      });

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