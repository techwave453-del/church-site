(function(){
  window.showAdminMessage=window.showAdminMessage||function(message,error){const notice=document.getElementById('notice');if(!notice)return;notice.textContent=message;notice.className='notice show'+(error?' error':'');window.setTimeout(()=>{notice.className='notice'},4500)};
  window.adminApi=async function(url,options){return fetch(url,{credentials:'include',...(options||{})})};
})();
