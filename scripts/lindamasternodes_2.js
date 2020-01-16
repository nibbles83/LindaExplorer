var mongoose = require('mongoose')
  , lib = require('../lib/explorer')
  , db = require('../lib/database')
  , settings = require('../lib/settings')
  , fs = require('fs')
  , request = require('request');

var action = "update";
var database = "lindamasternode";

function usage() {

  console.log('Usage: node scripts/lindermasternode.js update');
  console.log('');
  console.log('mode: (required)');
  console.log('update     Updates current masternode stats');
  console.log('clean      Clears masternodes older than 7 days');
  console.log('');
  process.exit(0);

}

if (process.argv[2] == 'update'){
  action = 'update';
} else if (process.argv[2] === 'clean'){
  action = 'clean';
} else {
  usage();
}

function create_lock(cb) {
  if (( database == 'lindamasternode' ) && ( action = 'update' )) {
    var fname = './tmp/' + database + '.pid';
    fs.appendFile(fname, process.pid, function (err) {
      if (err) {
        console.log("Error: unable to create %s", fname);
        process.exit(1);
      } else {
        return cb();
      }
    });
  } else {
    return cb();
  }
}

function remove_lock(cb) {
  if (( database == 'lindamasternode' ) && ( action = 'update' )) {
    var fname = './tmp/' + database + '.pid';
    fs.unlink(fname, function (err){
      if(err) {
        console.log("unable to remove lock: %s", fname);
        process.exit(1);
      } else {
        return cb();
      }
    });
  } else {
    return cb();
  }
}

function is_locked(cb) {
  if (( database == 'lindamasternode' ) && ( action = 'update' )) {
    var fname = './tmp/' + database + '.pid';
    fs.exists(fname, function (exists){
      if(exists) {
        return cb(true);
      } else {
        return cb(false);
      }
    });
  } else {
    return cb();
  }
}

function exit() {
  remove_lock(function(){
    mongoose.disconnect();
    process.exit(0);
  });
}

var dbString = 'mongodb://' + settings.dbsettings.user;
dbString = dbString + ':' + settings.dbsettings.password;
dbString = dbString + '@' + settings.dbsettings.address;
dbString = dbString + ':' + settings.dbsettings.port;
dbString = dbString + '/' + settings.dbsettings.database;

is_locked(function (exists) {
  if (exists) {
    console.log("Script already running..");
    process.exit(0);
  } else {
    create_lock(function (){
		console.log("script launched with pid: " + process.pid);
		mongoose.connect(dbString, function(err) {
				if (err) {
						console.log('Unable to connect to database: %s', dbString);
						console.log('Aborting');
						exit();
				} else {
						if (action == "update"){
								request({uri: 'http://127.0.0.1:' + settings.port + '/api/masternode?command=status-all', json: true}, function (error, response, body) {
								  lib.syncLoop(body.length, function (loop) {
										var i = loop.iteration();
										//console.log(JSON.stringify(body));
										var pubkey = body[i].pubkey.split(':')[0];
										//console.log(pubkey);
										db.find_linda_node(pubkey, function(pubkey) {
										  if (pubkey) {
												db.update_linda_node(body[i], function(){
												 loop.next();
												});
												// peer already exists update details only.
										  } else {
												  db.create_linda_node({
														minProtoVerion: body[i].minProtoVerion,
														address: body[i].address,
														pubkey: body[i].pubkey,
														vin: body[i].vin,
														lastTimeSeen: body[i].lastTimeSeen,
														activeseconds: body[i].activeseconds,
														rank: body[i].rank,
														lastDseep: body[i].lastDseep,
														cacheInputAge: body[i].cacheInputAge,
														cacheInputAgeBlock: body[i].cacheInputAgeBlock,
														enabled: body[i].enabled,
														unitTest: body[i].unitTest,
														allowFreeTx: body[i].allowFreeTx,
														protocolVersion: body[i].protocolVersion,
														nLastDsq: body[i].nLastDsq,
												  }, function(){
														loop.next();
												  });
										  }
										});
								  }, function() {
										exit();
								  });
								});
						} else if (action == "clean"){
								db.clean_linda_nodes(function(){
										exit();
								});
						}
				}
		});
	});
	}
});
