var allAlert=[];
const csrftoken= document.cookie
		.split( ';' )
		.map( pair => pair.split( '=' ) )
		.filter( pair => pair.length == 2 && pair[0].trim()=='sentinel_csrftoken' )
		.map( pair => [ pair[0].trim(), pair[1].trim() ] )
		.filter( pair => pair[0] != 'expires' )[0][1].trim()
	;
	
getAllAlerts = function(){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", 'https://sentinel.zerodha.com/api/triggers/all', false);

	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.setRequestHeader("accept", "application/json, text/plain, */*");
	xhr.setRequestHeader("x-csrftoken", csrftoken);

	xhr.onreadystatechange = function() {
	if(xhr.readyState === XMLHttpRequest.DONE) {
		var status = xhr.status;
		if (status === 0 || (status >= 200 && status < 400)) {
		  // The request has been completed successfully
		  allAlert = JSON.parse(xhr.responseText);
		} else {
		  alert(JSON.parse(xhr.responseText).message);
		}
	  }
	}
	xhr.send();
}

deleteAlert = function(alertKey){
	var xhr = new XMLHttpRequest();
	xhr.open("DELETE", 'https://sentinel.zerodha.com/api/triggers/detail/'+alertKey, false);

	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.setRequestHeader("accept", "application/json, text/plain, */*");
	xhr.setRequestHeader("x-csrftoken", csrftoken);

	xhr.send();
}	
	
getAllAlerts();	
for(var i=0;i<allAlert.length;i++){
	if(allAlert[i].is_active==false){
		deleteAlert(allAlert[i].hash_id);
	}
}