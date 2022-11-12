import React from 'react';
import './App.css';
import {getHolding,placeMISBuyLimitOrder,placeMISSellLimitOrder,placeMISBuyMarketOrder,placeMISSellMarketOrder,getPosition,placeMISBuySLMarketOrder,placeMISSellSLMarketOrder,
placeBuyLimitOrder,placeSellLimitOrder,placeBuyMarketOrder,placeSellMarketOrder,placeBuySLMarketOrder,placeSellSLMarketOrder
} from './OrderUtil';


class HoldingOrderDialog extends React.Component {
	  constructor(props) {
	    super(props);  

      let orderWindowView = {buyView:true,sellView:true,sellBuyCNCMISView:false};
      orderWindowView = localStorage.getItem("holdingOrderWindowView")!=undefined ?JSON.parse(localStorage.getItem("holdingOrderWindowView")):orderWindowView;      

      let holdingOrder = localStorage.getItem("holdingRowOrder")!=undefined ?JSON.parse(localStorage.getItem("holdingRowOrder")):[];      

      this.rowfRefs ={};

      this.state={orderWindowView:orderWindowView,isHideDialog:false,orderType:"MARKET",totaOrderRequest:undefined,totalFillOrderRequest:undefined,holdingOrder:holdingOrder};    

	  }

  toogleBuyView=()=>{
    let orderWindowView = this.state.orderWindowView;
    orderWindowView.buyView=!orderWindowView.buyView;
    this.setState({orderWindowView:orderWindowView});
    localStorage.setItem("holdingOrderWindowView", JSON.stringify(orderWindowView));    
  }

  toogleSellView=()=>{
    let orderWindowView = this.state.orderWindowView;
    orderWindowView.sellView=!orderWindowView.sellView;
    this.setState({orderWindowView:orderWindowView});
    localStorage.setItem("holdingOrderWindowView", JSON.stringify(orderWindowView));  
  }


  toogleSellBuyCNCMISView=()=>{
    let orderWindowView = this.state.orderWindowView;
    orderWindowView.sellBuyCNCMISView=!orderWindowView.sellBuyCNCMISView;
    this.setState({orderWindowView:orderWindowView});
    localStorage.setItem("holdingOrderWindowView", JSON.stringify(orderWindowView));  
  }



  saveHoldingRowOrder=(symbol)=>{
    let holdingOrder = this.state.holdingOrder;
    let indertPos = holdingOrder.indexOf(symbol);
    if(indertPos > 0){
    	holdingOrder.splice(indertPos,1);
    }
    holdingOrder.unshift(symbol);
    this.setState({holdingOrder:holdingOrder});
    localStorage.setItem("holdingRowOrder", JSON.stringify(holdingOrder));    
  }



  onPositionSuccess=(data)=>{
    this.setState({positionsdata:data});    
  }
  onPositionError=(data)=>{
   this.updateOrderStatus('Error in fetching position');
  }
  fetchPositionData=(data)=>{
    getPosition(this.onPositionSuccess,this.onPositionError);
  }

  onHoldingSuccess=(data)=>{
    this.setState({holdingsdata:data});    
  }
  onHoldingError=(data)=>{
   this.updateOrderStatus('Error in fetching holding');
  }
  fetchHoldingData=(data)=>{
    getHolding(this.onHoldingSuccess,this.onHoldingError);
  }


  componentDidMount() {
    this.fetchPositionData();
    this.fetchHoldingData();
    this.updateOrderStatus('HOLDINGS');
    this.interval = setInterval(this.fetchPositionData, 2000);
    this.holdinginterval=setInterval(this.fetchHoldingData,2000);
  }

  componentWillUnmount(){
    clearInterval( this.interval );
    clearInterval( this.holdinginterval );
    clearTimeout(this.misTimeout);
  }

	componentDidUpdate(prevProps) {

	}

	updateOrderStatus=(data)=>{
		this.setState({orderStatus:data})
	}

	showDialog=(data)=>{
    	this.setState({isHideDialog:false})
  	}


