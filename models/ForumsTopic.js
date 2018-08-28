const mongoose = web.require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    title: {type: String, required: true},
    category: {type: ObjectId, ref: 'ForumsCategory', required: true},
    tags: [{type: String}],
    viewCount: {type: Number, default: 0},
    activeUsers: [{_id: {type: ObjectId}, username: {type: String}, avatar: {type: String}}],
    lastPost: {_id:{type:ObjectId}, createBy:String, createDt: Date},
    status: {type: String, default: 'A', required: true, index: true}, //[A]ctive, [C]losed, X - Deleted

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'},
    createDt: {type: Date, default: Date.now},
    createBy: {type: String, default: 'SYSTEM'}
  },
  initSchema: function(schema) {

      let commonFuncs = require('../lib/commonFuncs.js');

      schema.statics.incrementViewCount = commonFuncs.incrementViewCount;
      schema.statics.addActiveUser = commonFuncs.addActiveUser;


      schema.pre('save', function (next) {
        this.wasNew = this.isNew;
        next();
      });

      schema.post('save', function () {
        if (this.wasNew) {
          web.subs.newSubscription(this._id, "ForumsTopic", this.title);
        }
      });
   }
}