var mongoose = web.lib.mongoose;
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    content: {type: String, required: true},
    userProfile: {type: ObjectId, ref: 'User', required: true},
    topic: {type: ObjectId, ref: 'ForumsTopic', required: true},

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'},
    createDt: {type: Date, default: Date.now},
    createBy: {type: String, default: 'SYSTEM'}
  }
}