 updateFillOrderRequest=()=>{
    let {totalOrderRequest,
        totalFillOrderRequest} = this.state;
    if(totalOrderRequest !=undefined){
      totalFillOrderRequest++;
      this.setState({totalFillOrderRequest:totalFillOrderRequest});  
      if(totalFillOrderRequest == totalOrderRequest){
        this.setState({totalOrderRequest:undefined,totalFillOrderRequest:undefined});  
      }
    }    
  }


checkFoPendingRequest=()=>{
    let {totalOrderRequest,
        totalFillOrderRequest} = this.state;

  let noOffendingOrderRequest = 0;      
  for (let key of Object.keys(this.rowfRefs)) {
      let rowRef  = this.rowfRefs[key];
      noOffendingOrderRequest += rowRef.getPendingOrderRequest();
  }

  if(totalOrderRequest != undefined || noOffendingOrderRequest != 0){
      window.alert('Request pending -> All '+noOffendingOrderRequest +' Bulk : '+(totalOrderRequest-totalFillOrderRequest) );
      return true;
  }
  return false;          
}


totalSelectedRows=()=>{
  let totalOrderRequest=0;
  for (let key of Object.keys(this.rowfRefs)) {
      let rowRef  = this.rowfRefs[key];
      if(rowRef.isCheckBoxChecked()){
        totalOrderRequest++;
      } 
  }
  return totalOrderRequest;
}


placeBuyOrderForselectedRow=()=>{          
   if(this.checkFoPendingRequest()){
      return;
   }       
  let {totalOrderRequest,
        totalFillOrderRequest} = this.state;

  totalOrderRequest= this.totalSelectedRows();

  let isOk = window.confirm("BUY order for all selected rows confirm : "+totalOrderRequest); 
  if(isOk && totalOrderRequest>0){
      this.setState({totalOrderRequest:totalOrderRequest,totalFillOrderRequest:0});
      for (let key of Object.keys(this.rowfRefs)) {
        let rowRef  = this.rowfRefs[key];
        if(rowRef.isCheckBoxChecked()){
          rowRef.sendBuyOrderRequest();
        } 
    }
  }

}



placeSellOrderForselectedRow=(data)=>{
   if(this.checkFoPendingRequest()){
      return;
   }       
    let {totalOrderRequest,
        totalFillOrderRequest} = this.state;
  totalOrderRequest= this.totalSelectedRows();

  let isOk = window.confirm("SELL order for all selected rows confirm : "+totalOrderRequest);
  if(isOk && totalOrderRequest>0){
    this.setState({totalOrderRequest:totalOrderRequest,totalFillOrderRequest:0});
    for (let key of Object.keys(this.rowfRefs)) {
        let rowRef  = this.rowfRefs[key];
        if(rowRef.isCheckBoxChecked()){
          rowRef.sendSellOrderRequest();
        } 
    }    
  }
}


onSQOFFClick=()=>{
   if(this.checkFoPendingRequest()){
      return;
   }       
   let  totalOrderRequest= this.totalSelectedRows();
   let isSoffOnlySelectedRows=false;
   if(totalOrderRequest != 0){
      isSoffOnlySelectedRows = window.confirm('SQ only selected rows:'+totalOrderRequest);
   }

  const perc = window.prompt('selected position '+(isSoffOnlySelectedRows?totalOrderRequest:' ALL ') +' Percetage to SQ OFF ->');

  if(perc!=null && perc!="" && !isNaN(perc) && perc > 20){
  	window.alert("HOLDINGS SQOFF ALERT > 20% doing nothing");
  	return;  	
  }else if(perc!=null && perc!="" && !isNaN(perc) && perc > 10){
  	window.alert("HOLDINGS SQOFF ALERT > 10%");
  }

  let totalValue=0;
  if(perc!=null && perc!="" && !isNaN(perc) ){
    for (let key of Object.keys(this.rowfRefs)) {
        let rowRef  = this.rowfRefs[key];
        if(isSoffOnlySelectedRows && !rowRef.isCheckBoxChecked()){
          continue;
        }
        totalValue+=rowRef.fillQtyValueOnSqOffClick(perc);
    }
  }
  this.updateOrderStatus('Order Value -> '+ (totalValue/1000).toFixed(1)+"K");
}



onTpriceClick=()=>{
   if(this.checkFoPendingRequest()){
      return;
   }

  let  totalOrderRequest= this.totalSelectedRows();
  const perc = window.prompt('Position selected '+totalOrderRequest+' Stop Loss %');
  let totalValue=0;
  if(perc!=null && perc!="" && !isNaN(perc) ){
    for (let key of Object.keys(this.rowfRefs)) {
        let rowRef  = this.rowfRefs[key];
         if(rowRef.isCheckBoxChecked()){
            totalValue+=rowRef.fillPriceValueOnTpriceClick(perc);
         }        
    }
  }
  this.updateOrderStatus('Order Value -> '+ (totalValue/1000).toFixed(1)+"K");
}


fillQtyForValue=()=>{
   if(this.checkFoPendingRequest()){
      return;
   }       

  let  totalOrderRequest= this.totalSelectedRows();

  const value = window.prompt('Build Position '+totalOrderRequest+' for amount ->');
  let totalValue=0;
  if(value!=null && value!="" && !isNaN(value) ){
    for (let key of Object.keys(this.rowfRefs)) {
        let rowRef  = this.rowfRefs[key];
        if(rowRef.isCheckBoxChecked()){
          totalValue+=rowRef.fillQtyForValue(value);
        }         
    }
    this.updateOrderStatus('Order Value -> '+ (totalValue/1000).toFixed(1)+"K");
  }

}


exitSoldPosition=()=>{
   if(this.checkFoPendingRequest()){
      return;
   }       
   let  totalOrderRequest= this.totalSelectedRows();
   let isSoffOnlySelectedRows=false;
   if(totalOrderRequest != 0){
      isSoffOnlySelectedRows = window.confirm('Exit only selected rows:'+totalOrderRequest);
   }

  const perc = window.prompt('Exit position '+(isSoffOnlySelectedRows?totalOrderRequest:' ALL ') +' Percetage to Exit(%) ->');

  if(perc!=null && perc!="" && !isNaN(perc) && perc > 100){
  	window.alert("Exit % ALERT > 100% doing nothing");
  	return;  	
  }else if(perc!=null && perc!="" && !isNaN(perc) && perc > 50){
  	window.alert("Exit %  ALERT > 50%");
  }

  let totalValue=0;
  if(perc!=null && perc!="" && !isNaN(perc) ){
    for (let key of Object.keys(this.rowfRefs)) {
        let rowRef  = this.rowfRefs[key];
        if(isSoffOnlySelectedRows && !rowRef.isCheckBoxChecked()){
          continue;
        }
        totalValue+=rowRef.exitSoldPosition(perc);
    }
  }
  this.updateOrderStatus('Order Value -> '+ (totalValue/1000).toFixed(1)+"K");

}



onSymbolSelect=(evt)=>{
  let element = document.querySelectorAll('#holdingOrderDialog tr[rowid="HOLDING_ORDER-'+ evt.target.value +'"]');
  if(element && element.length>0){
    element[0].scrollIntoView();
    element[0].classList.remove('blinkRow');
    setTimeout((value)=>{document.querySelectorAll('#holdingOrderDialog tr[rowid="HOLDING_ORDER-'+ value +'"]')[0].classList.add('blinkRow')},50,evt.target.value);
  }  
}


onOnderTypeChange=(evt)=>{
  if(evt.target.name=='orderType'){
     this.setState({orderType:evt.target.value});
  }
}

setSortOrder=(key)=>{
	let value = this.state[key];
 	this.setState({isSortPosition:false,isSortOnValue:false,isSortOnPriceChange:false,isSortOnMISQty:false,isSortOnDayQty:false});
 	let s1 = {};
 	s1[key] = !value;
	this.setState(s1);
}



