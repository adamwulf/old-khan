var correctAnswer = null;
var correct_answer = null;
var comparisonFunction = function eq(a,b) { return a==b; }

//Returns n rounded to "precision" places behind the decimal point
function roundNumber(n, precision)
{
	return Math.round(n*Math.pow(10,precision))/Math.pow(10,precision);	
}

//Randomly choose a problem type
function pickType(low,high)
{
	var notDoneType = null;
	generateNewProblem(function () {
		notDoneType = ''+getRandomIntRange(low, high);
		return notDoneType;
	}, Math.floor((high-low)/2), "type");
	eval("type"+notDoneType+"()");
}

function pickNumber(low,high)
{
	var notDoneNum = null;
	generateNewProblem(function () {
		notDoneNum = getRandomIntRange(low, high);
		return ''+notDoneNum;
	}, Math.floor((high-low)/2), "number");
	return notDoneNum;
}

function nicefySigns(expr)
{
	while (expr.indexOf("+ -") != -1) {
		expr = expr.replace("+ -", "- ");
	}
	while (expr.indexOf("- -") != -1) {
		expr = expr.replace("- -", "+ ")
	}
	return expr;
}

function writeText(text)
{
	write_text(text);
}

function writeStep(step)
{
	write_step(step);
}


function simplifiedRoot(x)
{
	var factor = perfect_square_factor(x);
	if (factor.length==1)
	{
		return 'sqrt('+x+')';
	}
	else if (factor[0]==1)
	{
		return Math.sqrt(x);
	}
	else 
	{
		return (Math.sqrt(factor[1])+'sqrt('+factor[0]+')');
	}
}



function equationString(s)
{
	return equation_string(s);
}

function writeEquation(e)
{
	writeText(equationString(e));
}

function setCorrectAnswer(a)
{
	correctAnswer = a+'';
	correct_answer = a;
}

function mathFormatWithColor(e,color)
{
	var formattedString = mathFormat(e);
	var selFontString = '<font color='+color+' size=4>';
	return (selFontString+formattedString+'</font>');
	
}

function mathFormat(e)
{
	// Make it a string
	e = e + ''; 
	// If it is already ASCIIMath, leave it alone
	if (e.length > 0 && e.charAt(0) == '`')
		return e;
	// Normalize the formatting if it is an integer
	var intRe = /^ *[+-]? *(0|[1-9][0-9]*) *$/;
	if (intRe.test(e)) {
		var intVal = parseInt(e);
		if (!isNaN(intVal)) {
			e = format_fraction(parseInt(e),1);			
		}
	}
	// Make it ASCIIMath
	return	'`'+e+'`';
}

function nonZeroRandomInt(l,h)
{
	var i = getRandomIntRange(l,h);
	while (i==0)
		i = getRandomIntRange(l,h);
	return i;
}

function randomMember(arr)
{
	// I should have done this a _long_ time ago -- Omar
	return arr[getRandomInt(arr.length-1)];
}

function problemFooter()
{
	while (possibleAnswers.length<6)
	{
		addWrongChoice(getRandomIntRange(-10,10));
	}
	correct_answer = mathFormat(correct_answer);
	
	
	problem_footer();
}

function freeAnswerFooter()
{
	free_answer_footer();
}

function formatCoefficient(c)
{
	return format_coefficient(c);
}

function formatFirstCoefficient(c)
{
	return format_first_coefficient(c);
}

function formatConstant(c)
{
	return format_constant(c);
}

function formatFraction(n,d)
{
	return format_fraction(n,d);
}

function formatFractionWithSign(n,d)
{
	return format_fraction_with_sign(n,d);
}

function formatNotReduced(n,d)
{
	return format_not_reduced(n,d);
}

function formatNotReducedWithSign(n,d)
{
	return format_not_reduced_with_sign(n,d);
}


function arraySum(a)
{
	return array_sum(a);
}

var correctnessRegistered = false;
function handleCorrectness(isCorrect)
{
	if (!correctnessRegistered) 
	{
		// Attempt to register the correctness of the answer with the server, before telling the user 
		// whether it is correct.  This prevents the user from just reloading the page to quickly and quietly 
		// avoid blowing a streak when he gets a wrong answer.  If the attempt to register the correctness fails,
		// we don't worry about it because they might just be having connectivity problems or need to log in again.
		// That means it is still possible for a user to cheat (e.g. by logging out before clicking "Check Answer")
		// but it takes longer and is more noticeable.
		$.post("/registercorrectness", 
			{
				key: $("#key").val(),
				time_warp: $("#time_warp").val(),
				correct: ((isCorrect && tries==0 && steps_given==0) ? 1 : 0),
                hint_used: ($("#hint_used").val() == 1 ? 1 : 0)
			}); // Fire and forget, no callback.
		correctnessRegistered = true;		
	}	
	if (isCorrect)
	{
		
		if (tries==0 && steps_given==0)
		{
			document.getElementById("correct").value="1"
		}

        $("#hint_used").val(steps_given == 0 ? "0" : "1");

		$("#check-answer-results").show();
		$("#check-answer-results #nextbutton").show();
		$("#check-answer-button").hide();
		document.images.feedback.src = correct.src;
		eraseCookie(notDoneCookie);
		document.forms['answerform'].correctnextbutton.focus()
	}
	else
	{
		
		tries++;
		$("#check-answer-results").show();
		$("#check-answer-results #nextbutton").hide();
		document.images.feedback.src= incorrect.src;
	}
}

function checkFreeAnswer()
{
	var usersAnswer = parseFloatStrict(document.getElementById("answer").value);
	if (isNaN(usersAnswer)) 
	{
			window.alert("Your answer is not a number.  Please try again.");
			return;
	}
	var isCorrect = (usersAnswer==parseFloat(correctAnswer));

	handleCorrectness(isCorrect);
}

function parseFloatStrict(val)
{
    if (val)
    {
        // parseFloat never uses comma as decimal separator.
        // If we want to allow commas for other locales, we can detect and replace
        // with periods.
        // See http://stackoverflow.com/questions/2085275/what-is-the-decimal-separator-symbol-in-javascript
        var reComma = /,/g;
        val = val.replace(reComma, "");
        val = $.trim(val);

        if (!isNumericStrict(val)) return NaN;
    }

    return parseFloat(val);
}

// See http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
// for explanation of this non-regex implementation,
// and http://dl.dropbox.com/u/35146/js/tests/isNumber.html for extensive unit tests against
// this implementation.
function isNumericStrict(val)
{
    return !isNaN(parseFloat(val)) && isFinite(val);
}

function graphFooter()
{
	correct_answer = mathFormat(correct_answer);
}


function graphicalFooter()
{

	correct_answer = mathFormat(correct_answer);
	correctchoice = Math.round(KhanAcademy.random()*4.98-.49);

	//Fill in the choices
	//need to fix it so that the other choices can never be the same as the correct choice
	
	var possibleWrongIndices=randomIndices(possibleAnswers.length);
	var definiteWrongIndices=randomIndices(definiteWrongAnswers.length);
	for (var i=0; i<5; i++)
	{
		if (i==correctchoice) 
		{
			answerChoices[i]=correct_answer;
		}
		else
		{
			if (definiteWrongIndices.length>0)
			{
				answerChoices[i]='`'+definiteWrongAnswers[definiteWrongIndices.pop()]+'`';
			}
			else
			{
				answerChoices[i]='`'+possibleAnswers[possibleWrongIndices.pop()]+'`';
			}
		}

		document.write('<br><input type=\"radio\" name=\"selectAnswer\" onClick=\"select_choice('+i+')\">'+answerChoices[i]+'</input></br>');

	}

	document.write('<br><input type=\"button\" value=\"Hint\" onClick=\"give_next_step()\"><input type=\"button\" value=\"Check Answer\" onClick=\"check_answer()\"></br>');
	document.write('<br><img src=\"/images/blank.gif\" name=\"feedback\"><div id=\"nextbutton\" style=\"position:relative; visibility:hidden;\"><input type=\"button\" value=\"Correct! Next Question...\" onClick=\"new_question()\"></div></br>');
	document.write('</form></td></tr></table>');	
	document.answerform.reset();
}

function getResponseProps(response, header){
	try {
		var s = response.getResponseHeader(header || 'X-Ajax-Props');
		if (s==null || s=="")
			return new Object()
		else
			return eval("o="+s)
	} catch (e) { return new Object() }
}

KhanAcademy = {
    random: Math.random, // Initialized so that it can work before seedRandom is called.
    
    seedRandom: function(seed) {
        var mathRandom = Math.random;
        Math.seedrandom(seed);
        KhanAcademy.random = Math.random;
        Math.random = mathRandom;
    },
    
	onMathMLSupportReady: function(callbackWhenReady) {
		ASCIIMathMLTranslate = translate;
		translate = function(callback) {
			ASCIIMathMLTranslate();
			if (callback && callback.call)
				callback.call();
		};
		// Use MathJax only if the browser doesn't support MathML or
		// doesn't have reasonable fonts installed
		if (browserSupportsMathML() && browserHasUsableFont()) {
			callbackWhenReady.call();
			return;			
		}
		checkForMathML = false;
		showasciiformulaonhover = false;
		translate = function(callback) {
			var hintButton = $('#hint');
			if (hintButton) {
				hintButton.attr('disabled', 'disabled');				
			}
			ASCIIMathMLTranslate();
			function enableHintAndMakeCallback() {
				if (hintButton)
					hintButton.removeAttr('disabled');
				if (callback && callback.call)
					callback.call();
			}
			if (MathJax.isReady)
				MathJax.Hub.Queue(["Typeset",MathJax.Hub,null,enableHintAndMakeCallback]);
			else
				enableHintAndMakeCallback();
		};
		// When MathJax has finished starting up, translate the page.
		MathJax.Hub.Register.StartupHook("End", callbackWhenReady);
		
		function browserHasUsableFont() {
			var d = new Detector();
			var usableFonts = ['cmsy10',
				'STIXNonUnicode', 
				'STIXSize1', 
				'STIXGeneral', 
				'Standard Symbols L', 
				'DejaVu Sans', 
				'Cambria Math']; 
			for (var i = 0; i < usableFonts.length; i++) {
	 			if (d.test(usableFonts[i])) {
					return true;
				}		
			}
			return false;
		}
		
		function browserSupportsMathML() {
			var MathPlayer; 
			try {
				new ActiveXObject("MathPlayer.Factory.1"); 
				MathPlayer = true;
			} catch(err) {
				MathPlayer = false
			};
			return (($.browser.mozilla && versionAtLeast("1.5")) ||
                  		($.browser.msie && MathPlayer && $.browser.version != "9.0" && $.browser.version != "8.0") ||
                  		($.browser.opera && versionAtLeast("9.52")));
				
			function versionAtLeast(minVersion) {
				var actualVersion = $.browser.version.split(".");
				minVersion = minVersion.split(".");
				while (minVersion.length && actualVersion.length) {
					var minV = minVersion.shift();
					var actualV = actualVersion.shift();
					if (actualV > minV) 
						return true;
					if (actualV < minV) 
						return false;
				}
				return false;
			}
		}
	}
};

/*
ASCIIMathML.js
==============
This file contains JavaScript functions to convert ASCII math notation
to Presentation MathML. The conversion is done while the XHTML page 
loads, and should work with Firefox/Mozilla/Netscape 7+ and Internet 
Explorer 6+MathPlayer (http://www.dessci.com/en/products/mathplayer/).
This is a convenient and inexpensive solution for authoring MathML.

Version 1.4.4 Jan 6, 2005, (c) Peter Jipsen http://www.chapman.edu/~jipsen
Latest version at http://www.chapman.edu/~jipsen/mathml/ASCIIMathML.js
If you use it on a webpage, please send the URL to jipsen@chapman.edu

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or (at
your option) any later version.

This program is distributed in the hope that it will be useful, 
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
General Public License (at http://www.gnu.org/copyleft/gpl.html) 
for more details.
*/

var checkForMathML = true; // check if browser can display MathML
var notifyIfNoMathML = true; // put note at top of page if no MathML capability
var mathcolor = "";   // change it to "" (to inherit) or any other color
var mathfontfamily = "serif"; // change to "" (to inherit) or another family
var displaystyle = true;   // puts limits above and below large operators
var separatetokens = false;// if true, nonletters must separate letter tokens

var AMdelimiter1 = "`", AMescape1 = "\\\\`"; // can use other characters
var AMdelimiter2 = "$", AMescape2 = "\\\\\\$", AMdelimiter2regexp = "\\$";
var doubleblankmathdelimiter = false; // if true,  x+1  is equal to `x+1`
                                      // for IE this works only in <!--   -->
var isIE = document.createElementNS==null;

if (document.getElementById==null) 
  alert("This webpage requires a recent browser such as\
\nMozilla/Netscape 7+ or Internet Explorer 6+MathPlayer")

// all further global variables start with "AM"

function AMcreateElementXHTML(t) {
  if (isIE) return document.createElement(t);
  else return document.createElementNS("http://www.w3.org/1999/xhtml",t);
}

function AMisMathMLavailable() {
  var nd = AMcreateElementXHTML("center");
  nd.appendChild(document.createTextNode("To view the "));
  var an = AMcreateElementXHTML("a");
  an.appendChild(document.createTextNode("ASCIIMathML"));
  an.setAttribute("href","http://www.chapman.edu/~jipsen/asciimath.html");
  nd.appendChild(an);
  nd.appendChild(document.createTextNode(" notation use Internet Explorer 6+"));  
  an = AMcreateElementXHTML("a");
  an.appendChild(document.createTextNode("MathPlayer"));
  an.setAttribute("href","http://www.dessci.com/en/products/mathplayer/download.htm");
  nd.appendChild(an);
  nd.appendChild(document.createTextNode(" or Netscape/Mozilla/Firefox"));
  if (navigator.appName.slice(0,8)=="Netscape") 
    if (navigator.appVersion.slice(0,1)>="5") return null;
    else return nd;
  else if (navigator.appName.slice(0,9)=="Microsoft")
    try {
        var ActiveX = new ActiveXObject("MathPlayer.Factory.1");
        return null;
    } catch (e) {
        return nd;
    }
  else return nd;
}

// character lists for Mozilla/Netscape fonts
var AMcal = [0xEF35,0x212C,0xEF36,0xEF37,0x2130,0x2131,0xEF38,0x210B,0x2110,0xEF39,0xEF3A,0x2112,0x2133,0xEF3B,0xEF3C,0xEF3D,0xEF3E,0x211B,0xEF3F,0xEF40,0xEF41,0xEF42,0xEF43,0xEF44,0xEF45,0xEF46];
var AMfrk = [0xEF5D,0xEF5E,0x212D,0xEF5F,0xEF60,0xEF61,0xEF62,0x210C,0x2111,0xEF63,0xEF64,0xEF65,0xEF66,0xEF67,0xEF68,0xEF69,0xEF6A,0x211C,0xEF6B,0xEF6C,0xEF6D,0xEF6E,0xEF6F,0xEF70,0xEF71,0x2128];
var AMbbb = [0xEF8C,0xEF8D,0x2102,0xEF8E,0xEF8F,0xEF90,0xEF91,0x210D,0xEF92,0xEF93,0xEF94,0xEF95,0xEF96,0x2115,0xEF97,0x2119,0x211A,0x211D,0xEF98,0xEF99,0xEF9A,0xEF9B,0xEF9C,0xEF9D,0xEF9E,0x2124];

var CONST = 0, UNARY = 1, BINARY = 2, INFIX = 3, LEFTBRACKET = 4, 
    RIGHTBRACKET = 5, SPACE = 6, UNDEROVER = 7, DEFINITION = 8; // token types

var AMsqrt = {input:"sqrt", tag:"msqrt", output:"sqrt", tex:null, ttype:UNARY},
  AMroot  = {input:"root", tag:"mroot", output:"root", tex:null, ttype:BINARY},
  AMfrac  = {input:"frac", tag:"mfrac", output:"/",    tex:null, ttype:BINARY},
  AMdiv   = {input:"/",    tag:"mfrac", output:"/",    tex:null, ttype:INFIX},
  AMover  = {input:"stackrel", tag:"mover", output:"stackrel", tex:null, ttype:BINARY},
  AMsub   = {input:"_",    tag:"msub",  output:"_",    tex:null, ttype:INFIX},
  AMsup   = {input:"^",    tag:"msup",  output:"^",    tex:null, ttype:INFIX},
  AMtext  = {input:"text", tag:"mtext", output:"text", tex:null, ttype:UNARY},
  AMmbox  = {input:"mbox", tag:"mtext", output:"mbox", tex:null, ttype:UNARY},
  AMquote = {input:"\"",   tag:"mtext", output:"mbox", tex:null, ttype:UNARY};

var AMsymbols = [
//some greek symbols
{input:"alpha",  tag:"mi", output:"\u03B1", tex:null, ttype:CONST},
{input:"beta",   tag:"mi", output:"\u03B2", tex:null, ttype:CONST},
{input:"chi",    tag:"mi", output:"\u03C7", tex:null, ttype:CONST},
{input:"delta",  tag:"mi", output:"\u03B4", tex:null, ttype:CONST},
{input:"Delta",  tag:"mo", output:"\u0394", tex:null, ttype:CONST},
{input:"epsi",   tag:"mi", output:"\u03B5", tex:"epsilon", ttype:CONST},
{input:"varepsilon", tag:"mi", output:"\u025B", tex:null, ttype:CONST},
{input:"eta",    tag:"mi", output:"\u03B7", tex:null, ttype:CONST},
{input:"gamma",  tag:"mi", output:"\u03B3", tex:null, ttype:CONST},
{input:"Gamma",  tag:"mo", output:"\u0393", tex:null, ttype:CONST},
{input:"iota",   tag:"mi", output:"\u03B9", tex:null, ttype:CONST},
{input:"kappa",  tag:"mi", output:"\u03BA", tex:null, ttype:CONST},
{input:"lambda", tag:"mi", output:"\u03BB", tex:null, ttype:CONST},
{input:"Lambda", tag:"mo", output:"\u039B", tex:null, ttype:CONST},
{input:"mu",     tag:"mi", output:"\u03BC", tex:null, ttype:CONST},
{input:"nu",     tag:"mi", output:"\u03BD", tex:null, ttype:CONST},
{input:"omega",  tag:"mi", output:"\u03C9", tex:null, ttype:CONST},
{input:"Omega",  tag:"mo", output:"\u03A9", tex:null, ttype:CONST},
{input:"phi",    tag:"mi", output:"\u03C6", tex:null, ttype:CONST},
{input:"varphi", tag:"mi", output:"\u03D5", tex:null, ttype:CONST},
{input:"Phi",    tag:"mo", output:"\u03A6", tex:null, ttype:CONST},
{input:"pi",     tag:"mi", output:"\u03C0", tex:null, ttype:CONST},
{input:"Pi",     tag:"mo", output:"\u03A0", tex:null, ttype:CONST},
{input:"psi",    tag:"mi", output:"\u03C8", tex:null, ttype:CONST},
{input:"rho",    tag:"mi", output:"\u03C1", tex:null, ttype:CONST},
{input:"sigma",  tag:"mi", output:"\u03C3", tex:null, ttype:CONST},
{input:"Sigma",  tag:"mo", output:"\u03A3", tex:null, ttype:CONST},
{input:"tau",    tag:"mi", output:"\u03C4", tex:null, ttype:CONST},
{input:"theta",  tag:"mi", output:"\u03B8", tex:null, ttype:CONST},
{input:"vartheta", tag:"mi", output:"\u03D1", tex:null, ttype:CONST},
{input:"Theta",  tag:"mo", output:"\u0398", tex:null, ttype:CONST},
{input:"upsilon", tag:"mi", output:"\u03C5", tex:null, ttype:CONST},
{input:"xi",     tag:"mi", output:"\u03BE", tex:null, ttype:CONST},
{input:"Xi",     tag:"mo", output:"\u039E", tex:null, ttype:CONST},
{input:"zeta",   tag:"mi", output:"\u03B6", tex:null, ttype:CONST},

//binary operation symbols
{input:"*",  tag:"mo", output:"\u22C5", tex:"cdot", ttype:CONST},
{input:"**", tag:"mo", output:"\u22C6", tex:"star", ttype:CONST},
{input:"//", tag:"mo", output:"/",      tex:null, ttype:CONST},
{input:"\\\\", tag:"mo", output:"\\",   tex:"backslash", ttype:CONST},
{input:"setminus", tag:"mo", output:"\\",   tex:null, ttype:CONST},
{input:"xx", tag:"mo", output:"\u00D7", tex:"times", ttype:CONST},
{input:"-:", tag:"mo", output:"\u00F7", tex:"divide", ttype:CONST},
{input:"@",  tag:"mo", output:"\u2218", tex:"circ", ttype:CONST},
{input:"o+", tag:"mo", output:"\u2295", tex:"oplus", ttype:CONST},
{input:"ox", tag:"mo", output:"\u2297", tex:"otimes", ttype:CONST},
{input:"o.", tag:"mo", output:"\u2299", tex:"odot", ttype:CONST},
{input:"sum", tag:"mo", output:"\u2211", tex:null, ttype:UNDEROVER},
{input:"prod", tag:"mo", output:"\u220F", tex:null, ttype:UNDEROVER},
{input:"^^",  tag:"mo", output:"\u2227", tex:"wedge", ttype:CONST},
{input:"^^^", tag:"mo", output:"\u22C0", tex:"bigwedge", ttype:UNDEROVER},
{input:"vv",  tag:"mo", output:"\u2228", tex:"vee", ttype:CONST},
{input:"vvv", tag:"mo", output:"\u22C1", tex:"bigvee", ttype:UNDEROVER},
{input:"nn",  tag:"mo", output:"\u2229", tex:"cap", ttype:CONST},
{input:"nnn", tag:"mo", output:"\u22C2", tex:"bigcap", ttype:UNDEROVER},
{input:"uu",  tag:"mo", output:"\u222A", tex:"cup", ttype:CONST},
{input:"uuu", tag:"mo", output:"\u22C3", tex:"bigcup", ttype:UNDEROVER},

//binary relation symbols
{input:"!=",  tag:"mo", output:"\u2260", tex:"ne", ttype:CONST},
{input:":=",  tag:"mo", output:":=",     tex:null, ttype:CONST},
{input:"lt",  tag:"mo", output:"<",      tex:null, ttype:CONST},
{input:"<=",  tag:"mo", output:"\u2264", tex:"le", ttype:CONST},
{input:"lt=", tag:"mo", output:"\u2264", tex:"leq", ttype:CONST},
{input:">=",  tag:"mo", output:"\u2265", tex:"ge", ttype:CONST},
{input:"geq", tag:"mo", output:"\u2265", tex:null, ttype:CONST},
{input:"-<",  tag:"mo", output:"\u227A", tex:"prec", ttype:CONST},
{input:"-lt", tag:"mo", output:"\u227A", tex:null, ttype:CONST},
{input:">-",  tag:"mo", output:"\u227B", tex:"succ", ttype:CONST},
{input:"in",  tag:"mo", output:"\u2208", tex:null, ttype:CONST},
{input:"!in", tag:"mo", output:"\u2209", tex:"notin", ttype:CONST},
{input:"sub", tag:"mo", output:"\u2282", tex:"subset", ttype:CONST},
{input:"sup", tag:"mo", output:"\u2283", tex:"supset", ttype:CONST},
{input:"sube", tag:"mo", output:"\u2286", tex:"subseteq", ttype:CONST},
{input:"supe", tag:"mo", output:"\u2287", tex:"supseteq", ttype:CONST},
{input:"-=",  tag:"mo", output:"\u2261", tex:"equiv", ttype:CONST},
{input:"~=",  tag:"mo", output:"\u2245", tex:"cong", ttype:CONST},
{input:"~~",  tag:"mo", output:"\u2248", tex:"approx", ttype:CONST},
{input:"prop", tag:"mo", output:"\u221D", tex:"propto", ttype:CONST},

//logical symbols
{input:"and", tag:"mtext", output:"and", tex:null, ttype:SPACE},
{input:"or",  tag:"mtext", output:"or",  tex:null, ttype:SPACE},
{input:"not", tag:"mo", output:"\u00AC", tex:"neg", ttype:CONST},
{input:"=>",  tag:"mo", output:"\u21D2", tex:"implies", ttype:CONST},
{input:"if",  tag:"mo", output:"if",     tex:null, ttype:SPACE},
{input:"<=>", tag:"mo", output:"\u21D4", tex:"iff", ttype:CONST},
{input:"AA",  tag:"mo", output:"\u2200", tex:"forall", ttype:CONST},
{input:"EE",  tag:"mo", output:"\u2203", tex:"exists", ttype:CONST},
{input:"_|_", tag:"mo", output:"\u22A5", tex:"bot", ttype:CONST},
{input:"TT",  tag:"mo", output:"\u22A4", tex:"top", ttype:CONST},
{input:"|-",  tag:"mo", output:"\u22A2", tex:"vdash", ttype:CONST},
{input:"|=",  tag:"mo", output:"\u22A8", tex:"models", ttype:CONST},

//grouping brackets
{input:"(", tag:"mo", output:"(", tex:null, ttype:LEFTBRACKET},
{input:")", tag:"mo", output:")", tex:null, ttype:RIGHTBRACKET},
{input:"[", tag:"mo", output:"[", tex:null, ttype:LEFTBRACKET},
{input:"]", tag:"mo", output:"]", tex:null, ttype:RIGHTBRACKET},
{input:"{", tag:"mo", output:"{", tex:null, ttype:LEFTBRACKET},
{input:"}", tag:"mo", output:"}", tex:null, ttype:RIGHTBRACKET},
{input:"(:", tag:"mo", output:"\u2329", tex:"langle", ttype:LEFTBRACKET},
{input:":)", tag:"mo", output:"\u232A", tex:"rangle", ttype:RIGHTBRACKET},
{input:"<<", tag:"mo", output:"\u2329", tex:null, ttype:LEFTBRACKET},
{input:">>", tag:"mo", output:"\u232A", tex:null, ttype:RIGHTBRACKET},
{input:"{:", tag:"mo", output:"{:", tex:null, ttype:LEFTBRACKET, invisible:true},
{input:":}", tag:"mo", output:":}", tex:null, ttype:RIGHTBRACKET, invisible:true},

//miscellaneous symbols
{input:"int",  tag:"mo", output:"\u222B", tex:null, ttype:CONST},
{input:"dx",   tag:"mi", output:"{:d x:}", tex:null, ttype:DEFINITION},
{input:"dy",   tag:"mi", output:"{:d y:}", tex:null, ttype:DEFINITION},
{input:"dz",   tag:"mi", output:"{:d z:}", tex:null, ttype:DEFINITION},
{input:"dt",   tag:"mi", output:"{:d t:}", tex:null, ttype:DEFINITION},
{input:"oint", tag:"mo", output:"\u222E", tex:null, ttype:CONST},
{input:"del",  tag:"mo", output:"\u2202", tex:"partial", ttype:CONST},
{input:"grad", tag:"mo", output:"\u2207", tex:"nabla", ttype:CONST},
{input:"+-",   tag:"mo", output:"\u00B1", tex:"pm", ttype:CONST},
{input:"O/",   tag:"mo", output:"\u2205", tex:"emptyset", ttype:CONST},
{input:"oo",   tag:"mo", output:"\u221E", tex:"infty", ttype:CONST},
{input:"aleph", tag:"mo", output:"\u2135", tex:null, ttype:CONST},
{input:"...",  tag:"mo", output:"...",    tex:"ldots", ttype:CONST},
{input:"\\ ",  tag:"mo", output:"\u00A0", tex:null, ttype:CONST},
{input:"quad", tag:"mo", output:"\u00A0\u00A0", tex:null, ttype:CONST},
{input:"qquad", tag:"mo", output:"\u00A0\u00A0\u00A0\u00A0", tex:null, ttype:CONST},
{input:"cdots", tag:"mo", output:"\u22EF", tex:null, ttype:CONST},
{input:"vdots", tag:"mo", output:"\u22EE", tex:null, ttype:CONST},
{input:"ddots", tag:"mo", output:"\u22F1", tex:null, ttype:CONST},
{input:"diamond", tag:"mo", output:"\u22C4", tex:null, ttype:CONST},
{input:"square", tag:"mo", output:"\u25A1", tex:null, ttype:CONST},
{input:"|_", tag:"mo", output:"\u230A",  tex:"lfloor", ttype:CONST},
{input:"_|", tag:"mo", output:"\u230B",  tex:"rfloor", ttype:CONST},
{input:"|~", tag:"mo", output:"\u2308",  tex:"lceiling", ttype:CONST},
{input:"~|", tag:"mo", output:"\u2309",  tex:"rceiling", ttype:CONST},
{input:"CC",  tag:"mo", output:"\u2102", tex:null, ttype:CONST},
{input:"NN",  tag:"mo", output:"\u2115", tex:null, ttype:CONST},
{input:"QQ",  tag:"mo", output:"\u211A", tex:null, ttype:CONST},
{input:"RR",  tag:"mo", output:"\u211D", tex:null, ttype:CONST},
{input:"ZZ",  tag:"mo", output:"\u2124", tex:null, ttype:CONST},

//standard functions
{input:"lim",  tag:"mo", output:"lim", tex:null, ttype:UNDEROVER},
{input:"Lim",  tag:"mo", output:"Lim", tex:null, ttype:UNDEROVER},
{input:"sin",  tag:"mo", output:"sin", tex:null, ttype:CONST},
{input:"cos",  tag:"mo", output:"cos", tex:null, ttype:CONST},
{input:"tan",  tag:"mo", output:"tan", tex:null, ttype:CONST},
{input:"sinh", tag:"mo", output:"sinh", tex:null, ttype:CONST},
{input:"cosh", tag:"mo", output:"cosh", tex:null, ttype:CONST},
{input:"tanh", tag:"mo", output:"tanh", tex:null, ttype:CONST},
{input:"cot",  tag:"mo", output:"cot", tex:null, ttype:CONST},
{input:"sec",  tag:"mo", output:"sec", tex:null, ttype:CONST},
{input:"csc",  tag:"mo", output:"csc", tex:null, ttype:CONST},
{input:"log",  tag:"mo", output:"log", tex:null, ttype:CONST},
{input:"ln",   tag:"mo", output:"ln",  tex:null, ttype:CONST},
{input:"det",  tag:"mo", output:"det", tex:null, ttype:CONST},
{input:"dim",  tag:"mo", output:"dim", tex:null, ttype:CONST},
{input:"mod",  tag:"mo", output:"mod", tex:null, ttype:CONST},
{input:"gcd",  tag:"mo", output:"gcd", tex:null, ttype:CONST},
{input:"lcm",  tag:"mo", output:"lcm", tex:null, ttype:CONST},
{input:"lub",  tag:"mo", output:"lub", tex:null, ttype:CONST},
{input:"glb",  tag:"mo", output:"glb", tex:null, ttype:CONST},
{input:"min",  tag:"mo", output:"min", tex:null, ttype:UNDEROVER},
{input:"max",  tag:"mo", output:"max", tex:null, ttype:UNDEROVER},

//arrows
{input:"uarr", tag:"mo", output:"\u2191", tex:"uparrow", ttype:CONST},
{input:"darr", tag:"mo", output:"\u2193", tex:"downarrow", ttype:CONST},
{input:"rarr", tag:"mo", output:"\u2192", tex:"rightarrow", ttype:CONST},
{input:"->",   tag:"mo", output:"\u2192", tex:"to", ttype:CONST},
{input:"|->",  tag:"mo", output:"\u21A6", tex:"mapsto", ttype:CONST},
{input:"larr", tag:"mo", output:"\u2190", tex:"leftarrow", ttype:CONST},
{input:"harr", tag:"mo", output:"\u2194", tex:"leftrightarrow", ttype:CONST},
{input:"rArr", tag:"mo", output:"\u21D2", tex:"Rightarrow", ttype:CONST},
{input:"lArr", tag:"mo", output:"\u21D0", tex:"Leftarrow", ttype:CONST},
{input:"hArr", tag:"mo", output:"\u21D4", tex:"Leftrightarrow", ttype:CONST},

//commands with argument
AMsqrt, AMroot, AMfrac, AMdiv, AMover, AMsub, AMsup,
{input:"hat", tag:"mover", output:"\u005E", tex:null, ttype:UNARY, acc:true},
{input:"bar", tag:"mover", output:"\u00AF", tex:"overline", ttype:UNARY, acc:true},
{input:"vec", tag:"mover", output:"\u2192", tex:null, ttype:UNARY, acc:true},
{input:"dot", tag:"mover", output:".",      tex:null, ttype:UNARY, acc:true},
{input:"ddot", tag:"mover", output:"..",    tex:null, ttype:UNARY, acc:true},
{input:"ul", tag:"munder", output:"\u0332", tex:"underline", ttype:UNARY, acc:true},
AMtext, AMmbox, AMquote,
{input:"bb", tag:"mstyle", atname:"fontweight", atval:"bold", output:"bb", tex:null, ttype:UNARY},
{input:"mathbf", tag:"mstyle", atname:"fontweight", atval:"bold", output:"mathbf", tex:null, ttype:UNARY},
{input:"sf", tag:"mstyle", atname:"fontfamily", atval:"sans-serif", output:"sf", tex:null, ttype:UNARY},
{input:"mathsf", tag:"mstyle", atname:"fontfamily", atval:"sans-serif", output:"mathsf", tex:null, ttype:UNARY},
{input:"bbb", tag:"mstyle", atname:"mathvariant", atval:"double-struck", output:"bbb", tex:null, ttype:UNARY, codes:AMbbb},
{input:"mathbb", tag:"mstyle", atname:"mathvariant", atval:"double-struck", output:"mathbb", tex:null, ttype:UNARY, codes:AMbbb},
{input:"cc",  tag:"mstyle", atname:"mathvariant", atval:"script", output:"cc", tex:null, ttype:UNARY, codes:AMcal},
{input:"mathcal", tag:"mstyle", atname:"mathvariant", atval:"script", output:"mathcal", tex:null, ttype:UNARY, codes:AMcal},
{input:"tt",  tag:"mstyle", atname:"fontfamily", atval:"monospace", output:"tt", tex:null, ttype:UNARY},
{input:"mathtt", tag:"mstyle", atname:"fontfamily", atval:"monospace", output:"mathtt", tex:null, ttype:UNARY},
{input:"fr",  tag:"mstyle", atname:"mathvariant", atval:"fraktur", output:"fr", tex:null, ttype:UNARY, codes:AMfrk},
{input:"mathfrak",  tag:"mstyle", atname:"mathvariant", atval:"fraktur", output:"mathfrak", tex:null, ttype:UNARY, codes:AMfrk}
];

