(function(){
  function render(){if(window.renderAdminEditor)window.renderAdminEditor('services')}
  window.adminServiceHelpers={add:function(){if(!window.adminSiteData)return;window.adminSiteData.services.push({title:'',time:'',image:''});render()},remove:function(i){if(!window.adminSiteData)return;if(!confirm('Remove this service?'))return;window.adminSiteData.services.splice(i,1);render()}};
  window.addService=function(){window.adminServiceHelpers.add()};
})();
