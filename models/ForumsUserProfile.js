var mongoose = web.lib.mongoose;
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    avatar: {type: String},
    user: {type: ObjectId, ref: 'User'},

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'}
  }
}