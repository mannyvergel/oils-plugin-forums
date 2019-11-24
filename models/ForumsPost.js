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
    status: {type: String, required: true, default: 'A'}, //[A]ctive, [X]Deleted, [P]Pending for Approval
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

    mySchema.virtual('summary').get(function() {
        return trunc(this.msg, 160);
    })

    mySchema.path('status').set(function (newVal) {
        this._prevStatus = this.status;
        return newVal;
    });

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
            const Topic = web.models('ForumsTopic');
            const self = this;

            const topic = await Topic.findOne({_id: this.topic});

            if (!topic) {
                console.error("[ForumsPost-postSave] Topic not found.");
                return;
            }

            topic.lastPost = self._id;
            topic.lastPostDt = self.createDt;
            if (this.isFirst) {
                topic.firstPost = self._id;
            }
            await topic.save();
        } else {
            // is update mode

            // TO DO: for flagged post from Approved to Deleted, also delete the topic if first post
            
            // handle approving first post along with the topic
            if (this._prevStatus === 'P' && this.status === 'A' && this.isFirst === 'Y') {
                const Topic = web.models('ForumsTopic');
                const topic = await Topic.findOne({_id: this.topic}).populate('user');
                if (!topic) {
                    console.error("[ForumsPost-postSave] Topic not found.");
                    return;
                }

                if (topic.status === 'P') {
                    console.log("Also approving the parent topic of the first post");
                    topic.status = 'A';
                    topic.updateDt = new Date();
                    await topic.save();
                    const pluginConf = web.plugins['oils-plugin-forums'].conf;
                    const listId = pluginConf.defaultForumsId + '_topic_' + topic._id.toString();
                    const forumTitle = pluginConf.defaultForumsName;

                    try {
                        await web.huhumails.emailToList({
                            listId: listId,

                            subj: `New Post Approved for ${topic.title} - ${forumTitle}`,
                            body: 
`Hi,

A new reply has been posted and approved for the topic <a href="${pluginConf.hostUrl}/forums/topic/${topic._id}/${topic.titleSlug}?forumspost_p=last#lastPost">${topic.title}.

${forumTitle}
`,
                            conf: {
                                replaceNewLineWithBr: true
                            },
                        });

                    } catch (ex) {
                        console.error("Huhumails approval email error", ex);
                    }
                }
                
            }
        }

    });

    mySchema.post('remove', function() {
        let Post = web.models('ForumsPost');

        let self = this;
        Post.find({topic: self.topic}).sort({createDt: -1}).limit(1).exec(function(err, post) {
            if (post) {
                Topic.findOne({_id: post.topic}, function(err, topic) {
                    if (topic) {
                        topic.lastPost = post._id;
                        topic.lastPostDt = post.createDt;
                        topic.save();
                    }
                });
                
            }
        })
    });
  }
}

function trunc(str, n) {
  if (!str) {
    return "";
  }

  return (str.length > n) ? str.substr(0, n-1) + '...' : str;
}