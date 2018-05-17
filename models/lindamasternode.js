var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var LindaMasternodeStats = new Schema({
  minProtocolVersion: { type: String },
  address: { type: String },
  pubkey: { type: String },
  vin: { type: String },
  lastTimeSeen: { type: String },
  activeseconds: { type: String },
  rank: { type: String },
  lastDseep: { type: String },
  cacheInputAge: { type: String },
  cacheInputAgeBlock: { type: String },
  enabled: { type: String },
  unitTest: { type: String },
  allowFreeTx: { type: String },
  protocolVersion: { type: String },
  nLastDsq: { type: String }
}, {collection: 'masternodelist'});

module.exports = mongoose.model('masternodelist', LindaMasternodeStats);