  render() {

    const{
      kitedata,
      BSEtoNSEsymbolsMapping,
      hideHoldingOrderDialog,
      tableId,
      addToFavList,
      removeFromFavList,
      onTableRowclick,
 //   positionsdata,  	//poll from server 
//	  holdingsdata,	 	//poll from server 
      updateMarginData
    }=this.props;

    const{
      orderStatus,
      orderWindowView,
      isHideDialog,
      positionsdata, 	//poll from client 
      holdingsdata, 		//poll from client 
      orderType,
      isSortPosition,
      isSortOnValue,
      isSortOnPriceChange,
      isSortOnDayQty,
      isSortOnMISQty,
      totalOrderRequest,
      totalFillOrderRequest,
      holdingOrder
    }=this.state;

    let kiteBasketOrderData=[];
    let positionMap={};
    let closeCNC =0;
    let totalCNC =0;    


    if(positionsdata && holdingsdata){

    	for(let i=0;i<holdingsdata.data.length;i++){
        if(BSEtoNSEsymbolsMapping[holdingsdata.data[i].tradingsymbol]){
          holdingsdata.data[i].tradingsymbol = BSEtoNSEsymbolsMapping[holdingsdata.data[i].tradingsymbol];
        }
    	 	positionMap[holdingsdata.data[i].tradingsymbol]={holding:holdingsdata.data[i]}
    	}		

	    for(let i=0;i<positionsdata.data.net.length;i++){
			 if(positionsdata.data.net[i].product == 'CNC' && kitedata.ticks[positionsdata.data.net[i].tradingsymbol]!=undefined){
			 	if(positionMap[positionsdata.data.net[i].tradingsymbol] == undefined){
			 		positionMap[positionsdata.data.net[i].tradingsymbol]={dayCNC:positionsdata.data.net[i]}
			 	}else{
			 		positionMap[positionsdata.data.net[i].tradingsymbol].dayCNC=positionsdata.data.net[i];
			 	}
	        }      
	    }

	    for(let i=0;i<positionsdata.data.net.length;i++){
	        if(positionsdata.data.net[i].product == 'MIS' && kitedata.ticks[positionsdata.data.net[i].tradingsymbol]!=undefined){
	        	if(positionMap[positionsdata.data.net[i].tradingsymbol] != undefined){
	        		positionMap[positionsdata.data.net[i].tradingsymbol].dayMIS=positionsdata.data.net[i];
	        	}	          
	        }      
	    }

	    kiteBasketOrderData = Object.keys(positionMap);
	    let saveRowOrder=[];
	    for(let i=0;i<holdingOrder.length;i++){
	    	if(positionMap[holdingOrder[i]] !=undefined){
	    		saveRowOrder.push(holdingOrder[i]);
	    	}
	    }
	    for(let i=0;i<kiteBasketOrderData.length;i++){
	    	if(saveRowOrder.indexOf(kiteBasketOrderData[i]) == -1){
	    		saveRowOrder.push(kiteBasketOrderData[i]);
	    	}
	    }
	    kiteBasketOrderData = saveRowOrder;

	    totalCNC = kiteBasketOrderData.length;	
	    for(let i=0;i<kiteBasketOrderData.length;i++){
	    	let combinedPosition = positionMap[kiteBasketOrderData[i]];
     		if(combinedPosition.holding && ((combinedPosition.holding.quantity + combinedPosition.holding.t1_quantity) == 0)){
     			closeCNC++;
     		}	
	    }


	    if(isSortPosition){
	            kiteBasketOrderData.sort(function(a, b){
	              let v1 = positionMap[a].holding?(positionMap[a].holding.quantity + positionMap[a].holding.t1_quantity)*positionMap[a].holding.last_price - (positionMap[a].holding.quantity + positionMap[a].holding.t1_quantity)*positionMap[a].holding.average_price:0;
	              let v2 = positionMap[b].holding?(positionMap[b].holding.quantity + positionMap[b].holding.t1_quantity)*positionMap[b].holding.last_price - (positionMap[b].holding.quantity + positionMap[b].holding.t1_quantity)*positionMap[b].holding.average_price:0;
	              v1 =isNaN(v1)?0:v1;
	              v2 =isNaN(v2)?0:v2;
	              return v1-v2;
	            });        
	      }else if(isSortOnValue){
	            kiteBasketOrderData.sort(function(a, b){
	              let v1 = positionMap[a].holding?(positionMap[a].holding.quantity + positionMap[a].holding.t1_quantity)*positionMap[a].holding.last_price:0;
	              let v2 = positionMap[b].holding?(positionMap[b].holding.quantity + positionMap[b].holding.t1_quantity)*positionMap[b].holding.last_price:0;
	              return v2-v1;
	            });

	      }else if(isSortOnPriceChange){
	        if(this.previosChangeSortedOrder == undefined){
	            let kiteBasketOrderDataCopy = [...kiteBasketOrderData]
	            kiteBasketOrderDataCopy.sort(function(a, b){
	              let v1 =kitedata.ticks[a].change;
	              let v2 =kitedata.ticks[b].change;
	              return v1-v2;
	            });
	            kiteBasketOrderData = kiteBasketOrderDataCopy;
	            this.previosChangeSortedOrder = kiteBasketOrderDataCopy;
	        }else{
	          kiteBasketOrderData = this.previosChangeSortedOrder;
	        }
	      }else if(isSortOnDayQty){
	            kiteBasketOrderData.sort(function(a, b){
	              let v1 = positionMap[a].dayCNC?positionMap[a].dayCNC.quantity :0;
	              let v2 = positionMap[b].dayCNC?positionMap[b].dayCNC.quantity :0;
	              if(v1==0) v1 = -9999999; 
	              if(v2==0) v2 = -9999999; 

	              return v2-v1;
	            });
	      }else if(isSortOnMISQty){
	            kiteBasketOrderData.sort(function(a, b){
	              let v1 = positionMap[a].dayMIS?positionMap[a].dayMIS.quantity :0;
	              let v2 = positionMap[b].dayMIS?positionMap[b].dayMIS.quantity :0;
	              if(v1==0) v1 = -9999999; 
	              if(v2==0) v2 = -9999999; 	              
	              return v2-v1;
	            });
	      }      


    }


    let buyButtonText = 'BUY'; let sellButtonText = 'SELL'
    if(totalOrderRequest!=undefined){
        buyButtonText = `B(${totalOrderRequest}/${totalFillOrderRequest})`;
        sellButtonText = `S(${totalOrderRequest}/${totalFillOrderRequest})`;
    }


	 	
	    return (
	      <div id='holdingOrderDialog' style={{display:(isHideDialog?'none':'block')}} className="modal">       
	        <div style={{width:'960px'}} className="modal-content">
	          <div  className="orderStatusView">{orderStatus} <div className="openPosition">({totalCNC - closeCNC}/{totalCNC})</div></div>	
	          <span onClick={hideHoldingOrderDialog} className="close">&times;</span>
	          <div className='basket-orders holding-orders'>	          
		          <table>
		            <thead>
		              <tr>
		                <th>Select</th>
		                <th>Name</th>		              
		                <th>PnL(%)</th>
		                <th>Value</th>
		                <th>Q(H)</th>
		                <th>Q(D)</th>
		                <th>Q(M)</th>		                
		                <th>Chg%</th>
		                <th>LTP</th>
		                <th>Qty</th>
		                <th>Price</th>
		             	{orderWindowView.buyView &&  	<th>BUY</th>  }		 
						{orderWindowView.sellView &&    <th>SELL</th> }
						{orderWindowView.sellBuyCNCMISView &&  <th>S-B</th> }
						
		              </tr>
		            </thead>

		            <tbody>
		            
		             { kiteBasketOrderData.map((symbol,index)=> <HoldingListRow saveHoldingRowOrder={this.saveHoldingRowOrder} updateFillOrderRequest={this.updateFillOrderRequest} fetchPositionData={this.fetchPositionData} fetchHoldingData={this.fetchHoldingData} updateMarginData={updateMarginData} positionsdata={positionMap[symbol]} ref={ele => this.rowfRefs['HOLDING_ORDER-'+symbol] = ele}  orderType={orderType} orderWindowView={orderWindowView} onTableRowclick={onTableRowclick} addToFavList={addToFavList} removeFromFavList={removeFromFavList} tableId={tableId} updateOrderStatus={this.updateOrderStatus} key={'HOLDING_ORDER-'+symbol} kitedata={kitedata}  symbol={symbol} />)}
		             
		            </tbody>
		        </table>
	         </div>

	        <button className="favButton"  onClick={(evt)=>{this.setState({isHideDialog:true})}} type="button">H</button>   
	        <button className="favButton"  onClick={this.toogleSellView} type="button">S</button>
	        <button className="favButton"  onClick={this.toogleBuyView} type="button">B</button>
	        <button className="favButton"  onClick={this.toogleSellBuyCNCMISView} type="button">S-B</button>


	        
	        <div style={{marginLeft: '10px'}} className="dropdown">
	          <button style={{fontSize:'15px',backgroundColor:((isSortPosition || isSortOnValue || isSortOnPriceChange || isSortOnMISQty || isSortOnDayQty)?'red':'initial')}} className="dropbtn">Srt</button>
	          <div className="dropdown-content" style={{bottom: '0px'}}>
	            <a style={{backgroundColor:(isSortPosition?'red':'initial')}} onClick={(evt)=>{this.setSortOrder('isSortPosition');}}>{'Loss'}</a>
	            <a style={{backgroundColor:(isSortOnValue?'red':'initial')}} onClick={(evt)=>{this.setSortOrder('isSortOnValue');}}>{'Total Value'}</a>
	            <a style={{backgroundColor:(isSortOnPriceChange?'red':'initial')}} onClick={(evt)=>{this.previosChangeSortedOrder=undefined;this.setSortOrder('isSortOnPriceChange');}}>{'Change'}</a>
	            <a style={{backgroundColor:(isSortOnDayQty?'red':'initial')}} onClick={(evt)=>{this.setSortOrder('isSortOnDayQty');}}>{'Q(D)'}</a>
	            <a style={{backgroundColor:(isSortOnMISQty?'red':'initial')}} onClick={(evt)=>{this.setSortOrder('isSortOnMISQty');}}>{'Q(M)'}</a>
	          </div>
	        </div>

	      
	        <button className="favButton"  onClick={this.onSQOFFClick} type="button">HOLD SQOFF</button>
	        <button className="favButton"  onClick={this.onTpriceClick} type="button">Tpri</button>
	        <button className="favButton"  onClick={this.fillQtyForValue} type="button">Fill Qty</button>
	        <button className="favButton"  onClick={this.exitSoldPosition} type="button">Exit S</button>


	        <div className="orderType">      
	          <input type="radio" name="orderType" onClick={this.onOnderTypeChange} id="ORDER_TYPE_MARKET" checked={orderType=="MARKET"?true:false} value="MARKET"/><label for="ORDER_TYPE_MARKET">M</label>
	          <input type="radio" name="orderType" onClick={this.onOnderTypeChange} id="ORDER_TYPE_LIMIT" checked={orderType=="LIMIT"?true:false} value="LIMIT"/><label for="ORDER_TYPE_LIMIT">L</label>
	          <input type="radio" name="orderType" onClick={this.onOnderTypeChange} id="ORDER_TYPE_SL_MARKET" checked={orderType=="SL_MARKET"?true:false} value="SL_MARKET"/><label for="ORDER_TYPE_SL_MARKET">SL_M</label>
	        </div>

	        <select className="selectSymbolsBasket" onChange={this.onSymbolSelect}>
	             { kiteBasketOrderData.map((symbol,index)=> <option value={symbol}>{symbol}</option>)}
	        </select>


	        {orderWindowView.buyView && <button  className="builkOrderBtn favButton buyButton"  onClick={this.placeBuyOrderForselectedRow} type="button">{buyButtonText}</button> }
	        {orderWindowView.sellView && <button  className="builkOrderBtn favButton sellButton"  onClick={this.placeSellOrderForselectedRow} type="button">{sellButtonText}</button> }


	       </div>
	      </div>
	    )
  }

}