function compareNames(s1,s2) {
  if (s1.input > s2.input) return 1
  else return -1;
}

var AMnames = []; //list of input symbols

function AMinitSymbols() {
  var texsymbols = [], i;
  for (i=0; i<AMsymbols.length; i++)
    if (AMsymbols[i].tex) 
      texsymbols[texsymbols.length] = {input:AMsymbols[i].tex, 
        tag:AMsymbols[i].tag, output:AMsymbols[i].output, ttype:AMsymbols[i].ttype};
  AMsymbols = AMsymbols.concat(texsymbols);
  AMsymbols.sort(compareNames);
  for (i=0; i<AMsymbols.length; i++) AMnames[i] = AMsymbols[i].input;
}

var AMmathml = "http://www.w3.org/1998/Math/MathML";

function AMcreateElementMathML(t) {
  if (isIE) return document.createElement("mml:"+t);
  else return document.createElementNS(AMmathml,t);
}

function AMcreateMmlNode(name,frag) {
  var node = AMcreateElementMathML(name);
  node.appendChild(frag);
  return node;
}

function AMremoveCharsAndBlanks(str,n) {
//remove n characters and any following blanks
  var st;
  if (str.charAt(n)=="\\" && str.charAt(n+1)!="\\" && str.charAt(n+1)!=" ") 
    st = str.slice(n+1);
  else st = str.slice(n);
  for (var i=0; i<st.length && st.charCodeAt(i)<=32; i=i+1);
  return st.slice(i);
}

function AMposition(arr, str, n) { 
// return position >=n where str appears or would be inserted
// assumes arr is sorted
  if (n==0) {
    var h,m;
    n = -1;
    h = arr.length;
    while (n+1<h) {
      m = (n+h) >> 1;
      if (arr[m]<str) n = m; else h = m;
    }
    return h;
  } else
    for (var i=n; i<arr.length && arr[i]<str; i++);
  return i; // i=arr.length || arr[i]>=str
}

var AMseparated = true;

function AMgetSymbol(str) {
//return maximal initial substring of str that appears in names
//return null if there is none
  var k = 0; //new pos
  var j = 0; //old pos
  var mk; //match pos
  var st;
  var tagst;
  var match = "";
  var more = true;
  for (var i=1; i<=str.length && more; i++) {
    st = str.slice(0,i); //initial substring of length i
    j = k;
    k = AMposition(AMnames, st, j);
    if (k<AMnames.length && str.slice(0,AMnames[k].length)==AMnames[k]){
      match = AMnames[k];
      mk = k;
      i = match.length;
    }
    more = k<AMnames.length && str.slice(0,AMnames[k].length)>=AMnames[k];
  }
  if (match!="")
    if (separatetokens) {
      i = match.length;
      if ("a">str.charAt(0) || str.charAt(0)>"z" || 
        "a">str.charAt(i-1) || str.charAt(i-1)>"z") {
        AMseparated = true;
        return AMsymbols[mk];
      }
      st = str.charAt(i);
      AMseparated = AMseparated && ("a">st || st>"z");
      if (AMseparated) return AMsymbols[mk];
    } else return AMsymbols[mk]; 
// if str[0] is a digit or - return maxsubstring of digits.digits
  k = 1;
  st = str.slice(0,1);
  var pos = true;
  var integ = true;
  if (st == "-") {
    pos = false;
    st = str.slice(k,k+1);
    k++;
  }
  while ("0"<=st && st<="9" && k<=str.length) {
    st = str.slice(k,k+1);
    k++;
  }
  if (st == ".") {
    integ = false;
    st = str.slice(k,k+1);
    k++;
    while ("0"<=st && st<="9" && k<=str.length) {
      st = str.slice(k,k+1);
      k++;
    }
  }
  if ((pos && integ && k>1) || ((pos || integ) && k>2) || k>3) {
    st = str.slice(0,k-1);
    tagst = "mn";
    AMseparated = true;
  } else {
    k = 2;
    st = str.slice(0,1); //take 1 character
    AMseparated = ("A">st || st>"Z") && ("a">st || st>"z");
    tagst = (AMseparated?"mo":"mi");
    AMseparated = AMseparated || str.charAt(1)<"a" || str.charAt(1)>"z";
  }
  return {input:str.slice(0,k-1), tag:tagst, output:st, ttype:CONST};
}

function AMremoveBrackets(node) {
  var st;
  if (node.nodeName=="mrow") {
    st = node.firstChild.firstChild.nodeValue;
    if (st=="(" || st=="[" || st=="{") node.removeChild(node.firstChild);
  }
  if (node.nodeName=="mrow") {
    st = node.lastChild.firstChild.nodeValue;
    if (st==")" || st=="]" || st=="}") node.removeChild(node.lastChild);
  }
}

/*Parsing ASCII math expressions with the following grammar
V ::= [A-Za-z] | greek letters | numbers | other constant symbols
U ::= sqrt | text | bb | other unary symbols for font commands
B ::= frac | root | stackrel         binary symbols
L ::= ( | [ | { | (: | {:            left brackets
R ::= ) | ] | } | :) | :}            right brackets
S ::= V | LER | US | BSS             simple expression
E ::= SE | S/S | S_S | S^S | S_S^S   expression
Each terminal symbol is translated into a corresponding mathml node.*/

var AMnestingDepth;

function AMparseSexpr(str) { //parses str and returns [node,tailstr]
  var symbol, node, result, i, st, newFrag = document.createDocumentFragment();
  str = AMremoveCharsAndBlanks(str,0);
  symbol = AMgetSymbol(str);             //either a token or a bracket or empty
  if (symbol == null || symbol.ttype == RIGHTBRACKET && AMnestingDepth > 0)
    return [null,str];
  if (symbol.ttype == DEFINITION) {
    str = symbol.output+AMremoveCharsAndBlanks(str,symbol.input.length); 
    symbol = AMgetSymbol(str);
  }
  switch (symbol.ttype) {
  case UNDEROVER:
  case CONST:
    str = AMremoveCharsAndBlanks(str,symbol.input.length); 
    if (symbol.tag=="mn" && symbol.output.charAt(0)=="-") {
      node = AMcreateMmlNode("mo",document.createTextNode("-"));
      node = AMcreateMmlNode("mrow",node);
      node.appendChild(AMcreateMmlNode(symbol.tag,        //its a constant
                             document.createTextNode(symbol.output.slice(1))));
      return [node,str];
    } else
    return [AMcreateMmlNode(symbol.tag,        //its a constant
                             document.createTextNode(symbol.output)),str];
  case LEFTBRACKET:   //read (expr+)
    AMnestingDepth++;
    str = AMremoveCharsAndBlanks(str,symbol.input.length); 
    result = AMparseExpr(str);
    if (typeof symbol.invisible == "boolean" && symbol.invisible) 
      node = AMcreateMmlNode("mrow",result[0]);
    else {
      node = AMcreateMmlNode("mo",document.createTextNode(symbol.output));
      node = AMcreateMmlNode("mrow",node);
      node.appendChild(result[0]);
    }
    return [node,result[1]];
  case UNARY:
    if (symbol == AMtext || symbol == AMmbox || symbol == AMquote) {
      if (symbol!=AMquote) str = AMremoveCharsAndBlanks(str,symbol.input.length);
      if (str.charAt(0)=="{") i=str.indexOf("}");
      else if (str.charAt(0)=="(") i=str.indexOf(")");
      else if (str.charAt(0)=="[") i=str.indexOf("]");
      else if (symbol==AMquote) i=str.slice(1).indexOf("\"")+1;
      else i = 0;
      if (i==-1) i = str.length;
      st = str.slice(1,i);
      if (st.charAt(0) == " ") {
        node = AMcreateElementMathML("mspace");
        node.setAttribute("width","1ex");
        newFrag.appendChild(node);
      }
      newFrag.appendChild(
        AMcreateMmlNode(symbol.tag,document.createTextNode(st)));
      if (st.charAt(st.length-1) == " ") {
        node = AMcreateElementMathML("mspace");
        node.setAttribute("width","1ex");
        newFrag.appendChild(node);
      }
      str = AMremoveCharsAndBlanks(str,i+1);
      return [AMcreateMmlNode("mrow",newFrag),str];
    } else {
      str = AMremoveCharsAndBlanks(str,symbol.input.length); 
      result = AMparseSexpr(str);
      if (result[0]==null) return [AMcreateMmlNode("mo",
                             document.createTextNode(symbol.input)),str];
      AMremoveBrackets(result[0]);
      if (symbol == AMsqrt) {           // sqrt
        return [AMcreateMmlNode(symbol.tag,result[0]),result[1]];
      } else if (typeof symbol.acc == "boolean" && symbol.acc) {   // accent
        node = AMcreateMmlNode(symbol.tag,result[0]);
        node.appendChild(AMcreateMmlNode("mo",document.createTextNode(symbol.output)));
        return [node,result[1]];
      } else {                        // font change command
        if (!isIE && typeof symbol.codes != "undefined") {
          for (i=0; i<result[0].childNodes.length; i++)
            if (result[0].childNodes[i].nodeName=="mi" || result[0].nodeName=="mi") {
              st = (result[0].nodeName=="mi"?result[0].firstChild.nodeValue:
                              result[0].childNodes[i].firstChild.nodeValue);
              var newst = [];
              for (var j=0; j<st.length; j++)
                if (st.charCodeAt(j)>64 && st.charCodeAt(j)<91) newst = newst +
                  String.fromCharCode(symbol.codes[st.charCodeAt(j)-65]);
                else newst = newst + st.charAt(j);
              if (result[0].nodeName=="mi")
                result[0]=AMcreateElementMathML("mo").
                          appendChild(document.createTextNode(newst));
              else result[0].replaceChild(AMcreateElementMathML("mo").
          appendChild(document.createTextNode(newst)),result[0].childNodes[i]);
            }
        }
        node = AMcreateMmlNode(symbol.tag,result[0]);
        node.setAttribute(symbol.atname,symbol.atval);
        return [node,result[1]];
      }
    }
  case BINARY:
    str = AMremoveCharsAndBlanks(str,symbol.input.length); 
    result = AMparseSexpr(str);
    if (result[0]==null) return [AMcreateMmlNode("mo",
                           document.createTextNode(symbol.input)),str];
    AMremoveBrackets(result[0]);
    var result2 = AMparseSexpr(result[1]);
    if (result2[0]==null) return [AMcreateMmlNode("mo",
                           document.createTextNode(symbol.input)),str];
    AMremoveBrackets(result2[0]);
    if (symbol==AMroot || symbol==AMover) newFrag.appendChild(result2[0]);
    newFrag.appendChild(result[0]);
    if (symbol==AMfrac) newFrag.appendChild(result2[0]);
    return [AMcreateMmlNode(symbol.tag,newFrag),result2[1]];
  case INFIX:
    str = AMremoveCharsAndBlanks(str,symbol.input.length); 
    return [AMcreateMmlNode("mo",document.createTextNode(symbol.output)),str];
  case SPACE:
    str = AMremoveCharsAndBlanks(str,symbol.input.length); 
    node = AMcreateElementMathML("mspace");
    node.setAttribute("width","1ex");
    newFrag.appendChild(node);
    newFrag.appendChild(
      AMcreateMmlNode(symbol.tag,document.createTextNode(symbol.output)));
    node = AMcreateElementMathML("mspace");
    node.setAttribute("width","1ex");
    newFrag.appendChild(node);
    return [AMcreateMmlNode("mrow",newFrag),str];
  default:
    str = AMremoveCharsAndBlanks(str,symbol.input.length); 
    return [AMcreateMmlNode(symbol.tag,        //its a constant
                             document.createTextNode(symbol.output)),str];
  }
}

function AMparseExpr(str) {
  var symbol, sym1, sym2, node, result, i, underover, nodeList = [],
  newFrag = document.createDocumentFragment();
  do {
    str = AMremoveCharsAndBlanks(str,0);
    sym1 = AMgetSymbol(str);
    result = AMparseSexpr(str);
    node = result[0];
    str = result[1];
    symbol = AMgetSymbol(str);
    if (symbol.ttype == INFIX) {
      str = AMremoveCharsAndBlanks(str,symbol.input.length);
      result = AMparseSexpr(str);
      if (result[0] == null)
        result[0] = AMcreateMmlNode("mo",document.createTextNode("\u25A1"));
      else AMremoveBrackets(result[0]);
      str = result[1];
      if (symbol == AMdiv) AMremoveBrackets(node);
      if (symbol == AMsub) {
        sym2 = AMgetSymbol(str);
        underover = (sym1.ttype == UNDEROVER);
        if (sym2 == AMsup) {
          str = AMremoveCharsAndBlanks(str,sym2.input.length);
          var res2 = AMparseSexpr(str);
          AMremoveBrackets(res2[0]);
          str = res2[1];
          node = AMcreateMmlNode((underover?"munderover":"msubsup"),node);
          node.appendChild(result[0]);
          node.appendChild(res2[0]);
          node = AMcreateMmlNode("mrow",node); // so sum does not stretch
        } else {
          node = AMcreateMmlNode((underover?"munder":"msub"),node);
          node.appendChild(result[0]);
        }
      } else {
        node = AMcreateMmlNode(symbol.tag,node);
        node.appendChild(result[0]);
      }
      newFrag.appendChild(node);
    } 
    else if (node!=undefined) newFrag.appendChild(node);
  } while ((symbol.ttype != RIGHTBRACKET || AMnestingDepth == 0) && 
           symbol!=null && symbol.output!="");
  if (symbol.ttype == RIGHTBRACKET) {
    if (AMnestingDepth > 0) AMnestingDepth--;
    var len = newFrag.childNodes.length;
    if (len>0 && newFrag.childNodes[len-1].nodeName == "mrow" && len>1 &&
      newFrag.childNodes[len-2].nodeName == "mo" &&
      newFrag.childNodes[len-2].firstChild.nodeValue == ",") { //matrix
      var right = newFrag.childNodes[len-1].lastChild.firstChild.nodeValue;
      if (right==")" || right=="]") {
        var left = newFrag.childNodes[len-1].firstChild.firstChild.nodeValue;
        if (left=="(" && right==")" && symbol.output != "}" || 
            left=="[" && right=="]") {
        var pos = []; // positions of commas
        var matrix = true;
        var m = newFrag.childNodes.length;
        for (i=0; matrix && i<m; i=i+2) {
          pos[i] = [];
          node = newFrag.childNodes[i];
          if (matrix) matrix = node.nodeName=="mrow" && 
            (i==m-1 || node.nextSibling.nodeName=="mo" && 
            node.nextSibling.firstChild.nodeValue==",")&&
            node.firstChild.firstChild.nodeValue==left &&
            node.lastChild.firstChild.nodeValue==right;
          if (matrix) 
            for (var j=0; j<node.childNodes.length; j++)
              if (node.childNodes[j].firstChild.nodeValue==",")
                pos[i][pos[i].length]=j;
          if (matrix && i>1) matrix = pos[i].length == pos[i-2].length;
        }
        if (matrix) {
          var row, frag, n, k, table = document.createDocumentFragment();
          for (i=0; i<m; i=i+2) {
            row = document.createDocumentFragment();
            frag = document.createDocumentFragment();
            node = newFrag.firstChild; // <mrow>(-,-,...,-,-)</mrow>
            n = node.childNodes.length;
            k = 0;
            node.removeChild(node.firstChild); //remove (
            for (j=1; j<n-1; j++) {
              if (typeof pos[i][k] != "undefined" && j==pos[i][k]){
                node.removeChild(node.firstChild); //remove ,
                row.appendChild(AMcreateMmlNode("mtd",frag));
                k++;
              } else frag.appendChild(node.firstChild);
            }
            row.appendChild(AMcreateMmlNode("mtd",frag));
            if (newFrag.childNodes.length>2) {
              newFrag.removeChild(newFrag.firstChild); //remove <mrow>)</mrow>
              newFrag.removeChild(newFrag.firstChild); //remove <mo>,</mo>
            }
            table.appendChild(AMcreateMmlNode("mtr",row));
          }
          node = AMcreateMmlNode("mtable",table);
          if (typeof symbol.invisible == "boolean" && symbol.invisible) node.setAttribute("columnalign","left");
          newFrag.replaceChild(node,newFrag.firstChild);
        }
       }
      }
    }
    str = AMremoveCharsAndBlanks(str,symbol.input.length);
    if (typeof symbol.invisible != "boolean" || !symbol.invisible) {
      node = AMcreateMmlNode("mo",document.createTextNode(symbol.output));
      newFrag.appendChild(node);
    }
  }
  return [newFrag,str];
}

function AMparseMath(str) {
  var result, node = AMcreateElementMathML("mstyle");
  if (mathcolor != "") node.setAttribute("mathcolor",mathcolor);
  if (displaystyle) node.setAttribute("displaystyle","true");
  if (mathfontfamily != "") node.setAttribute("fontfamily",mathfontfamily);
  AMnestingDepth = 0;
  node.appendChild(AMparseExpr(str.replace(/^\s+/g,""))[0]);
  node = AMcreateMmlNode("math",node);
  if (mathfontfamily != "") {
    var fnode = AMcreateElementXHTML("font");
    fnode.setAttribute("face",mathfontfamily);
    fnode.appendChild(node);
    return fnode;
  }
  return node;
}

function AMstrarr2docFrag(arr, linebreaks) {
  var newFrag=document.createDocumentFragment();
  var expr = false;
  for (var i=0; i<arr.length; i++) {
    if (expr) newFrag.appendChild(AMparseMath(arr[i]));
    else {
      var arri = (linebreaks ? arr[i].split("\n\n") : [arr[i]]);
      newFrag.appendChild(AMcreateElementXHTML("span").
      appendChild(document.createTextNode(arri[0].
      replace(/AMescape2/g,AMdelimiter2).replace(/AMescape1/g,AMdelimiter1))));
      for (var j=1; j<arri.length; j++) {
        newFrag.appendChild(AMcreateElementXHTML("p"));
        newFrag.appendChild(AMcreateElementXHTML("span").
        appendChild(document.createTextNode(arri[j].
          replace(/AMescape2/g,AMdelimiter2).
          replace(/AMescape1/g,AMdelimiter1))));
      }
    }
    expr = !expr;
  }
  return newFrag;
}

function AMprocessNode(n, linebreaks) {
  var mtch, str, arr;
  if (n.childNodes.length == 0 && (n.nodeType!=8 || linebreaks) &&
    n.parentNode.nodeName!="textarea" && n.parentNode.nodeName!="TEXTAREA" &&
    n.parentNode.nodeName!="pre" && n.parentNode.nodeName!="PRE" &&
    n.parentNode.nodeName!="script" && n.parentNode.nodeName!="SCRIPT") {
    str = n.nodeValue;
    if (!(str == null)) {
      str = str.replace(/\r\n\r\n/g,"\n\n");
      if (doubleblankmathdelimiter) {
        str = str.replace(/\x20\x20\./g," "+AMdelimiter1+".");
        str = str.replace(/\x20\x20,/g," "+AMdelimiter1+",");
        str = str.replace(/\x20\x20/g," "+AMdelimiter1+" ");
      }
      str = str.replace(/\x20+/g," ");
      str = str.replace(/\s*\r\n/g," ");
      mtch = false;
      str = str.replace(new RegExp(AMescape2, "g"),
              function(st){mtch=true;return "AMescape2"});
      str = str.replace(new RegExp(AMescape1, "g"),
              function(st){mtch=true;return "AMescape1"});
      str = str.replace(new RegExp(AMdelimiter2regexp, "g"),AMdelimiter1);
      arr = str.split(AMdelimiter1);
      if (arr.length>1 || mtch) {
        if (checkForMathML) {
          checkForMathML = false;
          var nd = AMisMathMLavailable();
          AMnoMathML = nd != null
          if (AMnoMathML && notifyIfNoMathML) 
            AMbody.insertBefore(nd,AMbody.childNodes[0]);
        }
        if (!AMnoMathML)
          n.parentNode.replaceChild(AMstrarr2docFrag(arr,n.nodeType==8),n);
      }
    }
  } else if (n.nodeName!="math") 
    for (var i=0; i<n.childNodes.length; i++)
      AMprocessNode(n.childNodes[i], linebreaks);
}

var AMbody;
var AMnoMathML = false;

function translate() {
  AMinitSymbols();
  AMbody = document.getElementsByTagName("body")[0];
  AMprocessNode(AMbody, false);
  if (isIE) { //needed to match size and font of formula to surrounding text
    var frag = document.getElementsByTagName('math');
    for (var i=0;i<frag.length;i++)
      if (frag[i].update)
        frag[i].update();
  }
}



// ASCIIsvg-wrapper.js
// written by: Omar Rizwan
//
// This wrapper is based on the original ASCIIsvg.js code;
// it takes a subset of ASCIIsvg API calls which exercises use and
// then uses Raphael as a rendering backend.
//
// Wrapping Raphael instead of ASCIIsvg gives us immediate support for
// browsers without SVG (that means IE without the Adobe SVGviewer).
//
// *This library is deprecated.*
// Do not use ASCIIsvg API calls for new exercises.

/* ASCIIsvg.js
   ==============
   JavaScript routines to dynamically generate Scalable Vector Graphics
   using a mathematical xy-coordinate system (y increases upwards) and
   very intuitive JavaScript commands (no programming experience required).
   ASCIIsvg.js is good for learning math and illustrating online math texts.
   Works with Internet Explorer+Adobe SVGviewer and SVG enabled Mozilla/Firefox.

   Version of Sept 12, 2009 (c) Peter Jipsen http://www.chapman.edu/~jipsen
   Latest version at http://www.chapman.edu/~jipsen/svg/ASCIIsvg.js
   If you use it on a webpage, please send the URL to jipsen@chapman.edu

   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; either version 2 of the License, or (at
   your option) any later version.

   This program is distributed in the hope that it will be useful, 
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
   General Public License (at http://www.gnu.org/copyleft/gpl.html) 
   for more details.*/

var xunitlength = 20;  // pixels
var yunitlength = 20;  // pixels
var origin = [0,0];   // in pixels (default is bottom left corner)
var defaultwidth = 300; defaultheight = 200; defaultborder = 0;
var border = defaultborder;
var strokewidth, strokedasharray, stroke, fill;
var fontstyle, fontfamily, fontsize, fontweight, fontstroke, fontfill;
var markerstrokewidth = "1";
var markerstroke = "black";
var markerfill = "yellow";
var markersize = 4;
var marker = "none";
var arrowfill = stroke;
var dotradius = 4;
var ticklength = 4;
var axesstroke = "black";
var gridstroke = "grey";
var pointerpos = null;
var coordinates = null;
var above = "above";
var below = "below";
var left = "left";
var right = "right";
var aboveleft = "aboveleft";
var aboveright = "aboveright";
var belowleft = "belowleft";
var belowright = "belowright";
var cpi = "\u03C0", ctheta = "\u03B8";
var pi = Math.PI, ln = Math.log, e = Math.E;
var arcsin = Math.asin, arccos = Math.acos, arctan = Math.atan;
var sec = function(x) { return 1/Math.cos(x) };
var csc = function(x) { return 1/Math.sin(x) };
var cot = function(x) { return 1/Math.tan(x) };
var xmin, xmax, ymin, ymax, xscl, yscl, 
xgrid, ygrid, xtick, ytick, initialized;

var picture, svgpicture, doc, width, height, a, b, c, d, i, n, p, t, x, y;
var paper;
var arcsec = function(x) { return arccos(1/x) };
var arccsc = function(x) { return arcsin(1/x) };
var arccot = function(x) { return arctan(1/x) };
var sinh = function(x) { return (Math.exp(x)-Math.exp(-x))/2 };
var cosh = function(x) { return (Math.exp(x)+Math.exp(-x))/2 };
var tanh = 
    function(x) { return (Math.exp(x)-Math.exp(-x))/(Math.exp(x)+Math.exp(-x)) };
var sech = function(x) { return 1/cosh(x) };
var csch = function(x) { return 1/sinh(x) };
var coth = function(x) { return 1/tanh(x) };
var arcsinh = function(x) { return ln(x+Math.sqrt(x*x+1)) };
var arccosh = function(x) { return ln(x+Math.sqrt(x*x-1)) };
var arctanh = function(x) { return ln((1+x)/(1-x))/2 };
var sech = function(x) { return 1/cosh(x) };
var csch = function(x) { return 1/sinh(x) };
var coth = function(x) { return 1/tanh(x) };
var arcsech = function(x) { return arccosh(1/x) };
var arccsch = function(x) { return arcsinh(1/x) };
var arccoth = function(x) { return arctanh(1/x) };
var sign = function(x) { return (x==0?0:(x<0?-1:1)) };

// Need a map to keep track of nodes by user-defined ID,
// because Raphael doesn't like us to set the IDs manually
var svgNodes = {};

function factorial(x,n) {
    if (n==null) n=1;
    for (var i=x-n; i>0; i-=n) x*=i;
    return (x<0?NaN:(x==0?1:x));
}

function C(x,k) {
    var res=1;
    for (var i=0; i<k; i++) res*=(x-i)/(k-i);
    return res;
}

function chop(x,n) {
    if (n==null) n=0;
    return Math.floor(x*Math.pow(10,n))/Math.pow(10,n);
}

