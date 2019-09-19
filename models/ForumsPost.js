'use strict';

const mongoose = web.require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    msg: {type: String, required: true},
    flags: [{type: String}], //e.g. for flagging as inappropriate
    user: {type: ObjectId, ref: 'User', required: true},
    topic: {type: ObjectId, ref: 'ForumsTopic', required: true},

    //not indexed as of writing since it's not needed to be retrieved separately
    status: {type: String, required: true, default: 'A'}, //[A]ctive, [X]Deleted
    //TODO: array diff column

    //diff
    diffs: [{
        diff: [],
        createDt:{type: Date}
    }],

    isEdited: {type: String},

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'},
    createDt: {type: Date, default: Date.now},
    createBy: {type: String, default: 'SYSTEM'}
  },

  initSchema: function(mySchema) {
    mySchema.index({topic: 1, status: 1});

    mySchema.pre('save', function(next) {
        //workaround for determining inserts
        this.wasNew = this.isNew;
        next();
    })

    mySchema.post('save', function() {
        let isInsert = this.wasNew;
        console.debug("[ForumsPost-postSave] isInsert:", isInsert);

        if (isInsert) {
            let Topic = web.models('ForumsTopic');
            let self = this;

            Topic.findOne({_id: this.topic}, function(err, topic) {
                if (!topic) {
                    console.error("[ForumsPost-postSave] Topic not found.");
                    return;
                }

                topic.lastPost = self;
                topic.save();
            })
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