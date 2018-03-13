var mongoose = web.lib.mongoose;
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    title: {type: String, required: true},
    category: {type: ObjectId, ref: 'ForumsCategory', required: true},
    tags: [{type: String}],
    viewCount: {type: Number, default: 1},
    activeUsers: [{_id: {type: ObjectId}, username: {type: String}, avatar: {type: String}}],
    lastPost: {_id:{type:ObjectId}, createBy:String, createDt: Date},

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