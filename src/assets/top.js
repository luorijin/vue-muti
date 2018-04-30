!function(e){var t=e.document,n=t.documentElement,i="orientationchange"in e?"orientationchange":"resize",a=function e(){var t=n.getBoundingClientRect().width;return n.style.fontSize=5*Math.max(Math.min(t/750*20,11.2),8.55)+"px",e}();n.setAttribute("data-dpr",e.navigator.appVersion.match(/iphone/gi)?e.devicePixelRatio:1),/iP(hone|od|ad)/.test(e.navigator.userAgent)&&(t.documentElement.classList.add("ios"),parseInt(e.navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/)[1],10)>=8&&t.documentElement.classList.add("hairline")),t.addEventListener&&(e.addEventListener(i,a,!1),t.addEventListener("DOMContentLoaded",a,!1))}(window);
 window.onload = function(){
	    	var wH = window.innerHeight > 0 ? window.innerHeight : document.documentElement.clientHeight;
  			document.body.style.height= wH + 'px';
        document.documentElement.style.height=wH + 'px';
    	}
window.addEventListener('resize', function () {
    if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
      window.setTimeout(function () {
        document.activeElement.scrollIntoViewIfNeeded();
      }, 0);
    }
  })
window.extend = function (target, source) {
    for (var p in source) {
        if (source.hasOwnProperty(p)) {
            target[p] = source[p];
        }
    }
    return target;
};
