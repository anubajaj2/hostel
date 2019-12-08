sap.ui.define([
	"victoria/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	'sap/m/MessagePopover',
	'sap/m/MessageItem'
], function(BaseController, JSONModel, History, MessagePopover, MessageItem) {
	"use strict";

	return BaseController.extend("victoria.controller.App", {

		fnHandleMessagePopoverPress: function(oEvent) {
			if (!this.oMP) {
				this._createMessagePopover();
			}
			this.oMP.toggle(oEvent.getSource());
		},

		_createMessagePopover: function() {
			var that = this;
			this.oMP = new MessagePopover({
				activeTitlePress: function(oEvent) {
					var oItem = oEvent.getParameter("item"),
						oMessage = oItem.getBindingContext("oMsgModel").getObject(),
						oControl = sap.ui.getCore().byId(oMessage.getControlId());

					if (that.getView().getModel("appView").getProperty("/admin") === false) {
						var oPage1 = that.oView.getContent()[0].getCurrentBeginColumnPage().byId("idPage2"),
							oPage2 = (that.oView.getContent()[0].getCurrentMidColumnPage() && that.oView.getContent()[0].getCurrentMidColumnPage().byId("idPage3")) ? that.oView.getContent()[0].getCurrentMidColumnPage().byId("idPage3") : null;
					} else {
						var oPage1 = that.oView.getContent()[0].getCurrentMidColumnPage().byId("idPage2"),
							oPage2 = that.oView.getContent()[0].getCurrentEndColumnPage().byId("idPage3");
					}

					if (oControl && oControl.getDomRef()) {
						if (oPage1) {
							oPage1.scrollToElement(oControl.getDomRef(), 200, [0, -100]);
							setTimeout(function() {
								oControl.focus();
							}, 300);
						}
						if (oPage2) {
							oPage2.scrollToElement(oControl.getDomRef(), 200, [0, -100]);
							setTimeout(function() {
								oControl.focus();
							}, 300);
						}
					}
				},
				items: {
					path: "oMsgModel>/",
					template: new MessageItem({
						activeTitle: { //--- Only Works From SAPUI5 Version 1.58
							parts: [{
								path: 'oMsgModel>target'
							}],
							formatter: this.isControlPositionable
						},
						title: "{oMsgModel>message}",
						subtitle: "{oMsgModel>additionalText}",
						groupName: {
							parts: [{
								path: 'oMsgModel>target'
							}],
							formatter: this.getControlGroupName.bind(this)
						},
						type: "{oMsgModel>type}",
						description: "{oMsgModel>message}"
					})
				}
			});

			this.oMP._oMessageView.setGroupItems(true);
			sap.ui.getCore().byId("idPage0MsgMan").addDependent(this.oMP);
		},

		getControlGroupName: function(sTarget) {
			var sControlId = sTarget.split("/")[0],
				sViewPrefix = this.getView().getId() + "--",
				oControl = sap.ui.getCore().byId(sControlId),
				sTitle = "";
			if (oControl) {
				var sFormSubtitle = oControl.getParent().getParent().getParent().getTitle().getText();
				// sFormTitle = oControl.getParent().getParent().getParent().getTitle();

				return sFormSubtitle; //+ ", " + sFormSubtitle;
			}
			// if (oControl && sTarget.startsWith(sViewPrefix)) {
			// 	var sFormName = oControl.getParent().getParent().getParent().getMetadata().getName(),
			// 		sTableName = oControl.getParent().getParent().getMetadata().getName();
			//
			// 	if (sFormName.substring(sFormName.lastIndexOf(".") + 1, sFormName.length) === "Form") {
			// 		sTitle = oControl.getParent().getParent().getParent().getTitle();
			// 	} else if (sTableName.substring(sTableName.lastIndexOf(".") + 1, sTableName.length) === "Table") {
			// 		sTitle = oControl.getParent().getParent().getParent().getHeader().split("(")[0] + ", Row - " + (oControl.getParent().getIndex() +
			// 			1) + " , Column - " + this.getView().byId(oControl.getLabels()[0].getId()).getLabel().getText();
			// 	}
			// } else { //--- If Message Is From Server
			// 	sTitle = "Backend Message(s)"; //sTarget.split("/")[1];
			// }
			return sTitle;
		},

		isControlPositionable: function(sTarget) {
			// var sViewPrefix = this.getView().getId() + "--",
			var sControlId;
			if (sTarget) {
				sControlId = sTarget.split("/")[0];
				return sControlId ? true : true;
			}
			return true;
		},

		idleLogout: function() {
			var t;
			var that = this;
			window.onbeforeunload = function() {
				that.logOutApp("X");
			};

			window.onload = resetTimer;
			window.onmousemove = resetTimer;
			window.onmousedown = resetTimer; // catches touchscreen presses as well
			window.ontouchstart = resetTimer; // catches touchscreen swipes as well
			window.onclick = resetTimer; // catches touchpad clicks as well
			window.onkeypress = resetTimer;
			window.addEventListener('scroll', resetTimer, true); // improved; see comments

			function yourFunction() {
				// your function for too long inactivity goes here
				// e.g. window.location.href = 'logout.php';
				sap.m.MessageBox.alert("Page expired, please login again!");
				window.top.location.href = "/";
			}

			function resetTimer() {
				clearTimeout(t);
				t = setTimeout(yourFunction, 900000); // time is in milliseconds
			}
		},

		onLogout: function() {
			this.logOutApp();
		},

		onChange: function(sChanel, sEvent, oEvent) {
			var oInput = oEvent.getSource();

			if (oInput.getRequired()) {
				this.handleRequiredField(oInput);
			}
		},

		handleRequiredField: function(oInput) {
			if (oInput.getBindingContext("local") && oInput.getBindingContext("local").getPath()) {
				var sTarget = oInput.getBindingContext("local").getPath() + "/" + oInput.getBindingPath("value");
			} else {
				var sTarget = oInput.getBindingPath("value");
			}


			this.removeMessageFromTarget(sTarget);
			var sValue = !oInput.getSelectedItem() ? oInput.getValue() : oInput.getSelectedItem();

			if (!sValue) {
				this._MessageManager.addMessages(
					new sap.ui.core.message.Message({
						message: "A mandatory field is required",
						type: sap.ui.core.MessageType.Error,
						additionalText: oInput.getLabels()[0].getText(),
						target: sTarget,
						processor: this.getView().getModel("local")
					})
				);
			}
		},

		removeMessageFromTarget: function(sTarget) {
			this._MessageManager.getMessageModel().getData().forEach(function(oMessage) {
				if (oMessage.target === sTarget) {
					this._MessageManager.removeMessages(oMessage);
				}
			}.bind(this));
		},

		onInit: function() {

			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("Page2", "onChange", this.onChange, this);
			oEventBus.subscribe("Page3", "onChange", this.onChange, this);

			//--- Message Manager
			this._MessageManager = sap.ui.getCore().getMessageManager();
			// this.getView().setModel(this._MessageManager.getMessageModel(), "oMsgModel");
			sap.ui.getCore().setModel(this._MessageManager.getMessageModel(), "oMsgModel");
			this._MessageManager.registerObject(this.getView(), true);
			sap.ui.getCore().byId("idPage0MsgMan").attachEvent("press", this.fnHandleMessagePopoverPress.bind(this));
			// sap.ui.getCore().byId("idPage0MsgMan").bindProperty("enabled", "oMsgModel>/.length", function(sLength) {
			// 	return !!sLength;
			// });

			this.getOwnerComponent().getModel("local").setSizeLimit(600);
			this.idleLogout();

			var oViewModel,
				oListSelector = this.getOwnerComponent().oListSelector,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0,
				admin: false
			});

			this.getView().setModel(oViewModel, "appView");

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			//FCL
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
			this.oFclModel = this.getOwnerComponent().getModel("FclRouter");

			return new Promise(function(fnResolve) {

				var oModel, aPromises = [];
				oModel = this.getOwnerComponent().getModel();
				aPromises.push(oModel.metadataLoaded);
				return Promise.all(aPromises).then(function() {
					oViewModel.setProperty("/busy", false);
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
					fnResolve();
				});
			}.bind(this));
		},

		onRouteMatched: function(oEvent) {
			var sRouteName = oEvent.getParameter("name");
			var sLayout = oEvent.getParameters().arguments.layout;
			this._updateUIState(sLayout);
			this.currentRouteName = sRouteName;
		},

		onStateChanged: function(oEvent) {
			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
				sLayout = oEvent.getParameter("layout"),
				sBeginContext = this.oFclModel.getProperty("/beginContext"),
				sMidContext = this.oFclModel.getProperty("/midContext"),
				sEndContext = this.oFclModel.getProperty("/endContext");

			if (bIsNavigationArrow) {
				var oNavProperties = {
					layout: sLayout,
					beginContext: sBeginContext,
					midContext: sMidContext,
					endContext: sEndContext
				};
				this.oRouter.navTo(this.currentRouteName, oNavProperties, true);
			}
		},

		_updateUIState: function(sNewLayout) {
			var oUIState = this.getOwnerComponent().getSemanticHelper().getCurrentUIState();
			this.oFclModel.setProperty('/uiState', oUIState);
			this.oFclModel.setProperty("/uiState/layout", sNewLayout);
		}
	});
});