function ran(a,b,n) {
    if (n==null) n=0;
    return chop((b+Math.pow(10,-n)-a)*Math.random()+a,n);
}

function less(x,y) { return x < y }  // used for scripts in XML files
// since IE does not handle CDATA well
function setText(st,id) { 
    var node = document.getElementById(id);
    if (node!=null)
	if (node.childNodes.length!=0) node.childNodes[0].nodeValue = st;
    else node.appendChild(document.createTextNode(st));
}

function setBorder(x) { border = x }

function initPaper(pr,wd,hi) {
    // Pass in a Raphael canvas and we'll use it to draw on
    paper = pr;
    width = wd;
    height = hi;
}

function initPicture(x_min,x_max,y_min,y_max) {
    if (!initialized) {
	strokewidth = "1"; // pixel
	strokedasharray = null;
	stroke = "black"; // default line color
	fill = "none";    // default fill color
	fontstyle = "italic"; // default shape for text labels
	fontfamily = "times"; // default font
	fontsize = "16";      // default size
	fontweight = "normal";
	fontstroke = "none";  // default font outline color
	fontfill = "none";    // default font color
	marker = "none";
	initialized = true;
	if (x_min!=null) xmin = x_min;
	if (x_max!=null) xmax = x_max;
	if (y_min!=null) ymin = y_min;
	if (y_max!=null) ymax = y_max;
	if (xmin==null) xmin = -5;
	if (xmax==null) xmax = 5;
	if (typeof xmin != "number" || typeof xmax != "number" || xmin >= xmax) 
	    alert("Picture requires at least two numbers: xmin < xmax");
	else if (y_max != null && (typeof y_min != "number" || 
				   typeof y_max != "number" || y_min >= y_max))
	    alert("initPicture(xmin,xmax,ymin,ymax) requires numbers ymin < ymax");
	else {
	    xunitlength = (width-2*border)/(xmax-xmin);
	    yunitlength = xunitlength;
	    //alert(xmin+" "+xmax+" "+ymin+" "+ymax)
	    if (ymin==null) {
		origin = [-xmin*xunitlength+border,height/2];
		ymin = -(height-2*border)/(2*yunitlength);
		ymax = -ymin;
	    } else {
		if (ymax!=null) yunitlength = (height-2*border)/(ymax-ymin);
		else ymax = (height-2*border)/yunitlength + ymin;
		origin = [-xmin*xunitlength+border,-ymin*yunitlength+border];
	    }
	    var node = paper.rect(0, 0, width, height);
	    
	    node.attr({
		"stroke-width": 1,
		"fill": "white"
	    });

	    border = defaultborder;
	}
    }
}

function line(p,q,id) { // segment connecting points p,q (coordinates in units)
    var node;
    if (id!=null) node = svgNodes[id];
    if (node==null) {
	node = paper.path();
	svgNodes[id] = node;
    }
    node.attr({path: "M"+(p[0]*xunitlength+origin[0])+","+
		      (height-p[1]*yunitlength-origin[1])+" "+
	       (q[0]*xunitlength+origin[0])+","+(height-q[1]*yunitlength-origin[1]),
	       "stroke-width": strokewidth,
	       "stroke": stroke,
	       "fill": (fill != "none" ? fill : null)
	      });
    if (strokedasharray != null) {
	node.attr("stroke-dasharray", strokedasharray);
    }
    if (marker=="dot" || marker=="arrowdot") {
	ASdot(p,markersize,markerstroke,markerfill);
	if (marker=="arrowdot") arrowhead(p,q);
	ASdot(q,markersize,markerstroke,markerfill);
    } else if (marker=="arrow") arrowhead(p,q);
}

function path(plist,id,c) {
    if (c==null) c="";
    var node, st, i;
    if (id!=null) node = svgNodes[id];
    if (typeof node == "undefined" || node==null) {
	node = paper.path();
	svgNodes[id] = node;
    }
    if (typeof plist == "string") st = plist;
    else {
	st = "M";
	st += (plist[0][0]*xunitlength+origin[0])+","+
            (height-plist[0][1]*yunitlength-origin[1])+" "+c;
	for (i=1; i<plist.length; i++)
	    st += (plist[i][0]*xunitlength+origin[0])+","+
            (height-plist[i][1]*yunitlength-origin[1])+" ";
    }
    node.attr("path", st);
    node.attr("stroke-width", strokewidth);
    if (strokedasharray!=null) 
	node.attr("stroke-dasharray", strokedasharray);
    node.attr("stroke", stroke);
    node.attr("fill", fill);
    if (marker=="dot" || marker=="arrowdot")
	for (i=0; i<plist.length; i++)
	    if (c!="C" && c!="T" || i!=1 && i!=2)
		ASdot(plist[i],markersize,markerstroke,markerfill);
}

function curve(plist,id) {
    path(plist,id,"T");
}

function circle(center,radius,id) { // coordinates in units
    var node;
    if (id!=null) node = svgNodes[id];
    if (typeof node == "undefined" || node==null) {
	node = paper.circle();
	svgNodes[id] = node;
    }
    node.attr("cx",center[0]*xunitlength+origin[0]);
    node.attr("cy",height-center[1]*yunitlength-origin[1]);
    node.attr("r",radius*xunitlength);
    node.attr("stroke-width", strokewidth);
    node.attr("stroke", stroke);
    node.attr("fill", fill);
}

function loop(p,d,id) { 
    // d is a direction vector e.g. [1,0] means loop starts in that direction
    if (d==null) d=[1,0];
    path([p,[p[0]+d[0],p[1]+d[1]],[p[0]-d[1],p[1]+d[0]],p],id,"C");
    if (marker=="arrow" || marker=="arrowdot") 
	arrowhead([p[0]+Math.cos(1.4)*d[0]-Math.sin(1.4)*d[1],
		   p[1]+Math.sin(1.4)*d[0]+Math.cos(1.4)*d[1]],p);
}

function arc(start,end,radius,id) { // coordinates in units
    var node, v;
    //alert([fill, stroke, origin, xunitlength, yunitlength, height])
    if (id!=null) node = svgNodes[id];
    if (radius==null) {
	v=[end[0]-start[0],end[1]-start[1]];
	radius = Math.sqrt(v[0]*v[0]+v[1]*v[1]);
    }
    if (typeof node == "undefined" || node==null) {
	node = paper.path();
	svgNodes[id] = node;
    }
    node.attr("path","M"+(start[0]*xunitlength+origin[0])+","+
		      (height-start[1]*yunitlength-origin[1])+" A"+radius*xunitlength+","+
		      radius*yunitlength+" 0 0,0 "+(end[0]*xunitlength+origin[0])+","+
		      (height-end[1]*yunitlength-origin[1]));
    node.attr("stroke-width", strokewidth);
    node.attr("stroke", stroke);
    node.attr("fill", fill);
    if (marker=="arrow" || marker=="arrowdot") {
	u = [(end[1]-start[1])/4,(start[0]-end[0])/4];
	v = [(end[0]-start[0])/2,(end[1]-start[1])/2];
	//alert([u,v])
	v = [start[0]+v[0]+u[0],start[1]+v[1]+u[1]];
    } else v=[start[0],start[1]];
    if (marker=="dot" || marker=="arrowdot") {
	ASdot(start,markersize,markerstroke,markerfill);
	if (marker=="arrowdot") arrowhead(v,end);
	ASdot(end,markersize,markerstroke,markerfill);
    } else if (marker=="arrow") arrowhead(v,end);
}

function ellipse(center,rx,ry,id) { // coordinates in units
    var node;
    if (id!=null) node = svgNodes[id];
    if (typeof node == "undefined" || node==null) {
	node = paper.ellipse();
	svgNodes[id] = node;
    }
    node.attr("cx",center[0]*xunitlength+origin[0]);
    node.attr("cy",height-center[1]*yunitlength-origin[1]);
    node.attr("rx",rx*xunitlength);
    node.attr("ry",ry*yunitlength);
    node.attr("stroke-width", strokewidth);
    node.attr("stroke", stroke);
    node.attr("fill", fill);
}

function rect(p,q,id,rx,ry) { // opposite corners in units, rounded by radii
    var node;
    if (id!=null) node = svgNodes[id];
    if (typeof node == "undefined" || node==null) {
	node = paper.rect();
	svgNodes[id] = node;
    }
    node.attr("x",p[0]*xunitlength+origin[0]);
    node.attr("y",height-q[1]*yunitlength-origin[1]);
    node.attr("width",(q[0]-p[0])*xunitlength);
    node.attr("height",(q[1]-p[1])*yunitlength);
    if (rx!=null) node.attr("rx",rx*xunitlength);
    if (ry!=null) node.attr("ry",ry*yunitlength);
    node.attr("stroke-width", strokewidth);
    node.attr("stroke", stroke);
    node.attr("fill", fill);
}

function text(p,st,pos,id,fontsty) {
    var textanchor = "middle";
    var dx = 0;
    var dy = fontsize/3;

    if (pos!=null) {
	if (pos.slice(0,5)=="above") dy = -fontsize/2;
	if (pos.slice(0,5)=="below") dy = fontsize-0;
	if (pos.slice(0,5)=="right" || pos.slice(5,10)=="right") {
	    textanchor = "start";
	    dx = fontsize/2;
	}
	if (pos.slice(0,4)=="left" || pos.slice(5,9)=="left") {
	    textanchor = "end";
	    dx = -fontsize/2;
	}
    }
    // magic number:
    // strange y discrepancy between Raphael and SVG that we need to
    // account for
    dy -= 10;

    var node;
    if (id!=null) node = svgNodes[id];
    if (typeof node == "undefined" || node==null) {
	node = paper.text();
	svgNodes[id] = node;
    }
    node.attr("x",p[0]*xunitlength+origin[0]+dx);
    // Magic number: 
    node.attr("y",height-p[1]*yunitlength-origin[1]+dy);
    if (paper.type == "SVG") {
	// font-style doesn't work in VML on IE
	node.attr("font-style",(fontsty!=null?fontsty:fontstyle));
    }
    node.attr("text",st);
    node.attr("font-family",fontfamily);
    node.attr("font-size",fontsize);
    node.attr("font-weight",fontweight);
    node.attr("text-anchor",textanchor);
    if (fontstroke!="none") node.attr("stroke",fontstroke);
    if (fontfill!="none") node.attr("fill",fontfill);
    return p;
}

function ASdot(center,radius,s,f) { // coordinates in units, radius in pixel
    if (s==null) s = stroke; if (f==null) f = fill;
    var node = paper.circle();
    node.attr("cx",center[0]*xunitlength+origin[0]);
    node.attr("cy",height-center[1]*yunitlength-origin[1]);
    node.attr("r",radius);
    node.attr("stroke-width", strokewidth);
    node.attr("stroke", s);
    node.attr("fill", f);
}

function dot(center, typ, label, pos, id) {
    var node;
    var cx = center[0]*xunitlength+origin[0];
    var cy = height-center[1]*yunitlength-origin[1];
    if (id!=null) node = svgNodes[id];
    if (typ=="+" || typ=="-" || typ=="|") {
	if (typeof node == "undefined" || node==null) {
	    node = paper.path();
	    svgNodes[id] = node;
	}
	if (typ=="+") {
	    node.attr("path",
			      " M "+(cx-ticklength)+" "+cy+" L "+(cx+ticklength)+" "+cy+
			      " M "+cx+" "+(cy-ticklength)+" L "+cx+" "+(cy+ticklength));
	    node.attr("stroke-width", .5);
	    node.attr("stroke", axesstroke);
	} else {
	    if (typ=="-") node.attr("path",
					    " M "+(cx-ticklength)+" "+cy+" L "+(cx+ticklength)+" "+cy);
	    else node.attr("path",
				   " M "+cx+" "+(cy-ticklength)+" L "+cx+" "+(cy+ticklength));
	    node.attr("stroke-width", strokewidth);
	    node.attr("stroke", stroke);
	}
    } else {
	if (typeof node == "undefined" || node==null) {
	    node = paper.circle();
	    svgNodes[id] = node;
	}
	node.attr("cx",cx);
	node.attr("cy",cy);
	node.attr("r",dotradius);
	node.attr("stroke-width", strokewidth);
	node.attr("stroke", stroke);
	node.attr("fill", (typ=="open"?"white":stroke));
    }
    if (label!=null) 
	text(center,label,(pos==null?"below":pos),(id==null?id:id+"label"))
}

function arrowhead(p,q) { // draw arrowhead at q (in units)
    var up;
    var v = [p[0]*xunitlength+origin[0],height-p[1]*yunitlength-origin[1]];
    var w = [q[0]*xunitlength+origin[0],height-q[1]*yunitlength-origin[1]];
    var u = [w[0]-v[0],w[1]-v[1]];
    var d = Math.sqrt(u[0]*u[0]+u[1]*u[1]);
    if (d > 0.00000001) {
	u = [u[0]/d, u[1]/d];
	up = [-u[1],u[0]];
	var node = paper.path();
	node.attr("path","M "+(w[0]-15*u[0]-4*up[0])+" "+
			  (w[1]-15*u[1]-4*up[1])+" L "+(w[0]-3*u[0])+" "+(w[1]-3*u[1])+" L "+
			  (w[0]-15*u[0]+4*up[0])+" "+(w[1]-15*u[1]+4*up[1])+" z");
	node.attr("stroke-width", markerstrokewidth);
	node.attr("stroke", stroke); /*was markerstroke*/
	node.attr("fill", stroke); /*was arrowfill*/
    }
}

function hopZ(st) {
    var k = st.indexOf(".");
    if (k==-1) return st;
    for (var i=st.length-1; i>k && st.charAt(i)=="0"; i--);
    if (i==k) i--;
    return st.slice(0,i+1);
}

function grid(dx,dy) { // for backward compatibility
    axes(dx,dy,null,dx,dy)
}

function noaxes() {
    if (!initialized) initPicture();
}

function axes(dx,dy,labels,gdx,gdy) {
    //xscl=x is equivalent to xtick=x; xgrid=x; labels=true;
    var x, y, ldx, ldy, lx, ly, lxp, lyp, pnode, st;
    if (!initialized) initPicture();
    if (typeof dx=="string") { labels = dx; dx = null; }
    if (typeof dy=="string") { gdx = dy; dy = null; }
    if (xscl!=null) {dx = xscl; gdx = xscl; labels = dx}
    if (yscl!=null) {dy = yscl; gdy = yscl}
    if (xtick!=null) {dx = xtick}
    if (ytick!=null) {dy = ytick}
    //alert(null)
    dx = (dx==null?xunitlength:dx*xunitlength);
    dy = (dy==null?dx:dy*yunitlength);
    fontsize = Math.min(dx/2,dy/2,16);//alert(fontsize)
    ticklength = fontsize/4;
    if (xgrid!=null) gdx = xgrid;
    if (ygrid!=null) gdy = ygrid;
    if (gdx!=null) {
	gdx = (typeof gdx=="string"?dx:gdx*xunitlength);
	gdy = (gdy==null?dy:gdy*yunitlength);
	pnode = paper.path();
	st="";
	for (x = origin[0]; x<width; x = x+gdx)
	    st += " M"+x+",0"+" "+x+","+height;
	for (x = origin[0]-gdx; x>0; x = x-gdx)
	    st += " M"+x+",0"+" "+x+","+height;
	for (y = height-origin[1]; y<height; y = y+gdy)
	    st += " M0,"+y+" "+width+","+y;
	for (y = height-origin[1]-gdy; y>0; y = y-gdy)
	    st += " M0,"+y+" "+width+","+y;
	pnode.attr("path",st);
	pnode.attr("stroke-width", .5);
	pnode.attr("stroke", gridstroke);
	pnode.attr("fill", fill);
    }
    pnode = paper.path();
    st="M0,"+(height-origin[1])+" "+width+","+
	(height-origin[1])+" M"+origin[0]+",0 "+origin[0]+","+height;
    for (x = origin[0]+dx; x<width; x = x+dx)
	st += " M"+x+","+(height-origin[1]+ticklength)+" "+x+","+
        (height-origin[1]-ticklength);
    for (x = origin[0]-dx; x>0; x = x-dx)
	st += " M"+x+","+(height-origin[1]+ticklength)+" "+x+","+
        (height-origin[1]-ticklength);
    for (y = height-origin[1]+dy; y<height; y = y+dy)
	st += " M"+(origin[0]+ticklength)+","+y+" "+(origin[0]-ticklength)+","+y;
    for (y = height-origin[1]-dy; y>0; y = y-dy)
	st += " M"+(origin[0]+ticklength)+","+y+" "+(origin[0]-ticklength)+","+y;
    if (labels!=null) with (Math) {
	ldx = dx/xunitlength;
	ldy = dy/yunitlength;
	lx = (xmin>0 || xmax<0?xmin:0);
	ly = (ymin>0 || ymax<0?ymin:0);
	lxp = (ly==0?"below":"above");
	lyp = (lx==0?"left":"right");
	var ddx = floor(1.1-log(ldx)/log(10))+1;
	var ddy = floor(1.1-log(ldy)/log(10))+1;
	for (x = ldx; x<=xmax; x = x+ldx)
	    text([x,ly],chopZ(x.toFixed(ddx)),lxp);
	for (x = -ldx; xmin<=x; x = x-ldx)
	    text([x,ly],chopZ(x.toFixed(ddx)),lxp);
	for (y = ldy; y<=ymax; y = y+ldy)
	    text([lx,y],chopZ(y.toFixed(ddy)),lyp);
	for (y = -ldy; ymin<=y; y = y-ldy)
	    text([lx,y],chopZ(y.toFixed(ddy)),lyp);
    }
    pnode.attr("path",st);
    pnode.attr("stroke-width", .5);
    pnode.attr("stroke", axesstroke);
    pnode.attr("fill", fill);
}

function mathjs(st) {
    //translate a math formula to js function notation
    // a^b --> pow(a,b)
    // na --> n*a
    // (...)d --> (...)*d
    // n! --> factorial(n)
    // sin^-1 --> arcsin etc.
    //while ^ in string, find term on left and right
    //slice and concat new formula string
    st = st.replace(/\s/g,"");
    if (st.indexOf("^-1")!=-1) {
	st = st.replace(/sin\^-1/g,"arcsin");
	st = st.replace(/cos\^-1/g,"arccos");
	st = st.replace(/tan\^-1/g,"arctan");
	st = st.replace(/sec\^-1/g,"arcsec");
	st = st.replace(/csc\^-1/g,"arccsc");
	st = st.replace(/cot\^-1/g,"arccot");
	st = st.replace(/sinh\^-1/g,"arcsinh");
	st = st.replace(/cosh\^-1/g,"arccosh");
	st = st.replace(/tanh\^-1/g,"arctanh");
	st = st.replace(/sech\^-1/g,"arcsech");
	st = st.replace(/csch\^-1/g,"arccsch");
	st = st.replace(/coth\^-1/g,"arccoth");
    }
    st = st.replace(/^e$/g,"(E)");
    st = st.replace(/^e([^a-zA-Z])/g,"(E)$1");
    st = st.replace(/([^a-zA-Z])e([^a-zA-Z])/g,"$1(E)$2");
    st = st.replace(/([0-9])([\(a-zA-Z])/g,"$1*$2");
    st = st.replace(/\)([\(0-9a-zA-Z])/g,"\)*$1");
    var i,j,k, ch, nested;
    while ((i=st.indexOf("^"))!=-1) {
	//find left argument
	if (i==0) return "Error: missing argument";
	j = i-1;
	ch = st.charAt(j);
	if (ch>="0" && ch<="9") {// look for (decimal) number
	    j--;
	    while (j>=0 && (ch=st.charAt(j))>="0" && ch<="9") j--;
	    if (ch==".") {
		j--;
		while (j>=0 && (ch=st.charAt(j))>="0" && ch<="9") j--;
	    }
	} else if (ch==")") {// look for matching opening bracket and function name
	    nested = 1;
	    j--;
	    while (j>=0 && nested>0) {
		ch = st.charAt(j);
		if (ch=="(") nested--;
		else if (ch==")") nested++;
		j--;
	    }
	    while (j>=0 && (ch=st.charAt(j))>="a" && ch<="z" || ch>="A" && ch<="Z")
		j--;
	} else if (ch>="a" && ch<="z" || ch>="A" && ch<="Z") {// look for variable
	    j--;
	    while (j>=0 && (ch=st.charAt(j))>="a" && ch<="z" || ch>="A" && ch<="Z")
		j--;
	} else { 
	    return "Error: incorrect syntax in "+st+" at position "+j;
	}
	//find right argument
	if (i==st.length-1) return "Error: missing argument";
	k = i+1;
	ch = st.charAt(k);
	if (ch>="0" && ch<="9" || ch=="-") {// look for signed (decimal) number
	    k++;
	    while (k<st.length && (ch=st.charAt(k))>="0" && ch<="9") k++;
	    if (ch==".") {
		k++;
		while (k<st.length && (ch=st.charAt(k))>="0" && ch<="9") k++;
	    }
	} else if (ch=="(") {// look for matching closing bracket and function name
	    nested = 1;
	    k++;
	    while (k<st.length && nested>0) {
		ch = st.charAt(k);
		if (ch=="(") nested++;
		else if (ch==")") nested--;
		k++;
	    }
	} else if (ch>="a" && ch<="z" || ch>="A" && ch<="Z") {// look for variable
	    k++;
	    while (k<st.length && (ch=st.charAt(k))>="a" && ch<="z" ||
		   ch>="A" && ch<="Z") k++;
	} else { 
	    return "Error: incorrect syntax in "+st+" at position "+k;
	}
	st = st.slice(0,j+1)+"pow("+st.slice(j+1,i)+","+st.slice(i+1,k)+")"+
            st.slice(k);
    }
    while ((i=st.indexOf("!"))!=-1) {
	//find left argument
	if (i==0) return "Error: missing argument";
	j = i-1;
	ch = st.charAt(j);
	if (ch>="0" && ch<="9") {// look for (decimal) number
	    j--;
	    while (j>=0 && (ch=st.charAt(j))>="0" && ch<="9") j--;
	    if (ch==".") {
		j--;
		while (j>=0 && (ch=st.charAt(j))>="0" && ch<="9") j--;
	    }
	} else if (ch==")") {// look for matching opening bracket and function name
	    nested = 1;
	    j--;
	    while (j>=0 && nested>0) {
		ch = st.charAt(j);
		if (ch=="(") nested--;
		else if (ch==")") nested++;
		j--;
	    }
	    while (j>=0 && (ch=st.charAt(j))>="a" && ch<="z" || ch>="A" && ch<="Z")
		j--;
	} else if (ch>="a" && ch<="z" || ch>="A" && ch<="Z") {// look for variable
	    j--;
	    while (j>=0 && (ch=st.charAt(j))>="a" && ch<="z" || ch>="A" && ch<="Z")
		j--;
	} else { 
	    return "Error: incorrect syntax in "+st+" at position "+j;
	}
	st = st.slice(0,j+1)+"factorial("+st.slice(j+1,i)+")"+st.slice(i+1);
    }
    return st;
}

function plot(fun,x_min,x_max,points,id) {
    var pth = [];
    var f = function(x) { return x }, g = fun;
    var name = null;
    if (typeof fun=="string") 
	eval("g = function(x){ with(Math) return "+mathjs(fun)+" }");
    else if (typeof fun=="object") {
	eval("f = function(t){ with(Math) return "+mathjs(fun[0])+" }");
	eval("g = function(t){ with(Math) return "+mathjs(fun[1])+" }");
    }
    if (typeof x_min=="string") { name = x_min; x_min = xmin }
    else name = id;
    var min = (x_min==null?xmin:x_min);
    var max = (x_max==null?xmax:x_max);
    var inc = max-min-0.000001*(max-min);
    inc = (points==null?inc/200:inc/points);
    var gt;
    //alert(typeof g(min))
    for (var t = min; t <= max; t += inc) {
	gt = g(t);
	if (!(isNaN(gt)||Math.abs(gt)=="Infinity")) pth[pth.length] = [f(t), gt];
    }
    path(pth,name)
    return p;
}

function slopefield(fun,dx,dy) {
    var g = fun;
    if (typeof fun=="string") 
	eval("g = function(x,y){ with(Math) return "+mathjs(fun)+" }");
    var gxy,x,y,u,v,dz;
    if (dx==null) dx=1;
    if (dy==null) dy=1;
    dz = Math.sqrt(dx*dx+dy*dy)/6;
    var x_min = Math.ceil(xmin/dx);
    var y_min = Math.ceil(ymin/dy);
    for (x = x_min; x <= xmax; x += dx)
	for (y = y_min; y <= ymax; y += dy) {
	    gxy = g(x,y);
	    if (!isNaN(gxy)) {
		if (Math.abs(gxy)=="Infinity") {u = 0; v = dz;}
		else {u = dz/Math.sqrt(1+gxy*gxy); v = gxy*u;}
		line([x-u,y-v],[x+u,y+v]);
	    }
	}
}
var currentexercise ="";
var tries=0;
var correct_at_first_try=false;
var perfectlycorrect = 0; //switched to 1 if the student gets the answer right without hints
var answerChoices = new Array(5);
var answerChoices2 = new Array(5);
var possibleAnswers = new Array(); //These are the possible answers
var possibleAnswers2 = new Array();  //This is used in exercises where the user has to select 2 choices
var definiteWrongAnswers = new Array();
var steps_given=0;
var next_step_to_write =1;
var correctchoice;
var correctchoice2; //used when there are 2 answer choices
var selectedchoice;
var selectedchoice2; 
var starttime = new Date();
var starttimestring = date_to_string(starttime);
var time;
var displaygraph = false;
var alreadyRedirect = 0;
var display_per_step = 1;  //This is how many DIV panes get displayed every time a new hint is given
var timesWrong = 0; //This is used only by words.jsp and new_question()
var recordedProblem = 0;
var recordedCorrect = 0;


var correct = new Image();
correct.src = "/images/face-smiley.gif";
var incorrect = new Image();
incorrect.src = "/images/face-sad.gif";


// Deprecated: Use generateRandomProblem (below) instead.
// Note: compareFunction is now ignored.  entryFunction must return the same
// id for all problems that should be considered equivalent.
function checkHistory(compareFunction, entryFunction, termFunction, historyLength)
{
	generateNewProblem(function () {
		entryFunction();
		return termFunction();
	}, historyLength/2);
}

// Calls randomProblemGenerator until it returns a problem id that hasn't been used recently. 
function generateNewProblem(randomProblemGenerator, range, salt)
{
	/*
	 * To generate reproducible problems P_0, P_1, P_2, ... with no repeats 
	 * within R problems:
	 * 1. Let U(S, {problems_to_avoid}) be a problem generated from seed S that is not 
	 *    in the set {problems_to_avoid}.  So it is "unique" relative to {problems_to_avoid}.
	 * 2. Then, we can generate a reproducible sequence of R problems with no
	 *    repeats given a seed S.  Call those generated problems G(0, S) through G(R-1, S).
	 *    They can be produced iteratively:
	 *    G(0, S) = U(S, {})
	 *    G(j, S) = U(S, {G(0, S),...G(j-1,S)})
	 * 3. We can use G to compute half of the P_i, by dividing the P_i into groups of R
	 *    problems and using G to compute every other group.  So:
	 *    For (i%(2R)) < R, let P_i = G(i%(2R), s(i//(2R)))
	 *       where "//" is integer division without remainder and
	 *       s(x) is the seed function that depends only on i through its parameter
	 *       and ideally ensures that s(x)!=s(y) for all x!=y.  s(x) = x could work.
	 *       So could s(x) = x+username if we wanted different users to get different
	 *       problems.
	 *    That covers half of the problems, specifically the 1st, 3rd, 5th, etc groups 
	 *    of R problems.
	 * 4. For the problems in the remaining (even) groups, we need to ensure that they 
	 *    don't match the problems that are within a distance of R in either the previous
	 *    or next group.  To do that, we generate the relevant problems from those groups
	 *    (which requires only knowing the problem numbers) and then use U() to ensure we
	 *    don't duplicate them.  So:
	 *    For (i%(2R)) >= R, let P_i = U(s(i//(2R)), {P_j where |j-i| < R})
	 *    
	 * From an implementation perspective, to generate P_i:
	 *   if (i%(2R)) < R):
	 *     Generate the first problem in its group, number (i//(2R))*2R, and subsequent problems up to
	 *     and including P_i skipping duplicates.
	 *   else:
	 *     Generate the first problem in the next group, number ((i//(2R))+1)*2R, and subsequent problem
	 *     numbers < i+R, skipping duplicates.
	 *     Generate all the problems in the previous group, starting with number (i//(2R)-1)*2R, skipping
	 *     duplicates within that group.
	 *     Generate the first problem in its group, number (i//(2R))*2R, and subsequent problems up to
	 *     and including P_i skipping duplicates in that group and in the problems in adjacent groups with
	 *     numbers within R of i.
	 */
	if (!range)
		range = 10;
	range = Math.floor(range);
	if (!salt)
		salt = '';
	var i = KhanAcademy.problem_number;
	var R = range;
	var group = Math.floor(i/R);
	var prev_group_problems = [];
	var next_group_problems = [];
	if (group % 2 == 1) {
		// generate problems to avoid
		KhanAcademy.seedRandom(s(group-1));
		for (var j=0; j<R; j++) {
			prev_group_problems.push(U(prev_group_problems));			
		}
		KhanAcademy.seedRandom(s(group+1));
		for (var j=0; j<(i%R); j++) {
			next_group_problems.push(U(next_group_problems));			
		}
	}
	
	KhanAcademy.seedRandom(s(group));
	var p = group*R;
	var current_group_problems = [];
	while (p <= i) {
		var problems_to_avoid = current_group_problems.concat(prev_group_problems.slice(p%R), next_group_problems.slice(0,p%R));
		current_group_problems.push(U(problems_to_avoid));
		p++;
	}
	
	function s(x) {
		return ''+salt+x;
	}
	
	function U(avoidance_arr) {
		var id;
		// We only try 10 times to prevent buggy callers
		// from generating an infinite loop if their randomProblemGenerator
		// always returns true.  See:
		// http://code.google.com/p/khanacademy/issues/detail?id=49
		var tries = 0;
		while(tries < 10 && $.inArray(id = randomProblemGenerator(), avoidance_arr) != -1) {
			tries++;			
		}
		return id;
	}
}

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

function equivInArray(target, arr) {
	for (var i = 0; i < arr.length; i++) {
		if (mathFormat(target) == mathFormat(arr[i]))
			return true;
	}
	return false;
}

//To add a choice; assumes correct_answer is already defined
function addWrongChoice(choice)
{
	if(mathFormat(choice) != mathFormat(correct_answer))
		if(!equivInArray(choice, possibleAnswers) && !equivInArray(choice, definiteWrongAnswers))
			possibleAnswers.push(choice);
}



function arrayEqual(a,b) //return true if the elements in the array are equal
{
	for(var i=0; i<a.length && i<b.length; i++)
	{
		if (a[i]!=b[i])
			return false;
	}
	return true;
}

function arrayCopy(a)
{
	var c = new Array();
	for(var i=0; i<a.length; i++)
	{
		c.push(a[i]);
	}
	return c;
}

function inArray(item, a)
{
	for(var i=0; i<a.length; i++)
	{
		if(item==a[i])
			return true;
	}
	return false;
}

//get_random() returns a non-zero random number between -10 and 10
function get_random()
{
	var ranNum=Math.round(KhanAcademy.random()*20)-10; 
	while (ranNum==0) {
		ranNum=Math.round(KhanAcademy.random()*20)-10;
	}
	return ranNum;
}

function randomIndices(length)
{
	var startArray = new Array();
	var endArray = new Array();
	
	for(var i=0; i<length; i++)
		startArray.push(i);
		
	while(startArray.length>0)
	{
		var epsilon = .99;
		var maxVal = startArray.length-1;
		var index = Math.round(KhanAcademy.random()*(maxVal+epsilon) - epsilon/2);
		
		endArray.push(startArray.splice(index,1)[0]);
	}

	return endArray;

}

function format_coefficient(number)
{
	if (number==1) {
		return "+"; 
	}
	else if (number==-1) {
		return "-"; 
	}
	else if (number>0) {
		return ("+"+number); 
	}
	else if (number<0) {
		return (""+number); 
	}
	else {
		return ""; 
	}
}

function format_first_coefficient(number)
{
	if (number==-1) {
		return "-"; 
	}
	else if (number==1) {
		return ""; 
	}
	else {
		return (""+number); 
	}
}


//for formatting_constants that aren't the first (when they are first, you can just put the constant there)

function format_constant(number)
{
	if (number>0) {
		return ("+"+number); 
	}
	else if (number<0) {
		return (""+number); 
	}
	else {
		return ""; 
	}
}

function date_to_string(d)
{
	return (""+d.getFullYear()+
		":"+(d.getMonth()+1)+
		":"+d.getDate()+
		":"+d.getHours()+
		":"+d.getMinutes()+
		":"+d.getSeconds());
}

function date_as_string()
{
	var d = new Date();
	return date_to_string(d);
}

function select_choice(choice)
{
	selectedchoice = choice;
}

function select_choice2(choice)
{
	selectedchoice2 = choice;
}

function getGCD(x,y) 
{
	var z;
	while (y!=0) {
		z = x % y;
		x = y;
		y = z;
	}
	return x;
}


function getLCM(x,y)
{
	return (x *y/getGCD(x,y));
}

function format_fraction(n, d)
{
	if (d == 0)
		return "`undefined`";
	if (n == 0)
		return "0";
	var sign = (n/d < 0) ? " - " : "";
	n = Math.abs(n);
	d = Math.abs(d);
	var gcd = getGCD(n, d);
	n = n/gcd;
	d = d/gcd;
	var fraction = sign + n;
	if (d > 1)
		fraction = fraction + "/"+d;
	return fraction;
}

function format_fraction_with_sign(n, d)
{
	var fraction = format_fraction(n,d);
	
	if ((n/d)>0)
	{
		fraction = '+'+fraction;

	}

	return fraction;
}

function format_not_reduced(n,d)
{
	if (n/d < 0)
	{
		return "- "+Math.abs(n)+"/"+Math.abs(d);
	}
	else
	{
		return Math.abs(n)+"/"+Math.abs(d);
	}
}

function format_not_reduced_with_sign(n, d)
{
	var fraction = format_not_reduced(n,d);
	
	if ((n/d)>0)
	{
		fraction = '+'+fraction;
	}
	return fraction;
}

var notDoneType = ''; //This is used by pickType in metautil.js to prevent students from refreshing away a type of problem
var notDoneCookie = '';


function record_problem() //presents the 'next question' button
{
	eraseCookie(notDoneCookie);
	
	var endtime = new Date();
	time = endtime.getSeconds()-starttime.getSeconds() +
			60* (endtime.getMinutes() - starttime.getMinutes()) +
			3600* (endtime.getHours() - starttime.getHours());
	
	
	if (tries==0 && steps_given==0)
	{
		correct_at_first_try=true;
		perfectlycorrect=1;
		if (recordedCorrect==0)
		{
			streak++;
			recordedCorrect=1;
		}
		
		//effort=2*effort; //Get double the points for not using hints and getting it right on the first try
		
	}
	else
	{
		perfectlycorrect=0;
		streak = 0;	
		effort = 1;
	}
	
	if (randomMode==1) //You should get more points for problems that are given randomly
	{
		effort =2*effort;
	}
	
	effort = Math.max(effort, 1);
}

function processReq() {
	recordedProblem=1;
    if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
	 
	  //alert( "everything worked");
	  
	  
	  
	  
        } 
	else {
          //alert( "Not able to log problem" );
	  
	  
	}
    }
}


