import React from 'react';
import './App.css';

import {placeBuyLimitOrder,placeSellLimitOrder,placeBuyMarketOrder,placeSellMarketOrder,placeBuySLMarketOrder,placeSellSLMarketOrder,placeMISBuyLimitOrder,placeMISSellLimitOrder,placeMISBuyMarketOrder,placeMISSellMarketOrder,getPosition,placeMISBuySLMarketOrder,placeMISSellSLMarketOrder} from './OrderUtil';


class OrderWindow extends React.Component {
	  constructor(props) {
	    super(props);
	    let orderWindowView = {buyView:true,sellView:true,orderType:"LIMIT",productType:"CNC"};
	    orderWindowView = localStorage.getItem("orderWindowView.json")!=undefined ?JSON.parse(localStorage.getItem("orderWindowView.json")):orderWindowView;	

	    let SLPerc = 2;
	    if(localStorage.getItem("SLPerc") && !isNaN(localStorage.getItem("SLPerc"))){
	    	SLPerc = localStorage.getItem("SLPerc");
	    }

	    this.state={orderWindowView:orderWindowView,SLPerc:SLPerc};    

		this.textInputBuyQty  = null;
		this.textInputSellQty = null;	    

	  }

	componentDidMount() {
		this.fillInputWithLatestPrice();
	}  

	componentDidUpdate(prevProps) {
		if(prevProps.symbol != this.props.symbol){
			this.fillInputWithLatestPrice();
		}
	}

  fillInputWithLatestPrice=()=>{
    const{
      kitedata,
      symbol
    }=this.props;
  	let depth = kitedata.ticks[symbol].depth;	

  	if(depth){

	  	this.setState({orderStatus:kitedata.ticks[symbol].exchange+'::'+symbol,orderStatusStyle:{},buyQuantity:'',buyPrice:depth.buy[0].price,sellQuantity:'',sellPrice:depth.sell[0].price});
	  	this.updateOrderPrice(this.state.orderWindowView.orderType,this.state.SLPerc);

	  	this.setFocusonOrderWindow();

  	}

  }


  updateSLPercentage=()=>{
  		let SLPrompt = window.prompt('SL percentage old-> ' +this.state.SLPerc);
  		if(SLPrompt!=null){
	  		if(!isNaN(SLPrompt)){
	  			localStorage.setItem("SLPerc",SLPrompt);
	  			this.setState({SLPerc:SLPrompt});
	  			this.updateOrderPrice(this.state.orderWindowView.orderType,SLPrompt);
	  		}else{
	  			alert('Invalid SL: old value -> '+this.state.SLPerc );
	  		}
  		}
  }

//update price on SL perc change
updateOrderPrice=(orderType,SLPerc)=>{
    const{
      kitedata,
      symbol
    }=this.props;


  	let depth = kitedata.ticks[symbol].depth;	

	let buyPrice = depth.buy[0].price;
	let sellPrice = depth.sell[0].price;


	if(orderType ==='SL_MARKET'){
		let lastTradedPrice = kitedata.ticks[symbol].lastTradedPrice;
		let priceChange = (lastTradedPrice*SLPerc)/100; 
		buyPrice = (buyPrice + priceChange).toFixed(1);
		sellPrice = (sellPrice - priceChange).toFixed(1);
	}
	this.setState({buyPrice:buyPrice,sellPrice:sellPrice});
}



setFocusonOrderWindow=()=>{
		// setTimeout(() => {
		//       	if(this.textInputBuyQty ){
		//   			this.textInputBuyQty.select();
		// 	  	}else if(this.textInputSellQty ){
		// 	  		this.textInputSellQty.select();
		// 	  	}
		//   }, 0);

      	if(this.textInputBuyQty ){
  			this.textInputBuyQty.select();
	  	}else if(this.textInputSellQty ){
	  		this.textInputSellQty.select();
	  	}
 }


 updaetOrderStatus=(orderStatus)=>{
 	this.setState({orderStatus:orderStatus});
 }



