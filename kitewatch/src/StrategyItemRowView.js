

import React from 'react';
import './App.css';
import OptionSLOrder from './OptionSLOrder';

class StrategyItemRowView extends React.Component {
  constructor(props) {
    super(props); 
  }



  placeOrder=(side)=>{
	const{
		rowValues,
		quoteData,
		NiftybankniftySLLimit
	}=this.props;

	let osl = new OptionSLOrder();
	let symbol=rowValues.symbol;
	let trade = {symbol:symbol,side:side,qty:1}
	let str={};
	str[symbol]=trade;
	osl.placeOrdersForStrategy(str);

	if(NiftybankniftySLLimit.enable){
		this.placeSLOrder(side);
	}

  }

  placeSLOrder=(side)=>{
	const{
		rowValues,
		quoteData,
		NiftybankniftySLLimit
	}=this.props;
	let symbol=rowValues.symbol;

	let slLimit = symbol.startsWith('NIFTY')?NiftybankniftySLLimit['Nifty']:NiftybankniftySLLimit['Banknifty'];
	slLimit= parseInt(slLimit);
	let last_price = parseInt(quoteData['NFO:'+symbol].last_price) ;
	let slSide= side=='BUY'?'SELL':'BUY'
	let price= slSide=='BUY'? (last_price + 2*slLimit ):(last_price - 2*slLimit ); 
	let trigger_price= slSide=='BUY'? (last_price + slLimit ):(last_price - slLimit );
	let SLTrade = {symbol:symbol,side:slSide,qty:1,order_type:'SL',price:(price).toFixed(0),trigger_price:(trigger_price).toFixed(0)}; 

	let str={};
	str[symbol]=SLTrade;

	let osl = new OptionSLOrder();
	osl.placeOrdersForStrategy(str);
  }



  cancelSLOrderForPosition=()=>{
  	const{
		rowValues
	}=this.props;

	let osl = new OptionSLOrder();
	let symbol=rowValues.symbol;
	osl.cancelSLOrdersForSymbol(symbol);
  }




  placeSLOrderForPosition=()=>{
  	const{
		rowValues,
		quoteData
	}=this.props;

	let inputQty = rowValues.inputQty;
	if(inputQty >=0 ){
		alert('SL only for (-) position');
		return;
	}

	let symbol = rowValues.symbol;
	let slSide = 'BUY'
	let size = Math.abs(inputQty)

	let MAX_QTY = symbol.startsWith('NIFTY') ? 1800:1200;
	let last_price = parseInt(quoteData['NFO:'+symbol].last_price) ;


	let slInputPrice = window.prompt("Place SL order for  : \n"+ symbol +"\nBUY -> " + size +" \nltp->"+last_price);
    if(slInputPrice==null){
        return;
    }

    if(isNaN(slInputPrice) || slInputPrice < last_price){
    	alert('Invalid buy sl price');
        return;
    }

    slInputPrice = parseInt(slInputPrice);

    let triggerPricegap = symbol.startsWith('NIFTY') ? 15:30;

	while(size > 0){
		let q = Math.min(size,MAX_QTY);

		let trigger_price = slInputPrice;
		let SLTrade = {symbol:symbol,side:slSide,qty:1,inputQty:q,order_type:'SL',price:(trigger_price + triggerPricegap).toFixed(0),trigger_price:(trigger_price).toFixed(0)}; 
		let str={};
		str[symbol]=SLTrade;
		let osl = new OptionSLOrder();
		osl.placeOrdersForStrategy(str);

		size = size-q;
	}
  }

  