function check_free_answer()
{
	// alert(correctAnswer);
	if (document.answerform.answer.value==correctAnswer)
	{
		document.images.feedback.src = correct.src;
		if (tries==0 && steps_given==0)
		{
			document.getElementById("correct").value="1"
		}
		//new_question();
		$("#check-answer-results").show();
	}
	else
	{
		tries++;
		document.images.feedback.src= incorrect.src;
		record_problem();	
	}
}

//For modules that need new colors;
var hColors = ['#D9A326', '#E8887D', '#9CC9B7', '#AE9CC9', '#EAADEA', '#CD8C95', '#EE8262', '#FBA16C', '#DEB887','#CFD784'];
var nColor = "#777777"; //Stands for "normal" color
var curColor =getRandomInt(hColors.length);

function getNextColor()
{
	curColor=(curColor+1)%hColors.length;
	return hColors[curColor];
}


//returns an integer between 0 and max, inclusive
function getRandomInt(max)
{
	var epsilon = .9;
	return Math.round(KhanAcademy.random()*(max+epsilon) - epsilon/2);
}

function getRandomIntRange(min, max)
{
	var epsilon = .9;
	var x = Math.abs(max-min);
	return (min+Math.round(KhanAcademy.random()*(x+epsilon) - epsilon/2));
}

function randomFromArray(a)
{
	var index = getRandomIntRange(0, a.length-1);
	return a[index];
}

function check_answer()
{
	if (selectedchoice === undefined) 
	{
			window.alert("Please choose your answer.");
			return;
	}

	var isCorrect = (selectedchoice==correctchoice)
	handleCorrectness(isCorrect);
}

//for problems where the user can give 2 answers
function check_both_answers()
{
	if (selectedchoice === undefined || selectedchoice2 === undefined) 
	{
			window.alert("Please choose both answers.");
			return;
	}

	var isCorrect = (selectedchoice==correctchoice  && selectedchoice2==correctchoice2);
	handleCorrectness(isCorrect);
}


function array_sum(a) {

	var sum=0;
	for (var i=0; i<a.length; i++) {
		sum+=a[i];
	}
	return sum;
}

function start_random_problem()
{
	window.location = randomProblem();
}

function write_step(text, step) //Deprecated
{
	document.write('<P><div id=\"step'+step+'_'+display_per_step+'\" style=\"position:relative; visibility:hidden;\"><font face=\"arial\" size=3>'+text+'</font></div></P>');
}

function write_step(text)
{
	document.write('<P><div id=\"step'+next_step_to_write+'_'+display_per_step+'\" style=\"position:relative; visibility:hidden;\"><font face=\"arial\" size=3>'+text+'</font></div></P>');
	next_step_to_write++;
}

function write_table_step(explanation, left, right)
{
	document.write(	'<tr><td align=left class=\"nobr\">'
			+get_step_part_string('<FONT class=\"explanation\"  class=\"nobr\">'+explanation+'</font>', next_step_to_write, 3)
			+'</td><td align=right class=\"nobr\"><nobr>'
			+get_step_part_string('`'+left+'`', next_step_to_write, 1)
			+'</nobr></td><td align=left class=\"nobr\"><nobr>'
			+get_step_part_string('`='+right+'`', next_step_to_write, 2)
			+'</nobr></td></tr>');
	next_step_to_write++;
}

function table_step_header(explanation, left, right)
{
	document.write('<center><table border=0><tr><td></td><td></td><td></td></tr><tr><td align=left class=\"nobr\"><font face=\"arial\" size=4>'+explanation+'</font></td><td align=right class=\"nobr\"><font face=\"arial\" size=4>`'+
			left+
			'</font></td><td align=left class=\"nobr\"><nobr><font face=\"arial\" size=4  class=\"nobr\">`='+right+'`</font></nobr></td></tr>');	
}

function table_step_footer()
{
	document.write('</table></center>');
}

function get_step_part_string(text, present_step, part)
{
	return ('<div id=\"step'+present_step+'_'+part+'\" style=\"position:relative; visibility:hidden;\"><font face=\"arial\" size=4>'+text+'</font></div>');
}

function write_equation(equation)
{
	document.write('<p><font face=\"arial\" size=4><center>`'+equation+'`</center></font></p>');
}

function write_text(text)
{
	document.write('<p><font face=\"arial\" size=3>'+text+'</font></p>');
}

function equation_string(equation)
{
	return ('<p><font face=\"arial\" size=4><center>`'+equation+'`</center></font></p>');
}

//used in lineq.jsp
function get_eq_step_string(instruction, lside, rside)
{
	return('<tr><td>'+instruction+'</td><td>`'+lside+'='+rside+'`</td></tr>');	
}


function perfect_square_factor(n)  //only factors numbers up to 625
{
	var square_factor=1;

	for (var i=1; (i<25 && i<Math.abs(n)); i++)
	{
		//document.write('<p>'+n+" "+i+" "+(Math.abs(n)%(i*i))+'</p>');
		if ((Math.abs(n)%(i*i))==0)
		{
			square_factor=i*i;
		}
	}
	//alert("N:"+n+",Factor:"+square_factor);


	if (Math.abs(square_factor)==1) //the number is not factorable has the product of a perfect square and another number
	{
		return [n];
	}
	else
	{
		return [n/square_factor, square_factor];
	}
}

function problem_footer()
{
	//randomly determine which choice will be the correct choice, the math is funky to ensure an equal probability of being any number from 0-4 inclusive
	correctchoice = Math.round(KhanAcademy.random()*4.98-.49);
	if (displaygraph)
	{
		document.write('</td><td valign=\"top\"><embed align=\"left\" width=260 height=260 src=\"/d.svg\" script=\'graph_update()\'><form name=\"answerform\">');
	}
	else
	{
		document.write('</td><td valign=\"top\"><form name=\"answerform\">');
	}
	
	//Fill in the choices
	//need to fix it so that the other choices can never be the same as the correct choice
	
	var possibleWrongIndices=randomIndices(possibleAnswers.length);
	var definiteWrongIndices=randomIndices(definiteWrongAnswers.length);
	for (var i=0; i<5; i++)
	{
		if (i==correctchoice) 
		{
			answerChoices[i]=correct_answer;
		}
		else
		{
			if (definiteWrongIndices.length>0)
			{
				answerChoices[i]='`'+definiteWrongAnswers[definiteWrongIndices.pop()]+'`';
			}
			else
			{
				answerChoices[i]='`'+possibleAnswers[possibleWrongIndices.pop()]+'`';
			}
			/****
			var new_index = Math.round(KhanAcademy.random()*(possibleAnswers.length-.02)-.49); //where to pick the new wrong choice
			var new_wrong_choice = possibleAnswers.splice(new_index, 1)[0];
			answerChoices[i]='`'+new_wrong_choice+'`';
			*****/
		}

		document.write('<br><input type=\"radio\" name=\"selectAnswer\" onClick=\"select_choice('+i+')\">'+answerChoices[i]+'</input></br>');

	}

	document.write('<br><input type=\"button\" value=\"Hint\" onClick=\"give_next_step()\"><input type=\"button\" value=\"Check Answer\" onClick=\"check_answer()\"></br>');
	document.write('<br><img src=\"/images/blank.gif\" name=\"feedback\"><div id=\"nextbutton\" style=\"position:relative; visibility:hidden;\"><input type=\"button\" value=\"Correct! Next Question...\" onClick=\"new_question()\"></div></br>');
	document.write('</form></td></tr></table>');	
	document.answerform.reset();
}

//for problems where the user has to select 2 answers
function double_answer_footer()
{
	//randomly determine which choice will be the correct choice, the math is funky to ensure an equal probability of being any number from 0-4 inclusive
	correctchoice = Math.round(KhanAcademy.random()*4.98-.49);
	correctchoice2 = Math.round(KhanAcademy.random()*4.98-.49); //every variable with a 2 is for the second set of choices
	if (displaygraph)
	{
		document.write('</td><td valign=\"top\"><embed align\"right\" width=200 height=200 src=\"d.svg\" script=\'graph_update()\'><form name=\"answerform\">');
	}
	else
	{
		document.write('</td><td valign=\"top\"><form name=\"answerform\">');
	}
	
	//Fill in the choices
	//need to fix it so that the other choices can never be the same as the correct choice
	document.write('<table border=0>');
	for (var i=0; i<5; i++)
	{
		if (i==correctchoice) 
		{
			answerChoices[i]=correct_answer;
		}
		else
		{
			
			var new_index = Math.round(KhanAcademy.random()*(possibleAnswers.length-.02)-.49); //where to pick the new wrong choice
			var new_wrong_choice = possibleAnswers.splice(new_index, 1)[0]
			answerChoices[i]='`'+new_wrong_choice+'`';
		}
		if (i==correctchoice2) 
		{
			answerChoices2[i]=correct_answer2;
		}
		else
		{
			
			var new_index = Math.round(KhanAcademy.random()*(possibleAnswers2.length-.02)-.49); //where to pick the new wrong choice
			var new_wrong_choice = possibleAnswers2.splice(new_index, 1)[0]
			answerChoices2[i]='`'+new_wrong_choice+'`';
		}
		document.write('<tr><td><input type=\"radio\" name=\"selectAnswer\" onClick=\"select_choice('+i+')\">'+answerChoices[i]
			+'</input></td><td><input type=\"radio\" name=\"selectAnswer2\" onClick=\"select_choice2('+i+')\">'+answerChoices2[i]+'</input></td></tr>');

	}

	document.write('</table>')
	
	document.write('<br><input type=\"button\" value=\"Hint\" onClick=\"give_next_step()\"><input type=\"button\" value=\"Check Answer\" onClick=\"check_both_answers()\"></br>');
	document.write('<br><img src=\"/images/blank.gif\" name=\"feedback\"><div id=\"nextbutton\" style=\"position:relative; visibility:hidden;\"><input type=\"button\" value=\"Correct! Next Question...\" onClick=\"new_question()\"></div></P>');
	document.write('</form></td></tr></table>');	
	document.answerform.reset();
}

function checkAnswerWithReturn(event)
{
	if (event &&event.which==13)
		check_free_answer();
	else
		return true;
}


function free_answer_footer()
{
	document.write('</td><td valign=\"top\"><form name=\"answerform\">');
	document.write('<br>Answer:<input type=\"text\" size=10 id=\"answer\" name=\"answer\"></br>');
	document.write('<br><input type=\"button\" value=\"Hint\"  onClick=\"give_next_step()\">');
	document.write('<input type=\"button\" value=\"Check Answer\" onClick=\"check_free_answer()\"></br>');
	document.write('<br><img src=\"/images/blank.gif\" name=\"feedback\"><div id=\"nextbutton\" style=\"position:relative; visibility:hidden;\"><input type=\"button\" value=\"Correct! Next Question...\" onClick=\"new_question()\"></div></br>');
	document.write('</form></td></tr></table>');
	document.answerform.reset();
}

function reset_streak() {
    if ($("#hint_used").val() != 1) {
        fade_streaks();
        $.ajax({
                    type: "POST",
                    url: "/resetstreak",
                    data: {	key: $("#key").val() },
                    data_type: 'json'
               }); 
    }
    $("#hint_used").val("1");
}

function fade_streaks() {
    $(".unit-rating li.current-rating").animate({opacity: 0.0}, "fast");
    $(".unit-rating li.current-label").animate({opacity: 0.0}, "fast");
}


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

var toDraw = {};
var randInt = getRandomIntRange(5,9);

var drawFunction = null;
var color1 = getNextColor();
var color2 = getNextColor();
var color3 = getNextColor();
var pointRegister = new Array();
var angleRegister = new Array();
var graphicalHints = new Array();
var initialObjectsToDraw  = new Array();

var sqr2div2 = Math.sqrt(2)/2;

var defaultColor = "black";

function colorString(string, color)
{
	return '<font color=\"'+color+'\">'+string+'</font>';	
}

hColors = ['#D9A326', '#E8887D', '#9CC9B7', '#AE9CC9', '#EAADEA', '#CD8C95', '#CFD784'];


function getSlope(p1, p2)
{
	if (p2.x==p1.x)
		return null;
	else
		return (p2.y-p1.y)/(p2.x-p1.x);	
}

function getDistance(p1,p2)
{
	return (Math.sqrt(Math.pow(p1.y-p2.y,2)+Math.pow(p1.x-p2.x, 2)));
}


var pointLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'];
var nextPointIndex = getRandomIntRange(0,pointLabels.length-1);

function getNextLabel()
{
	nextPointIndex = (nextPointIndex+1)%pointLabels.length;
	return pointLabels[nextPointIndex];
}

function initPlane()
{
	present.initPicture(-10,10, -10, 10);
	
	present.fontstyle = "normal";
	present.fontsize = "10";
	
	present.stroke = "#DDDDDD";
	present.strokewidth = "2";
	for(var i=-10; i<11; i++)
	{
		if (i!=0)
		{
			present.line([i,-11], [i,11]);
			present.line([-11,i], [11,i]);
			present.text([i, .1], i, below);
			present.text([0, i], i, right);
		}
	}
	present.axes();
}
function graphPoint(x,y, labelPosition)
{
	
	this.x = x;
	this.y = y;
	this.coor = [this.x,this.y];
	this.label = getNextLabel();
	this.handle = 'p_'+this.label;
	this.color = getNextColor();
	this.labelPosition = labelPosition;
	this.regStr = this.label;  
	this.colorStr = colorString(this.label,this.color);
	
		
	
	
	this.drawInColor = function()
	{
		present.fontfill = this.color;
		present.text([this.x,this.y], this.label, this.labelPosition, this.handle);
	}
	
	this.drawInOtherColor = function(color)
	{
		present.fontfill = color;
		present.text([this.x,this.y], this.label, this.labelPosition, this.handle);
	}
	
	this.draw = function()
	{
		present.fontfill = defaultColor;
		present.text([this.x,this.y], this.label, this.labelPosition, this.handle);
	}
	
	pointRegister.push(this);
}


function graphAngle(p1,vertex, p2) //p1 should be counter clockwise from p2 and less than 180 deg away
{
	this.color = getNextColor();
	this.startLine = new graphLine(vertex, p2);
	this.endLine = new graphLine(vertex, p1);

	this.p1 = p1;
	this.p2 = p2;
	this.vertex = vertex;
	this.regStr = '<B>&ang;'+p1.regStr+vertex.regStr+p2.regStr+'</B>';
	this.colorStr = colorString(this.regStr, this.color);
	this.handle = 'a_'+p1.regStr+vertex.regStr+p2.regStr;
	
	this.drawLinesInOtherColor = function(lines, color)
	{
		var baseShift = .15;
		var incrementalShift = .05;
		var startLine = new graphLine(vertex, p2);
		var endLine = new graphLine(vertex, p1);
		//alert([lines, color]);
		for(var i=0; i<lines; i++)
		{
			var howFarEnd = baseShift/this.endLine.getLength();
			var howFarStart = baseShift/this.startLine.getLength();
			
			var endX =  this.vertex.x + howFarEnd*(this.p1.x-this.vertex.x);
			var startX = this.vertex.x + howFarStart*(this.p2.x-this.vertex.x);
			var endY = this.vertex.y + howFarEnd*(this.p1.y-this.vertex.y);
			var startY = this.vertex.y + howFarStart*(this.p2.y-this.vertex.y);
			
			present.stroke = color;
			//alert([startX, startY, endX, endY, this.handle]);
			present.arc([startX, startY], [endX, endY], baseShift,this.handle+i);
			baseShift+=incrementalShift;
		}
	}
	
	
	this.eraseLines = function(lines)
	{
		for(var i=0; i<lines; i++)
		{
			
			present.line([-500, -500], [-500, -500],this.handle+i);
		}
		
	}
	
	
	this.drawLinesInColor = function(lines)
	{
		
		this.drawLinesInOtherColor(lines, this.color);
	}
	
	this.drawLines = function(lines)
	{
		this.drawLinesInOtherColor(lines, defaultColor);
	}
	
	this.draw = function()
	{
		this.eraseLines(1);
		//this.drawLines(1);
	}
	this.drawInColor = function()
	{
		this.drawLinesInColor(1);
	}
	this.drawInOtherColor = function(color)
	{
		this.drawLinesInOtherColor(color);
	}
	angleRegister.push(this);
}

function equalAngles(angle1, angle2, lines)
{
	this.angle1 = angle1;
	this.angle2 = angle2;
	this.lines = lines;
	
	this.drawInColor = function()
	{
		this.angle1.drawLinesInColor(this.lines);
		this.angle2.drawLinesInColor(this.lines);
	}
	
	this.draw = function()
	{
		this.angle1.eraseLines(this.lines);
		this.angle2.eraseLines(this.lines);
	}
}

function graphRightAngle(p1,vertex, p2) //p1 should be counter clockwise from p2 and less than 180 deg away; assumes the edges are parrallel to the 
{
	this.color = getNextColor();
	this.startLine = new graphLine(vertex, p2);
	this.endLine = new graphLine(vertex, p1);

	this.p1 = p1;
	this.p2 = p2;
	this.vertex = vertex;
	
	this.allPoints = new Array(this.p1, this.p2, this.vertex);
	this.center = new graphPoint((this.p1.x+this.p2.x+this.vertex.x)/3, (this.p1.y+this.p2.y+this.vertex.y)/3);
	
	
	this.handle = 'a_'+p1.regStr+vertex.regStr+p2.regStr;
	this.regStr = '<B>&ang;'+p1.regStr+vertex.regStr+p2.regStr+'</b>';
	this.colorStr = colorString(this.regStr, this.color);
	
	this.drawInOtherColor = function(color)
	{
		var baseShift = .1;
		var startLine = new graphLine(vertex, p2);
		var endLine = new graphLine(vertex, p1);
		
	
		var howFarEnd = baseShift/endLine.getLength();
		var howFarStart = baseShift/startLine.getLength();
			
		var endShiftX = howFarEnd*(this.p1.x-this.vertex.x);
		var startShiftX = howFarStart*(this.p2.x-this.vertex.x);
		var endShiftY = howFarEnd*(this.p1.y-this.vertex.y);
		var startShiftY = howFarStart*(this.p2.y-this.vertex.y);
			
		var endX =  this.vertex.x + endShiftX;
		var startX = this.vertex.x + startShiftX;
		var endY = this.vertex.y + endShiftY;
		var startY = this.vertex.y + startShiftY;
		var midX = this.vertex.x + (endShiftX+startShiftX);
		var midY = this.vertex.y + (endShiftY+startShiftY);
			
		present.stroke = color;
		present.path([[endX, endY], [midX, midY], [startX, startY]]);
	}
	
	this.drawInColor = function()
	{
		this.drawInOtherColor(this.color);
	}
	
	this.draw = function()
	{
		this.drawInOtherColor(defaultColor);
	}
	
	
	this.rotate = function(axisPoint, degrees)
	{
		var rads = degrees*Math.PI/180;
		for(var k=0; k < this.allPoints.length; k++)
		{
			var curPoint = this.allPoints[k];
			var curLabelPosition = curPoint.labelPosition;
			curPoint.labelPosition = posArray[($.inArray(curLabelPosition,posArray)+Math.floor(degrees/45))%posArray.length];
			var distance = getDistance(axisPoint, curPoint);
			var curAngle = Math.atan2(curPoint.y-axisPoint.y, curPoint.x-axisPoint.x);
		
			var newAngle = curAngle+rads;
		
			curPoint.x = distance*Math.cos(newAngle);
			curPoint.y = distance*Math.sin(newAngle);
		
			curPoint.coor = [curPoint.x, curPoint.y];
		}
		this.center.x = (this.left.x+this.top.x+this.right.x)/3;
		this.center.y = (this.left.y+this.top.y+this.right.y)/3;
		this.center.coor = [this.center.x, this.center.y];
	}
	
	
	
	this.scale = function(factor)
	{
		for(var k=0; k<this.allPoints.length; k++)
		{
			var curPoint = this.allPoints[k];
			var distance = getDistance(this.center, curPoint);
			var curAngle = Math.atan2(curPoint.y-this.center.y, curPoint.x-this.center.x);
			
			var newDistance = distance * factor;
			
			curPoint.x = newDistance*Math.cos(curAngle);
			curPoint.y = newDistance*Math.sin(curAngle);
			curPoint.coor = [curPoint.x, curPoint.y];
		}
	}
	
	this.shift = function(xShift, yShift)
	{
		for(var k=0; k<this.allPoints.length; k++)
		{
			var curPoint = this.allPoints[k];
			curPoint.x += xShift;
			curPoint.y += yShift;
			curPoint.coor = [curPoint.x, curPoint.y];
		}
		
		this.center.x += xShift;
		this.center.y += yShift;
		this.center.coor = [this.center.x, this.center.y];
		
	}
	
	
	
	//angleRegister.push(this);	
}



function noLabelLine(start, end)
{
	this.line = new graphLine(start, end);
	
	
	
	this.drawInOtherColor = function(color)
	{
		present.stroke = color;
		present.line(this.line.start.coor, this.line.end.coor, this.line.handle);
	}

	
	this.drawInColor = function()
	{
		this.drawInOtherColor(this.line.color);
	}
	
	this.draw = function()
	{
		this.drawInOtherColor(defaultColor);
	}
}
	

function congruentLabel(line1, line2, markers)
{
	
	this.labels1 = line1.getCrossLines(markers);
	this.labels2 = line2.getCrossLines(markers);
	this.color = getNextColor();
	
	this.drawInColor = function()
	{
		for(var k=0; k<this.labels1.length; k++)
		{
			this.labels1[k].drawInOtherColor(this.color);	
		}
		for(var k=0; k<this.labels2.length; k++)
		{
			this.labels2[k].drawInOtherColor(this.color);	
		}
	}
	
	this.draw = function()
	{
		for(var k=0; k<this.labels1.length; k++)
		{
			this.labels1[k].draw();	
		}
		for(var k=0; k<this.labels2.length; k++)
		{
			this.labels2[k].draw();	
		}
	}

}



function graphLine(start, end)
{
	this.start = start; //assumes that it is passed a graphPoint Object for start and end
	this.end = end;
	this.handle = 'l_'+start.label+'_'+end.label;
	this.color = getNextColor();
	this.regStr = '<b>'+overline(this.start.regStr+this.end.regStr)+'</b>';
	this.colorStr = colorString(this.regStr, this.color);
	
	var crossPointDistance = .04;
	var crossLineLength = .04;
	
	
	
	this.getCrossLineGivenPoint = function(x,y)
	{
		var pStart = new graphPoint(x, y-crossLineLength, above);
		var pEnd = new graphPoint(x, y+crossLineLength, above);
		var pSlope = this.perpendicularSlope();
		if (pSlope!=null)
		{
			var xShift = crossLineLength/Math.sqrt(1+Math.pow(pSlope,2));
			pStart = new graphPoint(x-xShift, y-xShift*pSlope, above);
			pEnd = new graphPoint(x+xShift, y+xShift*pSlope, above);
		}
		
		
		return  (new noLabelLine(pStart, pEnd));
	}
	
	
	this.getCrossLines = function(number)
	{
		var midX = (start.x+end.x)/2;
		var midY = (start.y+end.y)/2;
		var crossLines = new Array();
		
		
		var length = this.getLength();
		var weightIncr = crossPointDistance/length;
		
		var startWeight = .5-weightIncr*(number-1)/2; //this works if number is odd
		if (number%2==0)
		{
			startWeight+=weightIncr/2;
		}
	
		var weight = startWeight;
		
		for(var i=0; i<number; i++)
		{
			
			var curX = weight*this.start.x + (1-weight)*this.end.x;
			var curY = weight*this.start.y + (1-weight)*this.end.y;
			crossLines.push(this.getCrossLineGivenPoint(curX, curY));
			weight+=weightIncr;
		}
		
		return crossLines;
		
	}
	
	
	this.getCrossLine = function()
	{
		var midX = (this.start.x+this.end.x)/2;
		var midY = (this.start.y+this.end.y)/2;
		
		
		return this.getCrossLineGivenPoint(midX, midY);
	
	}
	
	this.drawInColor = function()
	{
		start.drawInOtherColor(this.color);
		end.drawInOtherColor(this.color);
		present.stroke = this.color;
		present.line(this.start.coor, this.end.coor, this.handle);
	}
	
	this.drawInOtherColor = function(color)
	{
		start.drawInOtherColor(color);
		end.drawInOtherColor(color);
		present.stroke = color;
		present.line(this.start.coor, this.end.coor, this.handle);
	}
	
	this.draw = function()
	{
		start.draw();
		end.draw();
		present.stroke = defaultColor;
		present.line(this.start.coor, this.end.coor, this.handle);
	}
	
	this.getLength = function()
	{
		return Math.sqrt(Math.pow(this.start.x-this.end.x, 2)+Math.pow(this.start.y-this.end.y, 2));
	}
	
	
	this.perpendicularSlope = function()
	{
		if (this.end.y==this.start.y)
			return null;
		else
			return (this.start.x-this.end.x)/(this.end.y-this.start.y);
	}
	
	
	this.getSlope = function()
	{
		if (this.end.x==this.start.x)
			return null;
		else
			return (this.end.y-this.start.y)/(this.end.x-this.start.x);
	}
	
}



