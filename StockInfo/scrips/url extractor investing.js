var trs = $('.myPortfolioTbl .js-hover-me-wrapper a');

var res = {};
for(var i=0;i<trs.size();i++){
 var obj = {};
 obj.link = trs[i].getAttribute('href');
 obj.datapairid = trs[i].getAttribute('data-pairid');
 obj.title = trs[i].innerText.trim();
 res[obj.title] = obj;
}
JSON.stringify(res);