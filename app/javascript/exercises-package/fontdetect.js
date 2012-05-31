/**
 * JavaScript code to detect available availability of a 
 * particular font in a browser using JavaScript and CSS. 
 * 
 * Author : Lalit Patel
 * Website: http://www.lalit.org/lab/jsoncookies
 * License: Creative Commons Attribution-ShareAlike 2.5
 *          http://creativecommons.org/licenses/by-sa/2.5/
 * Version: 0.15 
 *          changed comparision font to serif from sans-serif, 
 *          as in FF3.0 font of child element didn't fallback 
 *          to parent element if the font is missing.
 * Updated: 09 July 2009 10:52pm
 * 
 */

/**
 * Actual function that does all the work. Returns an array with all the info.
 * This test will fail for the font set as the default serif font.
 * 
 * Usage: d = new Detector();
 *        d.test('font_name');
 */
var Detector = function(){
	var h = document.getElementsByTagName("BODY")[0];
	var d = document.createElement("DIV");
	var s = document.createElement("SPAN");
	d.appendChild(s);
	d.style.fontFamily = "sans";			//font for the parent element DIV.
	s.style.fontFamily = "sans";			//serif font used as a comparator.
	s.style.fontSize   = "72px";			//we test using 72px font size, we may use any size. I guess larger the better.
	s.innerHTML        = "mmmmmmmmmmlil";		//we use m or w because these two characters take up the maximum width. And we use a L so that the same matching fonts can get separated
	h.appendChild(d);
	var defaultWidth   = s.offsetWidth;		//now we have the defaultWidth
	var defaultHeight  = s.offsetHeight;	//and the defaultHeight, we compare other fonts with these.
	h.removeChild(d);
	/* test
	 * params:
	 * font - name of the font you wish to detect
	 * return: 
	 * f[0] - Input font name.
	 * f[1] - Computed width.
	 * f[2] - Computed height.
	 * f[3] - Detected? (true/false).
	 */
	function debug(font) {
		h.appendChild(d);
		var f = [];
		f[0] = s.style.fontFamily = font;	// Name of the font
		f[1] = s.offsetWidth;				// Width
		f[2] = s.offsetHeight;				// Height
		h.removeChild(d);
		font = font.toLowerCase();
		if (font == "serif") {
			f[3] = true;	// to set arial and sans-serif true
		} else {
			f[3] = (f[1] != defaultWidth || f[2] != defaultHeight);	// Detected?
		}
		return f;
	}
	function test(font){
		var f = debug(font);
		return f[3];
	}
	this.detailedTest = debug;
	this.test = test;	
}
