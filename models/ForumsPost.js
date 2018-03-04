var mongoose = web.lib.mongoose;
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    msg: {type: String, required: true},
    flags: [{type: String}], //e.g. for flagging as inappropriate
    userProfile: {type: ObjectId, ref: 'ForumsUserProfile', required: true},
    topic: {type: ObjectId, ref: 'ForumsTopic', required: true},

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'},
    createDt: {type: Date, default: Date.now},
    createBy: {type: String, default: 'SYSTEM'}
  }
}