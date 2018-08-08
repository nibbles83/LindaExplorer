var mongoose = require('mongoose')
  , lib = require('../lib/explorer')
  , db = require('../lib/database')
  , settings = require('../lib/settings')
  , request = require('request');

var action = "update";
var hours = 6;

function usage() {

  console.log('Usage: node scripts/rewards.js update');
  console.log('');
  console.log('mode: (required)');
  console.log('update     Updates current reward stats');
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

function exit() {
  mongoose.disconnect();
  process.exit(0);
}

var dbString = 'mongodb://' + settings.dbsettings.user;
dbString = dbString + ':' + settings.dbsettings.password;
dbString = dbString + '@' + settings.dbsettings.address;
dbString = dbString + ':' + settings.dbsettings.port;
dbString = dbString + '/' + settings.dbsettings.database;

mongoose.connect(dbString, function(err) {
	if (err) {
		console.log('Unable to connect to database: %s', dbString);
		console.log('Aborting');
		exit();
	} else {
		if (action == "update"){
			console.log("getting last " + hours + " hours of rewards...");
			db.get_last_txs6(hours, function (body) {
			    lib.syncLoop(body.length, function (loop) {
			      var i = loop.iteration();
			      var tx = body[i].txid;
			      db.find_reward_tx(tx,function(txid){
		              	if (txid) {
		 	           //console.log(txid + " found");
				   loop.next();
              		        } else {
				
                		if ( body[i].vout.length > 0 ) {
		                  if ( body[i].vin.length == 0 ) {
                		    if ( body[i].vout.length > 1 ) {
		                      var poshalf = body[i].total / 2;
                		      for ( var n=0;n<body[i].vout.length; n++ ){
		                        if ( body[i].vout[n].amount > poshalf ){
                          		  var amount = body[i].vout[n].amount;
					  db.create_reward({
                                	      txid: body[i].txid,
                                     	      blockindex: body[i].blockindex,
                                      	      blockhash: body[i].blockhash,
                		              address: body[i].vout[n].addresses,
                	                      amount: amount.toFixed(8),
        	                              rewardType: "masternode",
        	                              timestamp: body[i].timestamp
	                                  }, function(){
						console.log("Inserted MN Reward " + body[i].txid);
                                          });

                        		}else{
					  var amount = body[i].vout[n].amount;
                                          db.create_reward({
                                              txid: body[i].txid,
                                              blockindex: body[i].blockindex,
                                              blockhash: body[i].blockhash,
                                              address: body[i].vout[n].addresses,
                                              amount: amount.toFixed(8),
                                              rewardType: "stake",
        	                              timestamp: body[i].timestamp
					   }, function(){
						console.log("Inserted Stake Reward " + body[i].txid);
                                           });

					}
                      		      }
                    		    } else {
                      		    	for ( var n=0;n<body[i].vout.length; n++ ) {
                        		    var amount = body[i].vout[n].amount;
                                          db.create_reward({
                                              txid: body[i].txid,
                                              blockindex: body[i].blockindex,
                                              blockhash: body[i].blockhash,
                                              address: body[i].vout[n].addresses,
                                              amount: amount.toFixed(8),
                                              rewardType: "stake",
        	                              timestamp: body[i].timestamp
                                          }, function(){
						console.log("Inserted v2 Stake Reward " + body[i].txid);
                                          });
                      		        }
                    		    }
				    loop.next();
                		  } else {
					loop.next();
				  }
		                } else {
					loop.next();
				}
		               }
			      });
		            }, function() {
				exit();
			    });
			});
		} else if (action == "clean"){
			//db.clean_linda_nodes(function(){
				exit();
			}
		}
});

