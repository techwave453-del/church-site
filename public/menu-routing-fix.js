(function(){
  const routes={
    about:'about',
    events:'upcoming-programs',
    visit:'visit-us',
    media:'media',
    resources:'resources',
    give:'give',
    contact:'contact'
  };
  function handle(event){
    const link=event.target&&event.target.closest?event.target.closest('a[href^="#"]'):null;
    if(!link)return;
    const raw=(link.getAttribute('href')||'').slice(1).toLowerCase();
    const route=routes[raw];
    if(!route)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const target=`#detail/${route}`;
    if(window.location.hash===target){window.dispatchEvent(new HashChangeEvent('hashchange'));}
    else window.location.hash=target;
  }
  document.addEventListener('click',handle,true);
})();