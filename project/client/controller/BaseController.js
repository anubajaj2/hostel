sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"victoria/dbapi/dbapi",
	"sap/m/MessageBox",
	'sap/m/MessagePopover',
	'sap/m/MessageItem'
], function(jQuery, Controller, History, JSONModel, ODataHelper, MessageBox, MessagePopover, MessageItem) {
	"use strict";
	var oTargetField;
	var oSDCField;
	var oUsernameField;
	var oSystemField;
	var oClientField;
	return Controller.extend("victoria.controller.BaseController", {
		/**
		 * Global Variables used in all controllers
		 * Defining the formatters here allows the use in all controllers that extends the base controller
		 * Also defined the models here so that all controllers would be able to access them
		 *
		 */
		ODataHelper: ODataHelper,
		secureToken: "",
		currentUser: "",
		bUserTestcases: true,
		oViewModel: undefined,
		oMasterList: undefined,
		oMasterPage: undefined,
		oDetailPage: undefined,
		oViewTable: undefined,
		oEditTable: undefined,
		oEventBus: undefined,
		oTestcaseListModel: undefined,
		sUrlTargetSystem: undefined,
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		onInit: function() {
			// var that = this;
			// this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/AppUsers", "GET", null, null, this)
			// 	.then(function(oData) {
			// 		that.getView().setBusy(false);
			// 	}).catch(function(oError) {
			// 		var oPopover = that.getErrorMessage(oError);
			// 	});
		},
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		getCurrentUser: function(){
			return this.currentUser;
		},

		logOutApp: function(Reload) {
			var that = this;
			var accessToken = that.getView().getModel("local").getProperty("/Authorization");
			if (accessToken) {
				$.post('/api/Users/logout?access_token=' + accessToken, {})
					.done(function(data, status) {
						that.getView().getModel("local").setProperty("/Authorization", "");
						that.getView().getModel().setHeaders({
							"Authorization": ""
						});
						that.redirectLoginPage("X", Reload);
					})
					.fail(function(xhr, status, error) {
						sap.m.MessageBox.error("Logout failed");
					});
			} else {
				that.redirectLoginPage("X", Reload);
			}

		},
		getCustomerPopup: function() {
			if (!this.searchPopup) {
				this.searchPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
				this.getView().addDependent(this.searchPopup);
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.searchPopup.setTitle(title);
			}
			this.searchPopup.open();

		},

		getDialogPopup: function() {
			if (!this.oDialogPopup) {
				this.oDialogPopup = new sap.ui.xmlfragment("idDialog","victoria.fragments.Dialog", this);
				// sap.ui.getCore().getMessageManager().registerObject(this.oSuppPopup, true);
				this.getView().addDependent(this.oDialogPopup);
			}
			this.oDialogPopup.open();
		},
		getReasgnPopup: function() {
			if (!this.ReasgnPopup) {
				this.ReasgnPopup = new sap.ui.xmlfragment("idReDialog","victoria.fragments.Dialog", this);
				// sap.ui.getCore().getMessageManager().registerObject(this.oSuppPopup, true);
				this.getView().addDependent(this.ReasgnPopup);
			}
			this.ReasgnPopup.open();
		},
		getFormPopup: function() {
			if (!this.oFormPopup) {
				this.oFormPopup = new sap.ui.xmlfragment("victoria.fragments.SimpleForm", this);
				// sap.ui.getCore().getMessageManager().registerObject(this.oSuppPopup, true);
				this.getView().addDependent(this.oFormPopup);
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.oFormPopup.setTitle(title);
			}
			this.oFormPopup.open();
		},

		getBatchPopup: function() {
			if (!this.oSuppPopup) {
				this.oSuppPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
				// sap.ui.getCore().getMessageManager().registerObject(this.oSuppPopup, true);
				this.getView().addDependent(this.oSuppPopup);
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.searchPopup.setTitle(title);
			}
			this.oSuppPopup.open();
		},

		getQuery: function(oEvent) {
			var queryString = oEvent.getParameter("query");
			if (!queryString) {
				queryString = oEvent.getParameter("value");
			}
			return queryString;
		},

		getSelectedKey: function(oEvent, key, label) {
			var key = oEvent.getParameter("selectedItem").getValue();
			var label = oEvent.getParameter("selectedItem").getLabel();
			var sPath = oEvent.getParameter("selectedItem").getBindingContextPath();
			var id = this.getView().getModel().getProperty(sPath).id;
			return [key, label, id];

		},

		getObjListSelectedkey: function(oEvent) {
			debugger;
			var title = oEvent.getParameter("selectedItem").getTitle();
			var intro = oEvent.getParameter("selectedItem").getIntro();
			var number = oEvent.getParameter("selectedItem").getNumber();
			var sPath = oEvent.getParameter("selectedItem").getBindingContextPath();
			var id = this.getView().getModel().getProperty(sPath).id;
			return [title, intro, number, id];

		},
		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getOwnerComponent().getModel(sName);
		},

		messagePoper: null,
		createMessagePopover: function() {
			var that = this;
			if (!this.messagePoper) {
				this.messagePoper = sap.ui.xmlfragment(
					"victoria.fragments.DependencyChecker",
					this
				);
				this.getView().addDependent(this.messagePoper);
				this.messagePoper.setModel(this.getOwnerComponent().getModel("local"), "local");
			}
			this.messagePoper.open();

		},
		destroyMessagePopover: function() {
			if (this.messagePoper) {
				this.messagePoper.destroy();
				this.messagePoper = null;
			}
		},

		getErrorMessage: function(oError) {
			var sErrorMessages = [];
			var sResponseText;
			var oResponse;

			if (oError.statusText == "Unauthorized") {
				this.redirectLoginPage();
			}

			try {
				var sErrorMessages = oError.responseText.split(".")[1];
				if(oError.responseText.split(".")["length"] > 2){
				 sErrorMessages = oError.responseText ;
				}
				if(!sErrorMessages){
				sErrorMessages = oError.responseText.split(":")[1];
				}
			} catch (e) {
				if(oError.message){
					sErrorMessages = ';' + oError.message;
				}
				else{
					return oError.responseText.split(".")[1];
				}
			}
			sErrorMessages = sErrorMessages.split(";");
			var finalMessages = [];
			for (var i = 0; i < sErrorMessages.length; i++) {
				finalMessages.push({
					type: "Error",
					description: sErrorMessages[i]
				});
			}
			if (finalMessages) {
				this.getOwnerComponent().getModel("local").setProperty("/messages", finalMessages);
				this.getOwnerComponent().getModel("local").setProperty("/messagesLength", finalMessages.length);
				this.createMessagePopover();
			}
		},
		handlevalidationDialogClose: function() {
			this.messagePoper.close();
			if (this.messagePoper) {
				this.messagePoper.destroy();
				this.messagePoper = null;
			}
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		redirectLoginPage: function(logOut, Reload) {
			if (logOut == "X" && Reload != "X") {
				MessageBox.alert("Logout Successful");
			} else if (Reload != "X") {
				MessageBox.alert("Page expired, please login again");
			}
			window.top.location.href = "/";
		},
		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				this.getRouter().navTo("master", {}, true);
			}
		},
		getEventBus: function() {
			return sap.ui.getCore().getEventBus();
		},
		getViewModel: function() {
			return new JSONModel({
				busy: false,
				delay: 0,
				mode: "view",
				oldRec: "false",
				extendedMode: false
			});
		},

		clearData: function() {

		},

		onSwitchStateChange: function(oEvent) {

		},

		onAutoLoginCheck: function(oEvent) {
			// var state = oEvent.getSource().getSelected();
			// var oTestcaseModel = sap.ui.getCore().getModel("tcCreateModel");
			// if (state) {
			// 	oTestcaseModel.setProperty("/autoLogin", "X");
			// } else {
			// 	oTestcaseModel.setProperty("/autoLogin", "");
			// }
		},

		//conversion of server date to format "DD-MM-YYYY"
		onDateFormatted: function(oDate){
			var dd = oDate.getDate();
			var mm = oDate.getMonth()+1;
			var yyyy = oDate.getFullYear();
			if(dd<10)
			{
			    dd='0'+dd;
			}
			if(mm<10)
			{
			    mm='0'+mm;
			}
			return dd+'.'+mm+'.'+yyyy;
		},
		
		copyTextToClipboard: function (text) {
			if (!navigator.clipboard) {
				fallbackCopyTextToClipboard(text);
				return;
			}
			navigator.clipboard.writeText(text).then(function() {
				console.log('Async: Copying to clipboard was successful!');
			}, function(err) {
				console.error('Async: Could not copy text: ', err);
			});
		},

		fallbackCopyTextToClipboard: function (text) {
			var textArea = document.createElement("textarea");
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			try {
				var successful = document.execCommand('copy');
				var msg = successful ? 'successful' : 'unsuccessful';
				console.log('Fallback: Copying text command was ' + msg);
			} catch (err) {
				console.error('Fallback: Oops, unable to copy', err);
			}

			document.body.removeChild(textArea);
		},

		onSystemHelp: function(oEvent) {
			// oSystemField = oEvent.getSource();
			// if (!this.systemHelpDialog) {
			// 	this.systemHelpDialog = sap.ui.xmlfragment(
			// 		"victoria.fragment.SystemValueHelp",
			// 		this
			// 	);
			// }
			// this.getView().addDependent(this.systemHelpDialog);
			// this.systemHelpDialog.open();
			// this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/DefaultSDC_TargetSet", "GET", {}).then(function(oData) {
			// 		var oModel = new JSONModel();
			// 		oModel.setData(oData);
			// 		sap.ui.getCore().byId("systemDialog").setModel(oModel, "systemModel");
			// 	})
			// 	.catch(function(oError) {
			// 		jQuery.sap.log.error("Could not obtain data");
			// 	});
		}

	});
});
