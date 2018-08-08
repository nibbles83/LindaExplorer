var externalScript   = document.createElement("script");
externalScript.type  = "text/javascript";
externalScript.setAttribute('async','async');
externalScript.src = "//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

var ins   = document.createElement("ins");
ins.setAttribute('class','adsbygoogle');
ins.setAttribute('style','display:block');/*add other styles if required*/
ins.setAttribute('data-ad-client','ca-pub-xxxxxxxxxxxx');
ins.setAttribute('data-ad-slot','8695170527');
ins.setAttribute('data-ad-format','auto');

var inlineScript   = document.createElement("script");
inlineScript.type  = "text/javascript";
inlineScript.text  = '(adsbygoogle = window.adsbygoogle || []).push({});'  

var table = document.createElement("table");
var row = document.createElement("tr");
var cell = document.createElement("td");
cell.setAttribute('align','center');
cell.appendChild(externalScript);
cell.appendChild(ins);
cell.appendChild(inlineScript);
row.appendChild(cell);
table.appendChild(row);
document.getElementsByTagName('body')[0].appendChild(table);
