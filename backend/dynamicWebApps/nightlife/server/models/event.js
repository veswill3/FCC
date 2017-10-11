const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  yelpBusinessId: {
    type: String,
    index: { unique: true },
  },
  date: { type: Date, default: Date.now },
  attendees: [String],
  // attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Event', EventSchema);
