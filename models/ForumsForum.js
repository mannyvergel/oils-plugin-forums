var mongoose = web.lib.mongoose;
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    timezone: {type: String, required: true},
    forumId: {type: String, required: true}, //one time identifier

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'},
    createDt: {type: Date, default: Date.now},
    createBy: {type: String, default: 'SYSTEM'}
  }
}