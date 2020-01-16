var request = require('request');

var base_url = 'https://api.crex24.com/v2/public';

function get_summary(coin, exchange, buys, sells, cb) {
  var summary = {};
  var topbid = 0;
  var topask = 0;
  var req_url = base_url + '/tickers?instrument=' + coin + '-' + exchange;
  request({uri: req_url, json: true}, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else if (response.statusCode === 200) {

            //buys.sort(function(a, b){if (a.price < b.price) return 1; if (b.price < a.price) return -1; return 0;});
            //sells.sort(function(a, b){if (a.price > b.price) return 1; if (b.price > a.price) return -1; return 0;});

            //topbid = parseFloat(buys[0].price).toFixed(8);
            //topask = parseFloat(sells[0].price).toFixed(8);
            summary['market'] = "Crex24";
            summary['bid'] = parseFloat(body[0]['bid']).toFixed(8);
            summary['ask'] = parseFloat(body[0]['ask']).toFixed(8);
            summary['volume'] = parseFloat(body[0]['quoteVolume']).toFixed(8);
            summary['high'] = parseFloat(body[0]['high']).toFixed(8);
            summary['low'] = parseFloat(body[0]['low']).toFixed(8);
            summary['last'] = parseFloat(body[0]['last']).toFixed(8);
            summary['change'] = body[0]['percentChange'];

            return cb(null, summary);
        } else {
            return cb(error, null);
        }
  });
}

function get_trades(coin, exchange, cb) {
  var req_url = base_url + '/recentTrades?instrument=' + coin + '-' + exchange;
  request({uri: req_url, json: true}, function (error, response, body) {
    if (response.statusCode === 200) {
      var trades = [];
      if (body.length > 0) {
          for (var i = 0; i < body.length; i++) {
//                console.log(new Date(body[i]['timestamp']).getTime() / 1000);
            var time = new Date(body[i]['timestamp']).getTime() / 1000;
            //var time = (body[i]['timestamp']).toString().substring(0,(body[i]['timestamp']).toString().length - 3);
            var trade = {
              type: body[i]['side'],
              price: parseFloat(body[i]['price']).toFixed(8),
              amount: body[i]['volume'],
              total: parseFloat((body[i]['volume']) * (body[i]['price'])).toFixed(8),
              timestamp: time
              //id: body[i]['id']
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
  var req_url = base_url + '/orderBook?instrument=' + coin + '-' + exchange + '&limit=100';
  request({uri: req_url, json: true}, function (error, response, body) {
    if (response.statusCode == 200) {
      var orders = body;
      var buys = [];
      var sells = [];
      if (orders['buyLevels'].length > 0){
          for (var i = 0; i < orders['buyLevels'].length; i++) {
            var order = {
              amount: parseFloat(orders['buyLevels'][i]['volume']).toFixed(8),
              price: parseFloat(orders['buyLevels'][i]['price']).toFixed(8),
              //  total: parseFloat(orders.buy[i].Total).toFixed(8)
              // Necessary because API will return 0.00 for small volume transactions
              total: (parseFloat(orders['buyLevels'][i]['volume']).toFixed(8) * parseFloat(orders['buyLevels'][i]['price']).toFixed(8)).toFixed(8)
            }
            buys.push(order);
          }
      }
      if (orders['sellLevels'].length > 0) {
        for (var x = 0; x < orders['sellLevels'].length; x++) {
            var order = {
                amount: parseFloat(orders['sellLevels'][x]['volume']).toFixed(8),
                price: parseFloat(orders['sellLevels'][x]['price']).toFixed(8),
                //    total: parseFloat(orders.sell[x].Total).toFixed(8)
                // Necessary because API will return 0.00 for small volume transactions
                total: (parseFloat(orders['sellLevels'][x]['volume']).toFixed(8) * parseFloat(orders['sellLevels'][x]['price']).toFixed(8)).toFixed(8)
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

