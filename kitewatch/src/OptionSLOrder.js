import React from 'react';
import {placeMISBuySLOrder,placeMISSellSLOrder,getPosition,showToastMsg,getOrders,cancelOrder,placeMISBuyMarketOrder,placeMISSellMarketOrder} from './OrderUtil';
import toaster from "toasted-notes";
import "toasted-notes/src/styles.css"; 



class OptionSLOrder extends React.Component {

	
  onOrderCancelError=(data)=>{
    showToastMsg((<span className={'red'}>{'Error in canceling order'}</span>));   
  }

  onPositionError=(data)=>{
    showToastMsg((<span className={'red'}>{'Error in fetching position'}</span>));   
  }

  onOrderBookError=(data)=>{
    showToastMsg((<span className={'red'}>{'Error in fetching orders list'}</span>));   
  }

  onSLOrderError=(data)=>{
  //  showToastMsg((<span className={'red'}>{'Error in placing orders'}</span>));   
  }
  onSLOrderSuccess=(data)=>{
    // showToastMsg((<span className={'green'}>{data.order_id}</span>));   
  }

  onOrderCancelNotification=(data)=>{
     showToastMsg((<span className={'green'}>{'Order canceled ' } {data.order_id}</span>));   
  }


  onOrderCancelSuccess=(data)=>{
    this.fnoOrders[data.data.order_id]=true;
    // all canceled placed sl orders
    let pendingsOrder = Object.values(this.fnoOrders).filter((e)=>{return e==false})
    
    if(pendingsOrder.length == 0){
    	getPosition(this.onPositionSuccess,this.onPositionError);
    }
    
  }


  onOrderBookSuccess=(data)=>{
    let orderbookData=data.data;  
    this.fnoOrders={};

    for(let i=0;i<orderbookData.length;i++){
    	let order = orderbookData[i];
    	if(order.exchange=='NFO' && order.product=='MIS' && order.status=='TRIGGER PENDING' && ( order.tradingsymbol.startsWith('BANKNIFTY')  || order.tradingsymbol.startsWith('NIFTY') ) ){
    		this.fnoOrders[order.order_id]=false;
    		cancelOrder(order.order_id,this.onOrderCancelSuccess,this.onOrderCancelError);
    	}
    }

    if(Object.keys(this.fnoOrders).length==0){
      getPosition(this.onPositionSuccess,this.onPositionError);
    }

  }




cancelSLOrdersForSymbol=(SLtradingsymbol)=>{
    getOrders(
      (data)=>{
        let orderbookData=data.data;  
        for(let i=0;i<orderbookData.length;i++){
          let order = orderbookData[i];
          if(order.exchange=='NFO' && order.product=='MIS' && order.status=='TRIGGER PENDING' && ( order.tradingsymbol == SLtradingsymbol) ){
            cancelOrder(order.order_id,this.onOrderCancelNotification,this.onOrderCancelError);
          }
        }
    },this.onOrderBookError);
}



  onOrderBookSuccessCancelOrder=(data)=>{
    let orderbookData=data.data;  

    for(let i=0;i<orderbookData.length;i++){
      let order = orderbookData[i];
      if(order.exchange=='NFO' && order.product=='MIS' && order.status=='TRIGGER PENDING' &&  ( order.tradingsymbol.startsWith('BANKNIFTY')  || order.tradingsymbol.startsWith('NIFTY') )){
        cancelOrder(order.order_id,this.onOrderCancelSuccess,this.onOrderCancelError);
      }
    }
  }


