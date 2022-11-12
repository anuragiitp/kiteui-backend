var apiKey="enctoken "+localStorage.getItem('__storejs_kite_enctoken').replaceAll('"',"");
var allAlert=[];

getAllAlerts = function(){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", 'https://kite.zerodha.com/oms/alerts', false);

	xhr.setRequestHeader("authorization", apiKey);	
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.setRequestHeader("accept", "application/json, text/plain, */*");

	xhr.onreadystatechange = function() {
	if(xhr.readyState === XMLHttpRequest.DONE) {
		var status = xhr.status;
		if (status === 0 || (status >= 200 && status < 400)) {
		  // The request has been completed successfully
		  allAlert = JSON.parse(xhr.responseText).data;
		} else {
		  alert(JSON.parse(xhr.responseText).message);
		}
	  }
	}
	xhr.send();
}

deleteAlert = function(alertKey){
	var xhr = new XMLHttpRequest();
	xhr.open("DELETE", 'https://kite.zerodha.com/oms/alerts/'+alertKey, false);
	xhr.setRequestHeader("authorization", apiKey);	
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("accept", "application/json, text/plain, */*");
	xhr.send();
}	
	
getAllAlerts();	
for(var i=0;i<allAlert.length;i++){
	if(allAlert[i].status=='disabled'){
		deleteAlert(allAlert[i].uuid);
	}
}