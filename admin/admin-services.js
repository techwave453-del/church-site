(function(){
  window.adminServiceHelpers={add:function(){if(!window.adminSiteData)return;window.adminSiteData.services.push({title:'',time:'',image:''});if(window.renderAdminEditor)window.renderAdminEditor('services')},remove:function(i){if(!window.adminSiteData)return;if(!confirm('Remove this service?'))return;window.adminSiteData.services.splice(i,1);if(window.renderAdminEditor)window.renderAdminEditor('services')}};
})();