  onPositionSuccess=(data)=>{ 
    let positionsdata=data.data.net;

    for(let i=0;i<positionsdata.length;i++){
    	let position = positionsdata[i];
    	if(position.exchange=='NFO' && position.product=='MIS' && position.quantity < 0 &&  (  position.tradingsymbol.startsWith('BANKNIFTY')  ||  position.tradingsymbol.startsWith('NIFTY') )  ){
    		let size = Math.abs(position.quantity);    		
    		let price=position.last_price;
    		
    		let ltp=position.last_price;

        let triggerPrice = this.getBuyTriggerPrice(ltp);

        let triggerPricegap = position.tradingsymbol.startsWith('NIFTY') ? 15:30;

			 price = ( triggerPricegap + triggerPrice  ).toFixed(1);
    	 triggerPrice = (triggerPrice).toFixed(1);	

       let MAX_QTY = position.tradingsymbol.startsWith('NIFTY') ? 1800:1200;
    		while(size > 0){
    			let q = Math.min(size,MAX_QTY);
    			let orderdata={exchange:position.exchange, tradingsymbol:position.tradingsymbol , quantity:q ,price:price,trigger_price:triggerPrice};
    			placeMISBuySLOrder(orderdata,this.onSLOrderSuccess,this.onSLOrderError);
    			size = size-q;
    		}

    	}
    }


  }


  getBuyTriggerPrice=(ltp)=>{
        let triggerPrice;

        if(ltp < 10){
          triggerPrice = 2*ltp;
        }else if(ltp < 15){
          triggerPrice = 7+ltp;
        }else if(ltp < 30){
          triggerPrice = 11+ltp;
        }else if(ltp < 40){
          triggerPrice = 17+ltp;
        }else if(ltp < 50){
          triggerPrice = 19+ltp;
        }else if(ltp<100){
          triggerPrice = 31+ltp;
        }else if(ltp<150){
          triggerPrice = 43+ltp;
        }else if(ltp<200){
          triggerPrice = 53+ltp;
        }else if(ltp<250){
          triggerPrice = 63+ltp;
        }else if(ltp<300){
          triggerPrice = 70+ltp;
        }else{
          triggerPrice = 80+ltp;
        }
        return triggerPrice;
  }



cancelSLOrders=()=>{
    getOrders(this.onOrderBookSuccessCancelOrder,this.onOrderBookError);
}


 resetFNOSLOrders=()=>{
 	getOrders(this.onOrderBookSuccess,this.onOrderBookError);
 }




  onStrOrderSuccess=(data)=>{
    // showToastMsg((<span className={'green'}>{data.order_id}</span>));   
  }

  onStrOrderError=(data)=>{
   //  showToastMsg((<span className={'red'}>{'Error in placing Str orders'}</span>));     
  }


placeOrdersForStrategy=(activeStrategie)=>{
   let symbols = Object.keys(activeStrategie);

   let msg = symbols.join('\n');

    let qty =0;

    if(symbols.length ==1 && activeStrategie[symbols[0]].inputQty){
      qty=Math.abs(activeStrategie[symbols[0]].inputQty);
    }



    if(qty == 0){
      qty=  window.prompt('Qty for strategy : -> \n\n'+msg +"\n");
       if(qty==null ){
        return;
       }
    }

    if( isNaN(qty) || qty > 1800){
      window.alert('Enter qty not valid > 1800 ' + qty);
      return;
    }

    for(let i=0;i<symbols.length;i++){
        let symbol = symbols[i];
        let fact = activeStrategie[symbol].qty;

        let data={exchange:'NFO', tradingsymbol:symbol, quantity:Math.abs(fact*qty)};

        if(activeStrategie[symbol].order_type=='SL'){
            data.price=activeStrategie[symbol].price;
            data.trigger_price=activeStrategie[symbol].trigger_price;
            if(activeStrategie[symbol].side=='BUY'){
                placeMISBuySLOrder(data,this.onStrOrderSuccess,this.onStrOrderError);        
            }else if(activeStrategie[symbol].side=='SELL'){
                placeMISSellSLOrder(data,this.onStrOrderSuccess,this.onStrOrderError);        
            } 
        }else{
          if(activeStrategie[symbol].side=='BUY'){
              placeMISBuyMarketOrder(data,this.onStrOrderSuccess,this.onStrOrderError);        
          }else if(activeStrategie[symbol].side=='SELL'){
              placeMISSellMarketOrder(data,this.onStrOrderSuccess,this.onStrOrderError);        
          } 
        }

       
      
    }

}





}


export default OptionSLOrder;