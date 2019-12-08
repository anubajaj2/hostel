'use strict';

module.exports = function(Account) {
	// var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	//validations
	///Parse microsoft ISO Date while read : /Date(1540319400000)/
	//jsonDate = "/Date(1540319400000)/"; var date = new Date(parseInt(jsonDate.substr(6)));
	// Account.observe("before save", function(ctx, next) {
	// 	var data = ctx.instance || ctx.data;
		//  console.log("Context kya hai" + ctx.instance.EmailId  + "   " +  ctx.instance.ServerPayName);
		//if(ctx.instance && ctx.instance.BatchNo ){
		//      //do nothing
		//      return next();
		//}
		//else{
		//  next();
		//}
		// ServerPay.find({
		// 		where: {
		// 			or: [{
		// 				Type: "Payment"
		// 			}, {
		// 				Type: "Assignment"
		// 			}]
		// 		}
		// 	})
		// 	.then(function(Records, err) {
		// 		if (err) {
		// 			next(err);
		// 		} else {
		// 			var count;
		// 			var Amount;
		// 			var total;
		// 			var rem;
		// 			var serPayment = [];
		// 			if (data.Type == "Payment") {
		//
		// 				if (Records[0].__data.Type.toString() != "Payment") {
		// 					for (var i = 0; i < Records["length"]; i++) {
		// 						if (Records[i].__data.Type.toString() == "Payment") {
		// 							serPayment = Records[i].__data;
		// 							Amount = data.Amount + serPayment.Extra;
		// 							break;
		// 						}
		// 					}
		// 				}else{
		// 					Amount = data.Amount + Records[0].__data.Extra;
		// 				}
		// 				if (Records["length"] >= 1) {
		// 					count = Records[0].__data.Count;
		// 					if (Amount) {
		// 							if(Amount >=2000){
		// 						data.Extra = Amount % 2000;
		// 						count = count + Math.floor(Amount / 2000);}else{
		// 								data.Extra = data.Amount;
		// 						}
		// 					}
		// 					data.Count = count;
		// 					next();
		// 				} else {
		// 					if (data.Amount >= 2000) {
		// 						data.Count = Math.floor(data.Amount / 2000);
		// 						data.Extra = data.Amount % 2000;
		// 					}
		// 					else{
		// 						data.Extra = Amount % 2000;
		// 					}
		// 					next();
		// 				}
		// 			} else {
		// 				next();
		// 			}
		// 		}
		// 	});

	// });
};
