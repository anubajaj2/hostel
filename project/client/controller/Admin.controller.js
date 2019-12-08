sap.ui.define([
	"victoria/controller/BaseController",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"victoria/models/formatter",
	"sap/ui/model/json/JSONModel"
], function(BaseController, MessageBox, Utilities, History, MessageToast, formatter, JSONModel) {
	"use strict";

	return BaseController.extend("victoria.controller.Admin", {

		handleRouteMatched: function(oEvent) {
			var oParams = oEvent.getParameters();
			this.currentRouteName = oParams.name;
			var sContext;
			if (oParams.arguments.midContext) {
				sContext = oParams.arguments.midContext;
			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function(oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype") {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);
				}
			}
			var sContextModelProperty = "/midContext";

			if (sContext) {
				var oPath = {
					path: "/" + sContext,
					parameters: {}
				};
				this.getView().bindObject(oPath);
				this.oFclModel.setProperty(sContextModelProperty, sContext);
			}

			var pageName = this.oView.sViewName.split('.');
			pageName = pageName[pageName.length - 1];

			if (pageName === this.currentRouteName) {
				this.oView.getModel('fclButton').setProperty('/visible', true);
			} else {
				this.oView.getModel('fclButton').setProperty('/visible', false);
			}

			if (oEvent.mParameters.arguments.layout && oEvent.mParameters.arguments.layout.includes('FullScreen')) {
				this.oFclModel.setProperty('/expandIcon/img', 'sap-icon://exit-full-screen');
				this.oFclModel.setProperty('/expandIcon/tooltip', 'Exit Full Screen Mode');
			} else {
				this.oFclModel.setProperty('/expandIcon/img', 'sap-icon://full-screen');
				this.oFclModel.setProperty('/expandIcon/tooltip', 'Enter Full Screen Mode');
			}

		},

		_onExpandButtonPress: function() {
			var endColumn = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().columnsVisibility.endColumn;
			var isFullScreen = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().isFullScreen;
			var nextLayout;
			var actionsButtonsInfo = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().actionButtonsInfo;
			if (endColumn && isFullScreen) {
				nextLayout = actionsButtonsInfo.endColumn.exitFullScreen;
				nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(2).layout;
			}
			if (!endColumn && isFullScreen) {
				nextLayout = actionsButtonsInfo.midColumn.exitFullScreen;
				nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(1).layout;
			}
			if (endColumn && !isFullScreen) {
				nextLayout = actionsButtonsInfo.endColumn.fullScreen;
				nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(3).layout;
			}
			if (!endColumn && !isFullScreen) {
				nextLayout = actionsButtonsInfo.midColumn.fullScreen;
				nextLayout = nextLayout ? nextLayout : 'MidColumnFullScreen'
			}
			var pageName = this.oView.sViewName.split('.');
			pageName = pageName[pageName.length - 1];
			this.oRouter.navTo(pageName, {
				layout: nextLayout
			});

		},

		_onCloseButtonPress: function() {
			var endColumn = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().columnsVisibility.endColumn;
			var nextPage;
			var nextLevel = 0;

			var actionsButtonsInfo = this.getOwnerComponent().getSemanticHelper().getCurrentUIState().actionButtonsInfo;

			var nextLayout = actionsButtonsInfo.midColumn.closeColumn;
			nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(0).layout;

			if (endColumn) {
				nextLevel = 1;
				nextLayout = actionsButtonsInfo.endColumn.closeColumn;
				nextLayout = nextLayout ? nextLayout : this.getOwnerComponent().getSemanticHelper().getNextUIState(1).layout;
			}

			var pageName = this.oView.sViewName.split('.');
			pageName = pageName[pageName.length - 1];
			var routePattern = this.oRouter.getRoute(pageName).getPattern().split('/');
			var contextFilter = new RegExp('^:.+:$');
			var pagePattern = routePattern.filter(function(pattern) {
				var contextPattern = pattern.match(contextFilter);
				return contextPattern === null || contextPattern === undefined;
			});

			var nextPage = pagePattern[nextLevel];
			this.oRouter.navTo(nextPage, {
				layout: nextLayout
			});

		},

		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
			this.oFclModel = this.getOwnerComponent().getModel("FclRouter");
			this.oFclModel.setProperty('/targetAggregation', 'midColumnPages');
			this.oFclModel.setProperty('/expandIcon', {});
			this.oView.setModel(new sap.ui.model.json.JSONModel({}), 'fclButton');

			// Users Data
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.attachRoutePatternMatched(this.herculis, this);
			var that = this;
			// var currentUser = this.getModel("local").getProperty("/CurrentUser");
			// var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			// loginUser = "Hey " + loginUser;
			// this.getView().byId("idUser").setText(loginUser);
			// debugger;


			that.getView().setBusy(true);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/AppUsers", "GET", null, null, this)
				.then(function(oData) {
					that.getView().setBusy(false);
				}).catch(function(oError) {
					var oPopover = that.getErrorMessage(oError);
				});
		},

		onExit: function() {
			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			var aControls = [{
				"controlId": "sap_Table_Page_0-content-build_simple_Table-1553408517536-zq66un8fje19ksalqjy2ug6q10_S10",
				"groups": ["items"]
			}];
			for (var i = 0; i < aControls.length; i++) {
				var oControl = this.getView().byId(aControls[i].controlId);
				if (oControl) {
					for (var j = 0; j < aControls[i].groups.length; j++) {
						var sAggregationName = aControls[i].groups[j];
						var oBindingInfo = oControl.getBindingInfo(sAggregationName);
						if (oBindingInfo) {
							var oTemplate = oBindingInfo.template;
							oTemplate.destroy();
						}
					}
				}
			}

		},

		onPressSaveSecure: function() {
			var that = this;
			that.getView().byId("viewSecureTable").setBusy(true);
			var oTable = this.getView().getModel("local");
			var secureListInfo = oTable.getData().appUsers;
			this.getView().getModel().setDeferredBatchGroups(["SaveSecureUserBatch"]);
			var _filterSecure = function(oViewSecureList, oEditSecureList) {
				return oViewSecureList.CredId === oEditSecureList.CredId;
			};
			if (secureListInfo.length > 0) {
				var aSecureInfo;
				for (var i = 0; i < secureListInfo.length; i++) {
					delete secureListInfo[i].CreateMode;
					if (secureListInfo[i].SecureKey === "*******") {
						secureListInfo[i].SecureKey = "";
					}
					secureListInfo[i].SecureKey = btoa(secureListInfo[i].SecureKey);
					aSecureInfo = this.globalData.filter(_filterSecure.bind(null, secureListInfo[i]));
					if (aSecureInfo.length === 1 && (JSON.stringify(aSecureInfo[0]) !== JSON.stringify(secureListInfo[i]))) {
						// Update
						this.getView().getModel().update("/SecureSet('" + secureListInfo[i].CredId + "')", secureListInfo[i], {
							groupId: "SaveSecureUserBatch"
						});
					} else if (secureListInfo[i].CredId === undefined) {
						//Create
						this.getView().getModel().create("/SecureSet", secureListInfo[i], {
							groupId: "SaveSecureUserBatch"
						});
					}
				}
				for (var j = 0; j < this.globalData.length; j++) {
					aSecureInfo = secureListInfo.filter(_filterSecure.bind(null, this.globalData[j]));
					if (aSecureInfo.length === 0) {
						//Delete
						this.getView().getModel().remove("/SecureSet('" + this.globalData[j].CredId + "')", {
							groupId: "SaveSecureUserBatch"
						});
					}
				}

			} else {
				for (var k = 0; k < this.globalData.length; k++) {
					//Delete
					this.getView().getModel().remove("/SecureSet('" + this.globalData[k].CredId + "')", {
						groupId: "SaveSecureUserBatch"
					});
				}
			}

			if (JSON.stringify(secureListInfo) === JSON.stringify(this.globalData)) {
				MessageToast.show(that.resourceBundle.getText("MSG_GET_SECURE_SAVE_ERROR"));
				that.getView().byId("viewSecureTable").setBusy(false);
				return;
			}

			this.getView().getModel().submitChanges({
				batchGroupId: "SaveSecureUserBatch",
				success: function(oData, oResponse) {
					var responses = oData.__batchResponses;
					// Check response of each call inside batch based on HTTP status
					that.getView().byId("viewSecureTable").setBusy(false);
					for (var p = 0; p < responses.length; p++) {
						if (oData.__batchResponses[p].response && oData.__batchResponses[p].response.statusCode > 399 && oData.__batchResponses[p].response
							.statusCode < 600) {
							MessageBox.error(JSON.parse(oData.__batchResponses[p].response.body).error.message.value, {
								title: that.resourceBundle.getText("TIT_MESSAGE_BOX_ERR"),
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});

							return;
						}
					}
					that._getSecureDetails();
					MessageToast.show(that.resourceBundle.getText("MSG_GET_SECURE_SAVE_SUCCESS"));
				},
				error: function(oError) {
					that.getView().byId("viewSecureTable").setBusy(false);
					MessageBox.error(that.getErrorMsg(oError), {
						title: that.resourceBundle.getText("TIT_MESSAGE_BOX_ERR"),
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
				}
			});
		},
		onPressDeleteSecureRow: function() {
			var that = this;
			var aSelectedRows = this.getView().byId("viewSecureTable").getSelectedContexts();
			var oSecureModel = this.getView().getModel("local");
			var aUserArray = oSecureModel.getData().appUsers;
			if (aSelectedRows.length < 1) {
				MessageBox.error("Select atlease one row", {
					title: "Selection Error",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
				return;
			}
			sap.m.MessageBox.confirm("Confirm deletion?", {
				title: "Confirmation",
				onClose: function(oAction) {
					if (oAction === sap.m.MessageBox.Action.OK) {
						var items = that.getView().byId('viewSecureTable').getSelectedContexts();
						for (var i = 0; i < items["length"]; i++) {
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), items[i].sPath, "DELETE", {}, {}, that)
								.then(function(oData) {
									sap.m.MessageToast.show("Deleted succesfully");
								}).catch(function(oError) {
									that.getView().setBusy(false);
									that.oPopover = that.getErrorMessage(oError);
									that.getView().setBusy(false);
								});
							// var propertyData = aSelectedRows[iSelectedRow].getObject();
							// aUserArray.splice(aUserArray.indexOf(propertyData), 1);
							// that._checkForSecureChangesButton();
						}
						oSecureModel.updateBindings();
						that.getView().byId("viewSecureTable").removeSelections();
					}
				}
			});

		},
		onPressHandleSecureOkPopup: function(oEvent) {
			var that = this;
			var bindingPath = oEvent.getSource().getParent().getContent()[0].getBindingContext();
			var Payload = {
				"Role": sap.ui.getCore().byId("Secure_Dialog--idRole").getValue(),
				"UserName": sap.ui.getCore().byId("Secure_Dialog--idUser").getValue(),
				"EmailId": sap.ui.getCore().byId("Secure_Dialog--idEmail").getValue(),
				"TechnicalId": sap.ui.getCore().byId("Secure_Dialog--idTech").getValue()
			};

			if (bindingPath) {
				var sPath = oEvent.getSource().getBindingContext().sPath;

				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath, "PUT", {},
						Payload, this)
					.then(function(oData) {
						sap.m.MessageToast.show("Server Updated successfully");
						that.getView().setBusy(false);
						that._oDialogSecure.close();
						that._oDialogSecure.unbindElement();
					}).catch(function(oError) {
						that.getView().setBusy(false);
						that.oPopover = that.getErrorMessage(oError);
						that.getView().setBusy(false);
					});
			} else {

				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), '/AppUsers', "POST", {},
						Payload, this)
					.then(function(oData) {
						sap.m.MessageToast.show("Server Updated successfully");
						that.getView().setBusy(false);
						that._oDialogSecure.close();

					}).catch(function(oError) {
						that.getView().setBusy(false);
						that.oPopover = that.getErrorMessage(oError);
						that.getView().setBusy(false);
					});
			}
		},
		_removeCreateMode: function(secureListInfo) {
			for (var i = 0; i < secureListInfo.length; i++) {
				delete secureListInfo[i].CreateMode;
			}
		},
		_checkForSecureChangesButton: function() {
			var oTable = this.getView().getModel("local");
			var secureListInfo = oTable.getData().appUsers;

			this._removeCreateMode(secureListInfo);
		},
		onPressHandleSecureCancelPopup: function() {
			this._oDialogSecure.close();
			this._oDialogSecure.destroy();
			this._oDialogSecure = null;
		},
		onPressOpenAddSecureDialog: function(createMode) {
      var that = this;
			if (!this._oDialogSecure) {
				// debugger;
				this._oDialogSecure = sap.ui.xmlfragment("Secure_Dialog", "victoria.fragments.SecureDialog", this);
				// this._oDialogSecure.setModel(new JSONModel({}), "secureFormModel");
				// this._oDialogSecure.getModel("secureFormModel").setProperty("/CreateMode", true);
				this.getView().addDependent(this._oDialogSecure);
				if (createMode == false) {
					this._oDialogSecure.bindElement({
						path: that.aBindingContext,
						events: {
							change: function(oEvent) {},
							dataRequested: function() {
								that.getView().setBusy(true);
							},
							dataReceived: function(oData) {
								that.getView().setBusy(false);
								that._oDialogSecure.open();
							}
						}
					});
				} else {
					this._oDialogSecure.unbindElement(this.aBindingContext);
					that._oDialogSecure.open();
				}
			} else {
				this._oDialogSecure.bindElement({
					path: that.aBindingContext,
					events: {
						change: function(oEvent) {},
						dataRequested: function() {
							that.getView().setBusy(true);
						},
						dataReceived: function(oData) {
							that.getView().setBusy(false);
							that._oDialogSecure.open();
						}
					}
				});
				that._oDialogSecure.open();
			}
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogSecure);
		},
		onStartChange: function(oEvent) {
			var dateString = oEvent.getSource().getValue();
			var from = dateString.split(".");
			var dateObject = new Date(from[2], from[1] - 1, from[0]);
			var endDate = this.formatter.getIncrementDate(dateObject, 2.5);
			this.getView().getModel("local").setProperty("/newBatch/endDate", endDate);
			var blogDate = this.formatter.getIncrementDate(dateObject, 8);
			this.getView().getModel("local").setProperty("/newBatch/blogDate", blogDate);
			console.log(endDate);
			console.log(blogDate);
		},
		editSecureField: function(oEvent) {
			this.aBindingContext = oEvent.getSource().getBindingContext().sPath;
			this.onPressOpenAddSecureDialog(false);
			// this.edit = 'X';
			// this._oDialogSecure.getModel("secureFormModel").setData(aBindingContext);
			// this.rowSelected = aBindingContext;
			// this._oDialogSecure.getModel("secureFormModel").setProperty("/CreateMode", false);

		},
		_getSecureDetails: function() {
			var that = this;
			//that.getView().byId("viewSecureTable").setBusy(true);
			//TODO: Set data to local model
		}
		// herculis: function(oEvent) {
		//
		// 	this.getView().getModel("local").setProperty("/newBatch/startDate", this.formatter.getFormattedDate(0));
		// 	this.getView().getModel("local").setProperty("/newBatch/demoDate", this.formatter.getFormattedDate(0));
		// 	this.getView().getModel("local").setProperty("/newBatch/endDate", this.formatter.getFormattedDate(2.5));
		// 	this.getView().getModel("local").setProperty("/newBatch/blogDate", this.formatter.getFormattedDate(8));
		// 	///TODO: Fill the Customer Set and Course Set from REST API
		// 	this._getSecureDetails();
		// }

	});
}, /* bExport= */ true);
