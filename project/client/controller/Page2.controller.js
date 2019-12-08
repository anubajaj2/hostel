sap.ui.define([
	"victoria/controller/BaseController",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/core/Fragment',
	'victoria/models/formatter'
], function(BaseController, MessageBox, Utilities, History, Filter, FilterOperator, Fragment, Formatter) {
	"use strict";

	return BaseController.extend("victoria.controller.Page2", {
		formatter: Formatter,

		onBeforeRebindTable: function(oEvent) {
			if (this.getView().getModel("local").getProperty("/Role") !== "Admin") {
				var mBindingParams = oEvent.getParameter("bindingParams");
				var aFilters = mBindingParams.filters;
				var oFilCreOn = new Filter("CreatedOn", FilterOperator.GT, new Date().setHours(0, 0, 0, 0));
				var oFilCreBy = new Filter("CreatedBy", FilterOperator.Contains, this.getModel("local").getProperty("/CurrentUser"));

				// var currentUser = this.getModel("local").getProperty("/CurrentUser");
				// if (currentUser) {
				// 	var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
				// }

				mBindingParams.filters.push(oFilCreOn);
				mBindingParams.filters.push(oFilCreBy);
			}
		},

		onChange: function(oEvent) {
			debugger;
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("Page2", "onChange", oEvent);
		},

		handleValueHelpState: function(oEvent) {
			if (oEvent.getSource().getValue().length > 0) {
				var oModel = this.getView().getModel("local"); //new sap.ui.model.json.JSONModel();
				var aLocations = this.getView().getModel("local").oData.Locations;
				var auniqueStates = [];
				$.each(aLocations, function(i, el) {
					if ($.inArray(el.State, auniqueStates) === -1) auniqueStates.push(el.State);
				});

				oModel.setData({
					"States": auniqueStates
				}, true);
				oEvent.getSource().setModel(oModel);
				oEvent.getSource().bindAggregation("suggestionItems", "/States", new sap.ui.core.Item({
					text: "{}"
				}));
			} else {
				this.getView().byId("idPage2InpCity").setEnabled(false);
			}
		},

		onSuggestionItemSelected: function(oEvent) {
			this.getView().byId("idPage2InpCity").setEnabled(true);
		},

		handleValueHelpCities: function(oEvent) {
			if (oEvent.getSource().getValue().length > 0) {
				var oModel = new sap.ui.model.json.JSONModel();
				var aLocations = this.getView().getModel("local").oData.Locations;
				var aCities = [];
				var sState = this.getView().byId("idPage2InpState").getValue()
				aCities = aLocations.filter(function(oLocation) {
					return oLocation.State === sState;
				});

				oModel.setData({
					"Cities": aCities
				});
				oEvent.getSource().setModel(oModel);
				oEvent.getSource().bindAggregation("suggestionItems", "/Cities", new sap.ui.core.Item({
					text: "{City}"
				}));
			}
		},

		onPage2Clear: function(oEvent) {
			var oModel = this.getView().getModel("local");
			oModel.setProperty("/newHostel/HostelName", "");
			oModel.setProperty("/newHostel/Owner", "");
			oModel.setProperty("/newHostel/WardenName", "");
			oModel.setProperty("/newHostel/Category", "");
			oModel.setProperty("/newHostel/Type", "");
			oModel.setProperty("/newHostel/AddressLine1", "");
			oModel.setProperty("/newHostel/AddressLine2", "");
			oModel.setProperty("/newHostel/Landmark", "");
			oModel.setProperty("/newHostel/City", "");
			oModel.setProperty("/newHostel/State", "");
			oModel.setProperty("/newHostel/Pincode", "");
			oModel.setProperty("/newHostel/Mobile1", "");
			oModel.setProperty("/newHostel/Mobile2", "");
			oModel.setProperty("/newHostel/Landline1", "");
			oModel.setProperty("/newHostel/Landline2", "");
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},

		onPage2Save: function(oEvent) {

			var oView = this.getView();
			oView.byId("idPage2HosName").fireChange();
			oView.byId("idPage2Owner").fireChange();
			oView.byId("idPage2Warden").fireChange();
			oView.byId("idPage2Mobile").fireChange();
			oView.byId("idPage2InpCity").fireChange();
			oView.byId("idPage2InpState").fireChange();

			if (sap.ui.getCore().getModel("oMsgModel").getData().length > 0) {
				return;
			}

			var oHosteldata = this.getView().getModel("local").getProperty("/newHostel");

			var oPayload = {
				HostelName: oHosteldata.HostelName,
				Owner: oHosteldata.Owner,
				WardenName: oHosteldata.WardenName,
				Category: this.getView().byId("idPg2Category").getSelectedKey(),
				Type: this.getView().byId("idPg2Type").getSelectedKey(),
				CreatedOn: oHosteldata.CreatedOn,
				CreatedBy: oHosteldata.CreatedBy,
				ChangedOn: oHosteldata.ChangedOn,
				ChangedBy: oHosteldata.ChangedBy,
				AddressLine1: oHosteldata.AddressLine1,
				AddressLine2: oHosteldata.AddressLine2,
				Landmark: oHosteldata.Landmark,
				City: oHosteldata.City,
				State: oHosteldata.State,
				Pincode: oHosteldata.Pincode,
				Mobile1: oHosteldata.Mobile1,
				Mobile2: oHosteldata.Mobile2,
				Landline1: oHosteldata.Landline1,
				Landline2: oHosteldata.Landline2
			}

			var that = this;
			that.getView().setBusy(true);

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Hostels", "POST", {},
					oPayload, this)
				.then(function(oData) {
					debugger;
					that.getView().setBusy(false);
					sap.m.MessageToast.show("New Hostel Created Successfully!");
					that.destroyMessagePopover();
					that.getView().byId("idPage2Btnclear").firePress();
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},

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
		_onTableItemPress: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {
				if (this.getView().getModel("local").getProperty("/Role") === "Admin") {
					this.doNavigate("Page3", oBindingContext, fnResolve, "", 2);
				} else {
					this.doNavigate("Page3Dup", oBindingContext, fnResolve, "", 1);
				}
				// this.doNavigate("Page3", oBindingContext, fnResolve, "", 2);
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation, iNextLevel) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var routePattern = this.oRouter.getRoute(sRouteName).getPattern().split('/');
			var contextFilter = new RegExp('^:.+:$');
			var pagePattern = routePattern.filter(function(pattern) {
				var contextPattern = pattern.match(contextFilter);
				return contextPattern === null || contextPattern === undefined;
			});
			iNextLevel = iNextLevel !== undefined ? iNextLevel : pagePattern ? pagePattern.length - 1 : 0;
			this.oFclModel = this.oFclModel ? this.oFclModel : this.getOwnerComponent().getModel("FclRouter");

			var sEntityNameSet;
			var oNextUIState = this.getOwnerComponent().getSemanticHelper().getNextUIState(iNextLevel);
			var sBeginContext, sMidContext, sEndContext;
			if (iNextLevel === 0) {
				sBeginContext = sPath;
			}

			if (iNextLevel === 1) {
				sBeginContext = this.oFclModel.getProperty("/beginContext");
				sMidContext = sPath;
			}

			if (iNextLevel === 2) {
				sBeginContext = this.oFclModel.getProperty("/beginContext");
				sMidContext = this.oFclModel.getProperty("/midContext");
				sEndContext = sPath;
			}

			var sNextLayout = oNextUIState.layout;

			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
					if (iNextLevel === 0) {
						sBeginContext = sPath;
					} else if (iNextLevel === 1) {
						sMidContext = sPath;
					} else {
						sEndContext = sPath;
					}
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
					sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						beginContext: sBeginContext,
						midContext: sMidContext,
						endContext: sEndContext,
						layout: sNextLayout
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}
						if (iNextLevel === 0) {
							sBeginContext = sPath;
						} else if (iNextLevel === 1) {
							sMidContext = sPath;
						} else {
							sEndContext = sPath;
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName, {
								layout: sNextLayout
							});
						} else {
							this.oRouter.navTo(sRouteName, {
								beginContext: sBeginContext,
								midContext: sMidContext,
								endContext: sEndContext,
								layout: sNextLayout
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName, {
					layout: sNextLayout
				});
			}

			if (typeof fnPromiseResolve === "function") {

				fnPromiseResolve();
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
			if (this.getView().getModel("local").getProperty("/Role") !== "Admin") {
				pageName = pageName + "Dup";
			}
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
			if (this.getView().getModel("local").getProperty("/Role") !== "Admin") {
				pageName = pageName + "Dup";
			}
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
			this.getView().byId("idPage2Form1").bindElement("local>/newHostel");
			this.getView().byId("idPage2Form2").bindElement("local>/newHostel");

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
			this.oFclModel = this.getOwnerComponent().getModel("FclRouter");
			this.oFclModel.setProperty('/targetAggregation', 'midColumnPages');
			this.oFclModel.setProperty('/expandIcon', {});
			this.oView.setModel(new sap.ui.model.json.JSONModel({}), 'fclButton');


			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if (currentUser) {
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			}

		},
		onExit: function() {

			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			var aControls = [{
				"controlId": "sap_Table_Page_0-content-build_simple_Table-1553408517536",
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

		}
	});
}, /* bExport= */ true);