  onInputValueChange=(evt)=>{

    let{
      buyQuantity,
      buyPrice,
      sellQuantity,
      sellPrice,
      orderStatus,
      orderStatusStyle
    }=this.state;

    const{
      kitedata,
      symbol
    }=this.props;



  	if(evt.target.name == 'buyQuantity'){
  		buyQuantity=evt.target.value;
  		this.setState({buyQuantity:buyQuantity,orderStatusStyle:{color:'green'},orderStatus:kitedata.ticks[symbol].exchange+'::'+symbol +" ( Q-> "+buyQuantity+" )  ( P-> "+buyPrice+" )"});
  	}else if(evt.target.name == 'buyPrice'){
  		 buyPrice=evt.target.value;
  		this.setState({buyPrice:buyPrice,orderStatusStyle:{color:'green'},orderStatus:kitedata.ticks[symbol].exchange+'::'+symbol +" ( Q-> "+buyQuantity+" )  ( P-> "+buyPrice+" )"});
  	}else if(evt.target.name == 'sellQuantity'){
  		sellQuantity=evt.target.value;
  		this.setState({sellQuantity:sellQuantity,orderStatusStyle:{color:'red'},orderStatus:kitedata.ticks[symbol].exchange+'::'+symbol +" ( Q-> "+sellQuantity+" )  ( P-> "+sellPrice+" )"});
  	}else if(evt.target.name == 'sellPrice'){
  		sellPrice=evt.target.value;
  		this.setState({sellPrice:sellPrice,orderStatusStyle:{color:'red'},orderStatus:kitedata.ticks[symbol].exchange+'::'+symbol +" ( Q-> "+sellQuantity+" )  ( P-> "+sellPrice+" )"});
  	}

  }


toogleBuyView=()=>{
	let orderWindowView = this.state.orderWindowView;
	orderWindowView.buyView=!orderWindowView.buyView;
	this.setState({orderWindowView:orderWindowView});
	localStorage.setItem("orderWindowView.json", JSON.stringify(orderWindowView));		
}


toogleSellView=()=>{
	let orderWindowView = this.state.orderWindowView;
	orderWindowView.sellView=!orderWindowView.sellView;
	this.setState({orderWindowView:orderWindowView});
	localStorage.setItem("orderWindowView.json", JSON.stringify(orderWindowView));	
}


onOnderTypeChange=(evt)=>{
  if(evt.target.name=='orderType'){
    let orderType = evt.target.value;
	let orderWindowView = this.state.orderWindowView;
	orderWindowView.orderType=orderType;
	this.setState({orderWindowView:orderWindowView});
	localStorage.setItem("orderWindowView.json", JSON.stringify(orderWindowView));	

	this.updateOrderPrice(orderType,this.state.SLPerc);
  }
}


onProductTypeChange=(evt)=>{
  if(evt.target.name=='productType'){
  	let productType = evt.target.value;
	let orderWindowView = this.state.orderWindowView;
	orderWindowView.productType=productType;
	this.setState({orderWindowView:orderWindowView});
	localStorage.setItem("orderWindowView.json", JSON.stringify(orderWindowView));	
  }
}



onOrderSuccess=(data)=>{
	this.setState({orderStatus:data.data.order_id});
//	this.setFocusonOrderWindow();
	this.props.updateMarginData();
}


onOrderError=(data)=>{
	this.setState({orderStatus:data.message});
//	this.setFocusonOrderWindow();
	this.props.updateMarginData();
}



sendBuyOrderRequest=()=>{

    const{
      buyQuantity,
      buyPrice,
      orderWindowView
    }=this.state;

    const{
      kitedata,
      symbol
    }=this.props;

    const {	productType,
    		orderType
    } = orderWindowView;


    if(isNaN(buyQuantity) || isNaN(buyPrice) || isNaN(Number.parseInt(buyQuantity))){
    	window.alert('Invalid input');
    	return;
    }
  	if(buyPrice*buyQuantity > 200000 ){
  		alert("MAX Order value 2Lac reached");  
  		return;	
  	}

    if(productType == "CNC"){

	   if(orderType=="MARKET"){
	      placeBuyMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:buyPrice,quantity:buyQuantity,transaction_type:'BUY',order_type:'MARKET'},this.onOrderSuccess,this.onOrderError);
	   } else if(orderType=="LIMIT"){
	      placeBuyLimitOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:buyPrice,quantity:buyQuantity,transaction_type:'BUY',order_type:'LIMIT'},this.onOrderSuccess,this.onOrderError);   
	   }else if(orderType=="SL_MARKET"){
	      placeBuySLMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:buyPrice,trigger_price:buyPrice,quantity:buyQuantity,transaction_type:'BUY',order_type:'SL-M'},this.onOrderSuccess,this.onOrderError);
	   }

    }else if(productType == "MIS"){
	   if(orderType=="MARKET"){
	      placeMISBuyMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:buyPrice,quantity:buyQuantity,transaction_type:'BUY',order_type:'MARKET'},this.onOrderSuccess,this.onOrderError);
	   } else if(orderType=="LIMIT"){
	      placeMISBuyLimitOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:buyPrice,quantity:buyQuantity,transaction_type:'BUY',order_type:'LIMIT'},this.onOrderSuccess,this.onOrderError);
	   } else if(orderType=="SL_MARKET"){
	      placeMISBuySLMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:buyPrice,trigger_price:buyPrice,quantity:buyQuantity,transaction_type:'BUY',order_type:'SL-M'},this.onOrderSuccess,this.onOrderError);
	   }
    }

    this.setState({buyQuantity:'',sellQuantity:''});
	
}

