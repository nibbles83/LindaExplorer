var request = require('request');

var base_url = 'https://openapi.idax.mn/api/v2';

function get_summary(coin, exchange, buys, sells, cb) {
  var summary = {};
  var topbid = 0;
  var topask = 0;
  var req_url = base_url + '/ticker?pair=' + coin + '_' + exchange;
  request({uri: req_url, json: true}, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else if (body.code === 10000) {
	    buys.sort(function(a, b){if (a.price < b.price) return 1; if (b.price < a.price) return -1; return 0;});
            sells.sort(function(a, b){if (a.price > b.price) return 1; if (b.price > a.price) return -1; return 0;});

	    topbid = parseFloat(buys[0].price).toFixed(8);
	    topask = parseFloat(sells[0].price).toFixed(8);

            summary['market'] = "Idax";
            summary['bid'] = topbid;
            summary['ask'] = topask;
            summary['volume'] = parseFloat(parseFloat(body.ticker[0]['vol']).toFixed(8) * parseFloat(body.ticker[0]['last']).toFixed(8)).toFixed(8);
            summary['high'] = parseFloat(body.ticker[0]['high']).toFixed(8);
            summary['low'] = parseFloat(body.ticker[0]['low']).toFixed(8);
            summary['last'] = parseFloat(body.ticker[0]['last']).toFixed(8);
            summary['change'] = "0";

            return cb(null, summary);
        } else {
            return cb(error, null);
        }
  });
}

function get_trades(coin, exchange, cb) {
  var req_url = base_url + '/trades?pair=' + coin + '_' + exchange;
  request({uri: req_url, json: true}, function (error, response, body) {
    if (body.code == 10000) {
      var trades = [];
      if (body['trades'].length > 0) {
          for (var i = 0; i < body['trades'].length; i++) {
	    var time = (body['trades'][i]['timestamp']).toString().substring(0,(body['trades'][i]['timestamp']).toString().length - 3);
            var trade = {
	      type: body['trades'][i]['maker'],
	      price: body['trades'][i]['price'],
	      amount: body['trades'][i]['quantity'],
	      total: parseFloat((body['trades'][i]['quantity']) * (body['trades'][i]['price'])).toFixed(8),
	      timestamp: time,
	      id: body['trades'][i]['id']
	    }
            trades.push(trade);
          } 
      }   
      trades = trades.sort(function(a,b){
	var datea = a.timestamp, dateb = b.timestamp;
	return dateb - datea;
      });
      return cb (null, trades);
    } else {
      return cb(body.message, null);
    }
  });
}

function get_orders(coin, exchange, cb) {
  var req_url = base_url + '/depth?pair=' + coin + '_' + exchange + '&size=20' + '&merge=8';
  request({uri: req_url, json: true}, function (error, response, body) {
    if (body.code == 10000) {
      var orders = body;
      var buys = [];
      var sells = [];
      if (orders['bids'].length > 0){
          for (var i = 0; i < orders['bids'].length; i++) {
            var order = {
              amount: parseFloat(orders.bids[i][1]).toFixed(8),
              price: parseFloat(orders.bids[i][0]).toFixed(8),
              //  total: parseFloat(orders.buy[i].Total).toFixed(8)
              // Necessary because API will return 0.00 for small volume transactions
              total: (parseFloat(orders.bids[i][1]).toFixed(8) * parseFloat(orders.bids[i][0])).toFixed(8)
            }
            buys.push(order);
          }
      }
      if (orders['asks'].length > 0) {
        for (var x = 0; x < orders['asks'].length; x++) {
            var order = {
                amount: parseFloat(orders.asks[x][1]).toFixed(8),
                price: parseFloat(orders.asks[x][0]).toFixed(8),
                //    total: parseFloat(orders.sell[x].Total).toFixed(8)
                // Necessary because API will return 0.00 for small volume transactions
                total: (parseFloat(orders.asks[x][1]).toFixed(8) * parseFloat(orders.asks[x][0])).toFixed(8)
            }
            sells.push(order);
        }
      }
      return cb(null, buys, sells);
    } else {
      return cb(body.message, [], []);
    }
  });
}

module.exports = {
  get_data: function(coin, exchange, cb) {
    var error = null;
    get_orders(coin, exchange, function(err, buys, sells) {
      if (err) { error = err; }
      get_trades(coin, exchange, function(err, trades) {
        if (err) { error = err; }
        get_summary(coin, exchange, buys, sells, function(err, stats) {
          if (err) { error = err; }
          return cb(error, {buys: buys, sells: sells, chartdata: [], trades: trades, stats: stats});
        });
      });
    });
  }
};
