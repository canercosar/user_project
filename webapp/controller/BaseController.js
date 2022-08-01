sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library"
], function (Controller, UIComponent, mobileLibrary) {
    "use strict";

    
    var URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("com.ntt.cc.userproject.controller.BaseController", {
        /**
         * 
         * @public
         * @returns {sap.ui.core.routing.Router} 
         */
        getRouter : function () {
            return UIComponent.getRouterFor(this);
        },

        /**
         * 
         * @public
         * @param {string} [sName] 
         * @returns {sap.ui.model.Model} 
         */
        getModel : function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         *
         * @public
         * @param {sap.ui.model.Model} oModel 
         * @param {string} sName 
         * @returns {sap.ui.mvc.View} 
         */
        setModel : function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * 
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} 
         */
        getResourceBundle : function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * 
         * @public
         */

        onDelete: function (sSet, oModel) {
			return new Promise(function (fnSuccess, fnReject) {
				const mParameters = {
					success: fnSuccess,
					error: fnReject
				};
				oModel.remove(sSet, mParameters);
			});
		},


        onCreate: function (sSet, oData, oModel) {
			return new Promise(function (fnSuccess, fnReject) {
				const mParameters = {
					success: fnSuccess,
					error: fnReject
				};
				oModel.create(sSet, oData, mParameters);
			});
		},

        onUpdate: function (sSet, oData, oModel) {
			return new Promise(function (fnSuccess, fnReject) {
				const mParameters = {
					success: fnSuccess,
					error: fnReject
				};
				oModel.update(sSet, oData, mParameters);
			});
		},
        
    });

});