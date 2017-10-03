const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  title: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  /** I was having some race condition issues where votes double count. Instead of
 * locking, it would be simpler to just record who voted for what and return the
 * totals via the api */
  options: { type: mongoose.Schema.Types.Mixed, default: {} }, // option: true - list of options
  votes: { type: mongoose.Schema.Types.Mixed, default: {} }, // ip: option - who voted for what
}, { minimize: false });

module.exports = mongoose.model('Poll', PollSchema);
