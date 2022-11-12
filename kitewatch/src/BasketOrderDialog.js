import React from 'react';
import './App.css';
import {placeMISBuyLimitOrder,placeMISSellLimitOrder,placeMISBuyMarketOrder,placeMISSellMarketOrder,getPosition,placeMISBuySLMarketOrder,placeMISSellSLMarketOrder} from './OrderUtil';



class BasketOrderDialog extends React.Component {
	  constructor(props) {
	    super(props);  

      let orderWindowView = {buyView:true,sellView:true};
      orderWindowView = localStorage.getItem("basketOrderWindowView")!=undefined ?JSON.parse(localStorage.getItem("basketOrderWindowView")):orderWindowView;      
      this.rowfRefs ={};

      let filterKeys = {isFilterMISPosition:true,isSortOnValue:true};
      filterKeys = localStorage.getItem("filterKeys")!=undefined ?JSON.parse(localStorage.getItem("filterKeys")):filterKeys;      

      this.state={orderWindowView:orderWindowView,isHideDialog:false,orderType:"MARKET",totaOrderRequest:undefined,totalFillOrderRequest:undefined,filterKeys:filterKeys};    

	  }

  toogleBuyView=()=>{
    let orderWindowView = this.state.orderWindowView;
    orderWindowView.buyView=!orderWindowView.buyView;
    this.setState({orderWindowView:orderWindowView});

    localStorage.setItem("basketOrderWindowView", JSON.stringify(orderWindowView));    
  }


