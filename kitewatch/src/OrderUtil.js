import React from 'react';
import './App.css';
import toaster from "toasted-notes";
import "toasted-notes/src/styles.css"; 


let isShowNotification = true;

export const  placeBuyLimitOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'BUY';
	fillCNCLimitOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}
export  const placeSellLimitOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'SELL';
	fillCNCLimitOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}
export const  placeBuyMarketOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'BUY';
	fillCNCMarketOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}
export  const placeSellMarketOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'SELL';
	fillCNCMarketOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}
export const  placeBuySLMarketOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'BUY';
	fillCNCSLMarketOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}
export  const placeSellSLMarketOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'SELL';
	fillCNCSLMarketOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}








export const  placeMISBuyLimitOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'BUY';
	fillMISLimitOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}
export  const placeMISSellLimitOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'SELL';
	fillMISLimitOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}

export const  placeMISBuyMarketOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'BUY';
	fillMISMarketOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}
export  const placeMISSellMarketOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'SELL';
	fillMISMarketOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}

export const  placeMISBuySLMarketOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'BUY';
	fillMISSLMarketOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}
export  const placeMISSellSLMarketOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'SELL';
	fillMISSLMarketOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}


export const  placeMISBuySLOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'BUY';
	fillMISSLOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}
export  const placeMISSellSLOrder=(data,onSuccess,onErrror)=>{
	data.transaction_type = 'SELL';
	fillMISSLOrderDetails(data);
	placeOrder(data,onSuccess,onErrror);
}






const fillCNCLimitOrderDetails=(data)=>{
	data.order_type = 'LIMIT';
	data.product = 'CNC';
	data.validity = 'DAY';
	data.disclosed_quantity = 0;
	data.trigger_price = 0;
	data.squareoff = 0;
	data.stoploss = 0;
	data.trailing_stoploss = 0;
	data.variety = 'regular';
	data.user_id = 'DA6170';
}

const fillCNCMarketOrderDetails=(data)=>{
	data.order_type = 'MARKET';
	data.product = 'CNC';
	data.validity = 'DAY';
	data.disclosed_quantity = 0;
	data.trigger_price = 0;
	data.squareoff = 0;
	data.stoploss = 0;
	data.trailing_stoploss = 0;
	data.variety = 'regular';
	data.user_id = 'DA6170';
}

const fillCNCSLMarketOrderDetails=(data)=>{
	data.order_type = 'SL-M';
	data.product = 'CNC';
	data.validity = 'DAY';
	data.disclosed_quantity = 0;
	data.squareoff = 0;
	data.stoploss = 0;
	data.trailing_stoploss = 0;
	data.variety = 'regular';
	data.user_id = 'DA6170';
}














const fillMISLimitOrderDetails=(data)=>{
	data.order_type = 'LIMIT';
	data.product = 'MIS';
	data.validity = 'DAY';
	data.disclosed_quantity = 0;
	data.trigger_price = 0;
	data.squareoff = 0;
	data.stoploss = 0;
	data.trailing_stoploss = 0;
	data.variety = 'regular';
	data.user_id = 'DA6170';
}


const fillMISMarketOrderDetails=(data)=>{
	data.order_type = 'MARKET';
	data.product = 'MIS';
	data.validity = 'DAY';
	data.disclosed_quantity = 0;
	data.trigger_price = 0;
	data.squareoff = 0;
	data.stoploss = 0;
	data.trailing_stoploss = 0;
	data.variety = 'regular';
	data.user_id = 'DA6170';
}

const fillMISSLMarketOrderDetails=(data)=>{
	data.order_type = 'SL-M';
	data.product = 'MIS';
	data.validity = 'DAY';
	data.disclosed_quantity = 0;
	data.squareoff = 0;
	data.stoploss = 0;
	data.trailing_stoploss = 0;
	data.variety = 'regular';
	data.user_id = 'DA6170';
}


const fillMISSLOrderDetails=(data)=>{
	data.order_type = 'SL';
	data.product = 'MIS';
	data.validity = 'DAY';
	data.disclosed_quantity = 0;
	data.squareoff = 0;
	data.stoploss = 0;
	data.trailing_stoploss = 0;
	data.variety = 'regular';
	data.user_id = 'DA6170';
}


export const showToastMsg=(content)=>{
	if(isShowNotification){
	    toaster.notify(content, {
	      position: "top-right", // top-left, top, top-right, bottom-left, bottom, bottom-right
	      duration: 3000 // This notification will not automatically close
	    });		
	}
}

export const showNotification=(isShow)=>{
	isShowNotification = isShow;
}

const placeOrder=(data,onSuccess,onErrror)=>{

	const  formattedVals = [];
    for(let prop in data){
        formattedVals.push(prop + "=" + data[prop]);
    }
    const body = formattedVals.join("&");
    
      fetch('https://kite.zerodha.com/oms/orders/regular',
      	{
	      	method: 'POST',
	      	headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"authorization": window.authKey
			},
	      	body:body
      	})
        .then(response => response.json())
        .then(function(jsonData){
        	//console.info(jsonData);
        	if(jsonData.status == 'success'){
        		onSuccess(jsonData);
				showToastMsg((<span className={'green'}>{data.tradingsymbol} &nbsp;&nbsp;O_ID->{jsonData.data.order_id}</span>));        		
        	}else if(jsonData.status == 'error'){
        		onErrror(jsonData);
        		showToastMsg((<span className={'red'}>{data.tradingsymbol} &nbsp;&nbsp; ->{jsonData.message}</span>));   
        	}        		
        })
        .catch((error) => {        	
          console.error(error);
          onErrror(error);
        });

   		showToastMsg((<span className={data.transaction_type=='BUY'?'green':'red'}>{data.tradingsymbol} &nbsp;&nbsp;{data.product} &nbsp;Q->{data.quantity}</span>));	
}



