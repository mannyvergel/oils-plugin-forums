var mongoose = web.lib.mongoose;
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    title: {type: String, required: true},
    category: {type: ObjectId, ref: 'ForumsCategory', required: true},
    tags: [{type: String}],
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