  toogleSellView=()=>{
    let orderWindowView = this.state.orderWindowView;
    orderWindowView.sellView=!orderWindowView.sellView;
    this.setState({orderWindowView:orderWindowView});

    localStorage.setItem("basketOrderWindowView", JSON.stringify(orderWindowView));  
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

  componentDidMount() {
    this.fetchPositionData();
    this.updateOrderStatus('MARGIN ORDRES');
    this.interval = setInterval(this.fetchPositionData, 2000);
  }

  componentWillUnmount(){
    clearInterval( this.interval );
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



uncheckPositionWithCNCnMIS=()=>{
    let count=0;
    for (let key of Object.keys(this.rowfRefs)) {
        let rowRef  = this.rowfRefs[key];
        if(rowRef.uncheckPositionWithCNCnMIS()){
          count++;
        }            
    } 
    this.updateOrderStatus('Uncheckd Rows :'+ count);
}


onSymbolSelect=(evt)=>{
  let element = document.querySelectorAll('#basketOrderDialog tr[rowid="MIS_ORDER-'+ evt.target.value +'"]');
  if(element && element.length>0){
    element[0].scrollIntoView();
    element[0].classList.remove('blinkRow');
    setTimeout((value)=>{document.querySelectorAll('#basketOrderDialog tr[rowid="MIS_ORDER-'+ value +'"]')[0].classList.add('blinkRow')},50,evt.target.value);
  }  
}


onOnderTypeChange=(evt)=>{
  if(evt.target.name=='orderType'){
     this.setState({orderType:evt.target.value});
  }
}


setSortOrder=(key)=>{
  let s1 = this.state.filterKeys;
  let value = s1[key]?s1[key]:false;  
  
  if(key !== 'isFilterMISPosition'){
    // s1 = {isSortPosition:false,isSortOnValue:false,isSortOnPriceChange:false,isSortOnMISQty:false,isSortOnDayQty:false};
     s1={isFilterMISPosition:this.state.filterKeys.isFilterMISPosition};
  }
  s1[key] = !value;
  this.setState({filterKeys:s1});
  localStorage.setItem('filterKeys',JSON.stringify(s1));
}



selectRows=(kiteBasketOrderData)=>{
  let start=undefined;
  let end=undefined;

  for(let i=0;i<kiteBasketOrderData.length;i++){
      let rowRef  = this.rowfRefs['MIS-'+kiteBasketOrderData[i]];
      if(rowRef.isCheckBoxChecked()){
        if(start == undefined){
          start = kiteBasketOrderData[i];
        }else{
          end = kiteBasketOrderData[i];
          break;
        }
      }
  }

  let startIndex = kiteBasketOrderData.indexOf(start);
  let endIndex = kiteBasketOrderData.indexOf(end);

  if(start == undefined || end== undefined){
    window.alert('Select start & end both');
    return;
  }

  
  let count=0;
  for(let i=startIndex;i<=endIndex;i++){
      let rowRef  = this.rowfRefs['MIS-'+kiteBasketOrderData[i]];
      rowRef.markCheckBox(true);
      count++;
  }

  this.updateOrderStatus(start +'   --->  '+end +'  --> ' +count);

}


uncheckAllRow=()=>{
    for (let key of Object.keys(this.rowfRefs)) {
        let rowRef  = this.rowfRefs[key];
        rowRef.markCheckBox(false);  
    }
}




  render() {

    let{
      kiteBasketOrderData,
    }=this.props;

    const{
      kitedata,
      hideBasketOrderDialog,
      tableId,
      addToFavList,
      removeFromFavList,
      onTableRowclick,
   //   positionsdata,  //poll from server 
      updateMarginData
    }=this.props;

    const{
    	orderStatus,
      orderWindowView,
      isHideDialog,
      positionsdata, //poll from client 
      orderType,   
      totalOrderRequest,
      totalFillOrderRequest
    }=this.state;


    const{
      isSortPosition,
      isSortOnValue,
      isSortOnPriceChange,
      isSortOnDayQty,
      isSortOnMISQty,
      isFilterMISPosition,      
    }=this.state.filterKeys;


    let positionMap={};
    let openMIS =0;
    let totalMIS =0;    

    kiteBasketOrderData = kiteBasketOrderData.filter(function(symbol){ return (symbol == 'SEPERATOR' || kitedata.ticks[symbol]!=undefined) });

    if(positionsdata){

          for(let i=0;i<positionsdata.data.net.length;i++){
            if(positionsdata.data.net[i].product == 'MIS' && kitedata.ticks[positionsdata.data.net[i].tradingsymbol]!=undefined){
              positionMap[positionsdata.data.net[i].tradingsymbol]=positionsdata.data.net[i];
            }      
          }

          for(let i=0;i<positionsdata.data.net.length;i++){
            if(positionsdata.data.net[i].product == 'CNC' && positionMap[positionsdata.data.net[i].tradingsymbol]!=undefined){
              positionMap[positionsdata.data.net[i].tradingsymbol].dayCNC=positionsdata.data.net[i]; // store CNC day position
            }      
          }

          this.rowfRefs={};

         

          if(isFilterMISPosition){
              kiteBasketOrderData = Object.keys(positionMap);     
          }     


          if(isSortPosition){
                  let kiteBasketOrderDataCopy = [...kiteBasketOrderData]
                  kiteBasketOrderDataCopy.sort(function(a, b){
                    let v1 = (positionMap[a] && positionMap[a].quantity!=0 ) ?positionMap[a].pnl :999999;
                    let v2 = (positionMap[b] && positionMap[b].quantity!=0 ) ?positionMap[b].pnl :999999;
                    return v1-v2;
                  });
                  kiteBasketOrderData = kiteBasketOrderDataCopy;

          }else if(isSortOnValue){
                  let kiteBasketOrderDataCopy = [...kiteBasketOrderData]
                  kiteBasketOrderDataCopy.sort(function(a, b){
                    let v1 = (positionMap[a] && positionMap[a].quantity!=0 )?positionMap[a].value :-99999999;
                    let v2 = (positionMap[b] && positionMap[b].quantity!=0 )?positionMap[b].value :-99999999;
                    return v2-v1;
                  });
                  kiteBasketOrderData = kiteBasketOrderDataCopy;
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
                    let kiteBasketOrderDataCopy = [...kiteBasketOrderData]
                    kiteBasketOrderDataCopy.sort(function(a, b){
                      let v1 = positionMap[a] && positionMap[a].dayCNC?positionMap[a].dayCNC.quantity :0;
                      let v2 = positionMap[b] && positionMap[b].dayCNC?positionMap[b].dayCNC.quantity :0;
                      if(v1==0) v1 = -9999999; 
                      if(v2==0) v2 = -9999999; 
                      return v2-v1;
                    });
                    kiteBasketOrderData = kiteBasketOrderDataCopy;
              }else if(isSortOnMISQty){
                    let kiteBasketOrderDataCopy = [...kiteBasketOrderData]
                    kiteBasketOrderDataCopy.sort(function(a, b){
                      let v1 = positionMap[a] ?positionMap[a].quantity :0;
                      let v2 = positionMap[b] ?positionMap[b].quantity :0;
                      if(v1==0) v1 = -9999999; 
                      if(v2==0) v2 = -9999999;                
                      return v2-v1;
                    });
                    kiteBasketOrderData = kiteBasketOrderDataCopy;
              }     
        

          for(let i=0;i<positionsdata.data.net.length;i++){
            if(positionsdata.data.net[i].product == 'MIS' ){
              totalMIS++;
              if(positionsdata.data.net[i].quantity !=0){
                openMIS++;
              }        
            }      
          }

    }



    let buyButtonText = 'BUY'; let sellButtonText = 'SELL'
    if(totalOrderRequest!=undefined){
        buyButtonText = `B(${totalOrderRequest}/${totalFillOrderRequest})`;
        sellButtonText = `S(${totalOrderRequest}/${totalFillOrderRequest})`;
    }

    
	 	
	    return (
	      <div id='basketOrderDialog' style={{display:(isHideDialog?'none':'block')}} className="modal">       
	        <div style={{width:'930px'}} className="modal-content">
	          <div  className="orderStatusView">{orderStatus} <div className="openPosition">({openMIS}/{totalMIS})</div></div>	
	          <span onClick={hideBasketOrderDialog} className="close">&times;</span>
	          <div className='basket-orders'>
	          
          <table>
            <thead>
              <tr>
                <th onClick={(evt)=>{this.selectRows(kiteBasketOrderData);}}  onDoubleClick={(evt)=>{this.uncheckAllRow()}}>Select</th>
                <th>Name</th>
                <th>PnL</th>
                <th>Q(M)</th>
                <th onDoubleClick={(evt)=>{this.uncheckPositionWithCNCnMIS();}}>Q(H)</th>
                <th>Value</th>
                <th>Change</th>
                <th>LTP</th>
                <th>Qty</th>
                <th>Price</th>
             {orderWindowView.buyView &&  <th>BUY</th>		}		 
				     {orderWindowView.sellView &&    <th>SELL</th> }
              </tr>
            </thead>

            <tbody>
            
             { kiteBasketOrderData.map((symbol,index)=> <BasketListRow updateFillOrderRequest={this.updateFillOrderRequest} fetchPositionData={this.fetchPositionData} updateMarginData={updateMarginData} positionsdata={positionMap[symbol]} ref={ele => this.rowfRefs['MIS-'+symbol] = ele}  orderType={orderType} orderWindowView={orderWindowView} onTableRowclick={onTableRowclick} addToFavList={addToFavList} removeFromFavList={removeFromFavList} tableId={tableId} updateOrderStatus={this.updateOrderStatus} key={'MIS-'+symbol} kitedata={kitedata}  symbol={symbol} />)}
             
            </tbody>


        </table>

	         </div>
        <button className="favButton"  onClick={(evt)=>{this.setState({isHideDialog:true})}} type="button">H</button>   
        <button className="favButton"  onClick={this.toogleSellView} type="button">S</button>
        <button className="favButton"  onClick={this.toogleBuyView} type="button">B</button>

        
        <div style={{marginLeft: '10px'}} className="dropdown">
          <button style={{fontSize:'15px',backgroundColor:((isSortPosition || isSortOnValue || isSortOnPriceChange || isSortOnMISQty || isSortOnDayQty || isFilterMISPosition)?'red':'initial')}} className="dropbtn">Flt</button>
          <div className="dropdown-content" style={{bottom: '0px'}}>
            <a style={{backgroundColor:(isSortPosition?'red':'initial')}} onClick={(evt)=>{this.setSortOrder('isSortPosition');}}>{'Loss'}</a>
            <a style={{backgroundColor:(isSortOnValue?'red':'initial')}} onClick={(evt)=>{this.setSortOrder('isSortOnValue');}}>{'Total Value'}</a>
            <a style={{backgroundColor:(isSortOnPriceChange?'red':'initial')}} onClick={(evt)=>{this.previosChangeSortedOrder=undefined;this.setSortOrder('isSortOnPriceChange');}}>{'Change'}</a>
            <a style={{backgroundColor:(isSortOnDayQty?'red':'initial')}} onClick={(evt)=>{this.setSortOrder('isSortOnDayQty');}}>{'Q(H)'}</a>
            <a style={{backgroundColor:(isSortOnMISQty?'red':'initial')}} onClick={(evt)=>{this.setSortOrder('isSortOnMISQty');}}>{'Q(M)'}</a>
            <a style={{backgroundColor:(isFilterMISPosition?'red':'initial')}} onClick={(evt)=>{this.setSortOrder('isFilterMISPosition');}}>{'MIS'}</a>            
          </div>
        </div>

      
        <button className="favButton"  onClick={this.onSQOFFClick} type="button">SQFF</button>
        <button className="favButton"  onClick={this.onTpriceClick} type="button">Tpri</button>

        <button className="favButton"  onClick={this.fillQtyForValue} type="button">Fill Qty</button>


        <div style={{marginLeft: '10px'}} className="dropdown">
          <button className="dropbtn">Mark</button>
          <div className="dropdown-content" style={{bottom: '0px'}}>
            <a >{'Chg% < X '}</a>
            <a >{'Chg% > X '}</a>
            <a >{'Chg% [x,y]'}</a>
            <a >{'Profit% < X '}</a>
            <a >{'Profit% > X '}</a>            
            <a >{'Profit [x,y]'}</a>
          </div>
        </div>


        <div className="orderType">      
          <input type="radio" name="orderType" onClick={this.onOnderTypeChange} id="ORDER_TYPE_MARKET" checked={orderType=="MARKET"?true:false} value="MARKET"/><label for="ORDER_TYPE_MARKET">M</label>
          <input type="radio" name="orderType" onClick={this.onOnderTypeChange} id="ORDER_TYPE_LIMIT" checked={orderType=="LIMIT"?true:false} value="LIMIT"/><label for="ORDER_TYPE_LIMIT">L</label>
          <input type="radio" name="orderType" onClick={this.onOnderTypeChange} id="ORDER_TYPE_SL_MARKET" checked={orderType=="SL_MARKET"?true:false} value="SL_MARKET"/><label for="ORDER_TYPE_SL_MARKET">SL_M</label>
        </div>

        <select className="selectSymbolsBasket" onChange={this.onSymbolSelect}>
             { kiteBasketOrderData.map((symbol,index)=> <option value={symbol}>{symbol}</option>)}
        </select>


        {orderWindowView.buyView && <button  className="builkOrderBtn favButton buyButton"  onClick={this.placeBuyOrderForselectedRow} type="button">{buyButtonText}</button> }
        {orderWindowView.sellView &&    <button  className="builkOrderBtn favButton sellButton"  onClick={this.placeSellOrderForselectedRow} type="button">{sellButtonText}</button> }





	       </div>
	      </div>
	    )
  }

}


export default BasketOrderDialog;




class BasketListRow extends React.Component {
  constructor(props) {
    super(props);
    this.state={isRowEnable:false,pendingOrderRequest:0};
  }


	componentDidMount() {
		this.fillInputWithLatestPrice();
	}  

	componentDidUpdate(prevProps) {

	}



uncheckPositionWithCNCnMIS=()=>{
    const{
      positionsdata     
    }=this.props;

    let dayQtyCNC=0;let dayQtyMIS=0;
    if(positionsdata && positionsdata.dayCNC){
      dayQtyCNC = positionsdata.dayCNC.quantity;
    }

    if(positionsdata){
      dayQtyMIS = positionsdata.quantity;
    }

    if( dayQtyCNC < 0){
      this.markCheckBox(false);
      return true;
    }
    return false;
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
    if(positionsdata){
      let quantity = Number.parseInt(Math.abs((positionsdata.quantity*perc/100)));      
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

      if(positionsdata.quantity >= 0){
          price = lastTradedPrice - priceChange; //sell stop losss trigger
      }else {
          price = lastTradedPrice + priceChange; //Buy stop losss trigger
      }
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
      updateFillOrderRequest
    }=this.props;		

    const{
      pendingOrderRequest
    }=this.state;


    updateMarginData();
    fetchPositionData();
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
      updateFillOrderRequest
    }=this.props;		

    const{
      pendingOrderRequest
    }=this.state;

  updateMarginData();
  fetchPositionData();
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
      placeMISBuyMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,quantity:quantity,transaction_type:'BUY',order_type:'MARKET'},this.onOrderSuccess,this.onOrderError);
      updateOrderStatus(symbol +' -> BUY  -> MARKET -> MIS ->' +'        Q: '+ quantity + '   P: '+price);
   } else if(orderType=="LIMIT"){
      placeMISBuyLimitOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,quantity:quantity,transaction_type:'BUY',order_type:'LIMIT'},this.onOrderSuccess,this.onOrderError);
      updateOrderStatus(symbol +' -> BUY  -> LIMIT -> MIS ->' +'        Q: '+ quantity + '   P: '+price);    
   } else if(orderType=="SL_MARKET"){
      placeMISBuySLMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,trigger_price:price,quantity:quantity,transaction_type:'BUY',order_type:'SL-M'},this.onOrderSuccess,this.onOrderError);
      updateOrderStatus(symbol +' -> BUY  -> SL-MARKET -> MIS ->' +'        Q: '+ quantity + '   TP: '+price);
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
      placeMISSellMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,quantity:quantity,transaction_type:'SELL',order_type:'MARKET'},this.onOrderSuccess,this.onOrderError);
      updateOrderStatus(symbol +' -> SELL  -> MARKET -> MIS ->' +'        Q: '+ quantity + '   P: '+price);    
   }else if(orderType=="LIMIT"){
      placeMISSellLimitOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,quantity:quantity,transaction_type:'SELL',order_type:'LIMIT'},this.onOrderSuccess,this.onOrderError);
      updateOrderStatus(symbol +' -> SELL  -> LIMIT -> MIS ->' +'        Q: '+ quantity + '   P: '+price);    
   }else if(orderType=="SL_MARKET"){
      placeMISSellSLMarketOrder({exchange:kitedata.ticks[symbol].exchange,tradingsymbol:symbol,price:price,trigger_price:price,quantity:quantity,transaction_type:'SELL',order_type:'SL-M'},this.onOrderSuccess,this.onOrderError);
      updateOrderStatus(symbol +' -> SELL  -> SL-MARKET -> MIS ->' +'        Q: '+ quantity + '   TP: '+price);
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
      positionsdata     
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
    if(positionsdata && positionsdata.quantity > 0){
      checkboxstyle.borderLeft='20px solid lightgreen';
    }else if(positionsdata && positionsdata.quantity < 0){
      checkboxstyle.borderLeft='20px solid red';
    }else {
      checkboxstyle.borderLeft='20px solid white';
    }     

     let rowstyle={};
     if(pendingOrderRequest!=0){
        rowstyle.backgroundColor='gold';
     }

    //ref={ele => this.checkBoxRef = ele}

    let dayQtyCNC=0;let dayQtyMIS=0;
    if(positionsdata && positionsdata.dayCNC){
      dayQtyCNC = positionsdata.dayCNC.quantity;
    }

    if(positionsdata){
      dayQtyMIS = positionsdata.quantity;
    }

    let dqCNCClass = dayQtyCNC<0 ?'red':'green';
    let dqMISClass = dayQtyMIS<0 ?'red':'green';

    return (
      <tr style={rowstyle} rowId={'MIS_ORDER-'+symbol}>
        <td onClick={(evt)=>{this.setState({isRowEnable:!isRowEnable})}} style={checkboxstyle}><input tabIndex={"-1"} style={{width:'20px',height: '20px'}}    onChange={this.onInputValueChange} type="checkbox" name='checkbox' checked={isRowEnable}></input></td>  
  			<td onDoubleClick={(evt)=>{addToFavList(symbol,'MIS');}} >{symbol}<span className='exchangeSuffix'>&nbsp;&nbsp;{kitedata.ticks[symbol].exchange}</span></td>    
        <td className={positionsdata && positionsdata.pnl<0?'red':'green'}>{positionsdata ?positionsdata.pnl.toFixed(1):'' }</td>   

        <td className={dqMISClass}>{dayQtyMIS==0?'':dayQtyMIS}</td>  
        <td className={dqCNCClass +" holdingQty"}>{dayQtyCNC==0?'':dayQtyCNC}</td>  
        <td><span className='misValue'>{(positionsdata&& positionsdata.quantity!=0 )?(Math.round((positionsdata.value)/1000)+'k'):'' }</span></td>

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
      
       </tr>
    );


  }

}

