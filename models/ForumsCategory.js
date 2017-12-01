var mongoose = web.lib.mongoose;
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    name: {type: String, required: true},
    desc: {type: String, required: true},
    seq: {type: Number},
    color: {type: String},
    icon: {type: String},
    forum: {type: ObjectId, ref: 'ForumsForum', required: true},

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'},
    createDt: {type: Date, default: Date.now},
    createBy: {type: String, default: 'SYSTEM'}
  }
}