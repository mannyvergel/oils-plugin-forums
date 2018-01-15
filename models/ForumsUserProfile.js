var mongoose = web.lib.mongoose;
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    avatar: {type: String},
    user: {type: ObjectId, ref: 'User'},
    points: {type: Number, default: 0},

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'}
  },

  initSchema: function(mySchema) {
    mySchema.post('save', function(rec) {
      web.plugins['oils-plugin-forums'].conf.userProfileNeedsUpdating = true;
    })
  }
}