sap.ui.define([
	"victoria/controller/BaseController",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("victoria.controller.Page3", {
		handleRouteMatched: function(oEvent) {
			var oParams = oEvent.getParameters();
			this.currentRouteName = oParams.name;
			var sContext;
			if (oParams.arguments.endContext) {
				sContext = oParams.arguments.endContext;
			} else if	(oParams.arguments.midContext){
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
			var sContextModelProperty = "/endContext";

			if (sContext) {
				var oPath = {
					path: "/" + sContext,
					parameters: {}
				};
				this.getView().bindObject(oPath);
				this.oFclModel.setProperty(sContextModelProperty, sContext);
			}

			this.oView.getModel('fclButton').setProperty('/visible', true);

			if (oEvent.mParameters.arguments.layout && oEvent.mParameters.arguments.layout.includes('FullScreen')) {
				this.oFclModel.setProperty('/expandIcon/img', 'sap-icon://exit-full-screen');
				this.oFclModel.setProperty('/expandIcon/tooltip', 'Exit Full Screen Mode');
			} else {
				this.oFclModel.setProperty('/expandIcon/img', 'sap-icon://full-screen');
				this.oFclModel.setProperty('/expandIcon/tooltip', 'Enter Full Screen Mode');
			}

		},

		onChange: function(oEvent) {
			debugger;
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("Page3", "onChange", oEvent);
		},

		_onTableItemRoomsPress: function(oEvent) {
			// debugger;
			var oContext = new sap.ui.model.Context(this.getView().getModel(), oEvent.getSource().getBindingContext().getPath());
			// this.getView().byId("idPage3Carousel").setBindingContext(oContext, "Photos");
			// this.getView().byId("idPage3Carousel").bindElement(oEvent.getSource().getBindingContext().getPath() + "/Photos ");
			// var oPage = new sap.m.Page({
			// 	height: "auto",
			// 	width: "auto",
			// 	densityAware: "false",
			// 	content: [new sap.m.Image({
			// 		src: "{Photos}"
			// 	})]
			// })
			var oImage = new sap.m.Image({
				src: "{Photos}"
			})
			this.getView().byId("idPage3Carousel").bindAggregation("pages", oEvent.getSource().getBindingContext().getPath() + "/Photos", oImage);

		},

		onPage3Clear: function(oEvent) {
			var oModel = this.getView().getModel("local");
			oModel.setProperty("/newRoom/RoomType", "");
			oModel.setProperty("/newRoom/AcNonAc", "");
			oModel.setProperty("/newRoom/Occupency", "");
			oModel.setProperty("/newRoom/PricePerPerson", "");
			oModel.setProperty("/newRoom/RoomsAvailable", "");
			oModel.setProperty("/newRoom/Type", "");
			this.getView().byId("idPage3ImgUploader").clear();
			var oView = this.getView();
			oView.byId("idPage3RoomType").clearSelection();
			oView.byId("idPage3AcNonAc").clearSelection();
			oView.byId("idPage3Occupency").clearSelection();
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},

		onPage3Save: function(oEvent) {

			var oView = this.getView();
			oView.byId("idPage3Type").fireChange();
			oView.byId("idPage3AcNonAc").fireChange();
			oView.byId("idPage3RoomType").fireChange();

			if (sap.ui.getCore().getModel("oMsgModel").getData().length > 0) {
				return;
			}

			var oRoomData = this.getView().getModel("local").getProperty("/newRoom");

			var oPayload = {
				ParentId: oEvent.getSource().getBindingContext().getProperty("id"), //oRoomData.HostelName,
				RoomType: this.getView().byId("idPage3RoomType").getSelectedKey(),
				AcNonAc: this.getView().byId("idPage3AcNonAc").getSelectedKey(),
				Occupency: this.getView().byId("idPage3Occupency").getSelectedKey(),
				PricePerPerson: oRoomData.PricePerPerson,
				RoomsAvailable: oRoomData.RoomsAvailable,
				Type: this.getView().byId("idPage3Type").getSelectedKey(),
				CreatedOn: oRoomData.CreatedOn,
				CreatedBy: oRoomData.CreatedBy,
				ChangedOn: oRoomData.ChangedOn,
				ChangedBy: oRoomData.ChangedBy,
			}

			var that = this;
			that.getView().setBusy(true);

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Rooms", "POST", {},
					oPayload, this)
				.then(function(oData) {
					// debugger;
					// that.getView().setBusy(false);
					// sap.m.MessageToast.show("New Room Created Successfully!");
					// that.destroyMessagePopover();
					// that.getView().byId("idPage3Btnclear").firePress();
					var oPhotoPayLoad = {
						"RoomId": oData.id,
						"Photos": ""
					};
					var aPayload = [];
					for (var i = 0; i < that.aFiles.length; i++) {
						var oPayload = jQuery.extend(true, {}, oPhotoPayLoad);
						oPayload.Photos = that.aFiles[i].imgContent;
						aPayload.push(oPayload);
					}

					let aRoomPromises = [];
					aPayload.forEach((oPayload) => {
						aRoomPromises.push(that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Photos", "POST", {}, oPayload, that))
					})

					Promise.all(aRoomPromises)
						.then((oData) => {
							that.getView().setBusy(false);
							sap.m.MessageToast.show("New Room Created Successfully!");
							that.destroyMessagePopover();
							that.getView().byId("idPage3BtnClear").firePress();
						}).catch((oError) => {
							that.getView().setBusy(false);
							var oPopover = that.getErrorMessage(oError);
						})

					// that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Photos", "POST", {},
					// 		aPayload, that)
					// 	.then(function(oData) {
					// 		// debugger;
					// 		that.getView().setBusy(false);
					// 		sap.m.MessageToast.show("New Room Created Successfully!");
					// 		that.destroyMessagePopover();
					// 		that.getView().byId("idPage3BtnClear").firePress();
					// 	}).catch(function(oError) {
					// 		that.getView().setBusy(false);
					// 		var oPopover = that.getErrorMessage(oError);
					// 	});
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},

		handleUploadPress: function(oEvent) {

			var oFileUploader = this.getView().byId("idPage3ImgUploader");
			var domRef = oFileUploader.getFocusDomRef();
			var that = this;
			that.aFiles = [];
			var aFiles = Object.values(domRef.files);

			function setupReader(file) {
				// var oFile = {};
				// oFile.fileName = file.name;
				// oFile.fileType = file.type;

				var reader = new FileReader();
				reader.onload = function(e) {
					var oFile = {};
					oFile.imgContent = e.currentTarget.result;
					that.aFiles.push(oFile);
				}
				reader.readAsDataURL(file);
			}

			for (var i = 0; i < aFiles.length; i++) {
				setupReader(aFiles[i]);
			}

			var oPayload = {
				"RoomId": "",
				"Photos": " "
			}

			var that = this;
			that.getView().setBusy(true);

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Photos", "POST", {},
					oPayload, this)
				.then(function(oData) {
					debugger;
					that.getView().setBusy(false);
					sap.m.MessageToast.show("New Room Created Successfully!");
					that.destroyMessagePopover();
					// that.getView().byId("idPage3Btnclear").firePress();
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});
		},

		fnOnUpLoadFile: function(oEvent) {
			var oFileUploader = this.getView().byId("idPage3ImgUploader");
			var domRef = oFileUploader.getFocusDomRef();
			var that = this;
			that.aFiles = [];
			var aFiles = Object.values(domRef.files);
			for (var i = 0; i < aFiles.length; i++) {
				var file = aFiles[i];
				if (file) {
					var that = this
					var oFile = {};
					oFile.fileName = file.name;
					oFile.fileType = file.type;

					// this.fileName = file.name;
					// this.fileType = file.type;
					var reader = new FileReader();
					reader.onload = function(e) {

						//get an access to the content of the file
						oFile.imgContent = e.currentTarget.result; //e.currentTarget.result.replace("data:image/jpeg;base64,", "");
						//that.encoded = btoa(encodeURI(that.imgContent));
						aFiles.push(oFile);
					}.bind(this);
					//File Reader will start reading the file
					reader.readAsDataURL(file);
				}
			}
		},

		_onFileUploaderUploadComplete: function(oEvent) {

			var oFileUploader = this.getView().byId("idPage3ImgUploader");
			var domRef = oFileUploader.getFocusDomRef();
			var that = this;
			that.aFiles = [];
			var aFiles = Object.values(domRef.files);

			function setupReader(file) {
				// var oFile = {};
				// oFile.fileName = file.name;
				// oFile.fileType = file.type;

				var reader = new FileReader();
				reader.onloadend = function(e) {
					console.log("test");
					// var oFile = {};
					// oFile.imgContent = e.currentTarget.result;
					// that.aFiles.push(oFile);
				}
				reader.readAsDataURL(file);
			}

			for (var i = 0; i < domRef.files.length; i++) {
				setupReader(domRef.files[i]);
			}
		},

		onFileUploaderChange: function(oEvent) {

			var oFileUploader = this.getView().byId("idPage3ImgUploader");
			var domRef = oFileUploader.getFocusDomRef();
			var that = this;
			that.aFiles = [];
			var aFiles = Object.values(domRef.files);

			function setupReader(file) {
				// var oFile = {};
				// oFile.fileName = file.name;
				// oFile.fileType = file.type;

				var reader = new FileReader();
				// reader.onload = function(i,e) {
				// 	console.log("test");
				// 	// var oFile = {};
				// 	// oFile.imgContent = e.currentTarget.result;
				// 	// that.aFiles.push(oFile);
				// }
				reader.addEventListener("onload", function(i, e) { //take over the bound i
					// $('#pic' + i + '').attr('src', '' + e.target.result + '');
					console.log(i);
				}.bind(this, i))
				reader.readAsDataURL(file);
			}

			for (var i = 0; i < aFiles.length; i++) {
				var file = aFiles[i];
				var reader = new FileReader();
				reader.addEventListener("load", function(i, e) {
					var oFile = {};
					oFile.imgContent = e.currentTarget.result;
					that.aFiles.push(oFile);
				}.bind(this, i)); //the magic part
				reader.readAsDataURL(file);
			}
		},

		_onFileUploaderTypeMissmatch: function(oEvent) {
			var aFileTypes = oEvent.getSource().getFileType();
			jQuery.each(aFileTypes, function(key, value) {
				aFileTypes[key] = "*." + value;
			});
			var sSupportedFileTypes = aFileTypes.join(", ");
			MessageToast.show("The file type *." + oEvent.getParameter("fileType") +
				" is not supported. Choose one of the following types: " +
				sSupportedFileTypes);

		},

		_onFileUploaderFileSizeExceed: function(oEvent) {
			// Please implement

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

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRouteMatched(this.handleRouteMatched, this);
			this.oFclModel = this.getOwnerComponent().getModel("FclRouter");
			this.oFclModel.setProperty('/targetAggregation', 'endColumnPages');
			this.oFclModel.setProperty('/expandIcon', {});
			this.oView.setModel(new sap.ui.model.json.JSONModel({}), 'fclButton');

		}
	});
}, /* bExport= */ true);