export default HoldingOrderDialog;




class HoldingListRow extends React.Component {
  constructor(props) {
    super(props);
    this.state={isRowEnable:false,pendingOrderRequest:0};
  }


	componentDidMount() {
		this.fillInputWithLatestPrice();
	}  

	componentDidUpdate(prevProps) {

	}

	  componentWillUnmount(){
	    clearTimeout(this.misTimeout);
	  }


  fillInputWithLatestPrice=()=>{
    const{
      kitedata,
      symbol
    }=this.props;
  	let depth = kitedata.ticks[symbol].depth;	

  	if(depth){
	  	this.setState({quantity:0,price:kitedata.ticks[symbol].lastTradedPrice});
  	}
  }


  fillQtyForValue=(value)=>{
    const{
      kitedata,
      symbol
    }=this.props;
    let lastTradedPrice = kitedata.ticks[symbol].lastTradedPrice; 
    let quantity =  Number.parseInt(value/lastTradedPrice);
    this.setState({quantity:quantity});
    return quantity*lastTradedPrice;
  }


  onInputValueChange=(evt)=>{

    let{
      quantity,
      price,
      isRowEnable
    }=this.state;

  	if(evt.target.name == 'quantity'){
  		quantity=evt.target.value;
  		this.setState({quantity:quantity});
  	}else if(evt.target.name == 'price'){
  		 price=evt.target.value;
  		this.setState({price:price});
  	}else if(evt.target.name == 'checkbox'){
      isRowEnable=evt.target.checked;
      this.setState({isRowEnable:isRowEnable});      
    }

  }


