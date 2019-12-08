sap.ui.define([],
	function() {
		return {
			//Input must be an object of control and return is boolean
			checkEmpty: function(oInput) {
				if (oInput.getValue() === "") {
					/* @type sap.m.Input */
					oInput.setValueState("Error");
					return false;
				} else {
					oInput.setValueState("None");
					return true;
				}
			},

			checkEmail: function(oInput) {
				var email = oInput.getValue();
				var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
				if (!email.match(mailregex)) {
					//alert("Invalid Email");
					oInput.setValueState("Error");
					return false;
				} else {
					oInput.setValueState("None");
					return true;
				}
			},

			convertDate: function(oInput,hireDt) {
				var today = new Date();
				var day = today.getDate();
				var mon = today.getMonth() + 1; // In JS January is 0, so add +1 to make it as normal months
				var yyyy = today.getFullYear();
				if (day < 10) {
					day = '0' + day;
				}
				if (mon < 10) {
					mon = '0' + mon;
				}
				var today = yyyy + '/' + mon + '/' + day;
				
				 if ( hireDt >today) {
				 	oInput.setValueState("Error");
					return false;
				 } else{
				 	oInput.setValueState("None");
					return true;
				 }
				},
			checkMore: function(oInput,threshold,inpVal) {
				if (inpVal>threshold) {
					oInput.setValueState("Error");
					return false;
				} else {
					oInput.setValueState("None");
					return true;
				}
			}

		};

	});