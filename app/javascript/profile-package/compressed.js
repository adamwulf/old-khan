if(!($.browser.msie&&parseInt($.browser.version)<8)){(function(a){a.address=function(){var aL=function(d){a(a.address).trigger(a.extend(a.Event(d),function(){for(var f={},k=a.address.parameterNames(),g=0,i=k.length;g<i;g++){f[k[g]]=a.address.parameter(k[g])}return{value:a.address.value(),path:a.address.path(),pathNames:a.address.pathNames(),parameterNames:k,parameters:f,queryString:a.address.queryString()}}.call(a.address)))},aK=function(f,d,g){a(a.address).bind(f,d,g);return a.address},av=function(){return aw.pushState&&a7.state!==a4},am=function(){return("/"+a5.pathname.replace(new RegExp(a7.state),"")+a5.search+(an()?"#"+an():"")).replace(a8,"/")},an=function(){var d=a5.href.indexOf("#");return d!=-1?au(a5.href.substr(d+1),a2):""},aP=function(){return av()?am():an()},aV=function(){return"javascript"},aU=function(d){d=d.toString();return(a7.strict&&d.substr(0,1)!="/"?"/":"")+d},au=function(f,d){if(a7.crawlable&&d){return(f!=""?"!":"")+f}return f.replace(/^\!/,"")},at=function(f,d){return parseInt(f.css(d),10)},aH=function(f){for(var d,k,g=0,i=f.childNodes.length;g<i;g++){if(f.childNodes[g].src){d=String(f.childNodes[g].src)}if(k=aH(f.childNodes[g])){d=k}}return d},aj=function(){if(!ac){var f=aP(),d=a6!=f;if(ar&&aY<523){if(al!=aw.length){al=aw.length;if(ao[al-1]!==a4){a6=ao[al-1]}ak(a2)}}else{if(d){if(aq&&aY<7){a5.reload()}else{aq&&aY<8&&a7.history&&aN(H,50);a6=f;ak(a2)}}}}},ak=function(d){aL(ay);aL(d?b:aI);aN(az,10)},az=function(){if(a7.tracker!=="null"&&a7.tracker!==null){var f=a.isFunction(a7.tracker)?a7.tracker:a3[a7.tracker],d=(a5.pathname+a5.search+(a.address&&!av()?a.address.value():"")).replace(/\/\//,"/").replace(/^\/$/,"");if(a.isFunction(f)){f(d)}else{if(a.isFunction(a3.urchinTracker)){a3.urchinTracker(d)}else{if(a3.pageTracker!==a4&&a.isFunction(a3.pageTracker._trackPageview)){a3.pageTracker._trackPageview(d)}else{a3._gaq!==a4&&a.isFunction(a3._gaq.push)&&a3._gaq.push(["_trackPageview",d])}}}}},H=function(){var d=aV()+":"+a2+";document.open();document.writeln('<html><head><title>"+a0.title.replace("'","\\'")+"</title><script>var "+aW+' = "'+encodeURIComponent(aP())+(a0.domain!=a5.host?'";document.domain="'+a0.domain:"")+"\";<\/script></head></html>');document.close();";if(aY<7){aZ.src=d}else{aZ.contentWindow.location.replace(d)}},aJ=function(){if(ah&&c!=-1){var f,d=ah.substr(c+1).split("&");for(aR=0;aR<d.length;aR++){f=d[aR].split("=");if(/^(autoUpdate|crawlable|history|strict|wrap)$/.test(f[0])){a7[f[0]]=isNaN(f[1])?/^(true|yes)$/i.test(f[1]):parseInt(f[1],10)!==0}if(/^(state|tracker)$/.test(f[0])){a7[f[0]]=f[1]}}ah=null}a6=aP()},j=function(){if(!aA){aA=a1;aJ();var f=function(){aE.call(this);af.call(this)},d=a("body").ajaxComplete(f);f();if(a7.wrap){a("body > *").wrapAll('<div style="padding:'+(at(d,"marginTop")+at(d,"paddingTop"))+"px "+(at(d,"marginRight")+at(d,"paddingRight"))+"px "+(at(d,"marginBottom")+at(d,"paddingBottom"))+"px "+(at(d,"marginLeft")+at(d,"paddingLeft"))+'px;" />').parent().wrap('<div id="'+aW+'" style="height:100%;overflow:auto;position:relative;'+(ar?window.statusbar.visible&&!/chrome/i.test(q)?"":"resize:both;":"")+'" />');a("html, body").css({height:"100%",margin:0,padding:0,overflow:"hidden"});ar&&a('<style type="text/css" />').appendTo("head").text("#"+aW+"::-webkit-resizer { background-color: #fff; }")}if(aq&&aY<8){f=a0.getElementsByTagName("frameset")[0];aZ=a0.createElement((f?"":"i")+"frame");if(f){f.insertAdjacentElement("beforeEnd",aZ);f[f.cols?"cols":"rows"]+=",0";aZ.noResize=a1;aZ.frameBorder=aZ.frameSpacing=0}else{aZ.style.display="none";aZ.style.width=aZ.style.height=0;aZ.tabIndex=-1;a0.body.insertAdjacentElement("afterBegin",aZ)}aN(function(){a(aZ).bind("load",function(){var g=aZ.contentWindow;a6=g[aW]!==a4?g[aW]:"";if(a6!=aP()){ak(a2);a5.hash=au(a6,a1)}});aZ.contentWindow[aW]===a4&&H()},50)}else{if(ar){if(aY<418){a(a0.body).append('<form id="'+aW+'" style="position:absolute;top:-9999px;" method="get"></form>');h=a0.getElementById(aW)}if(a5[aW]===a4){a5[aW]={}}if(a5[aW][a5.pathname]!==a4){ao=a5[aW][a5.pathname].split(",")}}}aN(function(){aL("init");ak(a2)},1);if(!av()){if(aq&&aY>7||!aq&&"on"+ag in a3){if(a3.addEventListener){a3.addEventListener(ag,aj,a2)}else{a3.attachEvent&&a3.attachEvent("on"+ag,aj)}}else{aX(aj,50)}}}},aE=function(){var f,d=a("a"),i=d.size(),g=-1;aN(function(){if(++g!=i){f=a(d.get(g));f.is("[rel*=address:]")&&f.address();aN(arguments.callee,1)}},1)},aF=function(){if(a6!=aP()){a6=aP();ak(a2)}},ai=function(){if(a3.removeEventListener){a3.removeEventListener(ag,aj,a2)}else{a3.detachEvent&&a3.detachEvent("on"+ag,aj)}},af=function(){if(a7.crawlable){var d=a5.pathname.replace(/\/$/,"");a("body").html().indexOf("_escaped_fragment_")!=-1&&a("a[href]:not([href^=http]), , a[href*="+document.domain+"]").each(function(){var f=a(this).attr("href").replace(/^http:/,"").replace(new RegExp(d+"/?$"),"");if(f==""||f.indexOf("_escaped_fragment_")!=-1){a(this).attr("href","#"+a.address.decode(f.replace(/\/(.*)\?_escaped_fragment_=(.*)$/,"!$2")))}})}},ap=function(d){return aM(aB(d)).replace(/%20/g,"+")},x=function(d){return d.split("#")[0].split("?")[0]},aO=function(f){f=x(f);var d=f.replace(a8,"/").split("/");if(f.substr(0,1)=="/"||f.length===0){d.splice(0,1)}f.substr(f.length-1,1)=="/"&&d.splice(d.length-1,1);return d},ae=function(d){d=d.split("?");return d.slice(1,d.length).join("?").split("#")[0]},aC=function(f,d){if(d=ae(d)){params=d.split("&");d=[];for(aR=0;aR<params.length;aR++){var g=params[aR].split("=");if(g[0]==f||a.address.decode(g[0])==f){d.push(g.slice(1).join("="))}}if(d.length!==0){return d.length!=1?d:d[0]}}},S=function(f){var d=ae(f);f=[];if(d&&d.indexOf("=")!=-1){d=d.split("&");for(var i=0;i<d.length;i++){var g=d[i].split("=")[0];a.inArray(g,f)==-1&&f.push(g)}}return f},ab=function(d){d=d.split("#");return d.slice(1,d.length).join("#")},a4,aW="jQueryAddress",ag="hashchange",ay="change",b="internalChange",aI="externalChange",a1=true,a2=false,a7={autoUpdate:a1,crawlable:a2,history:a1,strict:a1,wrap:a2},aT=a.browser,aY=parseFloat(a.browser.version),aS=aT.mozilla,aq=aT.msie,aD=aT.opera,ar=aT.webkit||aT.safari,e=a2,a3=function(){try{return top.document!==a4?top:window}catch(d){return window}}(),a0=a3.document,aw=a3.history,a5=a3.location,aX=setInterval,aN=setTimeout,aM=encodeURIComponent,aB=decodeURIComponent,a8=/\/{2,9}/g,q=navigator.userAgent,aZ,h,ah=aH(document),c=ah?ah.indexOf("?"):-1,aG=a0.title,al=aw.length,ac=a2,aA=a2,ax=a1,ad=a1,N=a2,ao=[],a6=aP();if(aq){aY=parseFloat(q.substr(q.indexOf("MSIE")+4));if(a0.documentMode&&a0.documentMode!=aY){aY=a0.documentMode!=8?7:8}a(document).bind("propertychange",function(){if(a0.title!=aG&&a0.title.indexOf("#"+aP())!=-1){a0.title=aG}})}if(e=aS&&aY>=1||aq&&aY>=6||aD&&aY>=9.5||ar&&aY>=312){for(var aR=1;aR<al;aR++){ao.push("")}ao.push(a6);if(aD){history.navigationMode="compatible"}if(document.readyState=="complete"){var aQ=setInterval(function(){if(a.address){j();clearInterval(aQ)}},50)}else{aJ();a(j)}aT=am();if(a7.state!==a4){if(aw.pushState){aT.substr(0,3)=="/#/"&&a5.replace(a7.state.replace(/^\/$/,"")+aT.substr(2))}else{aT!="/"&&aT.replace(/^\/#/,"")!=an()&&a5.replace(a7.state.replace(/^\/$/,"")+"/#"+aT)}}a(window).bind("popstate",aF).bind("unload",ai)}else{!e&&an()!=""||ar&&aY<418&&an()!=""&&a5.search!=""?a5.replace(a5.href.substr(0,a5.href.indexOf("#"))):az()}return{bind:function(f,d,g){return aK(f,d,g)},init:function(d){return aK("init",d)},change:function(d){return aK(ay,d)},internalChange:function(d){return aK(b,d)},externalChange:function(d){return aK(aI,d)},baseURL:function(){var d=a5.href;if(d.indexOf("#")!=-1){d=d.substr(0,d.indexOf("#"))}if(/\/$/.test(d)){d=d.substr(0,d.length-1)}return d},autoUpdate:function(d){if(d!==a4){a7.autoUpdate=d;return this}return a7.autoUpdate},crawlable:function(d){if(d!==a4){a7.crawlable=d;return this}return a7.crawlable},history:function(d){if(d!==a4){a7.history=d;return this}return a7.history},state:function(d){if(d!==a4){a7.state=d;return this}return a7.state},strict:function(d){if(d!==a4){a7.strict=d;return this}return a7.strict},tracker:function(d){if(d!==a4){a7.tracker=d;return this}return a7.tracker},wrap:function(d){if(d!==a4){a7.wrap=d;return this}return a7.wrap},update:function(){N=a1;this.value(a6);N=a2;return this},encode:function(f){var d=aO(f),m=S(f),k=ae(f),l=ab(f),i=f.substr(0,1),n=f.substr(f.length-1),g="";a.each(d,function(o,p){g+="/"+ap(p)});if(k!==""){g+="?";if(m.length===0){g+=k}else{a.each(m,function(o,p){o=aC(p,f);if(typeof o!=="string"){a.each(o,function(s,r){g+=ap(p)+"="+ap(r)+"&"})}else{g+=ap(p)+"="+ap(o)+"&"}});g=g.substr(0,g.length-1)}}if(l!==""){g+="#"+ap(l)}if(i!="/"&&g.substr(0,1)=="/"){g=g.substr(1)}if(i=="/"&&g.substr(0,1)!="/"){g="/"+g}if(/#|&|\?/.test(n)){g+=n}return g},decode:function(f){if(f!==a4){var d=[],k=function(l){return aB(l.toString().replace(/\+/g,"%20"))};if(typeof f=="object"&&f.length!==a4){for(var g=0,i=f.length;g<i;g++){d[g]=k(f[g])}return d}else{return k(f)}}},title:function(d){if(d!==a4){aN(function(){aG=a0.title=d;if(ad&&aZ&&aZ.contentWindow&&aZ.contentWindow.document){aZ.contentWindow.document.title=d;ad=a2}if(!ax&&aS){a5.replace(a5.href.indexOf("#")!=-1?a5.href:a5.href+"#")}ax=a2},50);return this}return a0.title},value:function(f){if(f!==a4){f=this.encode(aU(f));if(f=="/"){f=""}if(a6==f&&!N){return}ax=a1;a6=f;if(a7.autoUpdate||N){ak(a1);if(av()){aw[a7.history?"pushState":"replaceState"]({},"",a7.state.replace(/\/$/,"")+(a6==""?"/":a6))}else{ac=a1;ao[aw.length]=a6;if(ar){if(a7.history){a5[aW][a5.pathname]=ao.toString();al=aw.length+1;if(aY<418){if(a5.search==""){h.action="#"+au(a6,a1);h.submit()}}else{if(aY<523||a6==""){f=a0.createEvent("MouseEvents");f.initEvent("click",a1,a1);var d=a0.createElement("a");d.href="#"+au(a6,a1);d.dispatchEvent(f)}else{a5.hash="#"+au(a6,a1)}}}else{a5.replace("#"+au(a6,a1))}}else{if(a6!=aP()){if(a7.history){a5.hash="#"+au(a6,a1)}else{a5.replace("#"+au(a6,a1))}}}aq&&aY<8&&a7.history&&aN(H,50);if(ar){aN(function(){ac=a2},1)}else{ac=a2}}}return this}if(!e){return null}return this.decode(aU(a6))},path:function(f){if(f!==a4){var d=ae(aU(a6)),g=ab(aU(a6));this.value(f+(d?"?"+d:"")+(g?"#"+g:""));return this}return this.decode(x(aU(a6)))},pathNames:function(){return this.decode(aO(aU(a6)))},queryString:function(f){if(f!==a4){var d=ab(aU(a6));this.value(this.path()+(f?"?"+f:"")+(d?"#"+d:""));return this}return this.decode(ae(aU(a6)))},parameter:function(n,l,k){var g,d;if(l!==a4){var o=this.parameterNames();d=[];l=l?aM(l):"";for(g=0;g<o.length;g++){var i=o[g],f=this.parameter(i);if(typeof f=="string"){f=[f]}if(i==n){f=l===null||l===""?[]:k?f.concat([l]):[l]}for(var m=0;m<f.length;m++){d.push(i+"="+ap(f[m]))}}a.inArray(n,o)==-1&&l!==null&&l!==""&&d.push(n+"="+ap(l));this.queryString(d.join("&"));return this}return this.decode(aC(n,aU(a6)))},parameterNames:function(){return this.decode(S(aU(a6)))},hash:function(d){if(d!==a4){this.value(aU(a6).split("#")[0]+(d?"#"+d:""));return this}return this.decode(ab(aU(a6)))}}}();a.fn.address=function(c){if(!a(this).attr("address")){var b=function(e){if(a(this).is("a")){var d=c?c.call(this):/address:/.test(a(this).attr("rel"))?a(this).attr("rel").split("address:")[1].split(" ")[0]:a.address.state()!==undefined&&a.address.state()!="/"?a(this).attr("href").replace(new RegExp("^(.*"+a.address.state()+"|\\.)"),""):a(this).attr("href").replace(/^(#\!?|\.)/,"");a.address.value(d);e.preventDefault()}};a(this).click(b).live("click",b).submit(function(e){if(a(this).is("form")){var d=c?c.call(this):a(this).attr("action")+"?"+a.address.decode(a(this).serialize());a.address.value(d);e.preventDefault()}}).attr("address",true)}return this}})(jQuery)}var Profile={initialGraphUrl:null,fLoadingGraph:false,fLoadedGraph:false,init:function(){if($.address){$.address.externalChange(function(){Profile.historyChange()})}$(".graph-link").click(function(){Profile.loadGraphFromLink(this);return false});$("#individual_report #achievements #achievement-list > ul li").click(function(){var c=$(this).attr("id");var b=$(this);$("#badge-container").css("display","");b.siblings().removeClass("selected");if($("#badge-container > #"+c).is(":visible")){$("#badge-container > #"+c).slideUp(300,function(){$("#badge-container").css("display","none");b.removeClass("selected")})}else{var a=$("#badge-container");$(a).css("min-height",a.height());$(a).children().hide();$("#"+c,a).slideDown(300,function(){$(a).animate({"min-height":0},200)});b.addClass("selected")}});$("#stats-nav #nav-accordion").accordion({header:".header",active:".graph-link-selected",autoHeight:false,clearStyle:true});setTimeout(function(){if(!Profile.fLoadingGraph&&!Profile.fLoadedGraph){Profile.historyChange()}},1000)},highlightPoints:function(e,f){if(!e){return}for(var a=0;a<e.series.length;a++){var b=e.series[a];this.muteSeriesStyles(b);for(var d=0;d<b.data.length;d++){var c=b.data[d].options;if(!c.marker){c.marker={}}c.marker.enabled=f(c);if(c.marker.enabled){c.marker.radius=6}}b.isDirty=true}e.redraw()},muteSeriesStyles:function(a){if(a.options.fMuted){return}a.graph.attr("opacity",0.1);a.graph.attr("stroke","#CCCCCC");a.options.lineWidth=1;a.options.shadow=false;a.options.fMuted=true},accentuateSeriesStyles:function(a){a.options.lineWidth=3.5;a.options.shadow=true;a.options.fMuted=false},highlightSeries:function(g,f){if(!g||!f){return}for(var a=0;a<g.series.length;a++){var d=g.series[a];var b=(d==f);if(d.fSelectedLast==null||d.fSelectedLast!=b){if(b){this.accentuateSeriesStyles(d)}else{this.muteSeriesStyles(d)}for(var e=0;e<d.data.length;e++){d.data[e].options.marker={enabled:b,radius:b?5:4}}d.isDirty=true;d.fSelectedLast=b}}var c=f.options;c.color="#0080C9";f.remove(false);g.addSeries(c,false,false);g.redraw()},collapseAccordion:function(){$("#stats-nav #nav-accordion").accordion("option","collapsible",true).accordion("activate",false).accordion("option","collapsible",false)},baseGraphHref:function(b){var a=b.indexOf("://");if(a>-1){b=b.substring(a+"://".length)}var c=b.indexOf("/");if(c>-1){b=b.substring(b.indexOf("/"))}var d=b.indexOf("?");if(d>-1){b=b.substring(0,d)}return b},expandAccordionForHref:function(a){if(!a){return}a=this.baseGraphHref(a);a=a.replace(/[<>']/g,"");var b=".graph-link-header[href*='"+a+"']";if($(b).length){$("#stats-nav #nav-accordion").accordion("activate",b)}else{this.collapseAccordion()}},styleSublinkFromHref:function(b){if(!b){return}var a=/dt_start=[^&]+/;var c=b.match(a);var d=c?c[0]:"dt_start=lastweek";b=b.replace(/[<>']/g,"");$(".graph-sub-link").removeClass("graph-sub-link-selected");$(".graph-sub-link[href*='"+this.baseGraphHref(b)+"'][href*='"+d+"']").addClass("graph-sub-link-selected")},loadGraphFromLink:function(a){if(!a){return}this.loadGraph(a.href)},loadGraph:function(b,a){if(!b){return}if(this.fLoadingGraph){setTimeout(function(){Profile.loadGraph(b)},200);return}this.styleSublinkFromHref(b);this.fLoadingGraph=true;this.fLoadedGraph=true;$.ajax({type:"GET",url:Timezone.append_tz_offset_query_param(b),data:{},success:function(c){Profile.finishLoadGraph(c,b,a)},error:function(){Profile.finishLoadGraphError()}});$("#graph-content").html("");this.showGraphThrobber(true)},finishLoadGraph:function(data,href,fNoHistoryEntry){this.fLoadingGraph=false;try{eval("var dict_json = "+data)}catch(e){this.finishLoadGraphError();return}if(!fNoHistoryEntry){if($.address){$.address.parameter("graph_url",href,false)}}this.showGraphThrobber(false);this.styleSublinkFromHref(dict_json.url);$("#graph-content").html(dict_json.html)},finishLoadGraphError:function(){this.fLoadingGraph=false;this.showGraphThrobber(false);$("#graph-content").html("<div class='graph-notification'>It's our fault. We ran into a problem loading this graph. Try again later, and if this continues to happen please <a href='/reportissue?type=Defect'>let us know</a>.</div>")},historyChange:function(b){var a=($.address?$.address.parameter("graph_url"):"")||this.initialGraphUrl;if(a){this.expandAccordionForHref(a);this.loadGraph(a,true)}},showGraphThrobber:function(a){if(a){$("#graph-progress-bar").progressbar({value:100}).slideDown("fast")}else{$("#graph-progress-bar").slideUp("fast")}}};$(function(){Profile.init()});