 fillQtyValueOnSqOffClick=(perc)=>{

    let{
      positionsdata,
      kitedata,
      symbol      
    }=this.props;

    let orderValue =0;
    if(positionsdata && positionsdata.holding){
      let quantity = Number.parseInt(Math.abs(((positionsdata.holding.quantity + positionsdata.holding.t1_quantity)*perc/100)));      
      this.setState({quantity:quantity});
      if(quantity==0){
        this.markCheckBox(false);
      }else{
        this.markCheckBox(true)
      }
      let lastTradedPrice = kitedata.ticks[symbol].lastTradedPrice;
      orderValue = quantity*lastTradedPrice;
    }

    return orderValue;
  }


 exitSoldPosition=(perc)=>{
    let{
      positionsdata,
      kitedata,
      symbol      
    }=this.props;

    let orderValue =0;
    if(positionsdata && positionsdata.dayCNC){
      let quantity = positionsdata.dayCNC.quantity;
      if(quantity < 0){	
      	quantity = Number.parseInt(Math.abs(((quantity)*perc/100))); 
      }else{
      	quantity =0;
      }      
      this.setState({quantity:quantity});
      if(quantity==0){
        this.markCheckBox(false);
      }else{
        this.markCheckBox(true)
      }
      let lastTradedPrice = kitedata.ticks[symbol].lastTradedPrice;
      orderValue = quantity*lastTradedPrice;
    }
    return orderValue;
 }



fillPriceValueOnTpriceClick=(perc)=>{
    let{
      positionsdata,
      kitedata,
      symbol      
    }=this.props;

    let{
      quantity,
      price,
    }=this.state;

    let orderValue =0;
    if(positionsdata){
      let lastTradedPrice = kitedata.ticks[symbol].lastTradedPrice;
      let priceChange = (lastTradedPrice*perc)/100; 

 	  price = lastTradedPrice - priceChange; //sell stop losss trigger

      this.setState({price:(price).toFixed(1)});
      
      orderValue = quantity*price;
    }
    return orderValue;
}


onOrderSuccess=(data)=>{
    const{
      updateOrderStatus,
      updateMarginData,
      fetchPositionData,
      fetchHoldingData,
      updateFillOrderRequest
    }=this.props;		

    const{
      pendingOrderRequest
    }=this.state;


    updateMarginData();
    fetchPositionData();
    fetchHoldingData();
	updateOrderStatus(data.data.order_id);

	this.setState({quantity:0,isRowEnable:false,pendingOrderRequest:pendingOrderRequest-1});
  this.markCheckBox(false);
  updateFillOrderRequest();
}


onOrderError=(data)=>{
    const{
      updateOrderStatus,
      updateMarginData,
      fetchPositionData,
      fetchHoldingData,
      updateFillOrderRequest
    }=this.props;		

    const{
      pendingOrderRequest
    }=this.state;

    updateMarginData();
    fetchPositionData();
    fetchHoldingData();
	updateOrderStatus(data.message);
	this.setState({quantity:0,isRowEnable:false,pendingOrderRequest:pendingOrderRequest-1});
  this.markCheckBox(false);
  updateFillOrderRequest();
}  

markCheckBox=(enable)=>{
 // this.checkBoxRef.checked=enable;
  this.setState({isRowEnable:enable});
}  

isCheckBoxChecked=()=>{
  return this.state.isRowEnable == true;
}  

getPendingOrderRequest=()=>{
  return this.state.pendingOrderRequest ;
}  


getOrderValue=()=>{
    const{
      quantity,
      price,
    }=this.state;
  return Math.abs(quantity) * price;
}  


sendCNCMISSellBuyOrderRequest=()=>{

    const{
      quantity,
      price,
      pendingOrderRequest
    }=this.state;

    const{
      kitedata,
      symbol,
      updateOrderStatus,
      orderType
    }=this.props;

   if(orderType=="MARKET"){
   	  //place CNC SELL order	
      placeSellMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,quantity:quantity,transaction_type:'SELL',order_type:'MARKET'},this.onOrderSuccess,this.onOrderError);
      updateOrderStatus(symbol +' -> SELL  -> MARKET -> CNC ->' +'        Q: '+ quantity + '   P: '+price);    
      this.setState({quantity:0,pendingOrderRequest:pendingOrderRequest+2}); // to avoid multiple orders

