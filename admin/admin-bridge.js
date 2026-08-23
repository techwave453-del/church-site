(function(){
  const ready=()=>{
    if(window.adminSiteData&&window.renderAdminEditor){
      window.addItem=function(key){
        const map={services:window.adminServiceHelpers,links:window.adminHomepageLinkHelpers,membershipClasses:window.adminClassHelpers,gallery:window.adminGalleryHelpers};
        map[key]?.add();
      };
      window.removeItem=function(key,i){
        const map={services:window.adminServiceHelpers,links:window.adminHomepageLinkHelpers,membershipClasses:window.adminClassHelpers,gallery:window.adminGalleryHelpers};
        map[key]?.remove(i);
      };
      if(window.loadSiteContent)window.load=window.loadSiteContent;
      if(window.saveSiteContent)window.save=window.saveSiteContent;
      if(window.loadMedia)window.loadMedia=window.loadMedia;
      if(window.loadAdminComments)window.loadComments=window.loadAdminComments;
      if(window.showAdminMessage)window.msg=window.showAdminMessage;
      return true;
    }
    return false;
  };
  if(ready())return;
  let attempts=0;const timer=setInterval(()=>{if(ready()||++attempts>100)clearInterval(timer)},50);
})();
