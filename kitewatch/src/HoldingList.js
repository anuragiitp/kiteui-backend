import React from 'react';
import './App.css';



class HoldingList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    const{
      positionsdata,
      holdingsdata,
       onTableRowclick,
       margin,
       kitedata,
       BSEtoNSEsymbolsMapping
    }=this.props;


  if(holdingsdata && holdingsdata.data){      
      for( let i=0;i< holdingsdata.data.length; i++){
        if(BSEtoNSEsymbolsMapping[holdingsdata.data[i].tradingsymbol]){
          holdingsdata.data[i].tradingsymbol = BSEtoNSEsymbolsMapping[holdingsdata.data[i].tradingsymbol];
        }
        let hobj = holdingsdata.data[i];
          if(kitedata.ticks[hobj.tradingsymbol]){
            hobj.last_price =  kitedata.ticks[hobj.tradingsymbol].lastTradedPrice;
          }          
      }
  }
  if(positionsdata && positionsdata.data){
    for( let i=0;i< positionsdata.data.net.length; i++){
          let pobj = positionsdata.data.net[i];
          if(kitedata.ticks[pobj.tradingsymbol]){
            pobj.last_price =  kitedata.ticks[pobj.tradingsymbol].lastTradedPrice;
            pobj.pnl = pobj.sell_value + (pobj.buy_quantity - pobj.sell_quantity)*pobj.last_price - pobj.buy_value;
            pobj.change=kitedata.ticks[pobj.tradingsymbol].change
          }             
    }
  }



	//update total position
	let totalHoldQty=0;let totalPositionAddQty=0;let totalPositionSellQty=0; let dayPNLMIS=0;let dayPNLCNC=0;	let dayPNL=0;
  let tvalue=0;let misTvalue=0;let cncTvalue=0;
  let totalTradedValue=0;

	if(holdingsdata && holdingsdata.data && positionsdata && positionsdata.data){
			
			for( let i=0;i< holdingsdata.data.length; i++){
				let hobj = holdingsdata.data[i];
				totalHoldQty = totalHoldQty + (hobj.quantity + hobj.t1_quantity);
			}
			
			if(positionsdata.data.net){
				for( let i=0;i< positionsdata.data.net.length; i++){
					let pobj = positionsdata.data.net[i];
					if(pobj.product == 'CNC'){
						if(pobj.quantity > 0){
							totalPositionAddQty = totalPositionAddQty + pobj.quantity;	
						}else{
							totalPositionSellQty = totalPositionSellQty + pobj.quantity;	
						}		

            dayPNLCNC += pobj.pnl;
            cncTvalue += pobj.value;
					}else if(pobj.product == 'MIS'){
            dayPNLMIS+= pobj.pnl;
            misTvalue += pobj.value;
          }
          totalTradedValue += (pobj.day_buy_value + pobj.day_sell_value);	
          dayPNL += pobj.pnl;
          tvalue += pobj.value;
				}

        positionsdata.dayPNL=dayPNL;
        positionsdata.dayPNLCNC=dayPNLCNC;
        positionsdata.dayPNLMIS=dayPNLMIS;
			}
	}




	holdingsdata.data.sort(function(a, b){return a.day_change_percentage-b.day_change_percentage});


  positionsdata.data.net.sort(function(a, b){
    if(a.product == 'MIS' && b.product=='MIS'){
      if(a.quantity != 0 && b.quantity != 0) return a.pnl - b.pnl;
      else return b.quantity - a.quantity;    
    }else if(a.product == 'MIS' && b.product=='CNC'){
       return -1; 
    }else if(a.product == 'CNC' && b.product=='MIS'){
       return 1; 
    }else { //CNC-CNC
        if(a.quantity != 0 && b.quantity != 0) 
          return a.pnl - b.pnl;          
        else if(a.quantity == 0)
            return 1;
        else if(b.quantity == 0)
            return -1;
        else
          return 0;  
    }
  });


    let PL=0;
    let currentValue=0;
    let totalInvestment=0;
    for( let i=0;i< holdingsdata.data.length; i++){
    	let data = holdingsdata.data[i];
		currentValue = currentValue + (data.quantity + data.t1_quantity)*data.last_price;
		totalInvestment = totalInvestment + (data.quantity + data.t1_quantity)*data.average_price;
    }
    PL = Math.round(currentValue - totalInvestment);

    let plClass = PL<0 ?'red':'green';
    document.title=Math.round(PL/1000) +"K ( "+(PL*100/totalInvestment).toFixed(2)+"%) "

    return (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Change</th>
              </tr>
            </thead>

            <tbody>
              <tr key='summary' >
              	<td colSpan='2' className='summaryRow'>
              	 <span className='totalValue'>{(currentValue/100000).toFixed(2)}</span>L&nbsp;&nbsp;&nbsp;<span className={plClass}>{`${Math.round(PL)}(${(PL*100/totalInvestment).toFixed(2)}%)` }</span>{margin && <span>&nbsp;{(margin.data.equity.net/1000).toFixed(1)}K</span>}
              	</td> 
              </tr>

              <tr key='position' >
              	<td colSpan='2' className='positionRow'>
              	 <span>{totalHoldQty}&nbsp;|{totalPositionAddQty}&nbsp;|{totalPositionSellQty}&nbsp;&nbsp;=&nbsp;{(totalHoldQty+totalPositionAddQty)}</span>
              	</td> 
              </tr>


              <tr key='daypositionsummary' >
                <td colSpan='2' className='summaryRow'>
                 <span className={ dayPNL<0 ?'red':'green'}>{(dayPNL/1000).toFixed(2)}K</span>&nbsp;&nbsp;&nbsp;
                 <span className='bracketValue'>&nbsp;<span className={ dayPNLCNC<0 ?'red':'green'}>{`${(dayPNLCNC).toFixed(2)}` }</span>C</span>&nbsp;&nbsp;                 
                 <span className='bracketValue'>&nbsp;<span className={ dayPNLMIS<0 ?'red':'green'}>{`${Math.round(dayPNLMIS)}` }</span>M</span>
                </td> 
              </tr>

              <tr key='dayposition' >
                <td colSpan='2' className='positionRow'>
                 <span>{cncTvalue.toFixed(0)}&nbsp;|&nbsp;{misTvalue.toFixed(0)}&nbsp;&nbsp;&nbsp;=&nbsp;{(tvalue.toFixed(0))}  &nbsp;&nbsp; ( {(totalTradedValue/100000).toFixed(0)}L )</span>
                </td> 
              </tr>

              { positionsdata.data.net.map((data,index)=> <PositionWatchListRow  onTableRowclick={onTableRowclick}  key={'POS-'+index+ data.tradingsymbol} data={data} />) }

              <tr></tr>

              <tr key='summary-row-2' >
                <td colSpan='2' className='summaryRow'>
                 <span className='totalValue'>{(currentValue/100000).toFixed(2)}</span>L&nbsp;&nbsp;&nbsp;<span className={plClass}>{`${Math.round(PL)}(${(PL*100/totalInvestment).toFixed(2)}%)` }</span>
                </td> 
              </tr>              

             { holdingsdata.data.map((data,index)=> <WatchListRow  onTableRowclick={onTableRowclick} key={'HOLD-'+index+ data.tradingsymbol} data={data} />) }
             
            </tbody>


        </table>
    )
  }

}


