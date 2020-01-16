var request = require('request');

var base_url = 'https://api.altilly.com/api/public';

function get_summary(coin, exchange, buys, sells, cb) {
  var summary = {};
  var topbid = 0;
  var topask = 0;
  var req_url = base_url + '/ticker/' + coin + exchange;
  request({uri: req_url, json: true}, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else if (response.statusCode === 200) {
            summary['market'] = "Altilly";
            summary['bid'] = parseFloat(body['bid']).toFixed(10);
            summary['ask'] = parseFloat(body['ask']).toFixed(10);
            summary['volume'] = parseFloat(body['volumeQuote']).toFixed(8);
            summary['high'] = parseFloat(body['high']).toFixed(10);
            summary['low'] = parseFloat(body['low']).toFixed(10);
            summary['last'] = parseFloat(body['last']).toFixed(10);
            summary['change'] = "0";

            return cb(null, summary);
        } else {
            return cb(error, null);
        }
  });
}

function get_trades(coin, exchange, cb) {
  var req_url = base_url + '/trades/' + coin + exchange + '?sort=DESC&by=timestamp&limit=100';
  request({uri: req_url, json: true}, function (error, response, body) {
    if (response.statusCode == 200) {
      var trades = [];
      if (body.length > 0) {
          for (var i = 0; i < body.length; i++) {
            var time = body[i]['unixtimestamp'];
            var trade = {
              type: body[i]['side'],
              price: body[i]['price'],
              amount: body[i]['quantity'],
              total: parseFloat((body[i]['quantity']) * (body[i]['price'])).toFixed(8),
              timestamp: time,
              id: body[i]['id']
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
  var req_url = base_url + '/orderbook/' + coin + exchange + '?limit=100';
  request({uri: req_url, json: true}, function (error, response, body) {
    if (response.statusCode == 200) {
      var orders = body;
      var buys = [];
      var sells = [];
      if (orders['bid'].length > 0){
          for (var i = 0; i < orders['bid'].length; i++) {
            var order = {
              amount: parseFloat(orders.bid[i].size).toFixed(10),
              price: parseFloat(orders.bid[i].price).toFixed(10),
              //  total: parseFloat(orders.buy[i].Total).toFixed(8)
              // Necessary because API will return 0.00 for small volume transactions
              total: parseFloat(orders.bid[i].totsize).toFixed(10)
            }
            buys.push(order);
          }
      }
      if (orders['ask'].length > 0) {
        for (var x = 0; x < orders['ask'].length; x++) {
            var order = {
                amount: parseFloat(orders.ask[x].size).toFixed(10),
                price: parseFloat(orders.ask[x].price).toFixed(10),
                //    total: parseFloat(orders.sell[x].Total).toFixed(8)
                // Necessary because API will return 0.00 for small volume transactions
                total: parseFloat(orders.ask[x].totsize).toFixed(10)
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

