(function(){
  const ready=()=>{
    if(window.adminSiteData&&window.renderAdminEditor){
      const helpers={
        services:()=>window.adminServiceHelpers,
        links:()=>window.adminHomepageLinkHelpers,
        membershipClasses:()=>window.adminClassHelpers,
        gallery:()=>window.adminGalleryHelpers
      };
      window.addItem=function(key){const helper=helpers[key]?.();if(helper?.add)helper.add();};
      window.removeItem=function(key,i){const helper=helpers[key]?.();if(helper?.remove)helper.remove(i);};
      if(window.loadSiteContent)window.load=window.loadSiteContent;
      if(window.saveSiteContent)window.save=window.saveSiteContent;
      if(window.loadAdminComments)window.loadComments=window.loadAdminComments;
      if(window.showAdminMessage)window.msg=window.showAdminMessage;
      return true;
    }
    return false;
  };
  if(ready())return;
  let attempts=0;
  const timer=setInterval(()=>{if(ready()||++attempts>100)clearInterval(timer);},50);
})();