  placeExitOrderForPosition=()=>{
  	const{
		rowValues,
		quoteData
	}=this.props;

	let inputQty = rowValues.inputQty;
	if(inputQty ==0 ){
		alert('SL only for (+ , -) position');
		return;
	}

	let symbol = rowValues.symbol;
	let side = inputQty>0?'SELL':'BUY';
	let size = Math.abs(inputQty)
	let isOk = window.confirm("Place market order for  : \n"+ symbol +"  \n"+ side +"  -> " + size);

	let MAX_QTY = symbol.startsWith('NIFTY') ? 1800:1200;


	if(isOk){

		while(size > 0){
			let q = Math.min(size,MAX_QTY);

			let osl = new OptionSLOrder();
			let trade = {symbol:symbol,side:side,qty:1,inputQty:q};
			let str={};
			str[symbol]=trade;
			osl.placeOrdersForStrategy(str);

			size = size-q;
		}

	}

  }




render() { 	

	const{
		rowId,
		rowValues,
		isSelected,
		quoteData,
		kitedata,
		isPositionRow
	}=this.props;


	const{
		kiteAllSymbols
	}=this.props;

	let symbol = rowValues.symbol;
 	let item = kiteAllSymbols[symbol];
 	let isATMStrike=false;
 	let hrefGraph = 'https://kite.zerodha.com';
 	let ltp = 'N/A';
 	let changeFromPrevClose ='N/A'
 	let changeClassName='';

 	if(item){
		if(item.segment=='NFO-OPT'){
		//symbol = item.name + " " + item.expiry.split(' ')[0] + " " + item.strike +" "+item.instrument_type +" | " + item.expiry.split(' ')[1] +" " + item.expiry.split(' ')[2];
		symbol= item.name + " " + item.expiry.split(' ')[1].split(',')[0] +" "+item.expiry.split(' ')[0] + " | " + item.strike +" "+item.instrument_type ;
		        
		}else if(item.segment=='NFO-FUT'){
		symbol = item.name + " " + item.expiry.split(' ')[0] + " " + item.expiry.split(' ')[1] +" "+item.instrument_type;
		         
		} 		

	 	if("NIFTY"==item.name){
	 		let niftyLevel =  Math.round(  kitedata.ticks['NIFTY 50'].lastTradedPrice / 100)*100;
	 		isATMStrike = niftyLevel==item.strike;
	 	}else if("BANKNIFTY"==item.name){
	 		let bankNIftyLevel = Math.round(  kitedata.ticks['NIFTY BANK'].lastTradedPrice / 100)*100;
	 		isATMStrike = bankNIftyLevel==item.strike;
	 	}

 		hrefGraph = 'https://kite.zerodha.com/chart/ext/tvc/'+item.segment+'/'+item.tradingsymbol+'/'+item.instrument_token;  


		let exchangeSymbolKey =  kiteAllSymbols[rowValues.symbol].exchange+":"+rowValues.symbol;
		if(quoteData && quoteData[exchangeSymbolKey] ){
			ltp=quoteData[exchangeSymbolKey].last_price;
			ltp=ltp.toFixed(0);
			changeFromPrevClose = (quoteData[exchangeSymbolKey].last_price  - quoteData[exchangeSymbolKey].ohlc.close );
			changeFromPrevClose= changeFromPrevClose.toFixed(0);

			changeClassName=changeFromPrevClose>0?'green':'red';
		}	

 	}


 	
	return (
			<div style={{backgroundColor:isSelected?'yellow':'antiquewhite'}} className={"strategyItemRowView "+ (isATMStrike?'atmStrikeClass':'')} >
				<div className="sSymbol">{symbol}</div>
				<div className={rowValues.side=='BUY'?'strBuyRow':'strSellRow'}  >{rowValues.side}</div>
				<div >{ isPositionRow? rowValues.inputQty:rowValues.qty}</div>
				<div >{ltp} </div>
				{!isPositionRow && <span className={`${changeClassName} strItemPointChange`}> {changeFromPrevClose } </span> }

				<button type="button" style={{backgroundColor:'Red'}} onClick={ (e)=>{this.placeOrder('SELL')}}>SELL</button>
				<button type="button" style={{backgroundColor:'Green'}} onClick={ (e)=>{this.placeOrder('BUY')}}>BUY</button>

				
				{!isPositionRow && 	<button type="button" style={{backgroundColor:'grey'}} onClick={ (e)=>{this.props.onEditStrategyItem(rowId)}}>Edt</button> }
				{!isPositionRow && 	<button type="button" style={{backgroundColor:'grey'}} onClick={ (e)=>{this.props.onDeltrategyItem(rowId)}}>Del</button>   }
				<button type="button" style={{backgroundColor:'grey'}} onClick={(evt)=>{window.open(hrefGraph, "kiteAppGraph", "width=1980,height=1080");}} >Cht</button> 
				{isPositionRow &&  rowValues.inputQty!=0  && <button type="button" style={{backgroundColor:'gold'}} onClick={ (e)=>{this.placeExitOrderForPosition()}}>EXT</button> }

				
				{isPositionRow && rowValues.inputQty < 0 && <button type="button" style={{backgroundColor:'grey'}} onClick={ (e)=>{this.placeSLOrderForPosition()}}>SL</button> }
				{isPositionRow && rowValues.inputQty < 0 && <button type="button" style={{backgroundColor:'grey'}} onClick={ (e)=>{this.cancelSLOrderForPosition()}}>CSL</button> }

			
			</div>


		);



  }

}


export default StrategyItemRowView;
