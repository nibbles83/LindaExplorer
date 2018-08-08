var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var Rewards = new Schema({
  txid: { type: String },
  blockindex: { type: String },
  blockhash: { type: String },
  address: { type: String },
  amount: { type: String },
  rewardType: { type: String },
  timestamp: { type: String },
}, {collection: 'rewards'});

module.exports = mongoose.model('rewards', Rewards);
