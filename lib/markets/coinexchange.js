var request = require('request');
 
var base_url = 'https://www.coinexchange.io/api/v1';
function get_summary(coin, exchange, coinexchange_id, cb) {
    var summary = {};
    request({ uri: base_url + '/getmarketsummary?market_id=' + coinexchange_id, json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else if (body.success === "1") {
	    summary['market'] = "CoinExchange";
            summary['bid'] = parseFloat(body.result['BidPrice']).toFixed(8);
            summary['ask'] = parseFloat(body.result['AskPrice']).toFixed(8);
            summary['volume'] = body.result['Volume'];
            summary['high'] = parseFloat(body.result['HighPrice']).toFixed(8);
            summary['low'] = parseFloat(body.result['LowPrice']).toFixed(8);
            summary['last'] = parseFloat(body.result['LastPrice']).toFixed(8);
            summary['change'] = body.result['Change'];
            return cb(null, summary);
        } else {
            return cb(error, null);
        }
    });
        
}
function get_trades(coin, exchange, coinexchange_id, cb) {
    return cb(null, []);
 // Not currently implemented, coinexchnage doesn't yet support trade history in the API.
}

function get_orders(coin, exchange, coinexchange_id, cb) {
    var req_url = base_url + '/getorderbook?market_id=' + coinexchange_id;
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (body.success == "1") {
            var orders = body.result;
            var buys = [];
            var sells = [];
            if (orders['BuyOrders'].length > 0){
                for (var i = 0; i < orders['BuyOrders'].length; i++) {
                    var order = {
                        amount: parseFloat(orders.BuyOrders[i].Quantity).toFixed(8),
                        price: parseFloat(orders.BuyOrders[i].Price).toFixed(8),
                        //  total: parseFloat(orders.BuyOrders[i].Total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(orders.BuyOrders[i].Quantity).toFixed(8) * parseFloat(orders.BuyOrders[i].Price)).toFixed(8)
                    }
                    buys.push(order);
                }
                } else {}
                if (orders['SellOrders'].length > 0) {
                for (var x = 0; x < orders['SellOrders'].length; x++) {
                    var order = {
                        amount: parseFloat(orders.SellOrders[x].Quantity).toFixed(8),
                        price: parseFloat(orders.SellOrders[x].Price).toFixed(8),
                        //    total: parseFloat(orders.SellOrders[x].Total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(orders.SellOrders[x].Quantity).toFixed(8) * parseFloat(orders.SellOrders[x].Price)).toFixed(8)
                    }
                    sells.push(order);
                }
            } else {
		}
	    	var groupBuys = [];
                var groupSells = [];
		var price = 0;
		var amount = 0;
		var total = 0;
		for (var i = 0; i < buys.length; i++) {
			console.log(parseFloat(buys[i].price).toFixed(8));
			if(parseFloat(buys[i].price).toFixed(8) == price){
				amount += parseFloat(buys[i].amount);
				total += parseFloat(buys[i].total);
				if(i == (buys.length - 1)){
					console.log(i + "|" + buys.length + "Last Entry!");
					console.log("amount:" + amount+ ",price:" + price +",total:"+ total)
					groupBuys.push({amount: parseFloat(amount).toFixed(8),price: price,total: parseFloat(total).toFixed(8)});
					//groupBuys.push({amount: amount,price: price,total: total});
				} 
				continue;
			} else if (price == 0) {
				price = parseFloat(buys[i].price).toFixed(8);
				amount = parseFloat(buys[i].amount);
				total = parseFloat(buys[i].total);
				continue;
			} else if (parseFloat(buys[i].price).toFixed(8) != price){
				console.log("amount:" + amount+ ",price:" + price +",total:"+ total)
				groupBuys.push({amount: parseFloat(amount).toFixed(8),price: price,total: parseFloat(total).toFixed(8)});
	                        price = parseFloat(buys[i].price).toFixed(8);
                                amount = parseFloat(buys[i].amount);
                                total = parseFloat(buys[i].total);
				//console.log(parseFloat(buys[i].price).toFixed(8));
			}
			

		}
                price = 0;
                amount = 0;
                total = 0;
                for (var i = 0; i < sells.length; i++) {
                        console.log(parseFloat(sells[i].price).toFixed(8));
                        if(parseFloat(sells[i].price).toFixed(8) == price){
                                amount += parseFloat(sells[i].amount);
                                total += parseFloat(sells[i].total);
                                if(i == (sells.length - 1)){
                                        console.log(i + "|" + sells.length + "Last Entry!");
                                        console.log("amount:" + amount+ ",price:" + price +",total:"+ total)
                                        groupSells.push({amount: parseFloat(amount).toFixed(8),price: price,total: parseFloat(total).toFixed(8)});
                                        //groupBuys.push({amount: amount,price: price,total: total});
                                }
                                continue;
                        } else if (price == 0) {
                                price = parseFloat(sells[i].price).toFixed(8);
                                amount = parseFloat(sells[i].amount);
                                total = parseFloat(sells[i].total);
                                continue;
                        } else if (parseFloat(sells[i].price).toFixed(8) != price){
                                console.log("amount:" + amount+ ",price:" + price +",total:"+ total)
                                groupSells.push({amount: parseFloat(amount).toFixed(8),price: price,total: parseFloat(total).toFixed(8)});
                                price = parseFloat(sells[i].price).toFixed(8);
                                amount = parseFloat(sells[i].amount);
                                total = parseFloat(sells[i].total);
                                //console.log(parseFloat(buys[i].price).toFixed(8));
                        }

                }
//		console.log(groupBuys);
            return cb(null, groupBuys, groupSells);
            } else {
            return cb(body.Message, [], [])
        }
    });
}


module.exports = {
    get_data: function (coin, exchange, coinexchange_id, cb) {
        var error = null;
        get_orders(coin, exchange, coinexchange_id, function (err, buys, sells) {
            if (err) { error = err; }
            get_trades(coin, exchange, coinexchange_id, function (err, trades) {
                if (err) { error = err; }
                get_summary(coin, exchange, coinexchange_id, function (err, stats) {
                    if (err) { error = err; }
                    return cb(error, { buys: buys, sells: sells, chartdata: [], trades: trades, stats: stats });
                });
            });
        });
    }
};
