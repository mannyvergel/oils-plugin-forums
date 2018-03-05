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
    parentCat:{type: ObjectId, ref: 'ForumsCategory'},
    viewCount: {type: Number, default: 1},

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'},
    createDt: {type: Date, default: Date.now},
    createBy: {type: String, default: 'SYSTEM'}
  },
  initSchema: function(schema) {
        schema.statics.incrementViewCount = function (id, callback) {
            var setOnInsert = null;
            callback = callback || function(){};
            
          return this.findOneAndUpdate({_id: id}, { $inc: { viewCount: 1 }, $setOnInsert: setOnInsert}, 
            {new: true, upsert: true, select: {viewCount: 1}}, callback);
        };
     }
}