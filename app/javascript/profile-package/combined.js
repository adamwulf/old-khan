
// IE 6 and 7 have address plugin "Permission denied" bug right now: 
// http://www.asual.com/blog/jquery/2010/05/05/jquery-address-12-ajax-crawling-url-building-and-more.html
if (!($.browser.msie && parseInt($.browser.version) < 8))
{

/*
 * jQuery Address Plugin v1.3.1
 * http://www.asual.com/jquery/address/
 *
 * Copyright (c) 2009-2010 Rostislav Hristov
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Date: 2010-11-29 11:54:20 +0200 (Mon, 29 Nov 2010)
 */
(function(c){c.address=function(){var y=function(a){c(c.address).trigger(c.extend(c.Event(a),function(){for(var b={},e=c.address.parameterNames(),h=0,q=e.length;h<q;h++)b[e[h]]=c.address.parameter(e[h]);return{value:c.address.value(),path:c.address.path(),pathNames:c.address.pathNames(),parameterNames:e,parameters:b,queryString:c.address.queryString()}}.call(c.address)))},z=function(a,b,e){c(c.address).bind(a,b,e);return c.address},B=function(){return A.pushState&&d.state!==i},K=function(){return("/"+
g.pathname.replace(new RegExp(d.state),"")+g.search+(J()?"#"+J():"")).replace(ba,"/")},J=function(){var a=g.href.indexOf("#");return a!=-1?C(g.href.substr(a+1),l):""},v=function(){return B()?K():J()},ua=function(){return"javascript"},s=function(a){a=a.toString();return(d.strict&&a.substr(0,1)!="/"?"/":"")+a},C=function(a,b){if(d.crawlable&&b)return(a!=""?"!":"")+a;return a.replace(/^\!/,"")},D=function(a,b){return parseInt(a.css(b),10)},ca=function(a){for(var b,e,h=0,q=a.childNodes.length;h<q;h++){if(a.childNodes[h].src)b=
String(a.childNodes[h].src);if(e=ca(a.childNodes[h]))b=e}return b},O=function(){if(!T){var a=v(),b=f!=a;if(E&&p<523){if(L!=A.length){L=A.length;if(I[L-1]!==i)f=I[L-1];M(l)}}else if(b)if(F&&p<7)g.reload();else{F&&p<8&&d.history&&w(W,50);f=a;M(l)}}},M=function(a){y(da);y(a?ea:fa);w(ga,10)},ga=function(){if(d.tracker!=="null"&&d.tracker!==null){var a=c.isFunction(d.tracker)?d.tracker:k[d.tracker],b=(g.pathname+g.search+(c.address&&!B()?c.address.value():"")).replace(/\/\//,"/").replace(/^\/$/,"");if(c.isFunction(a))a(b);
else if(c.isFunction(k.urchinTracker))k.urchinTracker(b);else if(k.pageTracker!==i&&c.isFunction(k.pageTracker._trackPageview))k.pageTracker._trackPageview(b);else k._gaq!==i&&c.isFunction(k._gaq.push)&&k._gaq.push(["_trackPageview",b])}},W=function(){var a=ua()+":"+l+";document.open();document.writeln('<html><head><title>"+n.title.replace("'","\\'")+"</title><script>var "+r+' = "'+encodeURIComponent(v())+(n.domain!=g.host?'";document.domain="'+n.domain:"")+"\";<\/script></head></html>');document.close();";
if(p<7)o.src=a;else o.contentWindow.location.replace(a)},ia=function(){if(P&&ha!=-1){var a,b=P.substr(ha+1).split("&");for(u=0;u<b.length;u++){a=b[u].split("=");if(/^(autoUpdate|crawlable|history|strict|wrap)$/.test(a[0]))d[a[0]]=isNaN(a[1])?/^(true|yes)$/i.test(a[1]):parseInt(a[1],10)!==0;if(/^(state|tracker)$/.test(a[0]))d[a[0]]=a[1]}P=null}f=v()},ka=function(){if(!ja){ja=m;ia();var a=function(){va.call(this);wa.call(this)},b=c("body").ajaxComplete(a);a();if(d.wrap){c("body > *").wrapAll('<div style="padding:'+
(D(b,"marginTop")+D(b,"paddingTop"))+"px "+(D(b,"marginRight")+D(b,"paddingRight"))+"px "+(D(b,"marginBottom")+D(b,"paddingBottom"))+"px "+(D(b,"marginLeft")+D(b,"paddingLeft"))+'px;" />').parent().wrap('<div id="'+r+'" style="height:100%;overflow:auto;position:relative;'+(E?window.statusbar.visible&&!/chrome/i.test(X)?"":"resize:both;":"")+'" />');c("html, body").css({height:"100%",margin:0,padding:0,overflow:"hidden"});E&&c('<style type="text/css" />').appendTo("head").text("#"+r+"::-webkit-resizer { background-color: #fff; }")}if(F&&
p<8){a=n.getElementsByTagName("frameset")[0];o=n.createElement((a?"":"i")+"frame");if(a){a.insertAdjacentElement("beforeEnd",o);a[a.cols?"cols":"rows"]+=",0";o.noResize=m;o.frameBorder=o.frameSpacing=0}else{o.style.display="none";o.style.width=o.style.height=0;o.tabIndex=-1;n.body.insertAdjacentElement("afterBegin",o)}w(function(){c(o).bind("load",function(){var e=o.contentWindow;f=e[r]!==i?e[r]:"";if(f!=v()){M(l);g.hash=C(f,m)}});o.contentWindow[r]===i&&W()},50)}else if(E){if(p<418){c(n.body).append('<form id="'+
r+'" style="position:absolute;top:-9999px;" method="get"></form>');Y=n.getElementById(r)}if(g[r]===i)g[r]={};if(g[r][g.pathname]!==i)I=g[r][g.pathname].split(",")}w(function(){y("init");M(l)},1);if(!B())if(F&&p>7||!F&&"on"+Q in k)if(k.addEventListener)k.addEventListener(Q,O,l);else k.attachEvent&&k.attachEvent("on"+Q,O);else xa(O,50)}},va=function(){var a,b=c("a"),e=b.size(),h=-1;w(function(){if(++h!=e){a=c(b.get(h));a.is("[rel*=address:]")&&a.address();w(arguments.callee,1)}},1)},ya=function(){if(f!=
v()){f=v();M(l)}},za=function(){if(k.removeEventListener)k.removeEventListener(Q,O,l);else k.detachEvent&&k.detachEvent("on"+Q,O)},wa=function(){if(d.crawlable){var a=g.pathname.replace(/\/$/,"");c("body").html().indexOf("_escaped_fragment_")!=-1&&c("a[href]:not([href^=http]), , a[href*="+document.domain+"]").each(function(){var b=c(this).attr("href").replace(/^http:/,"").replace(new RegExp(a+"/?$"),"");if(b==""||b.indexOf("_escaped_fragment_")!=-1)c(this).attr("href","#"+c.address.decode(b.replace(/\/(.*)\?_escaped_fragment_=(.*)$/,
"!$2")))})}},G=function(a){return la(ma(a)).replace(/%20/g,"+")},na=function(a){return a.split("#")[0].split("?")[0]},oa=function(a){a=na(a);var b=a.replace(ba,"/").split("/");if(a.substr(0,1)=="/"||a.length===0)b.splice(0,1);a.substr(a.length-1,1)=="/"&&b.splice(b.length-1,1);return b},R=function(a){a=a.split("?");return a.slice(1,a.length).join("?").split("#")[0]},pa=function(a,b){if(b=R(b)){params=b.split("&");b=[];for(u=0;u<params.length;u++){var e=params[u].split("=");if(e[0]==a||c.address.decode(e[0])==
a)b.push(e.slice(1).join("="))}if(b.length!==0)return b.length!=1?b:b[0]}},qa=function(a){var b=R(a);a=[];if(b&&b.indexOf("=")!=-1){b=b.split("&");for(var e=0;e<b.length;e++){var h=b[e].split("=")[0];c.inArray(h,a)==-1&&a.push(h)}}return a},U=function(a){a=a.split("#");return a.slice(1,a.length).join("#")},i,r="jQueryAddress",Q="hashchange",da="change",ea="internalChange",fa="externalChange",m=true,l=false,d={autoUpdate:m,crawlable:l,history:m,strict:m,wrap:l},t=c.browser,p=parseFloat(c.browser.version),
ra=t.mozilla,F=t.msie,sa=t.opera,E=t.webkit||t.safari,Z=l,k=function(){try{return top.document!==i?top:window}catch(a){return window}}(),n=k.document,A=k.history,g=k.location,xa=setInterval,w=setTimeout,la=encodeURIComponent,ma=decodeURIComponent,ba=/\/{2,9}/g,X=navigator.userAgent,o,Y,P=ca(document),ha=P?P.indexOf("?"):-1,$=n.title,L=A.length,T=l,ja=l,aa=m,ta=m,V=l,I=[],f=v();if(F){p=parseFloat(X.substr(X.indexOf("MSIE")+4));if(n.documentMode&&n.documentMode!=p)p=n.documentMode!=8?7:8;c(document).bind("propertychange",
function(){if(n.title!=$&&n.title.indexOf("#"+v())!=-1)n.title=$})}if(Z=ra&&p>=1||F&&p>=6||sa&&p>=9.5||E&&p>=312){for(var u=1;u<L;u++)I.push("");I.push(f);if(sa)history.navigationMode="compatible";if(document.readyState=="complete")var Aa=setInterval(function(){if(c.address){ka();clearInterval(Aa)}},50);else{ia();c(ka)}t=K();if(d.state!==i)if(A.pushState)t.substr(0,3)=="/#/"&&g.replace(d.state.replace(/^\/$/,"")+t.substr(2));else t!="/"&&t.replace(/^\/#/,"")!=J()&&g.replace(d.state.replace(/^\/$/,
"")+"/#"+t);c(window).bind("popstate",ya).bind("unload",za)}else!Z&&J()!=""||E&&p<418&&J()!=""&&g.search!=""?g.replace(g.href.substr(0,g.href.indexOf("#"))):ga();return{bind:function(a,b,e){return z(a,b,e)},init:function(a){return z("init",a)},change:function(a){return z(da,a)},internalChange:function(a){return z(ea,a)},externalChange:function(a){return z(fa,a)},baseURL:function(){var a=g.href;if(a.indexOf("#")!=-1)a=a.substr(0,a.indexOf("#"));if(/\/$/.test(a))a=a.substr(0,a.length-1);return a},autoUpdate:function(a){if(a!==
i){d.autoUpdate=a;return this}return d.autoUpdate},crawlable:function(a){if(a!==i){d.crawlable=a;return this}return d.crawlable},history:function(a){if(a!==i){d.history=a;return this}return d.history},state:function(a){if(a!==i){d.state=a;return this}return d.state},strict:function(a){if(a!==i){d.strict=a;return this}return d.strict},tracker:function(a){if(a!==i){d.tracker=a;return this}return d.tracker},wrap:function(a){if(a!==i){d.wrap=a;return this}return d.wrap},update:function(){V=m;this.value(f);
V=l;return this},encode:function(a){var b=oa(a),e=qa(a),h=R(a),q=U(a),H=a.substr(0,1),N=a.substr(a.length-1),j="";c.each(b,function(x,S){j+="/"+G(S)});if(h!==""){j+="?";if(e.length===0)j+=h;else{c.each(e,function(x,S){x=pa(S,a);if(typeof x!=="string")c.each(x,function(Ca,Ba){j+=G(S)+"="+G(Ba)+"&"});else j+=G(S)+"="+G(x)+"&"});j=j.substr(0,j.length-1)}}if(q!=="")j+="#"+G(q);if(H!="/"&&j.substr(0,1)=="/")j=j.substr(1);if(H=="/"&&j.substr(0,1)!="/")j="/"+j;if(/#|&|\?/.test(N))j+=N;return j},decode:function(a){if(a!==
i){var b=[],e=function(H){return ma(H.toString().replace(/\+/g,"%20"))};if(typeof a=="object"&&a.length!==i){for(var h=0,q=a.length;h<q;h++)b[h]=e(a[h]);return b}else return e(a)}},title:function(a){if(a!==i){w(function(){$=n.title=a;if(ta&&o&&o.contentWindow&&o.contentWindow.document){o.contentWindow.document.title=a;ta=l}if(!aa&&ra)g.replace(g.href.indexOf("#")!=-1?g.href:g.href+"#");aa=l},50);return this}return n.title},value:function(a){if(a!==i){a=this.encode(s(a));if(a=="/")a="";if(f==a&&!V)return;
aa=m;f=a;if(d.autoUpdate||V){M(m);if(B())A[d.history?"pushState":"replaceState"]({},"",d.state.replace(/\/$/,"")+(f==""?"/":f));else{T=m;I[A.length]=f;if(E)if(d.history){g[r][g.pathname]=I.toString();L=A.length+1;if(p<418){if(g.search==""){Y.action="#"+C(f,m);Y.submit()}}else if(p<523||f==""){a=n.createEvent("MouseEvents");a.initEvent("click",m,m);var b=n.createElement("a");b.href="#"+C(f,m);b.dispatchEvent(a)}else g.hash="#"+C(f,m)}else g.replace("#"+C(f,m));else if(f!=v())if(d.history)g.hash="#"+
C(f,m);else g.replace("#"+C(f,m));F&&p<8&&d.history&&w(W,50);if(E)w(function(){T=l},1);else T=l}}return this}if(!Z)return null;return this.decode(s(f))},path:function(a){if(a!==i){var b=R(s(f)),e=U(s(f));this.value(a+(b?"?"+b:"")+(e?"#"+e:""));return this}return this.decode(na(s(f)))},pathNames:function(){return this.decode(oa(s(f)))},queryString:function(a){if(a!==i){var b=U(s(f));this.value(this.path()+(a?"?"+a:"")+(b?"#"+b:""));return this}return this.decode(R(s(f)))},parameter:function(a,b,e){var h,
q;if(b!==i){var H=this.parameterNames();q=[];b=b?la(b):"";for(h=0;h<H.length;h++){var N=H[h],j=this.parameter(N);if(typeof j=="string")j=[j];if(N==a)j=b===null||b===""?[]:e?j.concat([b]):[b];for(var x=0;x<j.length;x++)q.push(N+"="+G(j[x]))}c.inArray(a,H)==-1&&b!==null&&b!==""&&q.push(a+"="+G(b));this.queryString(q.join("&"));return this}return this.decode(pa(a,s(f)))},parameterNames:function(){return this.decode(qa(s(f)))},hash:function(a){if(a!==i){this.value(s(f).split("#")[0]+(a?"#"+a:""));return this}return this.decode(U(s(f)))}}}();
c.fn.address=function(y){if(!c(this).attr("address")){var z=function(B){if(c(this).is("a")){var K=y?y.call(this):/address:/.test(c(this).attr("rel"))?c(this).attr("rel").split("address:")[1].split(" ")[0]:c.address.state()!==undefined&&c.address.state()!="/"?c(this).attr("href").replace(new RegExp("^(.*"+c.address.state()+"|\\.)"),""):c(this).attr("href").replace(/^(#\!?|\.)/,"");c.address.value(K);B.preventDefault()}};c(this).click(z).live("click",z).submit(function(B){if(c(this).is("form")){var K=
y?y.call(this):c(this).attr("action")+"?"+c.address.decode(c(this).serialize());c.address.value(K);B.preventDefault()}}).attr("address",true)}return this}})(jQuery);

}


var Profile = {

    initialGraphUrl: null,
    fLoadingGraph: false,
    fLoadedGraph: false,

    init: function() {

        if ($.address)
            $.address.externalChange(function(){ Profile.historyChange(); });

        $(".graph-link").click(function(){Profile.loadGraphFromLink(this); return false;});

        $("#individual_report #achievements #achievement-list > ul li").click(function() {
             var category = $(this).attr('id');
             var clickedBadge = $(this);
             
             $("#badge-container").css("display", "");
             clickedBadge.siblings().removeClass("selected");

             if ($("#badge-container > #" + category ).is(":visible")) {
                $("#badge-container > #" + category ).slideUp(300, function(){
                        $("#badge-container").css("display", "none");
                        clickedBadge.removeClass("selected");
                    });
             }
             else {
                var jelContainer = $("#badge-container");
                $(jelContainer).css("min-height", jelContainer.height());
                $(jelContainer).children().hide();
                $("#" + category, jelContainer).slideDown(300, function() {
                    $(jelContainer).animate({"min-height": 0}, 200);
                });
                clickedBadge.addClass("selected");
             }
        });

        $("#stats-nav #nav-accordion").accordion({ header:".header", active:".graph-link-selected", autoHeight: false, clearStyle: true });

        setTimeout(function(){
            if (!Profile.fLoadingGraph && !Profile.fLoadedGraph)
            {
                // If 1000 millis after document.ready fires we still haven't
                // started loading a graph, load manually.
                // The externalChange trigger may have fired before we hooked
                // up a listener.
                Profile.historyChange();
            }
        }, 1000);
    },

    highlightPoints: function(chart, fxnHighlight) {

        if (!chart) return;

        for (var ix = 0; ix < chart.series.length; ix++) {
            var series = chart.series[ix];

            this.muteSeriesStyles(series);

            for (var ixData = 0; ixData < series.data.length; ixData++) {
                var pointOptions = series.data[ixData].options;
                if (!pointOptions.marker) pointOptions.marker = {};
                pointOptions.marker.enabled = fxnHighlight(pointOptions);
                if (pointOptions.marker.enabled) pointOptions.marker.radius = 6;
            }

            series.isDirty = true;
        }

        chart.redraw();
    },

    muteSeriesStyles: function(series) {
        if (series.options.fMuted) return;

        series.graph.attr('opacity', 0.1);
        series.graph.attr('stroke', '#CCCCCC');
        series.options.lineWidth = 1;
        series.options.shadow = false;
        series.options.fMuted = true;
    },

    accentuateSeriesStyles: function(series) {
        series.options.lineWidth = 3.5;
        series.options.shadow = true;
        series.options.fMuted = false;
    },

    highlightSeries: function(chart, seriesHighlight) {

        if (!chart || !seriesHighlight) return;

        for (var ix = 0; ix < chart.series.length; ix++)
        {
            var series = chart.series[ix];
            var fSelected = (series == seriesHighlight);

            if (series.fSelectedLast == null || series.fSelectedLast != fSelected)
            {
                if (fSelected)
                    this.accentuateSeriesStyles(series);
                else
                    this.muteSeriesStyles(series);

                for (var ixData = 0; ixData < series.data.length; ixData++) {
                    series.data[ixData].options.marker = {
                        enabled: fSelected, 
                        radius: fSelected ? 5 : 4
                    };
                }

                series.isDirty = true;
                series.fSelectedLast = fSelected;
            }
        }

        var options = seriesHighlight.options;
        options.color = '#0080C9';
        seriesHighlight.remove(false);
        chart.addSeries(options, false, false);

        chart.redraw();
    },

    collapseAccordion: function() {
        // Turn on collapsing, collapse everything, and turn off collapsing
        $("#stats-nav #nav-accordion").accordion(
                "option", "collapsible", true).accordion(
                    "activate", false).accordion(
                        "option", "collapsible", false);
    },

    baseGraphHref: function(href) {

        var ixProtocol = href.indexOf("://");
        if (ixProtocol > -1)
            href = href.substring(ixProtocol + "://".length);

        var ixSlash = href.indexOf("/");
        if (ixSlash > -1)
            href = href.substring(href.indexOf("/"));

        var ixQuestionMark = href.indexOf("?");
        if (ixQuestionMark > -1)
            href = href.substring(0, ixQuestionMark);

        return href;
    },

    expandAccordionForHref: function(href) {
        if (!href) return;

        href = this.baseGraphHref(href);

        href = href.replace(/[<>']/g, "");
        var selectorAccordionSection = ".graph-link-header[href*='" + href + "']";
        if ($(selectorAccordionSection).length)
            $("#stats-nav #nav-accordion").accordion("activate", selectorAccordionSection);
        else
            this.collapseAccordion();
    },

    styleSublinkFromHref: function(href) {

        if (!href) return;

        var reDtStart = /dt_start=[^&]+/;

        var matchStart = href.match(reDtStart);
        var sDtStart = matchStart ? matchStart[0] : "dt_start=lastweek";

        href = href.replace(/[<>']/g, "");

        $(".graph-sub-link").removeClass("graph-sub-link-selected");
        $(".graph-sub-link[href*='" + this.baseGraphHref(href) + "'][href*='" + sDtStart + "']").addClass("graph-sub-link-selected");
    },

    loadGraphFromLink: function(el) {
        if (!el) return;
        this.loadGraph(el.href);
    },

    loadGraph: function(href, fNoHistoryEntry) {
        if (!href) return;

        if (this.fLoadingGraph) {
            setTimeout(function(){Profile.loadGraph(href);}, 200);
            return;
        }

        this.styleSublinkFromHref(href);
        this.fLoadingGraph = true;
        this.fLoadedGraph = true;

        $.ajax({type: "GET",
                url: Timezone.append_tz_offset_query_param(href),
                data: {},
                success: function(data){ Profile.finishLoadGraph(data, href, fNoHistoryEntry); },
                error: function() { Profile.finishLoadGraphError(); }
        });
        $("#graph-content").html("");
        this.showGraphThrobber(true);
    },

    finishLoadGraph: function(data, href, fNoHistoryEntry) {

        this.fLoadingGraph = false;

        try { eval("var dict_json = " + data); }
        catch(e) { this.finishLoadGraphError(); return; }

        if (!fNoHistoryEntry)
        {
            // Add history entry for browser
            if ($.address)
                $.address.parameter("graph_url", href, false);
        }

        this.showGraphThrobber(false);
        this.styleSublinkFromHref(dict_json.url);
        $("#graph-content").html(dict_json.html);
    },

    finishLoadGraphError: function() {
        this.fLoadingGraph = false;
        this.showGraphThrobber(false);
        $("#graph-content").html("<div class='graph-notification'>It's our fault. We ran into a problem loading this graph. Try again later, and if this continues to happen please <a href='/reportissue?type=Defect'>let us know</a>.</div>");
    },

    historyChange: function(e) {
        var href = ($.address ? $.address.parameter("graph_url") : "") || this.initialGraphUrl;
        if (href)
        {
            this.expandAccordionForHref(href);
            this.loadGraph(href, true);
        }
    },

    showGraphThrobber: function(fVisible) {
        if (fVisible)
            $("#graph-progress-bar").progressbar({value: 100}).slideDown("fast");
        else
            $("#graph-progress-bar").slideUp("fast");
    }
};

$(function(){Profile.init();});