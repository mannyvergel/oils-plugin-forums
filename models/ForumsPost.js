'use strict';

const mongoose = web.require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    msg: {type: String, required: true, trim: true},
    user: {type: ObjectId, ref: 'User', required: true},
    topic: {type: ObjectId, ref: 'ForumsTopic', required: true},

    isFirst: {type: String}, // Y to indicate that it's the first (most likely from the author)

    //not indexed as of writing since it's not needed to be retrieved separately
    status: {type: String, required: true, default: 'A'}, //[A]ctive, [X]Deleted
    //TODO: array diff column

    //diff
    diffs: [{
        diff: [],
        createDt:{type: Date}
    }],

    postLikeEmoji: {type: ObjectId, ref: 'ForumsPostLikeEmoji'},

    isEdited: {type: String},

    lastFlagDt: {type: Date},
    flags: [{flag: String, flaggedBy: ObjectId, flagDt: Date}],

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'},
    createDt: {type: Date, default: Date.now},
    createBy: {type: String, default: 'SYSTEM'}
  },

  initSchema: function(mySchema) {
    mySchema.index({topic: 1, status: 1});

    mySchema.index({createDt: -1});

    mySchema.index({lastFlagDt: -1});

    mySchema.pre('save', async function() {
        //workaround for determining inserts
        this.wasNew = this.isNew;
        const self = this;
        const isInsert = self.isNew;

        const lastPostArr = await self.constructor.find({topic: self.topic}).limit(1).sort({createDt:-1}).lean().exec();

        if (isInsert) {
            if (lastPostArr && lastPostArr.length === 1
                && lastPostArr[0].user.equals(self.user)
                && lastPostArr[0].msg === self.msg) {
                throw new Error("This was already posted.");
            }
        }

        // in the future if you want to support non first posts likes
        // remove the isFirst condition
        if (this.isFirst === 'Y' && !this.postLikeEmoji) {
            const PostLikeEmoji = web.models('ForumsPostLikeEmoji');
            let myPostLikeEmoji = null; // await PostLikeEmoji.findOne({post: this._id}).lean().exec();
            if (!myPostLikeEmoji) {
                myPostLikeEmoji = new PostLikeEmoji();
                myPostLikeEmoji.post = this._id;
                await myPostLikeEmoji.save();
            }

            this.postLikeEmoji = myPostLikeEmoji._id;
        }
        
    })

    mySchema.post('save', async function() {
        const isInsert = this.wasNew;
        console.debug("[ForumsPost-postSave] isInsert:", isInsert);

        if (isInsert) {
            let Topic = web.models('ForumsTopic');
            const self = this;

            const topic = await Topic.findOne({_id: this.topic});

            if (!topic) {
                console.error("[ForumsPost-postSave] Topic not found.");
                return;
            }

            topic.lastPost = self;
            await topic.save();
        }

    });

    mySchema.post('remove', function() {
        let Post = web.models('ForumsPost');

        let self = this;
        Post.find({topic: self.topic}).sort({createDt: -1}).limit(1).exec(function(err, post) {
            if (post) {
                Topic.findOne({_id: post.topic}, function(err, topic) {
                    if (topic) {
                        topic.lastPost = post;
                        topic.save();
                    }
                });
                
            }
        })
    });
  }
}