function graphCircle(center, radius)
{
	this.center = center;
	this.radius = radius;
	this.handle = this.center.handle+this.radius.handle;
	this.color = getNextColor();
	this.regStr = "<B>the circle centered at point "+this.center.regStr+" with radius "+this.radius.regStr+"</B>";
	this.colorStr = colorString(this.regStr, this.color);
	
	this.drawInColor = function()
	{
		present.stroke = this.color;
		present.circle(this.center.coor, this.radius.getLength(), this.handle);
	}
	
	this.drawInOtherColor = function(color)
	{
		present.stroke = color;
		present.circle(this.center.coor, this.radius.getLength(), this.handle);
	}
	
	this.draw = function()
	{
		present.stroke = defaultColor;
		present.circle(this.center.coor, this.radius.getLength(), this.handle);
	}
}

function graphRectangle(topLeft, topRight, bottomRight, bottomLeft)
{
	this.topLeft = topLeft;
	this.topRight = topRight;
	this.bottomRight = bottomRight;
	this.bottomLeft = botomLeft;
	
	this.top = new graphLine(this.topLeft, this.topRight);
	this.right = new graphLine(this.topRight, this.bottomRight);
	this.bottom = new graphLine(this.bottomRight, this.bottomLeft);
	this.left = new graphLine(this.bottomLeft, this.topLeft);
	
	this.color = getNextColor();
	this.regStr = "<b>rectangle "+this.topLeft.regStr+this.topRight.regStr+this.bottomRight.regStr+this.bottomLeft.regStr+"</b>";
	this.colorStr = colorString(this.regStr, this.color);
	
	this.drawInColor = function()
	{
		this.top.drawInOtherColor(this.color);
		this.right.drawInOtherColor(this.color);
		this.bottom.drawInOtherColor(this.color);
		this.left.drawInOtherColor(this.color);
	}
		
	this.drawInOtherColor = function(color)
	{	
		this.top.drawInOtherColor(color);
		this.right.drawInOtherColor(color);
		this.bottom.drawInOtherColor(color);
		this.left.drawInOtherColor(color);
	}
	
	this.draw = function()
	{
		this.top.draw();
		this.right.draw();
		this.bottom.draw();
		this.left.draw();
	}
	
}

function graphPolygon(vertices){
    this.color = getNextColor();
    this.vertices = vertices;
    this.sides = [];
    //this.angles = [];
    for(var i = 0; i < vertices.length; i++){
        this.sides.push(new noLabelLine(this.vertices[i], this.vertices[(i + 1)%vertices.length]));
        //this.angles.push(new graphAngle(this.vertices[(i-1)%vertices.length], this.vertices[i], this.vertices[(i+1)%vertices.length]));
    }

    //this.regStr = ("<b>Polygon</b>"); //TODO - this isn't right, but appending 12 point names doesn't make much sense either
    //this.colorStr = (this.regStr, this.color);

    this.drawInColor = function()
    {
        this.drawInOtherColor(this.color);
    }

    this.drawInOtherColor = function(color)
    {
        for(var i = 0; i < this.sides.length; i++){
            this.sides[i].drawInOtherColor(color);
        }
    }

    this.draw = function()
    {
        for(var i = 0; i < this.sides.length; i++){
            this.sides[i].draw();
        }
    }
}


function graphTriangle(left, top, right)
{
	this.left = left;
	this.top = top;
	this.right = right;
	this.center = new graphPoint((this.left.x+this.top.x+this.right.x)/3, (this.left.y+this.top.y+this.right.y)/3);
	
	this.allPoints = new Array(this.left, this.top, this.right);
	
	
	this.leftSide = new graphLine(this.left, this.top);
	this.rightSide = new graphLine(this.top, this.right);
	this.bottomSide = new graphLine(this.right, this.left);
	
	this.rightSide.oppAngle = new graphAngle(this.top, this.left, this.right);
	this.leftSide.oppAngle = new graphAngle(this.left, this.right, this.top);
	this.bottomSide.oppAngle = new graphAngle(this.right, this.top, this.left);
	
	this.sides = [this.rightSide, this.leftSide, this.bottomSide];
	
	
	this.color = getNextColor();
	this.regStr = "<b>triangle "+this.left.regStr+this.top.regStr+this.right.regStr+"</b>";
	this.colorStr = colorString(this.regStr, this.color);
	
	
	
	this.rotate = function(axisPoint, degrees)
	{
		var rads = degrees*Math.PI/180;
	
		for(var k=0; k<this.allPoints.length; k++)
		{
			var curPoint = this.allPoints[k];
			var curLabelPosition = curPoint.labelPosition;
			curPoint.labelPosition = posArray[($.inArray(curLabelPosition, posArray)+Math.floor(degrees/45))%posArray.length];
			var distance = getDistance(axisPoint, curPoint);
			var curAngle = Math.atan2(curPoint.y-axisPoint.y, curPoint.x-axisPoint.x);
		
			var newAngle = curAngle+rads;
		
			curPoint.x = distance*Math.cos(newAngle);
			curPoint.y = distance*Math.sin(newAngle);
		
			curPoint.coor = [curPoint.x, curPoint.y];
		}
		this.center.x = (this.left.x+this.top.x+this.right.x)/3;
		this.center.y = (this.left.y+this.top.y+this.right.y)/3;
		this.center.coor = [this.center.x, this.center.y];
	}
	
	
	
	this.scale = function(factor)
	{
		for(var k=0; k<this.allPoints.length; k++)
		{
			var curPoint = this.allPoints[k];
			var distance = getDistance(this.center, curPoint);
			var curAngle = Math.atan2(curPoint.y-this.center.y, curPoint.x-this.center.x);
			
			var newDistance = distance * factor;
			
			curPoint.x = newDistance*Math.cos(curAngle);
			curPoint.y = newDistance*Math.sin(curAngle);
			curPoint.coor = [curPoint.x, curPoint.y];
		}
	}
	
	this.shift = function(xShift, yShift)
	{
		for(var k=0; k<this.allPoints.length; k++)
		{
			var curPoint = this.allPoints[k];
			curPoint.x += xShift;
			curPoint.y += yShift;
			curPoint.coor = [curPoint.x, curPoint.y];
		}
		
		this.center.x += xShift;
		this.center.y += yShift;
		this.center.coor = [this.center.x, this.center.y];
		
	}
	
	
	
	this.drawInColor = function()
	{
		this.leftSide.drawInOtherColor(this.color);
		this.rightSide.drawInOtherColor(this.color);
		this.bottomSide.drawInOtherColor(this.color);
	}
	
	this.drawInOtherColor = function(color)
	{
		this.leftSide.drawInOtherColor(color);
		this.rightSide.drawInOtherColor(color);
		this.bottomSide.drawInOtherColor(color);
	}
	
	this.draw = function()
	{
		this.leftSide.draw();
		this.rightSide.draw();
		this.bottomSide.draw();
	}
		
	this.getAltitude = function(side)
	{
		if (side=='top')
		{
			var basePoint =  getOtherAltitudePoint(this.top, this.left, this.right);
			return (new graphLine(this.top, basePoint));
		} 
		
		else if (side == 'left')
		{
			var basePoint = getOtherAltitudePoint(this.left, this.top, this.right);
			basePoint.labelPosition = aboveright;
			return (new graphLine(this.top, basePoint));
			
		} 
		else if (side == 'right')
		{
			var basePoint = getOtherAltitudePoint(this.right, this.left, this.top);
			basePoint.labelPosition = aboveleft;
			return (new graphLine(this.top, basePoint));
		}
		
	}
	
	
	
	
	function getOtherAltitudePoint(start, base1, base2)
	{
		var baseSlope = getSlope(base1, base2);
		var baseIntercept = base1.y - baseSlope*base1.x;
		var altSlope = -1/baseSlope;
		var altIntercept = start.y - altSlope*start.x;
		
		var endX = (altIntercept - baseIntercept)/(baseSlope-altSlope)
		var endY = baseSlope*endX + baseIntercept;
		var point = new graphPoint(endX, endY, below);
		return point;	
	}
	
	

}


function getEquilateral()
{
	return (new graphTriangle(new graphPoint(0,0,belowleft), new graphPoint(.5, Math.sqrt(3)/2, above), new graphPoint(1,0,belowright)));
}

function getIsoscelese()
{
	return (new graphTriangle(new graphPoint(0,0,belowleft), new graphPoint(.5, 1, above), new graphPoint(1,0, belowright)));
}

function get454590()
{
	return (new graphTriangle(new graphPoint(0,0,belowleft), new graphPoint(0,1,aboveleft), new graphPoint(1,0, belowright)));
}

function get306090()
{
	return (new graphTriangle(new graphPoint(0,0,belowleft), new graphPoint(0, Math.sqrt(3)/2, aboveleft), new graphPoint(.5,0,belowright)));
}

function getFlipped306090()
{
	var t = new graphTriangle(new graphPoint(-.5,0,belowleft), new graphPoint(0, Math.sqrt(3)/2, aboveright),new graphPoint(0,0,belowright));
	//The 3 lines below are to make sure that the corressponding sides to a non-flipped triangle are still corressponding
	var temp = t.sides[0];
	t.sides[0] = t.sides[1];
	t.sides[1] = temp;
	return t;
}

function getSeparateSimilarTriangles()
{
	var t1 = get306090();
	var t2 = getFlipped306090();
	
	if (getRandomIntRange(0,1)==1)
		t2 = get306090();
	
	t2.rotate(t2.center, getRandomIntRange(0,359));
	t2.scale(.75);
	t2.shift(-.6, .4);
	
	return [t1, t2];
}


function getOverlayedSimilarTriangles()
{
		
		var topPoint = new graphPoint(getRandomIntRange(-2,2)/10,1, above);
		//alert(1);
		var bigLeftPoint = new graphPoint(getRandomIntRange(-6,4)/10,0,belowleft);
		var bigRightPoint = new graphPoint(getRandomIntRange(bigLeftPoint.x+5, bigLeftPoint.x+10)/10,0, belowright);
		var midLinePosition = getRandomIntRange(40,60);
		//alert(2);
		
		var smallLeftPoint = new graphPoint(midLinePosition*topPoint.x/100+(100-midLinePosition)*bigLeftPoint.x/100, midLinePosition*topPoint.y/100+(100-midLinePosition)*bigLeftPoint.y/100, left);
		var smallRightPoint = new graphPoint(midLinePosition*topPoint.x/100+(100-midLinePosition)*bigRightPoint.x/100, midLinePosition*topPoint.y/100+(100-midLinePosition)*bigRightPoint.y/100, right);
		//alert(3);
		
		var t1 = new graphTriangle(bigLeftPoint, topPoint, bigRightPoint);
		var t2 = new graphTriangle(smallLeftPoint, topPoint, smallRightPoint);
		
		
		//var t1 = new graphTriangle(new graphPoint(0,0,belowleft), new graphPoint(0, Math.sqrt(3)/2, aboveleft), new graphPoint(.5,0,belowright));
		//var t2 = new graphTriangle(new graphPoint(-.5,0,belowleft), new graphPoint(0, Math.sqrt(3)/2, aboveright),new graphPoint(0,0,belowright));
		
		//alert(4);
		return [t1,t2];
	
}


function getRegularPolygon(n){
    var vertices = [];
    var offset = (Math.PI / 2) + getRandomIntRange(0, 1) * Math.PI / n;
    for(var i = 0; i < n; i++){
        var theta = offset + i * Math.PI * 2 / n;
        vertices.push(new graphPoint(Math.cos(theta), Math.sin(theta), belowleft)); //TODO - Label positions need to be set better if they're going to be used
    }
    return new graphPolygon(vertices);
}

function overline(x)
{
	return ('<font style=\"text-decoration: overline;\">'+x+'</font>');
}


function writeGraphicalHint(hint, stuffToDraw)
{
	if (stuffToDraw!=null)
	{
		graphicalHints[next_step_to_write] = stuffToDraw;
	}
	writeStep(hint);
}


KhanAcademy_hint_by_id = {};

// Store away the innerHTML of the hints so that users don't accidentally see it if they copy/paste
// the page to a text editor as described in issue 57.
function hide_hints() {
	var step = 1;
	while(true) {
		var part = 1;
		while (true) {
			var id = "step" + step + "_" + part;
			var elem = document.getElementById(id);
			if (!elem) 
				break;
			KhanAcademy_hint_by_id[id] = elem.innerHTML;
			elem.innerHTML = '';
			part++;
		}
		if (part == 1) 
			// Nothing for this step so we must be done
			break;
		step++;
	}	
}

function give_next_step() {
	
	var justDrawn = graphicalHints[steps_given];
	if (justDrawn)
	{
		for(var k=0; k<justDrawn.length; k++)
			justDrawn[k].draw();
	}
	steps_given++;
	var toDraw = graphicalHints[steps_given];
	if (toDraw)
	{
		for(var k=0; k<toDraw.length; k++)
			toDraw[k].drawInColor();
	}
	
	
	
	//graph_update();
	for(var i=1; i<=display_per_step; i++)
	{
		show_step(i);
	}
	translate(); // Process any ASCII Math -> MathML
}

function show_step(i)
{
	var id = "step"+steps_given+"_"+i;
	var elem = document.getElementById(id);
	if (elem) 
	{
		elem.innerHTML = KhanAcademy_hint_by_id[id];
		elem.style.visibility = 'visible';				
	}
}

function randomRotation()
{
	rotateGraph(getRandomIntRange(0,359));
}


var posArray = new Array(above, aboveleft, left, belowleft, below, belowright, right, aboveright);
var flipArray = {above: above, aboveleft: aboveright, left: right, belowleft: belowright, below: below, belowright: belowleft, right: left, aboveright:aboveleft};
	

function rotateGraph(degrees) {
	var dimensionMax = .25;
	var dimensionMin = 0;
	
	var flip = false;
	if (getRandomIntRange(1,2)==2)
		flip = true;
	
	
	
	for(var k=0; k<pointRegister.length; k++)
	{
		var curPoint = pointRegister[k];
		dimensionMax = Math.max(dimensionMax, Math.max(curPoint.x, curPoint.y));
		dimensionMin = Math.min(dimensionMin, Math.min(curPoint.x, curPoint.y));
	}
	
	var center = .5*(dimensionMax+dimensionMin);
	var rads = degrees*Math.PI/180;
	var centerPoint = new graphPoint(center, center, above);
	
	for(var k=0; k<pointRegister.length; k++)
	{
		var curPoint = pointRegister[k];
		var curLabelPosition = curPoint.labelPosition;
		curPoint.labelPosition = posArray[($.inArray(curLabelPosition,posArray)+Math.floor(degrees/45))%posArray.length];
		var distance = getDistance(centerPoint, curPoint);
		var curAngle = Math.atan2(curPoint.y-centerPoint.y, curPoint.x-centerPoint.x);
		
		var newAngle = curAngle+rads;
		
		curPoint.x = distance*Math.cos(newAngle);
		curPoint.y = distance*Math.sin(newAngle);
		
		
		
		if (flip)
		{
			curPoint.x = -1*curPoint.x;
			curPoint.labelPosition = flipArray[curPoint.labelPosition];
		}
		curPoint.coor = [curPoint.x, curPoint.y];
	}
	
	if (flip)
	{
		for(var k=0; k<angleRegister.length; k++)
		{
			var curAngle = angleRegister[k];
			
			var tempLine = curAngle.startLine;
			curAngle.startLine = curAngle.endLine;
			curAngle.endLine = tempLine;
			
			var tempPoint = curAngle.p1;
			curAngle.p1 = curAngle.p2;
			curAngle.p2 = tempPoint;
		}
	}
}




function initGraph() {
	
	//var dimensionMax = .25;
	//var dimensionMin = 0;
	
	var xMax = .25;
	var yMax = .25;
	var xMin = 0;
	var yMin = 0;
	
	for(var k=0; k < pointRegister.length; k++)
	{
		var curPoint = pointRegister[k];
		xMax = Math.max(xMax, curPoint.x);
		yMax = Math.max(yMax, curPoint.y);
		xMin = Math.min(xMin, curPoint.x);
		yMin = Math.min(yMin, curPoint.y);
		//dimensionMax = Math.max(dimensionMax, Math.max(curPoint.x, curPoint.y));
		//dimensionMin = Math.min(dimensionMin, Math.min(curPoint.x, curPoint.y));
	}
	
	
	var yCenter = (yMax+yMin)/2;
	var xCenter = (xMax+xMin)/2;
	
	if ((xMax-xMin)>(yMax-yMin))
	{
		var margin = .25*(xMax-xMin);
		//alert([xMin-margin, xMax+margin, yCenter-margin-(xMax-xMin)/2, yCenter+margin+(xMax-xMin)/2]);
		present.initPicture(xMin-margin, xMax+margin, yCenter-margin-(xMax-xMin)/2, yCenter+margin+(xMax-xMin)/2);
	}
	else
	{
		var margin = .25*(yMax-yMin);
		present.initPicture(xCenter-margin-(yMax-yMin)/2, xCenter+margin+(yMax-yMin)/2, yMin-margin, yMax+margin);
		
	}
	
	//var margin = .25*(dimensionMax - dimensionMin);
	present.strokewidth = "2";
	//present.initPicture(dimensionMin-margin,dimensionMax+margin, dimensionMin-margin,dimensionMax+margin);
	for(var k=0; k < initialObjectsToDraw.length; k++)
	{
		initialObjectsToDraw[k].draw();
	}


}

function graph_update() {
	
	initGraph();
}


	

/*!
 * Raphael 1.5.2 - JavaScript Vector Library
 *
 * Copyright (c) 2010 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://raphaeljs.com/license.html) license.
 */
