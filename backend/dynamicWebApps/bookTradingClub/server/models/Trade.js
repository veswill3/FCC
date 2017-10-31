const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  book: String,
});

TradeSchema.index({ owner: 1 });
TradeSchema.index({ requestedBy: 1 });

module.exports = mongoose.model('Trade', TradeSchema);