export default HoldingList;





class PositionWatchListRow extends React.Component {
  constructor(props) {
    super(props);
  }

  openStockInfo=()=>{
    this.props.onTableRowclick(this.props.data.tradingsymbol);
  }

  render() {

    const{
  data
    }=this.props;



    let dayChangeClass  = data.pnl <0 ?'red':'green';

      return (
        <tr rowId={'POS-'+data.tradingsymbol} onClick={this.openStockInfo} className={data.quantity==0?'lavender':''}>
        <td style={{position:'relative'}} >{data.tradingsymbol}&nbsp;<span className={'holdQty ' + (data.quantity<0?'red':'green')}>({data.quantity})</span><span className='productType'>{data.product}</span></td>
        <td>
        <span className='last_price'>{data.last_price.toFixed(2)}</span>&nbsp;&nbsp;<span style={{fontWeight:'bold'}} className={'holdDayChg ' + dayChangeClass}>{ data.pnl.toFixed(2)}</span>
        <br></br>
        <span className='positionValue'>{Math.round((data.value)/1000) }k</span>

        </td>
        </tr>
      );

  }

}




class WatchListRow extends React.Component {
  constructor(props) {
    super(props);
  }

  openStockInfo=()=>{
    this.props.onTableRowclick(this.props.data.tradingsymbol);
  }

  render() {

    const{
	data
    }=this.props;

    let profit = 	(data.quantity + data.t1_quantity)*data.last_price - (data.quantity + data.t1_quantity)*data.average_price;


    let dayChangeClass  = data.day_change_percentage <0 ?'red':'green';
    let plClass = profit<0 ?'red':'green';

      return (
        <tr rowId={'HOLD-'+data.tradingsymbol} onClick={this.openStockInfo}>
        <td>{data.tradingsymbol}<span className='holdQty'>({data.quantity + data.t1_quantity})</span>&nbsp;&nbsp;<span className='holdValue'>({Math.round((data.quantity + data.t1_quantity)*data.last_price/1000) })</span></td>
        <td>
        <span className='last_price'>{data.last_price.toFixed(2)}</span>&nbsp;&nbsp;<span className={'holdDayChg ' + dayChangeClass}>{ data.day_change_percentage.toFixed(2)}</span>
        <br></br>
        <span className={'holdPL '+plClass}>{Math.round(profit)}</span>&nbsp;&nbsp;<span className={'holdPLPec '+plClass}>{ (profit*100/((data.quantity + data.t1_quantity)*data.average_price)).toFixed(2)}%</span>

        </td>
        </tr>
      );




  }

}