      //place MIS BUY order 
      this.misTimeout = setTimeout(()=>{
	      placeMISBuyMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,quantity:quantity,transaction_type:'BUY',order_type:'MARKET'},this.onOrderSuccess,this.onOrderError);
	      updateOrderStatus(symbol +' -> BUY  -> MARKET -> MIS ->' +'        Q: '+ quantity + '   P: '+price);      	
      },1300);

   }else{
   		window.alert('ONLY MARKET ORDER ALLOWED');
   } 

}

sendBuyOrderRequest=()=>{

    const{
      quantity,
      price,
      pendingOrderRequest
    }=this.state;

    const{
      kitedata,
      symbol,
      updateOrderStatus,
      orderType
    }=this.props;

   if(orderType=="MARKET"){
      placeBuyMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,quantity:quantity,transaction_type:'BUY',order_type:'MARKET'},this.onOrderSuccess,this.onOrderError);
      updateOrderStatus(symbol +' -> BUY  -> MARKET -> CNC ->' +'        Q: '+ quantity + '   P: '+price);
   } else if(orderType=="LIMIT"){
      placeBuyLimitOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,quantity:quantity,transaction_type:'BUY',order_type:'LIMIT'},this.onOrderSuccess,this.onOrderError);
      updateOrderStatus(symbol +' -> BUY  -> LIMIT -> CNC ->' +'        Q: '+ quantity + '   P: '+price);    
   } else if(orderType=="SL_MARKET"){
      placeBuySLMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,trigger_price:price,quantity:quantity,transaction_type:'BUY',order_type:'SL-M'},this.onOrderSuccess,this.onOrderError);
      updateOrderStatus(symbol +' -> BUY  -> SL-MARKET -> CNC ->' +'        Q: '+ quantity + '   TP: '+price);
   }

   this.setState({quantity:0,pendingOrderRequest:pendingOrderRequest+1}); // to avoid multiple orders

}

