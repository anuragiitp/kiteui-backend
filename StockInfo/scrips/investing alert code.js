var time=1;
for(var i=0;i<=300;i++){
	setTimeout(talert,time*1000,i);
	time=time+20;
}

 function talert(ind){

	setTimeout(function(){
	$(".js-plus-icon")[ind].click()
	setTimeout(function(){$("li[data-value='alertChange']").click();$("#alertValueChange")[0].value=4;$("#alertPopupBig_instrument .footerContent a")[0].click();},2000);
	},1000);

	setTimeout(function(){
	$(".js-plus-icon")[ind].click()
	setTimeout(function(){$("li[data-value='alertChange']").click();$("#alertValueChange")[0].value=8;$("#alertPopupBig_instrument .footerContent a")[0].click();},2000);
	},4000);

	setTimeout(function(){
	$(".js-plus-icon")[ind].click()
	setTimeout(function(){$("li[data-value='alertChange']").click();$("#alertValueChange")[0].value=9;$("#alertPopupBig_instrument .footerContent a")[0].click();},2000);
	},8000);

	setTimeout(function(){
	$(".js-plus-icon")[ind].click()
	setTimeout(function(){$("li[data-value='alertChange']").click();$("#alertValueChange")[0].value=14;$("#alertPopupBig_instrument .footerContent a")[0].click();},2000);
	},12000);
}