(function () {
    function R() {
        if (R.is(arguments[0], array)) {
            var a = arguments[0],
                cnv = create[apply](R, a.splice(0, 3 + R.is(a[0], nu))),
                res = cnv.set();
            for (var i = 0, ii = a[length]; i < ii; i++) {
                var j = a[i] || {};
                elements[has](j.type) && res[push](cnv[j.type]().attr(j));
            }
            return res;
        }
        return create[apply](R, arguments);
    }
    R.version = "1.5.2";
    var separator = /[, ]+/,
        elements = {circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1},
        formatrg = /\{(\d+)\}/g,
        proto = "prototype",
        has = "hasOwnProperty",
        doc = document,
        win = window,
        oldRaphael = {
            was: Object[proto][has].call(win, "Raphael"),
            is: win.Raphael
        },
        Paper = function () {
            this.customAttributes = {};
        },
        paperproto,
        appendChild = "appendChild",
        apply = "apply",
        concat = "concat",
        supportsTouch = "createTouch" in doc,
        E = "",
        S = " ",
        Str = String,
        split = "split",
        events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend orientationchange touchcancel gesturestart gesturechange gestureend"[split](S),
        touchMap = {
            mousedown: "touchstart",
            mousemove: "touchmove",
            mouseup: "touchend"
        },
        join = "join",
        length = "length",
        lowerCase = Str[proto].toLowerCase,
        math = Math,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        pow = math.pow,
        PI = math.PI,
        nu = "number",
        string = "string",
        array = "array",
        toString = "toString",
        fillString = "fill",
        objectToString = Object[proto][toString],
        paper = {},
        push = "push",
        ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
        colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
        isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
        bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
        round = math.round,
        setAttribute = "setAttribute",
        toFloat = parseFloat,
        toInt = parseInt,
        ms = " progid:DXImageTransform.Microsoft",
        upperCase = Str[proto].toUpperCase,
        availableAttrs = {blur: 0, "clip-rect": "0 0 1e9 1e9", cursor: "default", cx: 0, cy: 0, fill: "#fff", "fill-opacity": 1, font: '10px "Arial"', "font-family": '"Arial"', "font-size": "10", "font-style": "normal", "font-weight": 400, gradient: 0, height: 0, href: "http://raphaeljs.com/", opacity: 1, path: "M0,0", r: 0, rotation: 0, rx: 0, ry: 0, scale: "1 1", src: "", stroke: "#000", "stroke-dasharray": "", "stroke-linecap": "butt", "stroke-linejoin": "butt", "stroke-miterlimit": 0, "stroke-opacity": 1, "stroke-width": 1, target: "_blank", "text-anchor": "middle", title: "Raphael", translation: "0 0", width: 0, x: 0, y: 0},
        availableAnimAttrs = {along: "along", blur: nu, "clip-rect": "csv", cx: nu, cy: nu, fill: "colour", "fill-opacity": nu, "font-size": nu, height: nu, opacity: nu, path: "path", r: nu, rotation: "csv", rx: nu, ry: nu, scale: "csv", stroke: "colour", "stroke-opacity": nu, "stroke-width": nu, translation: "csv", width: nu, x: nu, y: nu},
        rp = "replace",
        animKeyFrames= /^(from|to|\d+%?)$/,
        commaSpaces = /\s*,\s*/,
        hsrg = {hs: 1, rg: 1},
        p2s = /,?([achlmqrstvxz]),?/gi,
        pathCommand = /([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig,
        radial_gradient = /^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/,
        sortByKey = function (a, b) {
            return a.key - b.key;
        };

    R.type = (win.SVGAngle || doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    if (R.type == "VML") {
        var d = doc.createElement("div"),
            b;
        d.innerHTML = '<v:shape adj="1"/>';
        b = d.firstChild;
        b.style.behavior = "url(#default#VML)";
        if (!(b && typeof b.adj == "object")) {
            return R.type = null;
        }
        d = null;
    }
    R.svg = !(R.vml = R.type == "VML");
    Paper[proto] = R[proto];
    paperproto = Paper[proto];
    R._id = 0;
    R._oid = 0;
    R.fn = {};
    R.is = function (o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
            return !isnan[has](+o);
        }
        return  (type == "null" && o === null) ||
                (type == typeof o) ||
                (type == "object" && o === Object(o)) ||
                (type == "array" && Array.isArray && Array.isArray(o)) ||
                objectToString.call(o).slice(8, -1).toLowerCase() == type;
    };
    R.angle = function (x1, y1, x2, y2, x3, y3) {
        if (x3 == null) {
            var x = x1 - x2,
                y = y1 - y2;
            if (!x && !y) {
                return 0;
            }
            return ((x < 0) * 180 + math.atan(-y / -x) * 180 / PI + 360) % 360;
        } else {
            return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
        }
    };
    R.rad = function (deg) {
        return deg % 360 * PI / 180;
    };
    R.deg = function (rad) {
        return rad * 180 / PI % 360;
    };
    R.snapTo = function (values, value, tolerance) {
        tolerance = R.is(tolerance, "finite") ? tolerance : 10;
        if (R.is(values, array)) {
            var i = values.length;
            while (i--) if (abs(values[i] - value) <= tolerance) {
                return values[i];
            }
        } else {
            values = +values;
            var rem = value % values;
            if (rem < tolerance) {
                return value - rem;
            }
            if (rem > values - tolerance) {
                return value - rem + values;
            }
        }
        return value;
    };
    function createUUID() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [],
            i = 0;
        for (; i < 32; i++) {
            s[i] = (~~(math.random() * 16))[toString](16);
        }
        s[12] = 4;  // bits 12-15 of the time_hi_and_version field to 0010
        s[16] = ((s[16] & 3) | 8)[toString](16);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        return "r-" + s[join]("");
    }

    R.setWindow = function (newwin) {
        win = newwin;
        doc = win.document;
    };
    // colour utilities
    var toHex = function (color) {
        if (R.vml) {
            // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
            var trim = /^\s+|\s+$/g;
            var bod;
            try {
                var docum = new ActiveXObject("htmlfile");
                docum.write("<body>");
                docum.close();
                bod = docum.body;
            } catch(e) {
                bod = createPopup().document.body;
            }
            var range = bod.createTextRange();
            toHex = cacher(function (color) {
                try {
                    bod.style.color = Str(color)[rp](trim, E);
                    var value = range.queryCommandValue("ForeColor");
                    value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                    return "#" + ("000000" + value[toString](16)).slice(-6);
                } catch(e) {
                    return "none";
                }
            });
        } else {
            var i = doc.createElement("i");
            i.title = "Rapha\xebl Colour Picker";
            i.style.display = "none";
            doc.body[appendChild](i);
            toHex = cacher(function (color) {
                i.style.color = color;
                return doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
            });
        }
        return toHex(color);
    },
    hsbtoString = function () {
        return "hsb(" + [this.h, this.s, this.b] + ")";
    },
    hsltoString = function () {
        return "hsl(" + [this.h, this.s, this.l] + ")";
    },
    rgbtoString = function () {
        return this.hex;
    };
    R.hsb2rgb = function (h, s, b, o) {
        if (R.is(h, "object") && "h" in h && "s" in h && "b" in h) {
            b = h.b;
            s = h.s;
            h = h.h;
            o = h.o;
        }
        return R.hsl2rgb(h, s, b / 2, o);
    };
    R.hsl2rgb = function (h, s, l, o) {
        if (R.is(h, "object") && "h" in h && "s" in h && "l" in h) {
            l = h.l;
            s = h.s;
            h = h.h;
        }
        if (h > 1 || s > 1 || l > 1) {
            h /= 360;
            s /= 100;
            l /= 100;
        }
        var rgb = {},
            channels = ["r", "g", "b"],
            t2, t1, t3, r, g, b;
        if (!s) {
            rgb = {
                r: l,
                g: l,
                b: l
            };
        } else {
            if (l < .5) {
                t2 = l * (1 + s);
            } else {
                t2 = l + s - l * s;
            }
            t1 = 2 * l - t2;
            for (var i = 0; i < 3; i++) {
                t3 = h + 1 / 3 * -(i - 1);
                t3 < 0 && t3++;
                t3 > 1 && t3--;
                if (t3 * 6 < 1) {
                    rgb[channels[i]] = t1 + (t2 - t1) * 6 * t3;
                } else if (t3 * 2 < 1) {
                    rgb[channels[i]] = t2;
                } else if (t3 * 3 < 2) {
                    rgb[channels[i]] = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
                } else {
                    rgb[channels[i]] = t1;
                }
            }
        }
        rgb.r *= 255;
        rgb.g *= 255;
        rgb.b *= 255;
        rgb.hex = "#" + (16777216 | rgb.b | (rgb.g << 8) | (rgb.r << 16)).toString(16).slice(1);
        R.is(o, "finite") && (rgb.opacity = o);
        rgb.toString = rgbtoString;
        return rgb;
    };
    R.rgb2hsb = function (red, green, blue) {
        if (green == null && R.is(red, "object") && "r" in red && "g" in red && "b" in red) {
            blue = red.b;
            green = red.g;
            red = red.r;
        }
        if (green == null && R.is(red, string)) {
            var clr = R.getRGB(red);
            red = clr.r;
            green = clr.g;
            blue = clr.b;
        }
        if (red > 1 || green > 1 || blue > 1) {
            red /= 255;
            green /= 255;
            blue /= 255;
        }
        var max = mmax(red, green, blue),
            min = mmin(red, green, blue),
            hue,
            saturation,
            brightness = max;
        if (min == max) {
            return {h: 0, s: 0, b: max, toString: hsbtoString};
        } else {
            var delta = (max - min);
            saturation = delta / max;
            if (red == max) {
                hue = (green - blue) / delta;
            } else if (green == max) {
                hue = 2 + ((blue - red) / delta);
            } else {
                hue = 4 + ((red - green) / delta);
            }
            hue /= 6;
            hue < 0 && hue++;
            hue > 1 && hue--;
        }
        return {h: hue, s: saturation, b: brightness, toString: hsbtoString};
    };
    R.rgb2hsl = function (red, green, blue) {
        if (green == null && R.is(red, "object") && "r" in red && "g" in red && "b" in red) {
            blue = red.b;
            green = red.g;
            red = red.r;
        }
        if (green == null && R.is(red, string)) {
            var clr = R.getRGB(red);
            red = clr.r;
            green = clr.g;
            blue = clr.b;
        }
        if (red > 1 || green > 1 || blue > 1) {
            red /= 255;
            green /= 255;
            blue /= 255;
        }
        var max = mmax(red, green, blue),
            min = mmin(red, green, blue),
            h,
            s,
            l = (max + min) / 2,
            hsl;
        if (min == max) {
            hsl =  {h: 0, s: 0, l: l};
        } else {
            var delta = max - min;
            s = l < .5 ? delta / (max + min) : delta / (2 - max - min);
            if (red == max) {
                h = (green - blue) / delta;
            } else if (green == max) {
                h = 2 + (blue - red) / delta;
            } else {
                h = 4 + (red - green) / delta;
            }
            h /= 6;
            h < 0 && h++;
            h > 1 && h--;
            hsl = {h: h, s: s, l: l};
        }
        hsl.toString = hsltoString;
        return hsl;
    };
    R._path2string = function () {
        return this.join(",")[rp](p2s, "$1");
    };
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array[proto].slice.call(arguments, 0),
                args = arg[join]("\u25ba"),
                cache = newf.cache = newf.cache || {},
                count = newf.count = newf.count || [];
            if (cache[has](args)) {
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count[length] >= 1e3 && delete cache[count.shift()];
            count[push](args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }
 
    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none"};
        }
        !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
        var res,
            red,
            green,
            blue,
            opacity,
            t,
            values,
            rgb = colour.match(colourRegExp);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                green = toInt((t = rgb[3].charAt(2)) + t, 16);
                red = toInt((t = rgb[3].charAt(1)) + t, 16);
            }
            if (rgb[4]) {
                values = rgb[4][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
            }
            if (rgb[5]) {
                values = rgb[5][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsb2rgb(red, green, blue, opacity);
            }
            if (rgb[6]) {
                values = rgb[6][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsl2rgb(red, green, blue, opacity);
            }
            rgb = {r: red, g: green, b: blue};
            rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
            R.is(opacity, "finite") && (rgb.opacity = opacity);
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1};
    }, R);
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    R.getColor.reset = function () {
        delete this.start;
    };
    // path utilities
    R.parsePathString = cacher(function (pathString) {
        if (!pathString) {
            return null;
        }
        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data[length]) {
            Str(pathString)[rp](pathCommand, function (a, b, c) {
                var params = [],
                    name = lowerCase.call(b);
                c[rp](pathValues, function (a, b) {
                    b && params[push](+b);
                });
                if (name == "m" && params[length] > 2) {
                    data[push]([b][concat](params.splice(0, 2)));
                    name = "l";
                    b = b == "m" ? "l" : "L";
                }
                while (params[length] >= paramCounts[name]) {
                    data[push]([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        data[toString] = R._path2string;
        return data;
    });
    R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
            x = pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
            y = pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y,
            mx = p1x + 2 * t * (c1x - p1x) + t * t * (c2x - 2 * c1x + p1x),
            my = p1y + 2 * t * (c1y - p1y) + t * t * (c2y - 2 * c1y + p1y),
            nx = c1x + 2 * t * (c2x - c1x) + t * t * (p2x - 2 * c2x + c1x),
            ny = c1y + 2 * t * (c2y - c1y) + t * t * (p2y - 2 * c2y + c1y),
            ax = (1 - t) * p1x + t * c1x,
            ay = (1 - t) * p1y + t * c1y,
            cx = (1 - t) * c2x + t * p2x,
            cy = (1 - t) * c2y + t * p2y,
            alpha = (90 - math.atan((mx - nx) / (my - ny)) * 180 / PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {x: x, y: y, m: {x: mx, y: my}, n: {x: nx, y: ny}, start: {x: ax, y: ay}, end: {x: cx, y: cy}, alpha: alpha};
    };
    var pathDimensions = cacher(function (path) {
        if (!path) {
            return {x: 0, y: 0, width: 0, height: 0};
        }
        path = path2curve(path);
        var x = 0, 
            y = 0,
            X = [],
            Y = [],
            p;
        for (var i = 0, ii = path[length]; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X[push](x);
                Y[push](y);
            } else {
                var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X[concat](dim.min.x, dim.max.x);
                Y = Y[concat](dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        var xmin = mmin[apply](0, X),
            ymin = mmin[apply](0, Y);
        return {
            x: xmin,
            y: ymin,
            width: mmax[apply](0, X) - xmin,
            height: mmax[apply](0, Y) - ymin
        };
    }),
        pathClone = function (pathArray) {
            var res = [];
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            for (var i = 0, ii = pathArray[length]; i < ii; i++) {
                res[i] = [];
                for (var j = 0, jj = pathArray[i][length]; j < jj; j++) {
                    res[i][j] = pathArray[i][j];
                }
            }
            res[toString] = R._path2string;
            return res;
        },
        pathToRelative = cacher(function (pathArray) {
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[push](["M", x, y]);
            }
            for (var i = start, ii = pathArray[length]; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != lowerCase.call(pa[0])) {
                    r[0] = lowerCase.call(pa[0]);
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = +(pa[1] - y).toFixed(3);
                            break;
                        case "m":
                            mx = pa[1];
                            my = pa[2];
                        default:
                            for (var j = 1, jj = pa[length]; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    if (pa[0] == "m") {
                        mx = pa[1] + x;
                        my = pa[2] + y;
                    }
                    for (var k = 0, kk = pa[length]; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                var len = res[i][length];
                switch (res[i][0]) {
                    case "z":
                        x = mx;
                        y = my;
                        break;
                    case "h":
                        x += +res[i][len - 1];
                        break;
                    case "v":
                        y += +res[i][len - 1];
                        break;
                    default:
                        x += +res[i][len - 2];
                        y += +res[i][len - 1];
                }
            }
            res[toString] = R._path2string;
            return res;
        }, 0, pathClone),
        pathToAbsolute = cacher(function (pathArray) {
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[0] = ["M", x, y];
            }
            for (var i = start, ii = pathArray[length]; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != upperCase.call(pa[0])) {
                    r[0] = upperCase.call(pa[0]);
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x);
                            r[7] = +(pa[7] + y);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        case "M":
                            mx = +pa[1] + x;
                            my = +pa[2] + y;
                        default:
                            for (var j = 1, jj = pa[length]; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else {
                    for (var k = 0, kk = pa[length]; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        x = mx;
                        y = my;
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    case "M":
                        mx = res[i][res[i][length] - 2];
                        my = res[i][res[i][length] - 1];
                    default:
                        x = res[i][res[i][length] - 2];
                        y = res[i][res[i][length] - 1];
                }
            }
            res[toString] = R._path2string;
            return res;
        }, null, pathClone),
        l2c = function (x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },
        q2c = function (x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3,
                _23 = 2 / 3;
            return [
                    _13 * x1 + _23 * ax,
                    _13 * y1 + _23 * ay,
                    _13 * x2 + _23 * ax,
                    _13 * y2 + _23 * ay,
                    x2,
                    y2
                ];
        },
        a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            // for more information of where this math came from visit:
            // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
            var _120 = PI * 120 / 180,
                rad = PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = cacher(function (x, y, rad) {
                    var X = x * math.cos(rad) - y * math.sin(rad),
                        Y = x * math.sin(rad) + y * math.cos(rad);
                    return {x: X, y: Y};
                });
            if (!recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = math.cos(PI / 180 * angle),
                    sin = math.sin(PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                if (h > 1) {
                    h = math.sqrt(h);
                    rx = h * rx;
                    ry = h * ry;
                }
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                    f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                f1 = x1 < cx ? PI - f1 : f1;
                f2 = x2 < cx ? PI - f2 : f2;
                f1 < 0 && (f1 = PI * 2 + f1);
                f2 < 0 && (f2 = PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * math.cos(f2);
                y2 = cy + ry * math.sin(f2);
                res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = math.cos(f1),
                s1 = math.sin(f1),
                c2 = math.cos(f2),
                s2 = math.sin(f2),
                t = math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];
            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];
            if (recursive) {
                return [m2, m3, m4][concat](res);
            } else {
                res = [m2, m3, m4][concat](res)[join]()[split](",");
                var newres = [];
                for (var i = 0, ii = res[length]; i < ii; i++) {
                    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return newres;
            }
        },
        findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        },
        curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x[push](dot.x);
                y[push](dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x[push](dot.x);
                y[push](dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x[push](dot.x);
                y[push](dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x[push](dot.x);
                y[push](dot.y);
            }
            return {
                min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
            };
        }),
        path2curve = cacher(function (path, path2) {
            var p = pathToAbsolute(path),
                p2 = path2 && pathToAbsolute(path2),
                attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                processPath = function (path, d) {
                    var nx, ny;
                    if (!path) {
                        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                    }
                    !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "A":
                            path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                            break;
                        case "S":
                            nx = d.x + (d.x - (d.bx || d.x));
                            ny = d.y + (d.y - (d.by || d.y));
                            path = ["C", nx, ny][concat](path.slice(1));
                            break;
                        case "T":
                            d.qx = d.x + (d.x - (d.qx || d.x));
                            d.qy = d.y + (d.y - (d.qy || d.y));
                            path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                            break;
                        case "Q":
                            d.qx = path[1];
                            d.qy = path[2];
                            path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                            break;
                        case "L":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                            break;
                        case "H":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                            break;
                        case "V":
                            path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                            break;
                        case "Z":
                            path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                            break;
                    }
                    return path;
                },
                fixArc = function (pp, i) {
                    if (pp[i][length] > 7) {
                        pp[i].shift();
                        var pi = pp[i];
                        while (pi[length]) {
                            pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                        }
                        pp.splice(i, 1);
                        ii = mmax(p[length], p2 && p2[length] || 0);
                    }
                },
                fixM = function (path1, path2, a1, a2, i) {
                    if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                        path2.splice(i, 0, ["M", a2.x, a2.y]);
                        a1.bx = 0;
                        a1.by = 0;
                        a1.x = path1[i][1];
                        a1.y = path1[i][2];
                        ii = mmax(p[length], p2 && p2[length] || 0);
                    }
                };
            for (var i = 0, ii = mmax(p[length], p2 && p2[length] || 0); i < ii; i++) {
                p[i] = processPath(p[i], attrs);
                fixArc(p, i);
                p2 && (p2[i] = processPath(p2[i], attrs2));
                p2 && fixArc(p2, i);
                fixM(p, p2, attrs, attrs2, i);
                fixM(p2, p, attrs2, attrs, i);
                var seg = p[i],
                    seg2 = p2 && p2[i],
                    seglen = seg[length],
                    seg2len = p2 && seg2[length];
                attrs.x = seg[seglen - 2];
                attrs.y = seg[seglen - 1];
                attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                attrs2.x = p2 && seg2[seg2len - 2];
                attrs2.y = p2 && seg2[seg2len - 1];
            }
            return p2 ? [p, p2] : p;
        }, null, pathClone),
        parseDots = cacher(function (gradient) {
            var dots = [];
            for (var i = 0, ii = gradient[length]; i < ii; i++) {
                var dot = {},
                    par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]);
                if (dot.color.error) {
                    return null;
                }
                dot.color = dot.color.hex;
                par[2] && (dot.offset = par[2] + "%");
                dots[push](dot);
            }
            for (i = 1, ii = dots[length] - 1; i < ii; i++) {
                if (!dots[i].offset) {
                    var start = toFloat(dots[i - 1].offset || 0),
                        end = 0;
                    for (var j = i + 1; j < ii; j++) {
                        if (dots[j].offset) {
                            end = dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = toFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        dots[i].offset = start + "%";
                    }
                }
            }
            return dots;
        }),
        getContainer = function (x, y, w, h) {
            var container;
            if (R.is(x, string) || R.is(x, "object")) {
                container = R.is(x, string) ? doc.getElementById(x) : x;
                if (container.tagName) {
                    if (y == null) {
                        return {
                            container: container,
                            width: container.style.pixelWidth || container.offsetWidth,
                            height: container.style.pixelHeight || container.offsetHeight
                        };
                    } else {
                        return {container: container, width: y, height: w};
                    }
                }
            } else {
                return {container: 1, x: x, y: y, width: w, height: h};
            }
        },
        plugins = function (con, add) {
            var that = this;
            for (var prop in add) {
                if (add[has](prop) && !(prop in con)) {
                    switch (typeof add[prop]) {
                        case "function":
                            (function (f) {
                                con[prop] = con === that ? f : function () { return f[apply](that, arguments); };
                            })(add[prop]);
                        break;
                        case "object":
                            con[prop] = con[prop] || {};
                            plugins.call(this, con[prop], add[prop]);
                        break;
                        default:
                            con[prop] = add[prop];
                        break;
                    }
                }
            }
        },
        tear = function (el, paper) {
            el == paper.top && (paper.top = el.prev);
            el == paper.bottom && (paper.bottom = el.next);
            el.next && (el.next.prev = el.prev);
            el.prev && (el.prev.next = el.next);
        },
        tofront = function (el, paper) {
            if (paper.top === el) {
                return;
            }
            tear(el, paper);
            el.next = null;
            el.prev = paper.top;
            paper.top.next = el;
            paper.top = el;
        },
        toback = function (el, paper) {
            if (paper.bottom === el) {
                return;
            }
            tear(el, paper);
            el.next = paper.bottom;
            el.prev = null;
            paper.bottom.prev = el;
            paper.bottom = el;
        },
        insertafter = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.top && (paper.top = el);
            el2.next && (el2.next.prev = el);
            el.next = el2.next;
            el.prev = el2;
            el2.next = el;
        },
        insertbefore = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.bottom && (paper.bottom = el);
            el2.prev && (el2.prev.next = el);
            el.prev = el2.prev;
            el2.prev = el;
            el.next = el2;
        },
        removed = function (methodname) {
            return function () {
                throw new Error("Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object");
            };
        };
    R.pathToRelative = pathToRelative;
    // SVG
    if (R.svg) {
        paperproto.svgns = "http://www.w3.org/2000/svg";
        paperproto.xlink = "http://www.w3.org/1999/xlink";
        round = function (num) {
            return +num + (~~num === num) * .5;
        };
        var $ = function (el, attr) {
            if (attr) {
                for (var key in attr) {
                    if (attr[has](key)) {
                        el[setAttribute](key, Str(attr[key]));
                    }
                }
            } else {
                el = doc.createElementNS(paperproto.svgns, el);
                el.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
                return el;
            }
        };
        R[toString] = function () {
            return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
        };
        var thePath = function (pathString, SVG) {
            var el = $("path");
            SVG.canvas && SVG.canvas[appendChild](el);
            var p = new Element(el, SVG);
            p.type = "path";
            setFillAndStroke(p, {fill: "none", stroke: "#000", path: pathString});
            return p;
        };
        var addGradientFill = function (o, gradient, SVG) {
            var type = "linear",
                fx = .5, fy = .5,
                s = o.style;
            gradient = Str(gradient)[rp](radial_gradient, function (all, _fx, _fy) {
                type = "radial";
                if (_fx && _fy) {
                    fx = toFloat(_fx);
                    fy = toFloat(_fy);
                    var dir = ((fy > .5) * 2 - 1);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                        (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                        fy != .5 &&
                        (fy = fy.toFixed(5) - 1e-5 * dir);
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
                var vector = [0, 0, math.cos(angle * PI / 180), math.sin(angle * PI / 180)],
                    max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
                vector[2] *= max;
                vector[3] *= max;
                if (vector[2] < 0) {
                    vector[0] = -vector[2];
                    vector[2] = 0;
                }
                if (vector[3] < 0) {
                    vector[1] = -vector[3];
                    vector[3] = 0;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            var id = o.getAttribute(fillString);
            id = id.match(/^url\(#(.*)\)$/);
            id && SVG.defs.removeChild(doc.getElementById(id[1]));

            var el = $(type + "Gradient");
            el.id = createUUID();
            $(el, type == "radial" ? {fx: fx, fy: fy} : {x1: vector[0], y1: vector[1], x2: vector[2], y2: vector[3]});
            SVG.defs[appendChild](el);
            for (var i = 0, ii = dots[length]; i < ii; i++) {
                var stop = $("stop");
                $(stop, {
                    offset: dots[i].offset ? dots[i].offset : !i ? "0%" : "100%",
                    "stop-color": dots[i].color || "#fff"
                });
                el[appendChild](stop);
            }
            $(o, {
                fill: "url(#" + el.id + ")",
                opacity: 1,
                "fill-opacity": 1
            });
            s.fill = E;
            s.opacity = 1;
            s.fillOpacity = 1;
            return 1;
        };
        var updatePosition = function (o) {
            var bbox = o.getBBox();
            $(o.pattern, {patternTransform: R.format("translate({0},{1})", bbox.x, bbox.y)});
        };
        var setFillAndStroke = function (o, params) {
            var dasharray = {
                    "": [0],
                    "none": [0],
                    "-": [3, 1],
                    ".": [1, 1],
                    "-.": [3, 1, 1, 1],
                    "-..": [3, 1, 1, 1, 1, 1],
                    ". ": [1, 3],
                    "- ": [4, 3],
                    "--": [8, 3],
                    "- .": [4, 3, 1, 3],
                    "--.": [8, 3, 1, 3],
                    "--..": [8, 3, 1, 3, 1, 3]
                },
                node = o.node,
                attrs = o.attrs,
                rot = o.rotate(),
                addDashes = function (o, value) {
                    value = dasharray[lowerCase.call(value)];
                    if (value) {
                        var width = o.attrs["stroke-width"] || "1",
                            butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                            dashes = [];
                        var i = value[length];
                        while (i--) {
                            dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
                        }
                        $(node, {"stroke-dasharray": dashes[join](",")});
                    }
                };
            params[has]("rotation") && (rot = params.rotation);
            var rotxy = Str(rot)[split](separator);
            if (!(rotxy.length - 1)) {
                rotxy = null;
            } else {
                rotxy[1] = +rotxy[1];
                rotxy[2] = +rotxy[2];
            }
            toFloat(rot) && o.rotate(0, true);
            for (var att in params) {
                if (params[has](att)) {
                    if (!availableAttrs[has](att)) {
                        continue;
                    }
                    var value = params[att];
                    attrs[att] = value;
                    switch (att) {
                        case "blur":
                            o.blur(value);
                            break;
                        case "rotation":
                            o.rotate(value, true);
                            break;
                        case "href":
                        case "title":
                        case "target":
                            var pn = node.parentNode;
                            if (lowerCase.call(pn.tagName) != "a") {
                                var hl = $("a");
                                pn.insertBefore(hl, node);
                                hl[appendChild](node);
                                pn = hl;
                            }
                            if (att == "target" && value == "blank") {
                                pn.setAttributeNS(o.paper.xlink, "show", "new");
                            } else {
                                pn.setAttributeNS(o.paper.xlink, att, value);
                            }
                            break;
                        case "cursor":
                            node.style.cursor = value;
                            break;
                        case "clip-rect":
                            var rect = Str(value)[split](separator);
                            if (rect[length] == 4) {
                                o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                                var el = $("clipPath"),
                                    rc = $("rect");
                                el.id = createUUID();
                                $(rc, {
                                    x: rect[0],
                                    y: rect[1],
                                    width: rect[2],
                                    height: rect[3]
                                });
                                el[appendChild](rc);
                                o.paper.defs[appendChild](el);
                                $(node, {"clip-path": "url(#" + el.id + ")"});
                                o.clip = rc;
                            }
                            if (!value) {
                                var clip = doc.getElementById(node.getAttribute("clip-path")[rp](/(^url\(#|\)$)/g, E));
                                clip && clip.parentNode.removeChild(clip);
                                $(node, {"clip-path": E});
                                delete o.clip;
                            }
                        break;
                        case "path":
                            if (o.type == "path") {
                                $(node, {d: value ? attrs.path = pathToAbsolute(value) : "M0,0"});
                            }
                            break;
                        case "width":
                            node[setAttribute](att, value);
                            if (attrs.fx) {
                                att = "x";
                                value = attrs.x;
                            } else {
                                break;
                            }
                        case "x":
                            if (attrs.fx) {
                                value = -attrs.x - (attrs.width || 0);
                            }
                        case "rx":
                            if (att == "rx" && o.type == "rect") {
                                break;
                            }
                        case "cx":
                            rotxy && (att == "x" || att == "cx") && (rotxy[1] += value - attrs[att]);
                            node[setAttribute](att, value);
                            o.pattern && updatePosition(o);
                            break;
                        case "height":
                            node[setAttribute](att, value);
                            if (attrs.fy) {
                                att = "y";
                                value = attrs.y;
                            } else {
                                break;
                            }
                        case "y":
                            if (attrs.fy) {
                                value = -attrs.y - (attrs.height || 0);
                            }
                        case "ry":
                            if (att == "ry" && o.type == "rect") {
                                break;
                            }
                        case "cy":
                            rotxy && (att == "y" || att == "cy") && (rotxy[2] += value - attrs[att]);
                            node[setAttribute](att, value);
                            o.pattern && updatePosition(o);
                            break;
                        case "r":
                            if (o.type == "rect") {
                                $(node, {rx: value, ry: value});
                            } else {
                                node[setAttribute](att, value);
                            }
                            break;
                        case "src":
                            if (o.type == "image") {
                                node.setAttributeNS(o.paper.xlink, "href", value);
                            }
                            break;
                        case "stroke-width":
                            node.style.strokeWidth = value;
                            // Need following line for Firefox
                            node[setAttribute](att, value);
                            if (attrs["stroke-dasharray"]) {
                                addDashes(o, attrs["stroke-dasharray"]);
                            }
                            break;
                        case "stroke-dasharray":
                            addDashes(o, value);
                            break;
                        case "translation":
                            var xy = Str(value)[split](separator);
                            xy[0] = +xy[0] || 0;
                            xy[1] = +xy[1] || 0;
                            if (rotxy) {
                                rotxy[1] += xy[0];
                                rotxy[2] += xy[1];
                            }
                            translate.call(o, xy[0], xy[1]);
                            break;
                        case "scale":
                            xy = Str(value)[split](separator);
                            o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, isNaN(toFloat(xy[2])) ? null : +xy[2], isNaN(toFloat(xy[3])) ? null : +xy[3]);
                            break;
                        case fillString:
                            var isURL = Str(value).match(ISURL);
                            if (isURL) {
                                el = $("pattern");
                                var ig = $("image");
                                el.id = createUUID();
                                $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                                $(ig, {x: 0, y: 0});
                                ig.setAttributeNS(o.paper.xlink, "href", isURL[1]);
                                el[appendChild](ig);
 
                                var img = doc.createElement("img");
                                img.style.cssText = "position:absolute;left:-9999em;top-9999em";
                                img.onload = function () {
                                    $(el, {width: this.offsetWidth, height: this.offsetHeight});
                                    $(ig, {width: this.offsetWidth, height: this.offsetHeight});
                                    doc.body.removeChild(this);
                                    o.paper.safari();
                                };
                                doc.body[appendChild](img);
                                img.src = isURL[1];
                                o.paper.defs[appendChild](el);
                                node.style.fill = "url(#" + el.id + ")";
                                $(node, {fill: "url(#" + el.id + ")"});
                                o.pattern = el;
                                o.pattern && updatePosition(o);
                                break;
                            }
                            var clr = R.getRGB(value);
                            if (!clr.error) {
                                delete params.gradient;
                                delete attrs.gradient;
                                !R.is(attrs.opacity, "undefined") &&
                                    R.is(params.opacity, "undefined") &&
                                    $(node, {opacity: attrs.opacity});
                                !R.is(attrs["fill-opacity"], "undefined") &&
                                    R.is(params["fill-opacity"], "undefined") &&
                                    $(node, {"fill-opacity": attrs["fill-opacity"]});
                            } else if ((({circle: 1, ellipse: 1})[has](o.type) || Str(value).charAt() != "r") && addGradientFill(node, value, o.paper)) {
                                attrs.gradient = value;
                                attrs.fill = "none";
                                break;
                            }
                            clr[has]("opacity") && $(node, {"fill-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                        case "stroke":
                            clr = R.getRGB(value);
                            node[setAttribute](att, clr.hex);
                            att == "stroke" && clr[has]("opacity") && $(node, {"stroke-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                            break;
                        case "gradient":
                            (({circle: 1, ellipse: 1})[has](o.type) || Str(value).charAt() != "r") && addGradientFill(node, value, o.paper);
                            break;
                        case "opacity":
                            if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                                $(node, {"stroke-opacity": value > 1 ? value / 100 : value});
                            }
                            // fall
                        case "fill-opacity":
                            if (attrs.gradient) {
                                var gradient = doc.getElementById(node.getAttribute(fillString)[rp](/^url\(#|\)$/g, E));
                                if (gradient) {
                                    var stops = gradient.getElementsByTagName("stop");
                                    stops[stops[length] - 1][setAttribute]("stop-opacity", value);
                                }
                                break;
                            }
                        default:
                            att == "font-size" && (value = toInt(value, 10) + "px");
                            var cssrule = att[rp](/(\-.)/g, function (w) {
                                return upperCase.call(w.substring(1));
                            });
                            node.style[cssrule] = value;
                            // Need following line for Firefox
                            node[setAttribute](att, value);
                            break;
                    }
                }
            }
            
            tuneText(o, params);
            if (rotxy) {
                o.rotate(rotxy.join(S));
            } else {
                toFloat(rot) && o.rotate(rot, true);
            }
        };
        var leading = 1.2,
        tuneText = function (el, params) {
            if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
                return;
            }
            var a = el.attrs,
                node = el.node,
                fontSize = node.firstChild ? toInt(doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;
 
            if (params[has]("text")) {
                a.text = params.text;
                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
                var texts = Str(params.text)[split]("\n");
                for (var i = 0, ii = texts[length]; i < ii; i++) if (texts[i]) {
                    var tspan = $("tspan");
                    i && $(tspan, {dy: fontSize * leading, x: a.x});
                    tspan[appendChild](doc.createTextNode(texts[i]));
                    node[appendChild](tspan);
                }
            } else {
                texts = node.getElementsByTagName("tspan");
                for (i = 0, ii = texts[length]; i < ii; i++) {
                    i && $(texts[i], {dy: fontSize * leading, x: a.x});
                }
            }
            $(node, {y: a.y});
            var bb = el.getBBox(),
                dif = a.y - (bb.y + bb.height / 2);
            dif && R.is(dif, "finite") && $(node, {y: a.y + dif});
        },
        Element = function (node, svg) {
            var X = 0,
                Y = 0;
            this[0] = node;
            this.id = R._oid++;
            this.node = node;
            node.raphael = this;
            this.paper = svg;
            this.attrs = this.attrs || {};
            this.transformations = []; // rotate, translate, scale
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg: 0, cx: 0, cy: 0},
                sx: 1,
                sy: 1
            };
            !svg.bottom && (svg.bottom = this);
            this.prev = svg.top;
            svg.top && (svg.top.next = this);
            svg.top = this;
            this.next = null;
        };
        var elproto = Element[proto];
        Element[proto].rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            var bbox = this.getBBox();
            deg = Str(deg)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null && cx !== false) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            (cy == null) && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            cx = cx == null ? bbox.x + bbox.width / 2 : cx;
            cy = cy == null ? bbox.y + bbox.height / 2 : cy;
            if (this._.rt.deg) {
                this.transformations[0] = R.format("rotate({0} {1} {2})", this._.rt.deg, cx, cy);
                this.clip && $(this.clip, {transform: R.format("rotate({0} {1} {2})", -this._.rt.deg, cx, cy)});
            } else {
                this.transformations[0] = E;
                this.clip && $(this.clip, {transform: E});
            }
            $(this.node, {transform: this.transformations[join](S)});
            return this;
        };
        Element[proto].hide = function () {
            !this.removed && (this.node.style.display = "none");
            return this;
        };
        Element[proto].show = function () {
            !this.removed && (this.node.style.display = "");
            return this;
        };
        Element[proto].remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        Element[proto].getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (this.type == "path") {
                return pathDimensions(this.attrs.path);
            }
            if (this.node.style.display == "none") {
                this.show();
                var hide = true;
            }
            var bbox = {};
            try {
                bbox = this.node.getBBox();
            } catch(e) {
                // Firefox 3.0.x plays badly here
            } finally {
                bbox = bbox || {};
            }
            if (this.type == "text") {
                bbox = {x: bbox.x, y: Infinity, width: 0, height: 0};
                for (var i = 0, ii = this.node.getNumberOfChars(); i < ii; i++) {
                    var bb = this.node.getExtentOfChar(i);
                    (bb.y < bbox.y) && (bbox.y = bb.y);
                    (bb.y + bb.height - bbox.y > bbox.height) && (bbox.height = bb.y + bb.height - bbox.y);
                    (bb.x + bb.width - bbox.x > bbox.width) && (bbox.width = bb.x + bb.width - bbox.x);
                }
            }
            hide && this.hide();
            return bbox;
        };
        Element[proto].attr = function (name, value) {
            if (this.removed) {
                return this;
            }
            if (name == null) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                this._.rt.deg && (res.rotation = this.rotate());
                (this._.sx != 1 || this._.sy != 1) && (res.scale = this.scale());
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                return res;
            }
            if (value == null && R.is(name, string)) {
                if (name == "translation") {
                    return translate.call(this);
                }
                if (name == "rotation") {
                    return this.rotate();
                }
                if (name == "scale") {
                    return this.scale();
                }
                if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[name];
            }
            if (value == null && R.is(name, array)) {
                var values = {};
                for (var j = 0, jj = name.length; j < jj; j++) {
                    values[name[j]] = this.attr(name[j]);
                }
                return values;
            }
            if (value != null) {
                var params = {};
                params[name] = value;
            } else if (name != null && R.is(name, "object")) {
                params = name;
            }
            for (var key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                var par = this.paper.customAttributes[key].apply(this, [][concat](params[key]));
                this.attrs[key] = params[key];
                for (var subkey in par) if (par[has](subkey)) {
                    params[subkey] = par[subkey];
                }
            }
            setFillAndStroke(this, params);
            return this;
        };
        Element[proto].toFront = function () {
            if (this.removed) {
                return this;
            }
            this.node.parentNode[appendChild](this.node);
            var svg = this.paper;
            svg.top != this && tofront(this, svg);
            return this;
        };
        Element[proto].toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.node.parentNode.firstChild != this.node) {
                this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
                toback(this, this.paper);
                var svg = this.paper;
            }
            return this;
        };
        Element[proto].insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node || element[element.length - 1].node;
            if (node.nextSibling) {
                node.parentNode.insertBefore(this.node, node.nextSibling);
            } else {
                node.parentNode[appendChild](this.node);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        Element[proto].insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node || element[0].node;
            node.parentNode.insertBefore(this.node, node);
            insertbefore(this, element, this.paper);
            return this;
        };
        Element[proto].blur = function (size) {
            // Experimental. No Safari support. Use it on your own risk.
            var t = this;
            if (+size !== 0) {
                var fltr = $("filter"),
                    blur = $("feGaussianBlur");
                t.attrs.blur = size;
                fltr.id = createUUID();
                $(blur, {stdDeviation: +size || 1.5});
                fltr.appendChild(blur);
                t.paper.defs.appendChild(fltr);
                t._blur = fltr;
                $(t.node, {filter: "url(#" + fltr.id + ")"});
            } else {
                if (t._blur) {
                    t._blur.parentNode.removeChild(t._blur);
                    delete t._blur;
                    delete t.attrs.blur;
                }
                t.node.removeAttribute("filter");
            }
        };
        var theCircle = function (svg, x, y, r) {
            var el = $("circle");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
            res.type = "circle";
            $(el, res.attrs);
            return res;
        },
        theRect = function (svg, x, y, w, h, r) {
            var el = $("rect");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
            res.type = "rect";
            $(el, res.attrs);
            return res;
        },
        theEllipse = function (svg, x, y, rx, ry) {
            var el = $("ellipse");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
            res.type = "ellipse";
            $(el, res.attrs);
            return res;
        },
        theImage = function (svg, src, x, y, w, h) {
            var el = $("image");
            $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
            el.setAttributeNS(svg.xlink, "href", src);
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, width: w, height: h, src: src};
            res.type = "image";
            return res;
        },
        theText = function (svg, x, y, text) {
            var el = $("text");
            $(el, {x: x, y: y, "text-anchor": "middle"});
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, "text-anchor": "middle", text: text, font: availableAttrs.font, stroke: "none", fill: "#000"};
            res.type = "text";
            setFillAndStroke(res, res.attrs);
            return res;
        },
        setSize = function (width, height) {
            this.width = width || this.width;
            this.height = height || this.height;
            this.canvas[setAttribute]("width", this.width);
            this.canvas[setAttribute]("height", this.height);
            return this;
        },
        create = function () {
            var con = getContainer[apply](0, arguments),
                container = con && con.container,
                x = con.x,
                y = con.y,
                width = con.width,
                height = con.height;
            if (!container) {
                throw new Error("SVG container not found.");
            }
            var cnvs = $("svg");
            x = x || 0;
            y = y || 0;
            width = width || 512;
            height = height || 342;
            $(cnvs, {
                xmlns: "http://www.w3.org/2000/svg",
                version: 1.1,
                width: width,
                height: height
            });
            if (container == 1) {
                cnvs.style.cssText = "position:absolute;left:" + x + "px;top:" + y + "px";
                doc.body[appendChild](cnvs);
            } else {
                if (container.firstChild) {
                    container.insertBefore(cnvs, container.firstChild);
                } else {
                    container[appendChild](cnvs);
                }
            }
            container = new Paper;
            container.width = width;
            container.height = height;
            container.canvas = cnvs;
            plugins.call(container, container, R.fn);
            container.clear();
            return container;
        };
        paperproto.clear = function () {
            var c = this.canvas;
            while (c.firstChild) {
                c.removeChild(c.firstChild);
            }
            this.bottom = this.top = null;
            (this.desc = $("desc"))[appendChild](doc.createTextNode("Created with Rapha\xebl"));
            c[appendChild](this.desc);
            c[appendChild](this.defs = $("defs"));
        };
        paperproto.remove = function () {
            this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = removed(i);
            }
        };
    }

    // VML
    if (R.vml) {
        var map = {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
            bites = /([clmz]),?([^clmz]*)/gi,
            blurregexp = / progid:\S+Blur\([^\)]+\)/g,
            val = /-?[^,\s-]+/g,
            coordsize = 1e3 + S + 1e3,
            zoom = 10,
            pathlike = {path: 1, rect: 1},
            path2vml = function (path) {
                var total =  /[ahqstv]/ig,
                    command = pathToAbsolute;
                Str(path).match(total) && (command = path2curve);
                total = /[clmz]/g;
                if (command == pathToAbsolute && !Str(path).match(total)) {
                    var res = Str(path)[rp](bites, function (all, command, args) {
                        var vals = [],
                            isMove = lowerCase.call(command) == "m",
                            res = map[command];
                        args[rp](val, function (value) {
                            if (isMove && vals[length] == 2) {
                                res += vals + map[command == "m" ? "l" : "L"];
                                vals = [];
                            }
                            vals[push](round(value * zoom));
                        });
                        return res + vals;
                    });
                    return res;
                }
                var pa = command(path), p, r;
                res = [];
                for (var i = 0, ii = pa[length]; i < ii; i++) {
                    p = pa[i];
                    r = lowerCase.call(pa[i][0]);
                    r == "z" && (r = "x");
                    for (var j = 1, jj = p[length]; j < jj; j++) {
                        r += round(p[j] * zoom) + (j != jj - 1 ? "," : E);
                    }
                    res[push](r);
                }
                return res[join](S);
            };
        
        R[toString] = function () {
            return  "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
        };
        thePath = function (pathString, vml) {
            var g = createNode("group");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            var el = createNode("shape"), ol = el.style;
            ol.width = vml.width + "px";
            ol.height = vml.height + "px";
            el.coordsize = coordsize;
            el.coordorigin = vml.coordorigin;
            g[appendChild](el);
            var p = new Element(el, g, vml),
                attr = {fill: "none", stroke: "#000"};
            pathString && (attr.path = pathString);
            p.type = "path";
            p.path = [];
            p.Path = E;
            setFillAndStroke(p, attr);
            vml.canvas[appendChild](g);
            return p;
        };
        setFillAndStroke = function (o, params) {
            o.attrs = o.attrs || {};
            var node = o.node,
                a = o.attrs,
                s = node.style,
                xy,
                newpath = (params.x != a.x || params.y != a.y || params.width != a.width || params.height != a.height || params.r != a.r) && o.type == "rect",
                res = o;

            for (var par in params) if (params[has](par)) {
                a[par] = params[par];
            }
            if (newpath) {
                a.path = rectPath(a.x, a.y, a.width, a.height, a.r);
                o.X = a.x;
                o.Y = a.y;
                o.W = a.width;
                o.H = a.height;
            }
            params.href && (node.href = params.href);
            params.title && (node.title = params.title);
            params.target && (node.target = params.target);
            params.cursor && (s.cursor = params.cursor);
            "blur" in params && o.blur(params.blur);
            if (params.path && o.type == "path" || newpath) {
                node.path = path2vml(a.path);
            }
            if (params.rotation != null) {
                o.rotate(params.rotation, true);
            }
            if (params.translation) {
                xy = Str(params.translation)[split](separator);
                translate.call(o, xy[0], xy[1]);
                if (o._.rt.cx != null) {
                    o._.rt.cx +=+ xy[0];
                    o._.rt.cy +=+ xy[1];
                    o.setBox(o.attrs, xy[0], xy[1]);
                }
            }
            if (params.scale) {
                xy = Str(params.scale)[split](separator);
                o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, +xy[2] || null, +xy[3] || null);
            }
            if ("clip-rect" in params) {
                var rect = Str(params["clip-rect"])[split](separator);
                if (rect[length] == 4) {
                    rect[2] = +rect[2] + (+rect[0]);
                    rect[3] = +rect[3] + (+rect[1]);
                    var div = node.clipRect || doc.createElement("div"),
                        dstyle = div.style,
                        group = node.parentNode;
                    dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
                    if (!node.clipRect) {
                        dstyle.position = "absolute";
                        dstyle.top = 0;
                        dstyle.left = 0;
                        dstyle.width = o.paper.width + "px";
                        dstyle.height = o.paper.height + "px";
                        group.parentNode.insertBefore(div, group);
                        div[appendChild](group);
                        node.clipRect = div;
                    }
                }
                if (!params["clip-rect"]) {
                    node.clipRect && (node.clipRect.style.clip = E);
                }
            }
            if (o.type == "image" && params.src) {
                node.src = params.src;
            }
            if (o.type == "image" && params.opacity) {
                node.filterOpacity = ms + ".Alpha(opacity=" + (params.opacity * 100) + ")";
                s.filter = (node.filterMatrix || E) + (node.filterOpacity || E);
            }
            params.font && (s.font = params.font);
            params["font-family"] && (s.fontFamily = '"' + params["font-family"][split](",")[0][rp](/^['"]+|['"]+$/g, E) + '"');
            params["font-size"] && (s.fontSize = params["font-size"]);
            params["font-weight"] && (s.fontWeight = params["font-weight"]);
            params["font-style"] && (s.fontStyle = params["font-style"]);
            if (params.opacity != null || 
                params["stroke-width"] != null ||
                params.fill != null ||
                params.stroke != null ||
                params["stroke-width"] != null ||
                params["stroke-opacity"] != null ||
                params["fill-opacity"] != null ||
                params["stroke-dasharray"] != null ||
                params["stroke-miterlimit"] != null ||
                params["stroke-linejoin"] != null ||
                params["stroke-linecap"] != null) {
                node = o.shape || node;
                var fill = (node.getElementsByTagName(fillString) && node.getElementsByTagName(fillString)[0]),
                    newfill = false;
                !fill && (newfill = fill = createNode(fillString));
                if ("fill-opacity" in params || "opacity" in params) {
                    var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+R.getRGB(params.fill).o + 1 || 2) - 1);
                    opacity = mmin(mmax(opacity, 0), 1);
                    fill.opacity = opacity;
                }
                params.fill && (fill.on = true);
                if (fill.on == null || params.fill == "none") {
                    fill.on = false;
                }
                if (fill.on && params.fill) {
                    var isURL = params.fill.match(ISURL);
                    if (isURL) {
                        fill.src = isURL[1];
                        fill.type = "tile";
                    } else {
                        fill.color = R.getRGB(params.fill).hex;
                        fill.src = E;
                        fill.type = "solid";
                        if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || Str(params.fill).charAt() != "r") && addGradientFill(res, params.fill)) {
                            a.fill = "none";
                            a.gradient = params.fill;
                        }
                    }
                }
                newfill && node[appendChild](fill);
                var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
                newstroke = false;
                !stroke && (newstroke = stroke = createNode("stroke"));
                if ((params.stroke && params.stroke != "none") ||
                    params["stroke-width"] ||
                    params["stroke-opacity"] != null ||
                    params["stroke-dasharray"] ||
                    params["stroke-miterlimit"] ||
                    params["stroke-linejoin"] ||
                    params["stroke-linecap"]) {
                    stroke.on = true;
                }
                (params.stroke == "none" || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
                var strokeColor = R.getRGB(params.stroke);
                stroke.on && params.stroke && (stroke.color = strokeColor.hex);
                opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+strokeColor.o + 1 || 2) - 1);
                var width = (toFloat(params["stroke-width"]) || 1) * .75;
                opacity = mmin(mmax(opacity, 0), 1);
                params["stroke-width"] == null && (width = a["stroke-width"]);
                params["stroke-width"] && (stroke.weight = width);
                width && width < 1 && (opacity *= width) && (stroke.weight = 1);
                stroke.opacity = opacity;
                
                params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
                stroke.miterlimit = params["stroke-miterlimit"] || 8;
                params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
                if (params["stroke-dasharray"]) {
                    var dasharray = {
                        "-": "shortdash",
                        ".": "shortdot",
                        "-.": "shortdashdot",
                        "-..": "shortdashdotdot",
                        ". ": "dot",
                        "- ": "dash",
                        "--": "longdash",
                        "- .": "dashdot",
                        "--.": "longdashdot",
                        "--..": "longdashdotdot"
                    };
                    stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
                }
                newstroke && node[appendChild](stroke);
            }
            if (res.type == "text") {
                s = res.paper.span.style;
                a.font && (s.font = a.font);
                a["font-family"] && (s.fontFamily = a["font-family"]);
                a["font-size"] && (s.fontSize = a["font-size"]);
                a["font-weight"] && (s.fontWeight = a["font-weight"]);
                a["font-style"] && (s.fontStyle = a["font-style"]);
                res.node.string && (res.paper.span.innerHTML = Str(res.node.string)[rp](/</g, "&#60;")[rp](/&/g, "&#38;")[rp](/\n/g, "<br>"));
                res.W = a.w = res.paper.span.offsetWidth;
                res.H = a.h = res.paper.span.offsetHeight;
                res.X = a.x;
                res.Y = a.y + round(res.H / 2);
 
                // text-anchor emulationm
                switch (a["text-anchor"]) {
                    case "start":
                        res.node.style["v-text-align"] = "left";
                        res.bbx = round(res.W / 2);
                    break;
                    case "end":
                        res.node.style["v-text-align"] = "right";
                        res.bbx = -round(res.W / 2);
                    break;
                    default:
                        res.node.style["v-text-align"] = "center";
                    break;
                }
            }
        };
        addGradientFill = function (o, gradient) {
            o.attrs = o.attrs || {};
            var attrs = o.attrs,
                fill,
                type = "linear",
                fxfy = ".5 .5";
            o.attrs.gradient = gradient;
            gradient = Str(gradient)[rp](radial_gradient, function (all, fx, fy) {
                type = "radial";
                if (fx && fy) {
                    fx = toFloat(fx);
                    fy = toFloat(fy);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 && (fy = math.sqrt(.25 - pow(fx - .5, 2)) * ((fy > .5) * 2 - 1) + .5);
                    fxfy = fx + S + fy;
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            o = o.shape || o.node;
            fill = o.getElementsByTagName(fillString)[0] || createNode(fillString);
            !fill.parentNode && o.appendChild(fill);
            if (dots[length]) {
                fill.on = true;
                fill.method = "none";
                fill.color = dots[0].color;
                fill.color2 = dots[dots[length] - 1].color;
                var clrs = [];
                for (var i = 0, ii = dots[length]; i < ii; i++) {
                    dots[i].offset && clrs[push](dots[i].offset + S + dots[i].color);
                }
                fill.colors && (fill.colors.value = clrs[length] ? clrs[join]() : "0% " + fill.color);
                if (type == "radial") {
                    fill.type = "gradientradial";
                    fill.focus = "100%";
                    fill.focussize = fxfy;
                    fill.focusposition = fxfy;
                } else {
                    fill.type = "gradient";
                    fill.angle = (270 - angle) % 360;
                }
            }
            return 1;
        };
        Element = function (node, group, vml) {
            var Rotation = 0,
                RotX = 0,
                RotY = 0,
                Scale = 1;
            this[0] = node;
            this.id = R._oid++;
            this.node = node;
            node.raphael = this;
            this.X = 0;
            this.Y = 0;
            this.attrs = {};
            this.Group = group;
            this.paper = vml;
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg:0},
                sx: 1,
                sy: 1
            };
            !vml.bottom && (vml.bottom = this);
            this.prev = vml.top;
            vml.top && (vml.top.next = this);
            vml.top = this;
            this.next = null;
        };
        elproto = Element[proto];
        elproto.rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            deg = Str(deg)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            cy == null && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            this.setBox(this.attrs, cx, cy);
            this.Group.style.rotation = this._.rt.deg;
            // gradient fix for rotation. TODO
            // var fill = (this.shape || this.node).getElementsByTagName(fillString);
            // fill = fill[0] || {};
            // var b = ((360 - this._.rt.deg) - 270) % 360;
            // !R.is(fill.angle, "undefined") && (fill.angle = b);
            return this;
        };
        elproto.setBox = function (params, cx, cy) {
            if (this.removed) {
                return this;
            }
            var gs = this.Group.style,
                os = (this.shape && this.shape.style) || this.node.style;
            params = params || {};
            for (var i in params) if (params[has](i)) {
                this.attrs[i] = params[i];
            }
            cx = cx || this._.rt.cx;
            cy = cy || this._.rt.cy;
            var attr = this.attrs,
                x,
                y,
                w,
                h;
            switch (this.type) {
                case "circle":
                    x = attr.cx - attr.r;
                    y = attr.cy - attr.r;
                    w = h = attr.r * 2;
                    break;
                case "ellipse":
                    x = attr.cx - attr.rx;
                    y = attr.cy - attr.ry;
                    w = attr.rx * 2;
                    h = attr.ry * 2;
                    break;
                case "image":
                    x = +attr.x;
                    y = +attr.y;
                    w = attr.width || 0;
                    h = attr.height || 0;
                    break;
                case "text":
                    this.textpath.v = ["m", round(attr.x), ", ", round(attr.y - 2), "l", round(attr.x) + 1, ", ", round(attr.y - 2)][join](E);
                    x = attr.x - round(this.W / 2);
                    y = attr.y - this.H / 2;
                    w = this.W;
                    h = this.H;
                    break;
                case "rect":
                case "path":
                    if (!this.attrs.path) {
                        x = 0;
                        y = 0;
                        w = this.paper.width;
                        h = this.paper.height;
                    } else {
                        var dim = pathDimensions(this.attrs.path);
                        x = dim.x;
                        y = dim.y;
                        w = dim.width;
                        h = dim.height;
                    }
                    break;
                default:
                    x = 0;
                    y = 0;
                    w = this.paper.width;
                    h = this.paper.height;
                    break;
            }
            cx = (cx == null) ? x + w / 2 : cx;
            cy = (cy == null) ? y + h / 2 : cy;
            var left = cx - this.paper.width / 2,
                top = cy - this.paper.height / 2, t;
            gs.left != (t = left + "px") && (gs.left = t);
            gs.top != (t = top + "px") && (gs.top = t);
            this.X = pathlike[has](this.type) ? -left : x;
            this.Y = pathlike[has](this.type) ? -top : y;
            this.W = w;
            this.H = h;
            if (pathlike[has](this.type)) {
                os.left != (t = -left * zoom + "px") && (os.left = t);
                os.top != (t = -top * zoom + "px") && (os.top = t);
            } else if (this.type == "text") {
                os.left != (t = -left + "px") && (os.left = t);
                os.top != (t = -top + "px") && (os.top = t);
            } else {
                gs.width != (t = this.paper.width + "px") && (gs.width = t);
                gs.height != (t = this.paper.height + "px") && (gs.height = t);
                os.left != (t = x - left + "px") && (os.left = t);
                os.top != (t = y - top + "px") && (os.top = t);
                os.width != (t = w + "px") && (os.width = t);
                os.height != (t = h + "px") && (os.height = t);
            }
        };
        elproto.hide = function () {
            !this.removed && (this.Group.style.display = "none");
            return this;
        };
        elproto.show = function () {
            !this.removed && (this.Group.style.display = "block");
            return this;
        };
        elproto.getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (pathlike[has](this.type)) {
                return pathDimensions(this.attrs.path);
            }
            return {
                x: this.X + (this.bbx || 0),
                y: this.Y,
                width: this.W,
                height: this.H
            };
        };
        elproto.remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            this.Group.parentNode.removeChild(this.Group);
            this.shape && this.shape.parentNode.removeChild(this.shape);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        elproto.attr = function (name, value) {
            if (this.removed) {
                return this;
            }
            if (name == null) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                this._.rt.deg && (res.rotation = this.rotate());
                (this._.sx != 1 || this._.sy != 1) && (res.scale = this.scale());
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                return res;
            }
            if (value == null && R.is(name, "string")) {
                if (name == "translation") {
                    return translate.call(this);
                }
                if (name == "rotation") {
                    return this.rotate();
                }
                if (name == "scale") {
                    return this.scale();
                }
                if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[name];
            }
            if (this.attrs && value == null && R.is(name, array)) {
                var ii, values = {};
                for (i = 0, ii = name[length]; i < ii; i++) {
                    values[name[i]] = this.attr(name[i]);
                }
                return values;
            }
            var params;
            if (value != null) {
                params = {};
                params[name] = value;
            }
            value == null && R.is(name, "object") && (params = name);
            if (params) {
                for (var key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                    var par = this.paper.customAttributes[key].apply(this, [][concat](params[key]));
                    this.attrs[key] = params[key];
                    for (var subkey in par) if (par[has](subkey)) {
                        params[subkey] = par[subkey];
                    }
                }
                if (params.text && this.type == "text") {
                    this.node.string = params.text;
                }
                setFillAndStroke(this, params);
                if (params.gradient && (({circle: 1, ellipse: 1})[has](this.type) || Str(params.gradient).charAt() != "r")) {
                    addGradientFill(this, params.gradient);
                }
                (!pathlike[has](this.type) || this._.rt.deg) && this.setBox(this.attrs);
            }
            return this;
        };
        elproto.toFront = function () {
            !this.removed && this.Group.parentNode[appendChild](this.Group);
            this.paper.top != this && tofront(this, this.paper);
            return this;
        };
        elproto.toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.Group.parentNode.firstChild != this.Group) {
                this.Group.parentNode.insertBefore(this.Group, this.Group.parentNode.firstChild);
                toback(this, this.paper);
            }
            return this;
        };
        elproto.insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.constructor == Set) {
                element = element[element.length - 1];
            }
            if (element.Group.nextSibling) {
                element.Group.parentNode.insertBefore(this.Group, element.Group.nextSibling);
            } else {
                element.Group.parentNode[appendChild](this.Group);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        elproto.insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.constructor == Set) {
                element = element[0];
            }
            element.Group.parentNode.insertBefore(this.Group, element.Group);
            insertbefore(this, element, this.paper);
            return this;
        };
        elproto.blur = function (size) {
            var s = this.node.runtimeStyle,
                f = s.filter;
            f = f.replace(blurregexp, E);
            if (+size !== 0) {
                this.attrs.blur = size;
                s.filter = f + S + ms + ".Blur(pixelradius=" + (+size || 1.5) + ")";
                s.margin = R.format("-{0}px 0 0 -{0}px", round(+size || 1.5));
            } else {
                s.filter = f;
                s.margin = 0;
                delete this.attrs.blur;
            }
        };
 
        theCircle = function (vml, x, y, r) {
            var g = createNode("group"),
                o = createNode("oval"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "circle";
            setFillAndStroke(res, {stroke: "#000", fill: "none"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.r = r;
            res.setBox({x: x - r, y: y - r, width: r * 2, height: r * 2});
            vml.canvas[appendChild](g);
            return res;
        };
        function rectPath(x, y, w, h, r) {
            if (r) {
                return R.format("M{0},{1}l{2},0a{3},{3},0,0,1,{3},{3}l0,{5}a{3},{3},0,0,1,{4},{3}l{6},0a{3},{3},0,0,1,{4},{4}l0,{7}a{3},{3},0,0,1,{3},{4}z", x + r, y, w - r * 2, r, -r, h - r * 2, r * 2 - w, r * 2 - h);
            } else {
                return R.format("M{0},{1}l{2},0,0,{3},{4},0z", x, y, w, h, -w);
            }
        }
        theRect = function (vml, x, y, w, h, r) {
            var path = rectPath(x, y, w, h, r),
                res = vml.path(path),
                a = res.attrs;
            res.X = a.x = x;
            res.Y = a.y = y;
            res.W = a.width = w;
            res.H = a.height = h;
            a.r = r;
            a.path = path;
            res.type = "rect";
            return res;
        };
        theEllipse = function (vml, x, y, rx, ry) {
            var g = createNode("group"),
                o = createNode("oval"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "ellipse";
            setFillAndStroke(res, {stroke: "#000"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.rx = rx;
            res.attrs.ry = ry;
            res.setBox({x: x - rx, y: y - ry, width: rx * 2, height: ry * 2});
            vml.canvas[appendChild](g);
            return res;
        };
        theImage = function (vml, src, x, y, w, h) {
            var g = createNode("group"),
                o = createNode("image");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            o.src = src;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "image";
            res.attrs.src = src;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = w;
            res.attrs.h = h;
            res.setBox({x: x, y: y, width: w, height: h});
            vml.canvas[appendChild](g);
            return res;
        };
        theText = function (vml, x, y, text) {
            var g = createNode("group"),
                el = createNode("shape"),
                ol = el.style,
                path = createNode("path"),
                ps = path.style,
                o = createNode("textpath");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            path.v = R.format("m{0},{1}l{2},{1}", round(x * 10), round(y * 10), round(x * 10) + 1);
            path.textpathok = true;
            ol.width = vml.width;
            ol.height = vml.height;
            o.string = Str(text);
            o.on = true;
            el[appendChild](o);
            el[appendChild](path);
            g[appendChild](el);
            var res = new Element(o, g, vml);
            res.shape = el;
            res.textpath = path;
            res.type = "text";
            res.attrs.text = text;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = 1;
            res.attrs.h = 1;
            setFillAndStroke(res, {font: availableAttrs.font, stroke: "none", fill: "#000"});
            res.setBox();
            vml.canvas[appendChild](g);
            return res;
        };
        setSize = function (width, height) {
            var cs = this.canvas.style;
            width == +width && (width += "px");
            height == +height && (height += "px");
            cs.width = width;
            cs.height = height;
            cs.clip = "rect(0 " + width + " " + height + " 0)";
            return this;
        };
        var createNode;
        doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
        try {
            !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
            createNode = function (tagName) {
                return doc.createElement('<rvml:' + tagName + ' class="rvml">');
            };
        } catch (e) {
            createNode = function (tagName) {
                return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
            };
        }
        create = function () {
            var con = getContainer[apply](0, arguments),
                container = con.container,
                height = con.height,
                s,
                width = con.width,
                x = con.x,
                y = con.y;
            if (!container) {
                throw new Error("VML container not found.");
            }
            var res = new Paper,
                c = res.canvas = doc.createElement("div"),
                cs = c.style;
            x = x || 0;
            y = y || 0;
            width = width || 512;
            height = height || 342;
            width == +width && (width += "px");
            height == +height && (height += "px");
            res.width = 1e3;
            res.height = 1e3;
            res.coordsize = zoom * 1e3 + S + zoom * 1e3;
            res.coordorigin = "0 0";
            res.span = doc.createElement("span");
            res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            c[appendChild](res.span);
            cs.cssText = R.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
            if (container == 1) {
                doc.body[appendChild](c);
                cs.left = x + "px";
                cs.top = y + "px";
                cs.position = "absolute";
            } else {
                if (container.firstChild) {
                    container.insertBefore(c, container.firstChild);
                } else {
                    container[appendChild](c);
                }
            }
            plugins.call(res, res, R.fn);
            return res;
        };
        paperproto.clear = function () {
            this.canvas.innerHTML = E;
            this.span = doc.createElement("span");
            this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            this.canvas[appendChild](this.span);
            this.bottom = this.top = null;
        };
        paperproto.remove = function () {
            this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = removed(i);
            }
            return true;
        };
    }
 
    // rest
    // WebKit rendering bug workaround method
    var version = navigator.userAgent.match(/Version\/(.*?)\s/);
    if ((navigator.vendor == "Apple Computer, Inc.") && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP")) {
        paperproto.safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke: "none"});
            win.setTimeout(function () {rect.remove();});
        };
    } else {
        paperproto.safari = function () {};
    }
 
    // Events
    var preventDefault = function () {
        this.returnValue = false;
    },
    preventTouch = function () {
        return this.originalEvent.preventDefault();
    },
    stopPropagation = function () {
        this.cancelBubble = true;
    },
    stopTouch = function () {
        return this.originalEvent.stopPropagation();
    },
    addEvent = (function () {
        if (doc.addEventListener) {
            return function (obj, type, fn, element) {
                var realName = supportsTouch && touchMap[type] ? touchMap[type] : type;
                var f = function (e) {
                    if (supportsTouch && touchMap[has](type)) {
                        for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                            if (e.targetTouches[i].target == obj) {
                                var olde = e;
                                e = e.targetTouches[i];
                                e.originalEvent = olde;
                                e.preventDefault = preventTouch;
                                e.stopPropagation = stopTouch;
                                break;
                            }
                        }
                    }
                    return fn.call(element, e);
                };
                obj.addEventListener(realName, f, false);
                return function () {
                    obj.removeEventListener(realName, f, false);
                    return true;
                };
            };
        } else if (doc.attachEvent) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    e = e || win.event;
                    e.preventDefault = e.preventDefault || preventDefault;
                    e.stopPropagation = e.stopPropagation || stopPropagation;
                    return fn.call(element, e);
                };
                obj.attachEvent("on" + type, f);
                var detacher = function () {
                    obj.detachEvent("on" + type, f);
                    return true;
                };
                return detacher;
            };
        }
    })(),
    drag = [],
    dragMove = function (e) {
        var x = e.clientX,
            y = e.clientY,
            scrollY = doc.documentElement.scrollTop || doc.body.scrollTop,
            scrollX = doc.documentElement.scrollLeft || doc.body.scrollLeft,
            dragi,
            j = drag.length;
        while (j--) {
            dragi = drag[j];
            if (supportsTouch) {
                var i = e.touches.length,
                    touch;
                while (i--) {
                    touch = e.touches[i];
                    if (touch.identifier == dragi.el._drag.id) {
                        x = touch.clientX;
                        y = touch.clientY;
                        (e.originalEvent ? e.originalEvent : e).preventDefault();
                        break;
                    }
                }
            } else {
                e.preventDefault();
            }
            x += scrollX;
            y += scrollY;
            dragi.move && dragi.move.call(dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
        }
    },
    dragUp = function (e) {
        R.unmousemove(dragMove).unmouseup(dragUp);
        var i = drag.length,
            dragi;
        while (i--) {
            dragi = drag[i];
            dragi.el._drag = {};
            dragi.end && dragi.end.call(dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
        }
        drag = [];
    };
    for (var i = events[length]; i--;) {
        (function (eventName) {
            R[eventName] = Element[proto][eventName] = function (fn, scope) {
                if (R.is(fn, "function")) {
                    this.events = this.events || [];
                    this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node || doc, eventName, fn, scope || this)});
                }
                return this;
            };
            R["un" + eventName] = Element[proto]["un" + eventName] = function (fn) {
                var events = this.events,
                    l = events[length];
                while (l--) if (events[l].name == eventName && events[l].f == fn) {
                    events[l].unbind();
                    events.splice(l, 1);
                    !events.length && delete this.events;
                    return this;
                }
                return this;
            };
        })(events[i]);
    }
    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
        return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
    };
    elproto.unhover = function (f_in, f_out) {
        return this.unmouseover(f_in).unmouseout(f_out);
    };
    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
        this._drag = {};
        this.mousedown(function (e) {
            (e.originalEvent || e).preventDefault();
            var scrollY = doc.documentElement.scrollTop || doc.body.scrollTop,
                scrollX = doc.documentElement.scrollLeft || doc.body.scrollLeft;
            this._drag.x = e.clientX + scrollX;
            this._drag.y = e.clientY + scrollY;
            this._drag.id = e.identifier;
            onstart && onstart.call(start_scope || move_scope || this, e.clientX + scrollX, e.clientY + scrollY, e);
            !drag.length && R.mousemove(dragMove).mouseup(dragUp);
            drag.push({el: this, move: onmove, end: onend, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
        });
        return this;
    };
    elproto.undrag = function (onmove, onstart, onend) {
        var i = drag.length;
        while (i--) {
            drag[i].el == this && (drag[i].move == onmove && drag[i].end == onend) && drag.splice(i++, 1);
        }
        !drag.length && R.unmousemove(dragMove).unmouseup(dragUp);
    };
    paperproto.circle = function (x, y, r) {
        return theCircle(this, x || 0, y || 0, r || 0);
    };
    paperproto.rect = function (x, y, w, h, r) {
        return theRect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
    };
    paperproto.ellipse = function (x, y, rx, ry) {
        return theEllipse(this, x || 0, y || 0, rx || 0, ry || 0);
    };
    paperproto.path = function (pathString) {
        pathString && !R.is(pathString, string) && !R.is(pathString[0], array) && (pathString += E);
        return thePath(R.format[apply](R, arguments), this);
    };
    paperproto.image = function (src, x, y, w, h) {
        return theImage(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
    };
    paperproto.text = function (x, y, text) {
        return theText(this, x || 0, y || 0, Str(text));
    };
    paperproto.set = function (itemsArray) {
        arguments[length] > 1 && (itemsArray = Array[proto].splice.call(arguments, 0, arguments[length]));
        return new Set(itemsArray);
    };
    paperproto.setSize = setSize;
    paperproto.top = paperproto.bottom = null;
    paperproto.raphael = R;
    function x_y() {
        return this.x + S + this.y;
    }
    elproto.resetScale = function () {
        if (this.removed) {
            return this;
        }
        this._.sx = 1;
        this._.sy = 1;
        this.attrs.scale = "1 1";
    };
    elproto.scale = function (x, y, cx, cy) {
        if (this.removed) {
            return this;
        }
        if (x == null && y == null) {
            return {
                x: this._.sx,
                y: this._.sy,
                toString: x_y
            };
        }
        y = y || x;
        !+y && (y = x);
        var dx,
            dy,
            dcx,
            dcy,
            a = this.attrs;
        if (x != 0) {
            var bb = this.getBBox(),
                rcx = bb.x + bb.width / 2,
                rcy = bb.y + bb.height / 2,
                kx = abs(x / this._.sx),
                ky = abs(y / this._.sy);
            cx = (+cx || cx == 0) ? cx : rcx;
            cy = (+cy || cy == 0) ? cy : rcy;
            var posx = this._.sx > 0,
                posy = this._.sy > 0,
                dirx = ~~(x / abs(x)),
                diry = ~~(y / abs(y)),
                dkx = kx * dirx,
                dky = ky * diry,
                s = this.node.style,
                ncx = cx + abs(rcx - cx) * dkx * (rcx > cx == posx ? 1 : -1),
                ncy = cy + abs(rcy - cy) * dky * (rcy > cy == posy ? 1 : -1),
                fr = (x * dirx > y * diry ? ky : kx);
            switch (this.type) {
                case "rect":
                case "image":
                    var neww = a.width * kx,
                        newh = a.height * ky;
                    this.attr({
                        height: newh,
                        r: a.r * fr,
                        width: neww,
                        x: ncx - neww / 2,
                        y: ncy - newh / 2
                    });
                    break;
                case "circle":
                case "ellipse":
                    this.attr({
                        rx: a.rx * kx,
                        ry: a.ry * ky,
                        r: a.r * fr,
                        cx: ncx,
                        cy: ncy
                    });
                    break;
                case "text":
                    this.attr({
                        x: ncx,
                        y: ncy
                    });
                    break;
                case "path":
                    var path = pathToRelative(a.path),
                        skip = true,
                        fx = posx ? dkx : kx,
                        fy = posy ? dky : ky;
                    for (var i = 0, ii = path[length]; i < ii; i++) {
                        var p = path[i],
                            P0 = upperCase.call(p[0]);
                        if (P0 == "M" && skip) {
                            continue;
                        } else {
                            skip = false;
                        }
                        if (P0 == "A") {
                            p[path[i][length] - 2] *= fx;
                            p[path[i][length] - 1] *= fy;
                            p[1] *= kx;
                            p[2] *= ky;
                            p[5] = +(dirx + diry ? !!+p[5] : !+p[5]);
                        } else if (P0 == "H") {
                            for (var j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= fx;
                            }
                        } else if (P0 == "V") {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= fy;
                            }
                         } else {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= (j % 2) ? fx : fy;
                            }
                        }
                    }
                    var dim2 = pathDimensions(path);
                    dx = ncx - dim2.x - dim2.width / 2;
                    dy = ncy - dim2.y - dim2.height / 2;
                    path[0][1] += dx;
                    path[0][2] += dy;
                    this.attr({path: path});
                break;
            }
            if (this.type in {text: 1, image:1} && (dirx != 1 || diry != 1)) {
                if (this.transformations) {
                    this.transformations[2] = "scale("[concat](dirx, ",", diry, ")");
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    dx = (dirx == -1) ? -a.x - (neww || 0) : a.x;
                    dy = (diry == -1) ? -a.y - (newh || 0) : a.y;
                    this.attr({x: dx, y: dy});
                    a.fx = dirx - 1;
                    a.fy = diry - 1;
                } else {
                    this.node.filterMatrix = ms + ".Matrix(M11="[concat](dirx,
                        ", M12=0, M21=0, M22=", diry,
                        ", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            } else {
                if (this.transformations) {
                    this.transformations[2] = E;
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    a.fx = 0;
                    a.fy = 0;
                } else {
                    this.node.filterMatrix = E;
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            }
            a.scale = [x, y, cx, cy][join](S);
            this._.sx = x;
            this._.sy = y;
        }
        return this;
    };
    elproto.clone = function () {
        if (this.removed) {
            return null;
        }
        var attr = this.attr();
        delete attr.scale;
        delete attr.translation;
        return this.paper[this.type]().attr(attr);
    };
    var curveslengths = {},
    getPointAtSegmentLength = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
        var len = 0,
            precision = 100,
            name = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y].join(),
            cache = curveslengths[name],
            old, dot;
        !cache && (curveslengths[name] = cache = {data: []});
        cache.timer && clearTimeout(cache.timer);
        cache.timer = setTimeout(function () {delete curveslengths[name];}, 2000);
        if (length != null) {
            var total = getPointAtSegmentLength(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
            precision = ~~total * 10;
        }
        for (var i = 0; i < precision + 1; i++) {
            if (cache.data[length] > i) {
                dot = cache.data[i * precision];
            } else {
                dot = R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, i / precision);
                cache.data[i] = dot;
            }
            i && (len += pow(pow(old.x - dot.x, 2) + pow(old.y - dot.y, 2), .5));
            if (length != null && len >= length) {
                return dot;
            }
            old = dot;
        }
        if (length == null) {
            return len;
        }
    },
    getLengthFactory = function (istotal, subpath) {
        return function (path, length, onlystart) {
            path = path2curve(path);
            var x, y, p, l, sp = "", subpaths = {}, point,
                len = 0;
            for (var i = 0, ii = path.length; i < ii; i++) {
                p = path[i];
                if (p[0] == "M") {
                    x = +p[1];
                    y = +p[2];
                } else {
                    l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                    if (len + l > length) {
                        if (subpath && !subpaths.start) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            sp += ["C", point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                            if (onlystart) {return sp;}
                            subpaths.start = sp;
                            sp = ["M", point.x, point.y + "C", point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]][join]();
                            len += l;
                            x = +p[5];
                            y = +p[6];
                            continue;
                        }
                        if (!istotal && !subpath) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            return {x: point.x, y: point.y, alpha: point.alpha};
                        }
                    }
                    len += l;
                    x = +p[5];
                    y = +p[6];
                }
                sp += p;
            }
            subpaths.end = sp;
            point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[1], p[2], p[3], p[4], p[5], p[6], 1);
            point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
            return point;
        };
    };
    var getTotalLength = getLengthFactory(1),
        getPointAtLength = getLengthFactory(),
        getSubpathsAtLength = getLengthFactory(0, 1);
    elproto.getTotalLength = function () {
        if (this.type != "path") {return;}
        if (this.node.getTotalLength) {
            return this.node.getTotalLength();
        }
        return getTotalLength(this.attrs.path);
    };
    elproto.getPointAtLength = function (length) {
        if (this.type != "path") {return;}
        return getPointAtLength(this.attrs.path, length);
    };
    elproto.getSubpath = function (from, to) {
        if (this.type != "path") {return;}
        if (abs(this.getTotalLength() - to) < "1e-6") {
            return getSubpathsAtLength(this.attrs.path, from).end;
        }
        var a = getSubpathsAtLength(this.attrs.path, to, 1);
        return from ? getSubpathsAtLength(a, from).end : a;
    };

    // animation easing formulas
    R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 3);
        },
        ">": function (n) {
            return pow(n - 1, 3) + 1;
        },
        "<>": function (n) {
            n = n * 2;
            if (n < 1) {
                return pow(n, 3) / 2;
            }
            n -= 2;
            return (pow(n, 3) + 2) / 2;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == 0 || n == 1) {
                return n;
            }
            var p = .3,
                s = p / 4;
            return pow(2, -10 * n) * math.sin((n - s) * (2 * PI) / p) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                p = 2.75,
                l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };

    var animationElements = [],
        animation = function () {
            var Now = +new Date;
            for (var l = 0; l < animationElements[length]; l++) {
                var e = animationElements[l];
                if (e.stop || e.el.removed) {
                    continue;
                }
                var time = Now - e.start,
                    ms = e.ms,
                    easing = e.easing,
                    from = e.from,
                    diff = e.diff,
                    to = e.to,
                    t = e.t,
                    that = e.el,
                    set = {},
                    now;
                if (time < ms) {
                    var pos = easing(time / ms);
                    for (var attr in from) if (from[has](attr)) {
                        switch (availableAnimAttrs[attr]) {
                            case "along":
                                now = pos * ms * diff[attr];
                                to.back && (now = to.len - now);
                                var point = getPointAtLength(to[attr], now);
                                that.translate(diff.sx - diff.x || 0, diff.sy - diff.y || 0);
                                diff.x = point.x;
                                diff.y = point.y;
                                that.translate(point.x - diff.sx, point.y - diff.sy);
                                to.rot && that.rotate(diff.r + point.alpha, point.x, point.y);
                                break;
                            case nu:
                                now = +from[attr] + pos * ms * diff[attr];
                                break;
                            case "colour":
                                now = "rgb(" + [
                                    upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                    upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                    upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                ][join](",") + ")";
                                break;
                            case "path":
                                now = [];
                                for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                                    now[i] = [from[attr][i][0]];
                                    for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                        now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                    }
                                    now[i] = now[i][join](S);
                                }
                                now = now[join](S);
                                break;
                            case "csv":
                                switch (attr) {
                                    case "translation":
                                        var x = pos * ms * diff[attr][0] - t.x,
                                            y = pos * ms * diff[attr][1] - t.y;
                                        t.x += x;
                                        t.y += y;
                                        now = x + S + y;
                                    break;
                                    case "rotation":
                                        now = +from[attr][0] + pos * ms * diff[attr][0];
                                        from[attr][1] && (now += "," + from[attr][1] + "," + from[attr][2]);
                                    break;
                                    case "scale":
                                        now = [+from[attr][0] + pos * ms * diff[attr][0], +from[attr][1] + pos * ms * diff[attr][1], (2 in to[attr] ? to[attr][2] : E), (3 in to[attr] ? to[attr][3] : E)][join](S);
                                    break;
                                    case "clip-rect":
                                        now = [];
                                        i = 4;
                                        while (i--) {
                                            now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                        }
                                    break;
                                }
                                break;
                            default:
                              var from2 = [].concat(from[attr]);
                                now = [];
                                i = that.paper.customAttributes[attr].length;
                                while (i--) {
                                    now[i] = +from2[i] + pos * ms * diff[attr][i];
                                }
                                break;
                        }
                        set[attr] = now;
                    }
                    that.attr(set);
                    that._run && that._run.call(that);
                } else {
                    if (to.along) {
                        point = getPointAtLength(to.along, to.len * !to.back);
                        that.translate(diff.sx - (diff.x || 0) + point.x - diff.sx, diff.sy - (diff.y || 0) + point.y - diff.sy);
                        to.rot && that.rotate(diff.r + point.alpha, point.x, point.y);
                    }
                    (t.x || t.y) && that.translate(-t.x, -t.y);
                    to.scale && (to.scale += E);
                    that.attr(to);
                    animationElements.splice(l--, 1);
                }
            }
            R.svg && that && that.paper && that.paper.safari();
            animationElements[length] && setTimeout(animation);
        },
        keyframesRun = function (attr, element, time, prev, prevcallback) {
            var dif = time - prev;
            element.timeouts.push(setTimeout(function () {
                R.is(prevcallback, "function") && prevcallback.call(element);
                element.animate(attr, dif, attr.easing);
            }, prev));
        },
        upto255 = function (color) {
            return mmax(mmin(color, 255), 0);
        },
        translate = function (x, y) {
            if (x == null) {
                return {x: this._.tx, y: this._.ty, toString: x_y};
            }
            this._.tx += +x;
            this._.ty += +y;
            switch (this.type) {
                case "circle":
                case "ellipse":
                    this.attr({cx: +x + this.attrs.cx, cy: +y + this.attrs.cy});
                    break;
                case "rect":
                case "image":
                case "text":
                    this.attr({x: +x + this.attrs.x, y: +y + this.attrs.y});
                    break;
                case "path":
                    var path = pathToRelative(this.attrs.path);
                    path[0][1] += +x;
                    path[0][2] += +y;
                    this.attr({path: path});
                break;
            }
            return this;
        };
    elproto.animateWith = function (element, params, ms, easing, callback) {
        for (var i = 0, ii = animationElements.length; i < ii; i++) {
            if (animationElements[i].el.id == element.id) {
                params.start = animationElements[i].start;
            }
        }
        return this.animate(params, ms, easing, callback);
    };
    elproto.animateAlong = along();
    elproto.animateAlongBack = along(1);
    function along(isBack) {
        return function (path, ms, rotate, callback) {
            var params = {back: isBack};
            R.is(rotate, "function") ? (callback = rotate) : (params.rot = rotate);
            path && path.constructor == Element && (path = path.attrs.path);
            path && (params.along = path);
            return this.animate(params, ms, callback);
        };
    }
    function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            cy = 3 * p1y,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function solve(x, epsilon) {
            var t = solveCurveX(x, epsilon);
            return ((ay * t + by) * t + cy) * t;
        }
        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            for(t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < epsilon) {
                    return t2;
                }
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (abs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            t0 = 0;
            t1 = 1;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (abs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) / 2 + t0;
            }
            return t2;
        }
        return solve(t, 1 / (200 * duration));
    }
    elproto.onAnimation = function (f) {
        this._run = f || 0;
        return this;
    };
    elproto.animate = function (params, ms, easing, callback) {
        var element = this;
        element.timeouts = element.timeouts || [];
        if (R.is(easing, "function") || !easing) {
            callback = easing || null;
        }
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var from = {},
            to = {},
            animateable = false,
            diff = {};
        for (var attr in params) if (params[has](attr)) {
            if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
                animateable = true;
                from[attr] = element.attr(attr);
                (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                to[attr] = params[attr];
                switch (availableAnimAttrs[attr]) {
                    case "along":
                        var len = getTotalLength(params[attr]);
                        var point = getPointAtLength(params[attr], len * !!params.back);
                        var bb = element.getBBox();
                        diff[attr] = len / ms;
                        diff.tx = bb.x;
                        diff.ty = bb.y;
                        diff.sx = point.x;
                        diff.sy = point.y;
                        to.rot = params.rot;
                        to.back = params.back;
                        to.len = len;
                        params.rot && (diff.r = toFloat(element.rotate()) || 0);
                        break;
                    case nu:
                        diff[attr] = (to[attr] - from[attr]) / ms;
                        break;
                    case "colour":
                        from[attr] = R.getRGB(from[attr]);
                        var toColour = R.getRGB(to[attr]);
                        diff[attr] = {
                            r: (toColour.r - from[attr].r) / ms,
                            g: (toColour.g - from[attr].g) / ms,
                            b: (toColour.b - from[attr].b) / ms
                        };
                        break;
                    case "path":
                        var pathes = path2curve(from[attr], to[attr]);
                        from[attr] = pathes[0];
                        var toPath = pathes[1];
                        diff[attr] = [];
                        for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                            diff[attr][i] = [0];
                            for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                            }
                        }
                        break;
                    case "csv":
                        var values = Str(params[attr])[split](separator),
                            from2 = Str(from[attr])[split](separator);
                        switch (attr) {
                            case "translation":
                                from[attr] = [0, 0];
                                diff[attr] = [values[0] / ms, values[1] / ms];
                            break;
                            case "rotation":
                                from[attr] = (from2[1] == values[1] && from2[2] == values[2]) ? from2 : [0, values[1], values[2]];
                                diff[attr] = [(values[0] - from[attr][0]) / ms, 0, 0];
                            break;
                            case "scale":
                                params[attr] = values;
                                from[attr] = Str(from[attr])[split](separator);
                                diff[attr] = [(values[0] - from[attr][0]) / ms, (values[1] - from[attr][1]) / ms, 0, 0];
                            break;
                            case "clip-rect":
                                from[attr] = Str(from[attr])[split](separator);
                                diff[attr] = [];
                                i = 4;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                            break;
                        }
                        to[attr] = values;
                        break;
                    default:
                        values = [].concat(params[attr]);
                        from2 = [].concat(from[attr]);
                        diff[attr] = [];
                        i = element.paper.customAttributes[attr][length];
                        while (i--) {
                            diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                        }
                        break;
                }
            }
        }
        if (!animateable) {
            var attrs = [],
                lastcall;
            for (var key in params) if (params[has](key) && animKeyFrames.test(key)) {
                attr = {value: params[key]};
                key == "from" && (key = 0);
                key == "to" && (key = 100);
                attr.key = toInt(key, 10);
                attrs.push(attr);
            }
            attrs.sort(sortByKey);
            if (attrs[0].key) {
                attrs.unshift({key: 0, value: element.attrs});
            }
            for (i = 0, ii = attrs[length]; i < ii; i++) {
                keyframesRun(attrs[i].value, element, ms / 100 * attrs[i].key, ms / 100 * (attrs[i - 1] && attrs[i - 1].key || 0), attrs[i - 1] && attrs[i - 1].value.callback);
            }
            lastcall = attrs[attrs[length] - 1].value.callback;
            if (lastcall) {
                element.timeouts.push(setTimeout(function () {lastcall.call(element);}, ms));
            }
        } else {
            var easyeasy = R.easing_formulas[easing];
            if (!easyeasy) {
                easyeasy = Str(easing).match(bezierrg);
                if (easyeasy && easyeasy[length] == 5) {
                    var curve = easyeasy;
                    easyeasy = function (t) {
                        return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
                    };
                } else {
                    easyeasy = function (t) {
                        return t;
                    };
                }
            }
            animationElements.push({
                start: params.start || +new Date,
                ms: ms,
                easing: easyeasy,
                from: from,
                diff: diff,
                to: to,
                el: element,
                t: {x: 0, y: 0}
            });
            R.is(callback, "function") && (element._ac = setTimeout(function () {
                callback.call(element);
            }, ms));
            animationElements[length] == 1 && setTimeout(animation);
        }
        return this;
    };
    elproto.stop = function () {
        for (var i = 0; i < animationElements.length; i++) {
            animationElements[i].el.id == this.id && animationElements.splice(i--, 1);
        }
        for (i = 0, ii = this.timeouts && this.timeouts.length; i < ii; i++) {
            clearTimeout(this.timeouts[i]);
        }
        this.timeouts = [];
        clearTimeout(this._ac);
        delete this._ac;
        return this;
    };
    elproto.translate = function (x, y) {
        return this.attr({translation: x + " " + y});
    };
    elproto[toString] = function () {
        return "Rapha\xebl\u2019s object";
    };
    R.ae = animationElements;
 
    // Set
    var Set = function (items) {
        this.items = [];
        this[length] = 0;
        this.type = "set";
        if (items) {
            for (var i = 0, ii = items[length]; i < ii; i++) {
                if (items[i] && (items[i].constructor == Element || items[i].constructor == Set)) {
                    this[this.items[length]] = this.items[this.items[length]] = items[i];
                    this[length]++;
                }
            }
        }
    };
    Set[proto][push] = function () {
        var item,
            len;
        for (var i = 0, ii = arguments[length]; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == Element || item.constructor == Set)) {
                len = this.items[length];
                this[len] = this.items[len] = item;
                this[length]++;
            }
        }
        return this;
    };
    Set[proto].pop = function () {
        delete this[this[length]--];
        return this.items.pop();
    };
    for (var method in elproto) if (elproto[has](method)) {
        Set[proto][method] = (function (methodname) {
            return function () {
                for (var i = 0, ii = this.items[length]; i < ii; i++) {
                    this.items[i][methodname][apply](this.items[i], arguments);
                }
                return this;
            };
        })(method);
    }
    Set[proto].attr = function (name, value) {
        if (name && R.is(name, array) && R.is(name[0], "object")) {
            for (var j = 0, jj = name[length]; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items[length]; i < ii; i++) {
                this.items[i].attr(name, value);
            }
        }
        return this;
    };
    Set[proto].animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items[length],
            i = len,
            item,
            set = this,
            collector;
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        easing = R.is(easing, string) ? easing : collector;
        item = this.items[--i].animate(params, ms, easing, collector);
        while (i--) {
            this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, params, ms, easing, collector);
        }
        return this;
    };
    Set[proto].insertAfter = function (el) {
        var i = this.items[length];
        while (i--) {
            this.items[i].insertAfter(el);
        }
        return this;
    };
    Set[proto].getBBox = function () {
        var x = [],
            y = [],
            w = [],
            h = [];
        for (var i = this.items[length]; i--;) {
            var box = this.items[i].getBBox();
            x[push](box.x);
            y[push](box.y);
            w[push](box.x + box.width);
            h[push](box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        return {
            x: x,
            y: y,
            width: mmax[apply](0, w) - x,
            height: mmax[apply](0, h) - y
        };
    };
    Set[proto].clone = function (s) {
        s = new Set;
        for (var i = 0, ii = this.items[length]; i < ii; i++) {
            s[push](this.items[i].clone());
        }
        return s;
    };

    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
                w: font.w,
                face: {},
                glyphs: {}
            },
            family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family][push](fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d[rp](/[mlcxtrv]/g, function (command) {
                            return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                        }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    paperproto.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        if (!R.fonts) {
            return;
        }
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family[rp](/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font[length]; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    paperproto.print = function (x, y, string, font, size, origin, letter_spacing) {
        origin = origin || "middle"; // baseline|middle
        letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
        var out = this.set(),
            letters = Str(string)[split](E),
            shift = 0,
            path = E,
            scale;
        R.is(font, string) && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox.split(separator),
                top = +bb[0],
                height = +bb[1] + (origin == "baseline" ? bb[3] - bb[1] + (+font.face.descent) : (bb[3] - bb[1]) / 2);
            for (var i = 0, ii = letters[length]; i < ii; i++) {
                var prev = i && font.glyphs[letters[i - 1]] || {},
                    curr = font.glyphs[letters[i]];
                shift += i ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * letter_spacing) : 0;
                curr && curr.d && out[push](this.path(curr.d).attr({fill: "#000", stroke: "none", translation: [shift, 0]}));
            }
            out.scale(scale, scale, top, height).translate(x - top, y - height);
        }
        return out;
    };

    R.format = function (token, params) {
        var args = R.is(params, array) ? [0][concat](params) : arguments;
        token && R.is(token, string) && args[length] - 1 && (token = token[rp](formatrg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    R.ninja = function () {
        oldRaphael.was ? (win.Raphael = oldRaphael.is) : delete Raphael;
        return R;
    };
    R.el = elproto;
    R.st = Set[proto];

    oldRaphael.was ? (win.Raphael = R) : (Raphael = R);
})();
// seedrandom.js
// Author: David Bau 3/11/2010
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
//
// Usage:
//
//   <script src=http://davidbau.com/encode/seedrandom-min.js></script>
//
//   Math.seedrandom('yipee'); Sets Math.random to a function that is
//                             initialized using the given explicit seed.
//
//   Math.seedrandom();        Sets Math.random to a function that is
//                             seeded using the current time, dom state,
//                             and other accumulated local entropy.
//                             The generated seed string is returned.
//
//   Math.seedrandom('yowza', true);
//                             Seeds using the given explicit seed mixed
//                             together with accumulated entropy.
//
//   <script src="http://bit.ly/srandom-512"></script>
//                             Seeds using physical random bits downloaded
//                             from random.org.
//
// Examples:
//
//   Math.seedrandom("hello");            // Use "hello" as the seed.
//   document.write(Math.random());       // Always 0.5463663768140734
//   document.write(Math.random());       // Always 0.43973793770592234
//   var rng1 = Math.random;              // Remember the current prng.
//
//   var autoseed = Math.seedrandom();    // New prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable.
//
//   Math.random = rng1;                  // Continue "hello" prng sequence.
//   document.write(Math.random());       // Always 0.554769432473455
//
//   Math.seedrandom(autoseed);           // Restart at the previous seed.
//   document.write(Math.random());       // Repeat the 'unpredictable' value.
//
// Notes:
//
// Each time seedrandom('arg') is called, entropy from the passed seed
// is accumulated in a pool to help generate future seeds for the
// zero-argument form of Math.seedrandom, so entropy can be injected over
// time by calling seedrandom with explicit data repeatedly.
//
// On speed - This javascript implementation of Math.random() is about
// 3-10x slower than the built-in Math.random() because it is not native
// code, but this is typically fast enough anyway.  Seeding is more expensive,
// especially if you use auto-seeding.  Some details (timings on Chrome 4):
//
// Our Math.random()            - avg less than 0.002 milliseconds per call
// seedrandom('explicit')       - avg less than 0.5 milliseconds per call
// seedrandom('explicit', true) - avg less than 2 milliseconds per call
// seedrandom()                 - avg about 38 milliseconds per call
//
// LICENSE (BSD):
//
// Copyright 2010 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
// 
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 *
 * @param {number=} overflow 
 * @param {number=} startdenom
 */
(function (pool, math, width, chunks, significance, overflow, startdenom) {


//
// seedrandom()
// This is the seedrandom function described above.
//
math['seedrandom'] = function seedrandom(seed, use_entropy) {
  var key = [];
  var arc4;

  // Flatten the seed string or build one from local entropy if needed.
  seed = mixkey(flatten(
    use_entropy ? [seed, pool] :
    arguments.length ? seed :
    [new Date().getTime(), pool, window], 3), key);

  // Use the seed to initialize an ARC4 generator.
  arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(arc4.S, pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  math['random'] = function random() {  // Closure to return a random double:
    var n = arc4.g(chunks);             // Start with a numerator n < 2 ^ 48
    var d = startdenom;                 //   and denominator d = 2 ^ 48.
    var x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  // Return the seed that was used
  return seed;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, u, me = this, keylen = key.length;
  var i = 0, j = me.i = me.j = me.m = 0;
  me.S = [];
  me.c = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) { me.S[i] = i++; }
  for (i = 0; i < width; i++) {
    t = me.S[i];
    j = lowbits(j + t + key[i % keylen]);
    u = me.S[j];
    me.S[i] = u;
    me.S[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  me.g = function getnext(count) {
    var s = me.S;
    var i = lowbits(me.i + 1); var t = s[i];
    var j = lowbits(me.j + t); var u = s[j];
    s[i] = u;
    s[j] = t;
    var r = s[lowbits(t + u)];
    while (--count) {
      i = lowbits(i + 1); t = s[i];
      j = lowbits(j + t); u = s[j];
      s[i] = u;
      s[j] = t;
      r = r * width + s[lowbits(t + u)];
    }
    me.i = i;
    me.j = j;
    return r;
  };
  // For robust unpredictability discard an initial batch of values.
  // See http://www.rsa.com/rsalabs/node.asp?id=2009
  me.g(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
/** @param {Object=} result 
  * @param {string=} prop */
function flatten(obj, depth, result, prop) {
  result = [];
  if (depth && typeof(obj) == 'object') {
    for (prop in obj) {
      if (prop.indexOf('S') < 5) {    // Avoid FF3 bug (local/sessionStorage)
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }
  }
  return result.length ? result : '' + obj;
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
/** @param {number=} smear 
  * @param {number=} j */
function mixkey(seed, key, smear, j) {
  seed += '';                         // Ensure the seed is a string
  smear = 0;
  for (j = 0; j < seed.length; j++) {
    key[lowbits(j)] =
      lowbits((smear ^= key[lowbits(j)] * 19) + seed.charCodeAt(j));
  }
  seed = '';
  for (j in key) { seed += String.fromCharCode(key[j]); }
  return seed;
}

//
// lowbits()
// A quick "n mod width" for width a power of 2.
//
function lowbits(n) { return n & (width - 1); }

//
// The following constants are related to IEEE 754 limits.
//
startdenom = math.pow(width, chunks);
significance = math.pow(2, significance);
overflow = significance * 2;

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

// End anonymous scope, and pass initial values.
})(
  [],   // pool: entropy pool starts empty
  Math, // math: package containing random, pow, and seedrandom
  256,  // width: each RC4 output is 0 <= x < 256
  6,    // chunks: at least six RC4 outputs for each double
  52    // significance: there are 52 significant digits in a double
);
