var externalScript   = document.createElement("script");
externalScript.type  = "text/javascript";
externalScript.setAttribute('async','async');
externalScript.src = "//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
document.getElementsByTagName('body')[0].appendChild(externalScript);

var ins   = document.createElement("ins");
ins.setAttribute('class','adsbygoogle');
ins.setAttribute('style','display:block;');/*add other styles if required*/
ins.setAttribute('data-ad-client','ca-pub-unique_id');
ins.setAttribute('data-ad-slot','youradslot');
ins.setAttribute('data-ad-format','auto');
document.getElementsByTagName('body')[0].appendChild(ins);

var inlineScript   = document.createElement("script");
inlineScript.type  = "text/javascript";
inlineScript.text  = '(adsbygoogle = window.adsbygoogle || []).push({});'  
document.getElementsByTagName('body')[0].appendChild(inlineScript);
