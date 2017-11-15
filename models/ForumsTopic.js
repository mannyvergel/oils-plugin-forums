var mongoose = web.lib.mongoose;
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    subj: {type: String, required: true},
    category: {type: ObjectId, ref: 'ForumsCategory', required: true},

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'},
    createDt: {type: Date, default: Date.now},
    createBy: {type: String, default: 'SYSTEM'}
  }
}