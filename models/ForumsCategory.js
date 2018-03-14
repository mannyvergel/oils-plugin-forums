var mongoose = web.lib.mongoose;
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    name: {type: String, required: true},
    desc: {type: String},
    seq: {type: Number},
    color: {type: String},
    icon: {type: String},
    forum: {type: ObjectId, ref: 'ForumsForum', required: true},
    parentCat:{type: ObjectId, ref: 'ForumsCategory'},
    viewCount: {type: Number, default: 0},
    activeUsers: [{_id: {type: ObjectId}, username: {type: String}, avatar: {type: String}}],

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'},
    createDt: {type: Date, default: Date.now},
    createBy: {type: String, default: 'SYSTEM'}
  },
  initSchema: function(schema) {

        var commonFuncs = require('../lib/commonFuncs.js');

        schema.statics.incrementViewCount = commonFuncs.incrementViewCount;
        schema.statics.addActiveUser = commonFuncs.addActiveUser;
     }
}