const mongoose = require('mongoose');
require('mongoose-type-url');

const UserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  url: {
    type: mongoose.SchemaTypes.Url,
    required: true,
  },
  description: {
    type: String,
    maxLength: 40,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model('Pin', UserSchema);