sendSellOrderRequest=()=>{

    const{
      sellQuantity,
      sellPrice,
      orderWindowView
    }=this.state;

    const{
      kitedata,
      symbol
    }=this.props;

    const {	productType,
    		orderType
    } = orderWindowView;


    if(isNaN(sellQuantity) || isNaN(sellPrice) || isNaN(Number.parseInt(sellQuantity))){
    	window.alert('Invalid input');
    	return;
    }

  	if(sellPrice*sellQuantity > 200000 ){
  		alert("MAX Order value 2Lac reached"); 
  		return; 	
  	}

    if(productType == "CNC"){
	   if(orderType=="MARKET"){
	      placeSellMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:sellPrice,quantity:sellQuantity,transaction_type:'SELL',order_type:'MARKET'},this.onOrderSuccess,this.onOrderError);
	   }else if(orderType=="LIMIT"){
	      placeSellLimitOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:sellPrice,quantity:sellQuantity,transaction_type:'SELL',order_type:'LIMIT'},this.onOrderSuccess,this.onOrderError);
	   }else if(orderType=="SL_MARKET"){
	      placeSellSLMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:sellPrice,trigger_price:sellPrice,quantity:sellQuantity,transaction_type:'SELL',order_type:'SL-M'},this.onOrderSuccess,this.onOrderError);
	   } 

    }else if(productType == "MIS"){
	   if(orderType=="MARKET"){
	      placeMISSellMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:sellPrice,quantity:sellQuantity,transaction_type:'SELL',order_type:'MARKET'},this.onOrderSuccess,this.onOrderError);
	   }else if(orderType=="LIMIT"){
	      placeMISSellLimitOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:sellPrice,quantity:sellQuantity,transaction_type:'SELL',order_type:'LIMIT'},this.onOrderSuccess,this.onOrderError);
	   }else if(orderType=="SL_MARKET"){
	      placeMISSellSLMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:sellPrice,trigger_price:sellPrice,quantity:sellQuantity,transaction_type:'SELL',order_type:'SL-M'},this.onOrderSuccess,this.onOrderError);
	   } 
    }

	this.setState({buyQuantity:'',sellQuantity:''});
}



  render() {
	 	
	    const{
	      kitedata,
	      symbol
	    }=this.props;


	    const{
	      buyQuantity,
	      buyPrice,
	      sellQuantity,
	      sellPrice,
	      orderStatus,
	      orderStatusStyle,
	      orderWindowView
	    }=this.state;


	    let depth = kitedata.ticks[symbol].depth;	


	    return (
				<div className="orderView">
				<button className="favButton orderToggleBtn"  onClick={this.toogleSellView} type="button">SW</button>
				<button className="favButton orderToggleBtn"  onClick={this.toogleBuyView} type="button">BW</button>

				<div className="line"></div>		
				
			{	(orderWindowView.buyView || orderWindowView.sellView) && depth &&

				<div className="orderSelection">

			        <div className="productTypeSelec orderType">      
			          <input type="radio" name="productType" onClick={this.onProductTypeChange} id="PRODUCT_TYPE_CNC" checked={orderWindowView.productType=="CNC"?true:false} value="CNC"/><label style={{fontWeight:orderWindowView.productType=="CNC"?'bold':'normal'}}  for="PRODUCT_TYPE_CNC">CNC</label>
			          <input type="radio" name="productType" onClick={this.onProductTypeChange} id="PRODUCT_TYPE_MIS" checked={orderWindowView.productType=="MIS"?true:false} value="MIS"/><label style={{fontWeight:orderWindowView.productType=="MIS"?'bold':'normal'}}  for="PRODUCT_TYPE_MIS">MIS</label>
			        </div>


			        <div className="orderType">      
			          <input type="radio" name="orderType" onClick={this.onOnderTypeChange} id="ORDER_TYPE_MARKET" checked={orderWindowView.orderType=="MARKET"?true:false} value="MARKET"/><label style={{fontWeight:orderWindowView.orderType=="MARKET"?'bold':'normal'}} for="ORDER_TYPE_MARKET">M</label>
			          <input type="radio" name="orderType" onClick={this.onOnderTypeChange} id="ORDER_TYPE_LIMIT" checked={orderWindowView.orderType=="LIMIT"?true:false} value="LIMIT"/><label  style={{fontWeight:orderWindowView.orderType=="LIMIT"?'bold':'normal'}} for="ORDER_TYPE_LIMIT">L</label>
			          <input type="radio" name="orderType" onClick={this.onOnderTypeChange} id="ORDER_TYPE_SL_MARKET" checked={orderWindowView.orderType=="SL_MARKET"?true:false} value="SL_MARKET"/><label onDoubleClick={this.updateSLPercentage} style={{fontWeight:orderWindowView.orderType=="SL_MARKET"?'bold':'normal'}}  for="ORDER_TYPE_SL_MARKET">SL_M</label>
			        </div>


			        <div className="line"></div>
		        </div>
		    }    

				<div style={orderStatusStyle} className="orderStatusView">{orderStatus}</div>
				<br/>
			
			{orderWindowView.buyView && depth &&
				<div className="buyOrderView" onKeyUp={event=>{ if(event.keyCode === 13) { this.sendBuyOrderRequest();}}}>
					 
					  <label for="buyQuantity">Q:</label>
					  <input type="number"   ref={elem => (this.textInputBuyQty = elem)} onClick={event => event.target.select()} onInput={this.onInputValueChange} className="buyQuantity" step={1} name="buyQuantity" min="1" max="1000" value={buyQuantity}></input>
					  
					  <label for="buyPrice">P:</label>
					  <input type="number" onClick={event => event.target.select()}  onInput={this.onInputValueChange} className="buyPrice" step={0.2} name="buyPrice" min="1" max="10000" value={buyPrice}></input>
					  
					  <button className = 'buyButton' onClick={this.sendBuyOrderRequest}> BUY </button>

				</div>
			}

			{orderWindowView.sellView && depth &&

				<div className="sellOrderView" onKeyUp={event=>{ if(event.keyCode === 13) { this.sendSellOrderRequest();}}} >
				
					  <label for="sellQuantity">Q:</label>
					  <input type="number"   ref={elem => (this.textInputSellQty = elem)} onClick={event => event.target.select()}  onInput={this.onInputValueChange}  className="sellQuantity" step={1} name="sellQuantity" min="1" max="1000" value={sellQuantity}></input>
					  
					  <label for="sellPrice">P:</label>
					  <input type="number"  onClick={event => event.target.select()}   onInput={this.onInputValueChange} className="sellPrice" step={0.2} name="sellPrice" min="1" max="10000" value={sellPrice}></input>
					  
					  <button className='sellButton' onClick={this.sendSellOrderRequest}> SELL </button>
				
				</div>
			}	
				
			</div>
	    )
  }

}


export default OrderWindow;
