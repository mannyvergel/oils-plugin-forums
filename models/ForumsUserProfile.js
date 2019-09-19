'use strict';

const mongoose = web.require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = {
  schema: {
    user: {type: ObjectId, ref: 'User'},
    points: {type: Number, default: 0},
    rank: {type: String},

    updateDt: {type: Date, default: Date.now},
    updateBy: {type: String, default: 'SYSTEM'}
  },

  initSchema: function(mySchema) {
    mySchema.post('save', function(rec) {
      web.plugins['oils-plugin-forums'].conf.userProfileNeedsUpdating = true;
    })
  }
}