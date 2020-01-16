var request = require('request');

var base_url = 'https://btc-alpha.com/';

function getPercentageChange(oldNumber, newNumber){
        var difference = oldNumber - newNumber;
        return (difference / oldNumber) * 100;
}

function get_summary(coin, exchange, trades, buys, sells, cb) {
    var dNow = Math.round((new Date()).getTime() / 1000);
    var high = 0;
    var low = 0;
    var volumebtc = 0;
    var topbid = 0;
    var topask = 0;
    var lastprice = 0;
    var lasttime = 0;
    var change = 0;
    var summary = {};

    if (trades.length > 0){
        var body = trades;
        if (body.length > 0) {
            //console.log(body);
            //console.log(body.length);
            for (var i = 0; i < body.length; i++) {
                //console.log(body[i]['price']);
                if ( body[i].timestamp > (dNow - 84600)) {
                    if (high == 0) {
                        high = body[i].price;
                        //console.log("high:" + high);
                    }
                    if (body[i].price > high){
                        //console.log("high:" + high + "|" + body[i].price);
                        high = body[i].price;
                    }
                    if (low == 0) {
                        low = body[i].price;
                        //console.log("Low:" + low);
                    }
                    if (body[i].price < low){
                        //console.log("Low:" + low + "|" + body[i].price);
                        low = body[i].price;
                    }
                    if (body[i].timestamp > lasttime){
                        lasttime = body[i].timestamp;
                        lastprice = body[i].price;
                    }
                    addvol = parseFloat(body[i].amount).toFixed(8) * body[i].price;
                    volumebtc = volumebtc + addvol;


                } else {
                    high = 0;
                    low = 0;
                    lasttime = 0;
                    lastprice= 0;
                    addvol = 0;
                    volumebtx = 0;
                }
            }

            //stick the last 24 hrs of trades into their own array, we can then sort it to find the earliest trade price in the last 24hrs.
            var last24hrTrades = new Array();
            for (var i = 0; i < body.length; i++) {
                if ( body[i].timestamp > (dNow - 84600)) {
                  last24hrTrades.push(body[i]);
                }
            }
            last24hrTrades.sort(function(a, b){if (a.timestamp > b.timestamp) return 1; if (b.timestamp > a.timestamp) return -1; return 0;});
            if (last24hrTrades.length > 0) {
                var first24trade = last24hrTrades[0].price;
                change = getPercentageChange(first24trade, lastprice);
            }
        }
    }

    //sort the buys and sells, this lets us grab the top price buy and lowest priced sell.
    buys.sort(function(a, b){if (a.price < b.price) return 1; if (b.price < a.price) return -1; return 0;});
    sells.sort(function(a, b){if (a.price > b.price) return 1; if (b.price > a.price) return -1; return 0;});

    if (buys.length > 0){
        topbid = parseFloat(buys[0].price).toFixed(8);
    } else {
        topbid = 0;
    }
    if (sells.length > 0){
        topask = parseFloat(sells[0].price).toFixed(8);
    } else {
        topask = 0;
    }

    //console.log(high + "|" + low + "|" + lastprice + "|" + parseFloat(volumebtc).toFixed(8) + "|" + parseFloat(change).toFixed(2) + " | " + topask + "|" + topbid );
    summary['market'] = "BTC-Alpha";
    summary['bid'] = topbid;
    summary['ask'] = topask;
    summary['volume'] = parseFloat(volumebtc).toFixed(8);
    summary['high'] = high;
    summary['low'] = low;
    summary['last'] = lastprice;
    summary['change'] = change;
    return cb(null, summary);
}
function get_trades(coin, exchange, cb) {
    var req_url = base_url + 'api/v1/exchanges/?format=json&pair=' + coin + "_" + exchange;
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (body.length > 0) {
            var tTrades = body;
            var trades = [];
            for (var i = 0; i < tTrades.length; i++) {
                var Trade = {
                    orderpair: tTrades[i].pair,
                    ordertype: tTrades[i].type,
                    amount: parseFloat(tTrades[i].amount).toFixed(8),
                    price: parseFloat(tTrades[i].price).toFixed(8),
                    //  total: parseFloat(tTrades[i].Total).toFixed(8)
                    // Necessary because API will return 0.00 for small volume transactions
                    total: (parseFloat(tTrades[i].amount).toFixed(8) * parseFloat(tTrades[i].price)).toFixed(8),
                    timestamp: tTrades[i].timestamp
                }
                trades.push(Trade);
            }
            return cb(null, trades);
        } else {
            return cb(body.Message, null);
        }
    });
}

function get_orders(coin, exchange, cb) {
    var req_url = base_url + 'api/v1/orderbook/' + coin + "_" + exchange + "/?format=json&group=1";
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (body != null) {
            var orders = body;
            var buys = [];
            var sells = [];
            if (orders['buy'].length > 0){
                for (var i = 0; i < orders['buy'].length; i++) {
                    var order = {
                        amount: parseFloat(orders.buy[i].amount).toFixed(8),
                        price: parseFloat(orders.buy[i].price).toFixed(8),
                        //  total: parseFloat(orders.BuyOrders[i].Total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(orders.buy[i].amount).toFixed(8) * parseFloat(orders.buy[i].price)).toFixed(8)
                    }
                    buys.push(order);
                }
                } else {}
                if (orders['sell'].length > 0) {
                for (var x = 0; x < orders['sell'].length; x++) {
                    var order = {
                        amount: parseFloat(orders.sell[x].amount).toFixed(8),
                        price: parseFloat(orders.sell[x].price).toFixed(8),
                        //    total: parseFloat(orders.SellOrders[x].Total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(orders.sell[x].amount).toFixed(8) * parseFloat(orders.sell[x].price)).toFixed(8)
                    }
                    sells.push(order);
                }
            } else {
            }
            return cb(null, buys, sells);
            } else {
            return cb(body.Message, [], [])
        }
    });
}


module.exports = {
    get_data: function (coin, exchange, cb) {
        var error = null;
        get_orders(coin, exchange, function (err, buys, sells) {
            if (err) { error = err; }
            get_trades(coin, exchange, function (err, trades) {
                if (err) { error = err; }
                get_summary(coin, exchange, trades, buys, sells, function (err, stats) {
                    if (err) { error = err; }
                    return cb(error, { buys: buys, sells: sells, chartdata: [], trades: trades, stats: stats });
                });
            });
        });
    }
};

