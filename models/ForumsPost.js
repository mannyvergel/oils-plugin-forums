var mongoose = web.lib.mongoose;
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    msg: {type: String, required: true},
    flags: [{type: String}], //e.g. for flagging as inappropriate
    user: {type: ObjectId, ref: 'User', required: true},
    topic: {type: ObjectId, ref: 'ForumsTopic', required: true},

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'},
    createDt: {type: Date, default: Date.now},
    createBy: {type: String, default: 'SYSTEM'}
  },

  initSchema: function(mySchema) {
    mySchema.pre('save', function(next) {
        //workaround for determining inserts
        this.wasNew = this.isNew;
        next();
    })

    mySchema.post('save', function() {
        var isInsert = this.wasNew;
        console.debug("[ForumsPost-postSave] isInsert:", isInsert);

        if (isInsert) {
            var Topic = web.models('ForumsTopic');
            var self = this;

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
        var Post = web.models('ForumsPost');

        var self = this;
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