export const getMargin=(onSuccess,onErrror)=>{

      fetch('https://kite.zerodha.com/oms/user/margins',
      	{
	      	method: 'GET',
	      	headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"authorization": window.authKey
			}
      	})
        .then(response => response.json())
        .then(function(jsonData){
        	//console.info(jsonData);
        	if(jsonData.status == 'success'){
        		onSuccess(jsonData);
        	}else if(jsonData.status == 'error'){
        		onErrror(jsonData);
        	}        		
        })
        .catch((error) => {        	
          console.error(error);
          onErrror(error);
        });
}



export const getPosition=(onSuccess,onErrror)=>{

      fetch('https://kite.zerodha.com/oms/portfolio/positions',
      	{
	      	method: 'GET',
	      	headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"authorization": window.authKey
			}
      	})
        .then(response => response.json())
        .then(function(jsonData){
        	//console.info(jsonData);
        	if(jsonData.status == 'success'){
        		onSuccess(jsonData);
        	}else if(jsonData.status == 'error'){
        		onErrror(jsonData);
        	}        		
        })
        .catch((error) => {        	
          console.error(error);
          onErrror(error);
        });
}


export const getHolding=(onSuccess,onErrror)=>{

      fetch('https://kite.zerodha.com/oms/portfolio/holdings',
      	{
	      	method: 'GET',
	      	headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"authorization": window.authKey
			}
      	})
        .then(response => response.json())
        .then(function(jsonData){
        	//console.info(jsonData);
        	if(jsonData.status == 'success'){
        		onSuccess(jsonData);
        	}else if(jsonData.status == 'error'){
        		onErrror(jsonData);
        	}        		
        })
        .catch((error) => {        	
          console.error(error);
          onErrror(error);
        });
}








export const getFullQuote=(queryString,onSuccess,onErrror)=>{

      fetch('https://api.kite.trade/quote?'+queryString,
      	{
	      	method: 'GET',
	      	headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"authorization": window.authKey
			}
      	})
        .then(response => response.json())
        .then(function(jsonData){
        	//console.info(jsonData);
        	if(jsonData.status == 'success'){
        		onSuccess(jsonData);
        	}else if(jsonData.status == 'error'){
        		onErrror(jsonData);
        	}        		
        })
        .catch((error) => {        	
          console.error(error);
          onErrror(error);
        });
}






export const createBasket=(name,onSuccess,onErrror)=>{

      fetch('https://kite.zerodha.com/api/baskets',
      	{
	      	method: 'POST',
	      	headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					"authorization": window.authKey
			},
			body: 'name='+name
      	})
        .then(response => response.json())
        .then(function(jsonData){
        	//console.info(jsonData);
        	if(jsonData.status == 'success'){
        		onSuccess(jsonData);
        	}else if(jsonData.status == 'error'){
        		onErrror(jsonData);
        	}        		
        })
        .catch((error) => {        	
          console.error(error);
          onErrror(error);
        });
}


export const addToBasket=(basketId,payload,onSuccess,onErrror)=>{

      fetch(`https://kite.zerodha.com/api/baskets/${basketId}/items`,
      	{
	      	method: 'POST',
	      	headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					"authorization": window.authKey
			},
			body: payload
      	})
        .then(response => response.json())
        .then(function(jsonData){
        	//console.info(jsonData);
        	if(jsonData.status == 'success'){
        		onSuccess(jsonData);
        	}else if(jsonData.status == 'error'){
        		onErrror(jsonData);
        	}        		
        })
        .catch((error) => {        	
          console.error(error);
          onErrror(error);
        });
}



export const createAlertOnSentinel=(payload)=>{

      fetch('https://kite.zerodha.com/oms/alerts',
      	{
	      	method: 'POST',
	      	headers: {
					'Content-Type': 'application/x-www-form-urlencoded',								
					"authorization": window.authKey
			},
			body: payload
      	})
        .then(response => response.json())
        .then(function(jsonData){
        	//console.info(jsonData);
        	if(jsonData.status == 'success'){
        		showToastMsg((<span className={'green'}>{jsonData.data.name}</span>));   
        	}else if(jsonData.status == 'error'){
        		showToastMsg((<span className={'red'}>{"error"} &nbsp;&nbsp; ->{jsonData.message}</span>));   
        	}        		
        })
        .catch((error) => {        	
          console.error(error);
          showToastMsg((<span className={'red'}>{error}</span>));   
        });
}



export const getOrders=(onSuccess,onErrror)=>{

      fetch('https://kite.zerodha.com/oms/orders',
      	{
	      	method: 'GET',
	      	headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"authorization": window.authKey
			}
      	})
        .then(response => response.json())
        .then(function(jsonData){
        	//console.info(jsonData);
        	if(jsonData.status == 'success'){
        		onSuccess(jsonData);
        	}else if(jsonData.status == 'error'){
        		onErrror(jsonData);
        	}        		
        })
        .catch((error) => {        	
          console.error(error);
          onErrror(error);
        });
}



export const cancelOrder=(orderID,onSuccess,onErrror)=>{

      fetch('https://api.kite.trade/orders/regular/'+orderID,
      	{
	      	method: 'DELETE',
	      	headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"authorization": window.authKey
			}
      	})
        .then(response => response.json())
        .then(function(jsonData){
        	//console.info(jsonData);
        	if(jsonData.status == 'success'){
        		onSuccess(jsonData);
        	}else if(jsonData.status == 'error'){
        		onErrror(jsonData);
        	}        		
        })
        .catch((error) => {        	
          console.error(error);
          onErrror(error);
        });
}



