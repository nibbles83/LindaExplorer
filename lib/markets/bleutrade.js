var request = require('request');

var base_url = 'https://bleutrade.com/api/v2/public';

function get_summary(coin, exchange, cb) {
  var req_url = base_url + '/getmarketsummary?market=' + coin + '_' + exchange;
  var summary = {};
  request({uri: req_url, json: true}, function (error, response, body) {
    if (error) {
      return cb(error, null);
    } else {
      if (body.message) {
        return cb(body.message, null)
      } else {
            summary['market'] = "Bleutrade";
            summary['bid'] = body.result[0].Bid.toFixed(8);
            summary['ask'] = body.result[0].Ask.toFixed(8);
            summary['volume'] = body.result[0].BaseVolume;
            summary['high'] = body.result[0].High.toFixed(8);
            summary['low'] = body.result[0].Low.toFixed(8);
            summary['last'] = body.result[0].Last.toFixed(8);
            summary['prevday'] = body.result[0].PrevDay.toFixed(8);
            //summary['change'] = body.result[0].Change;
        return cb (null, summary);
      }
    }
  });
}

function get_trades(coin, exchange, cb) {
  var req_url = base_url + '/getmarkethistory?market=' + coin + '_' + exchange + '&count=50';
  request({uri: req_url, json: true}, function (error, response, body) {
    if (body.success == "true") {
      return cb (null, body.result);
    } else {
      return cb(body.message, null);
    }
  });
}

function get_orders(coin, exchange, cb) {
  var req_url = base_url + '/getorderbook?market='  + coin + '_' + exchange + '&type=all' + '&depth=50';
  request({uri: req_url, json: true}, function (error, response, body) {
    if (body.success == "true") {
      var orders = body.result;
      var buys = [];
      var sells = [];
            if (orders['buy'].length > 0){
                for (var i = 0; i < orders['buy'].length; i++) {
                    var order = {
                        amount: parseFloat(orders.buy[i].Quantity).toFixed(8),
                        price: parseFloat(orders.buy[i].Rate).toFixed(8),
                        //  total: parseFloat(orders.buy[i].Total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(orders.buy[i].Quantity).toFixed(8) * parseFloat(orders.buy[i].Rate)).toFixed(8)
                    }
                    buys.push(order);
                }
                } else {}
                if (orders['sell'].length > 0) {
                for (var x = 0; x < orders['sell'].length; x++) {
                    var order = {
                        amount: parseFloat(orders.sell[x].Quantity).toFixed(8),
                        price: parseFloat(orders.sell[x].Rate).toFixed(8),
                        //    total: parseFloat(orders.sell[x].Total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(orders.sell[x].Quantity).toFixed(8) * parseFloat(orders.sell[x].Rate)).toFixed(8)
                    }
                    sells.push(order);
                }
            } else {
            }
            return cb(null, buys, sells);
            } else {
            return cb(body.message, [], [])
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
        get_summary(coin, exchange, function(err, stats) {
          if (err) { error = err; }
          return cb(error, {buys: buys, sells: sells, chartdata: [], trades: trades, stats: stats});
        });
      });
    });
  }
};