sendSellOrderRequest=()=>{

    const{
      quantity,
      price,
      pendingOrderRequest
    }=this.state;

    const{
      kitedata,
      symbol,
      updateOrderStatus,
      orderType
    }=this.props;

   if(orderType=="MARKET"){
      placeSellMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,quantity:quantity,transaction_type:'SELL',order_type:'MARKET'},this.onOrderSuccess,this.onOrderError);
      updateOrderStatus(symbol +' -> SELL  -> MARKET -> CNC ->' +'        Q: '+ quantity + '   P: '+price);    
   }else if(orderType=="LIMIT"){
      placeSellLimitOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,quantity:quantity,transaction_type:'SELL',order_type:'LIMIT'},this.onOrderSuccess,this.onOrderError);
      updateOrderStatus(symbol +' -> SELL  -> LIMIT -> CNC ->' +'        Q: '+ quantity + '   P: '+price);    
   }else if(orderType=="SL_MARKET"){
      placeSellSLMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,trigger_price:price,quantity:quantity,transaction_type:'SELL',order_type:'SL-M'},this.onOrderSuccess,this.onOrderError);
      updateOrderStatus(symbol +' -> SELL  -> SL-MARKET -> CNC ->' +'        Q: '+ quantity + '   TP: '+price);
   } 

   this.setState({quantity:0,pendingOrderRequest:pendingOrderRequest+1}); // to avoid multiple orders
}


  openStockInfo=()=>{
    this.props.onTableRowclick(this.props.symbol);
  }

  render() {

    const{
      kitedata,
      symbol,
      tableId,
      addToFavList,
      removeFromFavList,
      onTableRowclick, 
      orderWindowView,
      positionsdata,
      saveHoldingRowOrder     
    }=this.props;


    let{
      quantity,
      price,
      isRowEnable,
      pendingOrderRequest
    }=this.state;


    let changeClass  = '';
    if( kitedata.ticks[symbol] ){
      changeClass=kitedata.ticks[symbol].change<0 ?'red':'green';
    }

    let checkboxstyle={};
    if(isRowEnable){
      checkboxstyle.backgroundColor='grey';
    } 
    

     let rowstyle={};
     if(pendingOrderRequest!=0){
        rowstyle.backgroundColor='gold';
     }

    let profit  =  0;let profitPec  =  0;let holdingValue  =  0;let holdingQty=0;let dayQtyCNC=0;let dayQtyMIS=0;
    if(positionsdata && positionsdata.holding){
    	profit  = 	(positionsdata.holding.quantity + positionsdata.holding.t1_quantity)*positionsdata.holding.last_price - (positionsdata.holding.quantity + positionsdata.holding.t1_quantity)*positionsdata.holding.average_price;
    	profitPec = (profit*100/((positionsdata.holding.quantity + positionsdata.holding.t1_quantity)*positionsdata.holding.average_price)).toFixed(0);
    	profitPec = isNaN(profitPec)?0:profitPec;
    	holdingValue = (positionsdata.holding.quantity + positionsdata.holding.t1_quantity)*positionsdata.holding.last_price;
    	holdingQty = positionsdata.holding.quantity + positionsdata.holding.t1_quantity;
    }

    if(positionsdata && positionsdata.dayCNC){
    	dayQtyCNC = positionsdata.dayCNC.quantity;
    }

    if(positionsdata && positionsdata.dayMIS){
    	dayQtyMIS = positionsdata.dayMIS.quantity;
    }

    let plClass = profit<0 ?'red':'green';
    let dqCNCClass = dayQtyCNC<0 ?'red':'green';
    let dqMISClass = dayQtyMIS<0 ?'red':'green';


    return (
      <tr style={rowstyle} rowId={'HOLDING_ORDER-'+symbol}>
        	<td onClick={(evt)=>{this.setState({isRowEnable:!isRowEnable})}} style={checkboxstyle}><input tabIndex={"-1"} style={{width:'20px',height: '20px'}}    onChange={this.onInputValueChange} type="checkbox" name='checkbox' checked={isRowEnable}></input></td>  
  			<td onDoubleClick={(evt)=>{saveHoldingRowOrder(symbol)}}>{symbol}</td>    
  			<td  className={plClass}>{(profit/1000).toFixed(2)}k&nbsp;<span className="holdPercGain">({profitPec}%)</span></td>  
  			<td>{Math.round(holdingValue/1000)}k</td>  
  			<td>{holdingQty}</td>  
  			<td className={dqCNCClass}>{dayQtyCNC==0?'':dayQtyCNC}</td>  
  			<td className={dqMISClass}>{dayQtyMIS==0?'':dayQtyMIS}</td>    
        	<td onClick={this.openStockInfo} className={changeClass}>{(kitedata.ticks[symbol].change).toFixed(2)}%</td>    
  			<td >{kitedata.ticks[symbol].lastTradedPrice}</td>   
  			<td>
  				<input type="number"   autoComplete="off" onClick={event => event.target.select()} onInput={this.onInputValueChange} className="quantity" step={1} name="quantity" min="1" max="1000" value={quantity}></input>
  			</td>         
  			<td>
  				<input type="number" tabIndex={"-1"} autoComplete="off" onClick={event => event.target.select()}   onInput={this.onInputValueChange} className="price" step={0.2} name="price" min="1" max="10000" value={price}></input>
  			</td> 		
  			{orderWindowView.buyView && <td><button style={{backgroundColor:(pendingOrderRequest!=0)?'grey':'green'}} className = 'buyButton' onClick={this.sendBuyOrderRequest}> BUY </button></td> }
  			{orderWindowView.sellView && <td> <button style={{backgroundColor:(pendingOrderRequest!=0)?'grey':'#e86666'}} className='sellButton' onClick={this.sendSellOrderRequest}> SELL </button></td>}      

  			{orderWindowView.sellBuyCNCMISView && <td> <button style={{backgroundColor:(pendingOrderRequest!=0)?'grey':'yellow'}} className="sellBuyButton" onClick={this.sendCNCMISSellBuyOrderRequest}> S->B </button></td>}      
       </tr>
    );


  }

}

