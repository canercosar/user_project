sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator,MessageBox) {
    "use strict";

    return BaseController.extend("com.ntt.cc.userproject.controller.Worklist", {

        formatter: formatter,

        
        onInit : function () {
            let oViewModel;

            this._aTableSearchState = [];

            oViewModel = new JSONModel({
                worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText : this.getResourceBundle().getText("tableNoDataText")
            });
            this.setModel(oViewModel, "worklistView");

        },
        onACDialog: function(){
			this.oDialog.close();
			this.oDialog.destroy();
			this.oDialog = null;

            
		},

        onCreateUser: function(){
			const oUserInformation = this.getModel("model").getProperty("/");
			let oData = {};

            oData.Username = oUserInformation.Name[0] + oUserInformation.Surname
            oData.Name = oUserInformation.Name
            oData.Surname  = oUserInformation.Surname
            oData.Birthdate = oUserInformation.Birthdate
            oData.Mail = oUserInformation.Mail


            MessageBox.confirm(this.getResourceBundle().getText("infoCreateUser"), {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				styleClass: this.getOwnerComponent().getContentDensityClass(),
				onClose: (sAction) => {
					if (sAction === MessageBox.Action.OK) {
						this.onCreate("/UserInformationSet", oData, this.getModel())
							.then((oResponse) => { 
                                                            	
							})
							.catch((oError) => {
                                
                            })
							.finally(() => {
                                this.onRefresh();
                            });
					}
				}
			});
        },

        onDeleteUser: function(){

            const oModel = this.getModel("model").getProperty("/");
			const oKey = this.getModel().createKey("/UserInformationSet", {
				Username: oModel.Username
			});

			this.onDelete(oKey, this.getModel())
				.then(() => {})
				.catch(() => {})
				.finally(() => {
                    this.onRefresh();
                });

        },
        

        onUpdateUser: function () {
			
			const oModel = this.getModel("model").getProperty("/");
			const oKey = this.getModel().createKey("/UserInformationSet", {
				Username: oModel.Username
			});
            let oData = {};

            oData.Username = oModel.Username
            oData.Name = oModel.Name
            oData.Surname  = oModel.Surname
            oData.Birthdate = oModel.Birthdate
            oData.Mail = oModel.Mail

			this.onUpdate(oKey, oData, this.getModel())
				.then((oResponse) => {})
				.catch(() => {})
				.finally(() => {
                    this.onRefresh();
                });
		},


        onShowUpdateDialog: function(){
            this.oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ntt.cc.userproject.fragment.UpdateUser", this);
			this.getView().addDependent(this.oDialog);
			this.oDialog.open();

        },

        onShowDeleteDialog: function() {
            this.oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ntt.cc.userproject.fragment.DeleteUser", this);
			this.getView().addDependent(this.oDialog);
			this.oDialog.open();
        },


        onShowCreateDialog: function() {
            this.oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ntt.cc.userproject.fragment.CreateUser", this);
			this.getView().addDependent(this.oDialog);
			this.oDialog.open();
        },
        
        /**
         * @param {sap.ui.base.Event} oEvent 
         * @public
         */
        
        onUpdateFinished : function (oEvent) {
          
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
        },

        /**
         * @param {sap.ui.base.Event} oEvent 
         * @public
         */
        onPress : function (oEvent) {
            
            this._showObject(oEvent.getSource());
        },

        /**
         * @public
         */
        onNavBack : function() {
        
            history.go(-1);
        },


        onSearch : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                this.onRefresh();
            } else {
                var aTableSearchState = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState = [new Filter("Username", FilterOperator.Contains, sQuery)];
                }
                this._applySearch(aTableSearchState);
            }

        },

        /**
         * @public
         */
        onRefresh : function () {
            var oTable = this.byId("table");
            oTable.getBinding("items").refresh();
        },

        /**
         * @param {sap.m.ObjectListItem} oItem 
         * @private
         */
        _showObject : function (oItem) {
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext().getPath().substring("/UserInformationSet".length)
            });
        },

        /**
         * @param {sap.ui.model.Filter[]} aTableSearchState 
         * @private
         */
        _applySearch: function(aTableSearchState) {
            var oTable = this.byId("table"),
                oViewModel = this.getModel("worklistView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        }

    });
});