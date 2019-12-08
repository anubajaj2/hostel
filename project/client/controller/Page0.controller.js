sap.ui.define([
	"victoria/Controller/BaseController",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("victoria.controller.Page0", {
		handleRouteMatched: function(oEvent) {
			var oParams = oEvent.getParameters();
			this.currentRouteName = oParams.name;
			var sContext;
			if (oParams.arguments.beginContext) {
				sContext = oParams.arguments.beginContext;
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
			var sContextModelProperty = "/beginContext";

			if (sContext) {
				var oPath = {
					path: "/" + sContext,
					parameters: {}
				};
				this.getView().bindObject(oPath);
				this.oFclModel.setProperty(sContextModelProperty, sContext);
			}

			this.oView.getModel('fclButton').setProperty('/visible', false);

			if (oEvent.mParameters.arguments.layout && oEvent.mParameters.arguments.layout.includes('FullScreen')) {
				this.oFclModel.setProperty('/expandIcon/img', 'sap-icon://exit-full-screen');
				this.oFclModel.setProperty('/expandIcon/tooltip', 'Exit Full Screen Mode');
			} else {
				this.oFclModel.setProperty('/expandIcon/img', 'sap-icon://full-screen');
				this.oFclModel.setProperty('/expandIcon/tooltip', 'Enter Full Screen Mode');
			}

		},
		_onPageNavButtonPress: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("Page1", oBindingContext, fnResolve, "", 0);
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

		_onButtonPress: function(oEvent) {

			var loginPayload = {
				"email": this.getView().byId("userid").getValue(),
				"password": this.getView().byId("pwd").getValue(),
			};

			var that = this;

			if (!loginPayload.email || !loginPayload.password) {
				sap.m.MessageBox.error("User/password cannot be empty");
				return;
			}

			$.post('/api/Users/login', loginPayload)
				.done(function(data, status) {
					// debugger;
					that._oLoginEvent = oEvent;
					that.getView().getModel("local").setProperty("/Authorization", data.id);
					that.getView().getModel().setHeaders({
						"Authorization": data.id
					});
					that.secureToken = data.id;
					that.getView().getModel("local").setProperty("/CurrentUser", data.userId);
					that.getView().getModel().setUseBatch(false);
					var that2 = that;

					var aFilter = [new sap.ui.model.Filter("TechnicalId",
						sap.ui.model.FilterOperator.EQ, data.userId)];
					var oParameters = {
						filters: aFilter
					};
					var found = false;
					var AppUsers = [];

					that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
							"/AppUsers", "GET", {}, {}, that)
						.then(function(oData) {
							if (oData.results.length != 0) {
								that2.getView().getModel("local").setProperty("/AppUsersData", oData.results);
								for (var i = 0; i < oData.results.length; i++) {
									AppUsers[oData.results[i].TechnicalId] = oData.results[i];
									if (oData.results[i].TechnicalId === data.userId) {
										that2.getView().getModel("local").setProperty("/Role", oData.results[i].Role);
										that2.getView().getModel("local").setProperty("/UserName", oData.results[i].UserName);
										if(oData.results[i].Role === "Admin"){
                      that2.getView().getModel("appView").setProperty("/admin", true);
										}
										found = true;
									} else {
										that2.getView().getModel("local").setProperty("/Authorization", "");
									}
								}
								if (found === true) {
									that2.getView().getModel("local").setProperty("/AppUsers", AppUsers);
									sap.ui.getCore().byId("idPage0Logout").setEnabled(true);
									var currentUser = that2.getModel("local").getProperty("/CurrentUser");
									if (currentUser) {
										var sLoginUser = that2.getModel("local").oData.AppUsers[currentUser].UserName;
									}
									sLoginUser = "Hey " + sLoginUser;
									sap.ui.getCore().byId("idPage0User").setText(sLoginUser);

									sap.ui.getCore().byId("idPage0Logout").attachEvent("press", that2.logOutApp.bind(that2))


									var oBindingContext = null; //that2._oLoginEvent.getSource().getBindingContext();
									return new Promise(function (fnResolve) {
                    if (that2.getView().getModel("local").getProperty("/Role") === "Admin"){
											that2.doNavigate("Page1", oBindingContext, fnResolve, "", 0);
										} else{
												that2.doNavigate("Page2Dup", oBindingContext, fnResolve, "", 0);
										}
									}.bind(this)).catch(function (err) {
										if (err !== undefined) {
											MessageBox.error(err.message);
										}
									});
								} else {
									sap.m.MessageBox.error("The user is not authorized, Contact Anubhav");
								}
							}
						}).catch(function(oError) {
							console.log("Error")
						});

				})
				.fail(function(xhr, status, error) {
					sap.m.MessageBox.error("Login Failed, Please enter correct credentials");
				});


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
			this.oFclModel.setProperty('/targetAggregation', 'beginColumnPages');
			this.oFclModel.setProperty('/expandIcon', {});
			this.oView.setModel(new sap.ui.model.json.JSONModel({}), 'fclButton');

		}
	});
}, /* bExport= */ true);
