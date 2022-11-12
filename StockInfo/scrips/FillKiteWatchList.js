populateTable = function(){
	var prefix = '21722';  //NIFTY2170115800CE
	var niftyStart=15900;
	var bankNiftyStart=35900;

	
	//Fill FUT
	addRow('NIFTY21JULFUT','NFO-FUT');
	addRow('BANKNIFTY21JULFUT','NFO-FUT');
	
	
	//Fill  NIFTY call/put
	for(var i=0;i<10 ;i++){
		addRow('NIFTY' + prefix + (niftyStart -400 +i*100) +'CE','NFO-OPT');
	}
	for(var i=0;i<10 ;i++){
		addRow('NIFTY' + prefix + (niftyStart -400 +i*100) +'PE','NFO-OPT');
	}
	

	//Fill BANKNIFTY call/put
	for(var i=0;i<13 ;i++){
		addRow('BANKNIFTY' + prefix + (bankNiftyStart -700 +i*100) +'CE','NFO-OPT');
	}
	for(var i=0;i<13 ;i++){
		addRow('BANKNIFTY' + prefix + (bankNiftyStart -700 +i*100) +'PE','NFO-OPT');
	}

}

var index=1;
addRow= function(symbol,segment){
	
	fetch("api/marketwatch/20347/items", {
	  method: "POST", 
	  body:  'segment='+segment+ '&tradingsymbol='+symbol+'&watch_id=20347&weight='+(index++),
	  headers:{'x-csrftoken':localStorage.getItem('__storejs_kite_public_token').replaceAll('"',''),'content-type':'application/x-www-form-urlencoded'}
	}).then(res => {
	  console.log("Request complete! response:", res);
	});
}

function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

populateTable();
	

