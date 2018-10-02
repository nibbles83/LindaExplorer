var mongoose = require('mongoose')
  , lib = require('../lib/explorer')
  , db = require('../lib/database')
  , settings = require('../lib/settings')
  , request = require('request')
  , fs = require('fs');

var action = "update";

function usage() {

  console.log('Usage: node scripts/connectionslist.js update');
  console.log('');
  console.log('mode: (required)');
  console.log('update     Updates connection list with most recent masternode connections');
  console.log('');
  process.exit(0);

}

if (process.argv[2] == 'update'){
  action = 'update';
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
			db.get_linda_masternodes_24hr(function(body){
			  if(body.length > 100) {
				var conns = 0;
				var ips = "";
				for (i=1;i<=100;i++){
				  console.log(body[i]['address']);
				  ips = ips + "addnode=" + body[i]['address'] + "\n";
				  conns++
			        }
				if(conns=100){
				  fs.writeFileSync("public/connectionlist.txt",ips,{flag:'w'});
				  exit();
				}
			  }
			});
		}
	}
});
