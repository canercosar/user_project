sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    'sap/ui/export/library',
	'sap/ui/export/Spreadsheet'
], function (BaseController, JSONModel, formatter, Filter, FilterOperator,MessageBox, exportLibrary, Spreadsheet) {
    "use strict";
    var EdmType = exportLibrary.EdmType;
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


        onDeleteTableRow: function(oEvent){

           const oRow = oEvent.mParameters.listItem.mAggregations.cells[0].mProperties.title;
            const oModel = oRow;
			const oKey = this.getModel().createKey("/UserInformationSet", {
				Username: oModel
			});

			this.onDelete(oKey, this.getModel())
				.then(() => {})
				.catch(() => {})
				.finally(() => {
                    this.onRefresh();
                });
        },

        onAddUser: function () {
            const oModel = this.getModel("model");
            const aUsers = oModel.getProperty("/Users");
        
            aUsers.push({
                Username: "",
                Name: "",
                Surname: "",
                Birthdate: null,
                Mail: "@gmail.com"
            });
        
            oModel.setProperty("/Users", aUsers);
        },
        
        onCreateMultiUser: function () {
            const aUserInformations = this.getModel("model").getProperty("/Users");
            const oUserInformartionData = {
                Username: "",
                UserInformationItems: aUserInformations
            };
        
            this.onCreate("/UserInformationSet", oUserInformartionData, this.getModel())
                .then((oResponse) => {
                    MessageToast.show(sap.ui.getCore().getMessageManager().getMessageModel().getData()[0].message);
                })
                .catch((oError) => {
        
                })
                .finally(() => {
                });
        },

        onCreateUser: function(){
			const oUserInformation = this.getModel("model").getProperty("/");
			let oData = {};

            oData.Username = oUserInformation.Username
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

        onGenerateUsername: function () {
            const oModel = this.getModel("model");
            const sName = oModel.getProperty("/Name");
            const sSurname = oModel.getProperty("/Surname");
            let sUsername = "";

            if (sName !== "" && sSurname !== "") {
                sUsername = sName.charAt(0).toLocaleUpperCase() + sSurname.toLocaleUpperCase();
            }

            oModel.setProperty("/Username", sUsername);
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
        onShowMultiDialog: function(){

            this.oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ntt.cc.userproject.fragment.MultiUser", this);
			this.getView().addDependent(this.oDialog);
			this.oDialog.open();
        },

        createColumnConfig: function () {
            let aCols = [];

            aCols.push({
                label: 'Username',
                property: 'Username'
            });

            aCols.push({
                label: 'Name',
                property: 'Name'
            });

            aCols.push({
                label: 'Surname',
                property: 'Surname'
            });

            aCols.push({
                label: 'Birthdate',
                property: 'Birthdate',
                type:EdmType.Date,
            });


            aCols.push({
                label: 'Mail',
                property: 'Mail'
            });

            return aCols;
        },


        onExport: function (){

            let aCols, oSettings, oSheet;
            let aData=[];
            const aContexts = this.byId("table").getBinding("items").getContexts();
            aContexts.forEach(oContext => {
                aData.push(this.getModel().getProperty(oContext.getPath() + "/"));
            });
            aCols = this.createColumnConfig();
            oSettings = {
                workbook: { columns: aCols},
                dataSource: aData,
                fileName: 'Table export.xlsx',
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(() => { })
                .finally(oSheet.destroy);

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