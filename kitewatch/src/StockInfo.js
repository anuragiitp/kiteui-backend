import React from 'react';
import './App.css';
import OrderWindow from './OrderWindow';
import CanvasJSReact from './canvasjs.react';
import {createAlertOnSentinel} from './OrderUtil';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;



class StockInfo extends React.Component {
  constructor(props) {
    super(props);    
    this.state={};

    let graphTimeFrame = localStorage.getItem("graphTimeFrame");
    if(graphTimeFrame == 'MINUTE'){	    	
        this.state.isShowDailyCandle=true;
    }

    let minInterval = localStorage.getItem("minInterval");  	
    this.state.minInterval= (minInterval == undefined)?'minute':minInterval;


    let isSyncDayChart = localStorage.getItem("isSyncDayChart");
    this.state.isSyncDayChart= (isSyncDayChart == undefined)?false:isSyncDayChart;

  }



	componentDidMount() {
		this.fetchHistoricalData();
		this.fetchDailyLiveDataByMin(this.state.minInterval);
	}  


	componentWillUnmount(){


	}



	componentDidUpdate(prevProps) {
     if (prevProps.stockInfo.symbol !== this.props.stockInfo.symbol) {
       this.fetchHistoricalData();
       this.setState({avg_Volume:0});
       this.fetchDailyLiveDataByMin(this.state.minInterval);	
     }else {     

		const{
			dailyCandleOptions,
			isShowCandle,
			isShowDailyCandle,
			isSyncDayChart
		}=this.state;

     	if(isSyncDayChart && dailyCandleOptions &&  isShowCandle && isShowDailyCandle){
			let symbol = this.props.stockInfo.symbol;
			 if( Math.abs(prevProps.kitedata.ticks[symbol].lastTradedPrice - this.props.kitedata.ticks[symbol].lastTradedPrice) > 0.04 ){
			 	this.refreshDailyCandles();
			 }
     	}	
     }
   }

    onColorInput=(evt)=>{    	

	    const{
	      stockInfo,
	      updateKitePerfData
	    }=this.props;

		updateKitePerfData(stockInfo.symbol,'color',evt.target.value);
    }





 fetchDailyLiveDataByMin =(minInterval)=>{
 	  let ticker = this.props.kitedata.ticks[this.props.stockInfo.symbol];
	  let fromdate = new Date();
	  fromdate.setDate(fromdate.getDate()-4);

      fetch('https://api.kite.trade/instruments/historical/'+ticker.token+'/'+minInterval+'?from='+fromdate.toISOString().split('T')[0]+'&to='+new Date().toISOString().split('T')[0],
      {
      	method: 'GET',
      	headers: {
				"X-Kite-Version":"3",
				"Content-Type": "application/x-www-form-urlencoded",
				"authorization": window.authKey
			}
      	}
      	)
        .then(response => response.json())
        .then(function(jsonData){
        	this.updateDailyMinuteChart(jsonData);
        }.bind(this))
        .catch((error) => {
          console.error(error)
        });
}





 fetchHistoricalData =()=>{
 	let ticker = this.props.kitedata.ticks[this.props.stockInfo.symbol];

		 let fromdate = new Date();
		 fromdate.setDate(fromdate.getDate()-2000);

      fetch('https://api.kite.trade/instruments/historical/'+ticker.token+'/day?from='+fromdate.toISOString().split('T')[0]+'&to='+new Date().toISOString().split('T')[0],
      {
      	method: 'GET',
      	headers: {
				"X-Kite-Version":"3",
				"Content-Type": "application/x-www-form-urlencoded",
				"authorization": window.authKey
			}
      	}
      	)
        .then(response => response.json())
        .then(function(jsonData){
        	this.updateHistoryData(jsonData);
        }.bind(this))
        .catch((error) => {
          console.error(error)
        });

}




refreshDailyCandles=()=>{

    const{
      kitedata,
      stockInfo
    }=this.props;

    const{
      symbol,
      tableId
    }=stockInfo;

	const{
		dailyCandleOptions
	}=this.state;


	let dataPoints = dailyCandleOptions.data[0].dataPoints;	
	let volDataPoints = dailyCandleOptions.data[1].dataPoints;	
	let lastCandle = dataPoints[dataPoints.length-1];
	let lastVolCandle = volDataPoints[volDataPoints.length-1];
	
	let dt = new Date();
	let ltp = kitedata.ticks[symbol].lastTradedPrice;
	let lastTradeQuantity = kitedata.ticks[symbol].lastTradeQuantity;

	if(lastCandle.x.getMinutes() != dt.getMinutes()){
		dailyCandleOptions.data[0].dataPoints.push({x:dt,y:[ltp,ltp,ltp,ltp]});
		dailyCandleOptions.data[1].dataPoints.push({x:dt,y:lastTradeQuantity});
	}else{
		lastCandle.y[1]= Math.max(lastCandle.y[1],ltp); //high
		lastCandle.y[2]= Math.min(lastCandle.y[2],ltp); //low
		lastCandle.y[3]= ltp; //close

		lastVolCandle.y=lastVolCandle.y+lastTradeQuantity;			
	}

	this.setState({dailyCandleOptions: Object.assign({}, dailyCandleOptions)});
		
}



updateDailyMinuteChart=(jsonData)=>{

	let hCandles = jsonData.data.candles;
	let dataPoints = [];let volPoints=[];

	let latestTickDay= hCandles[hCandles.length - 1][0].split("T")[0];
	let startFromEnd =hCandles.length-1;

	for(let i=hCandles.length-1;i>=0;i--){
		if(hCandles[i][0].split("T")[0] !== latestTickDay){
			startFromEnd = hCandles.length-i-1;
			break;
		}
	}

	for(let i=Math.min(380,startFromEnd);i>0;i--){
		let day = hCandles.length -i;
		dataPoints.push({x: new Date(hCandles[day][0]), y: [hCandles[day][1], hCandles[day][2], hCandles[day][3], hCandles[day][4]]});
		volPoints.push({x: new Date(hCandles[day][0]), y:hCandles[day][5]});
	}


	const candleOptions = {
		zoomEnabled: true, 
		axisX: { 
			interval:900,
			intervalType: "second",
			valueFormatString: "hh:mm",
		},	
		axisY: {
			includeZero:false,
			gridDashType: "dash",			   
		},
		axisY2: {
			includeZero:false,
			gridDashType: "dash",
			labelFormatter: function(e){
				return e.value/100000 + "L";
			}					
		},		
		data: [{
			type: "candlestick",
			risingColor: "#008000",
			fallingColor: "#ff0000",
			exportEnabled: true,			
			dataPoints:dataPoints
		},
		{
			axisYType: "secondary",
			fillOpacity: .1,
			color: "blue",
			type: "column",		
			dataPoints:volPoints
		}		
	  ]
	}


	this.setState({dailyCandleOptions:candleOptions});
}




updateHistoryData=(jsonData)=>{

	let hCandles = jsonData.data.candles;
		
	let d1,d2,d3,w1,w2,m1,m6,y1,y2,y3,y4,y5;

	let avg_Volume = 0; 

	if(hCandles){
		let data=hCandles;
		let totalTick = data.length-1;
		let close = data[totalTick][4];

		d1 = Number.parseInt(-(data[totalTick-1][4]-close)*100/data[totalTick-1][4]);
	    d2=Number.parseInt(-(data[totalTick-2][4]-close)*100/data[totalTick-2][4]);
	    d3=Number.parseInt(-(data[totalTick-3][4]-close)*100/data[totalTick-3][4]);
	    w1=Number.parseInt(-(data[totalTick-5][4]-close)*100/data[totalTick-5][4]);
	    w2=Number.parseInt(-(data[totalTick-10][4]-close)*100/data[totalTick-10][4]);

		if(totalTick-23 >0 ){
			m1= Number.parseInt(-(data[totalTick-23][4]-close)*100/data[totalTick-23][4]);
		}
		    
		if(totalTick-140 >0 ){
		    m6=Number.parseInt(-(data[totalTick-140][4]-close)*100/data[totalTick-140][4]);
		}


		if(totalTick-269 >0 ){
		    y1=Number.parseInt(-(data[totalTick-269][4]-close)*100/data[totalTick-269][4]);
		}

		if(totalTick-540 >0 ){
		    y2=Number.parseInt(-(data[totalTick-540][4]-close)*100/data[totalTick-540][4]);
		}

		if(totalTick-807 >0 ){
		    y3=Number.parseInt(-(data[totalTick-807][4]-close)*100/data[totalTick-807][4]);
		}

		if(totalTick-1076 >0 ){
		    y4=Number.parseInt(-(data[totalTick-1076][4]-close)*100/data[totalTick-1076][4]);
		}

		if(totalTick-1150 >0 ){
		    y5=Number.parseInt(-(data[0][4]-close)*100/data[0][4]);
		}

	}

	let hPerformance = {d1:d1,d2:d2,d3:d3,w1:w1,w2:w2,m1:m1,m6:m6,y1:y1,y2:y2,y3:y3,y4:y4,y5:y5}


	let count=0;
	let dataPoints = [];let volPoints=[];
	for(let i=Math.min(250,hCandles.length);i>0;i--){
		let day = hCandles.length -i;
		dataPoints.push({x: new Date(hCandles[day][0]), y: [hCandles[day][1], hCandles[day][2], hCandles[day][3], hCandles[day][4]]});
		volPoints.push({x: new Date(hCandles[day][0]), y:hCandles[day][5]});
		if(count < 10){
			avg_Volume += hCandles[hCandles.length - count -2][5];
			count++;
		}		
	}
	avg_Volume = avg_Volume/10;


	const candleOptions = {
		zoomEnabled: true, 
		axisX: { 
			interval:1,
			intervalType: "month",
			valueFormatString: "MMM"		
		},
		axisY: {
			includeZero:false,
			gridDashType: "dash"					   
		},
		axisY2: {
			includeZero:false,
			gridDashType: "dash",
			labelFormatter: function(e){
				return e.value/100000 + "L";
			}					
		},		
		data: [{
			type: "candlestick",
			risingColor: "#008000",
			fallingColor: "#ff0000",
			exportEnabled: true,			
			dataPoints:dataPoints
		},
		{
			axisYType: "secondary",
			fillOpacity: .1,
			color: "blue",
			type: "column",		
			dataPoints:volPoints
		}		
	  ]
	}


	this.setState({candleOptions:candleOptions,hPerformance:hPerformance,avg_Volume:avg_Volume});
}



createAlert=(opr)=>{
    const{
      kitedata,
      stockInfo,
    }=this.props;

    const{
      symbol
    }=stockInfo;


    let triggerValue = window.prompt('Enter trigger value ', kitedata.ticks[symbol].lastTradedPrice);
    if(triggerValue == null || isNaN(triggerValue)){
    	return;
    }


	
	let stockA=kitedata.ticks[symbol].tradingsymbol;
	let exchangeA=kitedata.ticks[symbol].exchange;
	let constant_value= triggerValue;
	let operator=window.encodeURIComponent(opr);
	let rule_name= window.encodeURIComponent(`${symbol}  ${opr} ${triggerValue} - ${Date.now()}`);
	let payload = `name=${rule_name}&lhs_exchange=${exchangeA}&lhs_tradingsymbol=${stockA}&lhs_attribute=LastTradedPrice&operator=${operator}&rhs_type=constant&rhs_constant=${constant_value}`
  	createAlertOnSentinel(payload);




/* 
	let rule = btoa(`LastTradedPrice('${kitedata.ticks[symbol].exchange}:${kitedata.ticks[symbol].tradingsymbol}') ${opr} ${triggerValue}`);
	rule=window.encodeURIComponent(rule);
	let rule_name=window.encodeURIComponent(`${symbol}  ${opr} ${triggerValue} - ${Date.now()}`);
  	let aleretURL = `https://sentinel.zerodha.com/dashboard/advanced?rule=${rule}&rule_name=${rule_name}`;
 	window.open(aleretURL, "sentinel_alert", "width=1980,height=1080"); 	
*/

}



  render() {
 	
    const{
      isShowCandle,
      isShowDailyCandle,
      isSyncDayChart,
      minInterval,
      candleOptions,
      dailyCandleOptions,
      hPerformance,
      avg_Volume
    }=this.state;

    const{
      kitedata,
      updateKitePerfData,
      stockInfo,
      hideStokInfo,
      addToFavList,
      removeFromFavList,
      showFundamentalsDialog,
      updateMarginData,
      quoteData,
      isOpenGraph,
      positionsdata,
      holdingsdata,
      tradingviewdata,
      TFPropertyMap
    }=this.props;

    const{
      symbol,
      tableId
    }=stockInfo;



    let positions = undefined;
	if(holdingsdata && holdingsdata.data && positionsdata && positionsdata.data){
		let CNCPosition = positionsdata.data.net.find(obj=>obj.tradingsymbol==symbol && obj.product=='CNC');
		let MISPosition = positionsdata.data.net.find(obj=>obj.tradingsymbol==symbol && obj.product=='MIS');
		let HOLDPosition= holdingsdata.data.find(obj=>obj.tradingsymbol==symbol);

		if(CNCPosition || MISPosition || HOLDPosition){
			positions={};
			if(CNCPosition){
				positions.cnc={qty:CNCPosition.quantity,pnl:CNCPosition.pnl.toFixed(0),value:Math.round((CNCPosition.value)/1000)};
			}
			if(MISPosition){
				positions.mis={qty:MISPosition.quantity,pnl:MISPosition.pnl.toFixed(0),value:Math.round((MISPosition.value)/1000)};
			}
			if(HOLDPosition){
				let qty = HOLDPosition.quantity + HOLDPosition.t1_quantity;
				let profit = 	(HOLDPosition.quantity + HOLDPosition.t1_quantity)*HOLDPosition.last_price - (HOLDPosition.quantity + HOLDPosition.t1_quantity)*HOLDPosition.average_price;
				positions.hold={qty:qty,pnl:profit.toFixed(0),value:Math.round(qty*HOLDPosition.last_price/1000)};
			}
		}

	}


	let {d1,d2,d3,w1,w2,m1,m6,y1,y2,y3,y4,y5}=hPerformance || {};



    let hrefGraph = 'https://kite.zerodha.com/chart/ext/tvc/'+kitedata.ticks[symbol].exchange+'/'+kitedata.ticks[symbol].tradingsymbol+'/'+kitedata.ticks[symbol].token
////<td colSpan="2"><a rel='noreferrer' onClick={this.showFundamentalsDialog} target='_blank' href={hrefGraph}>{kitedata.ticks[symbol].tradingsymbol}</a></td> 
	let depth = kitedata.ticks[symbol].depth;


	let LC;let UC;
	if(quoteData){
		let quote = quoteData[kitedata.ticks[symbol].exchange+":"+symbol];
		if(quote){
			LC = quote.lower_circuit_limit;
			UC = quote.upper_circuit_limit;
		}
	}




    return (


    	<div className='stockInfo' >
    	{  isShowCandle && !isShowDailyCandle && candleOptions && <div className='stockCandleInfoFraph'><CanvasJSChart  options = {candleOptions}/></div>}
    	{  isShowCandle && isShowDailyCandle && dailyCandleOptions && <div className='stockCandleInfoFraph'><CanvasJSChart  options = {dailyCandleOptions}/></div>}


    	<p onDoubleClick={hideStokInfo} className='name'>{kitedata.ticks[symbol].name}</p>


      
    <div className="infoNPosition">	
    	<table className='stockInfoTable'>
		  <tbody>

		  	<tr> 
			  	<td colSpan="2" style={{cursor:'pointer',textDecoration:'underline'}} onClick={(evt)=>{window.open('https://www.screener.in/company/'+(symbol.endsWith('-BE')?symbol.replace('-BE',''):symbol)+'/consolidated/', "screenerPageView", "width=1980,height=1080");}} ><a rel='noreferrer' > </a>{kitedata.ticks[symbol].tradingsymbol}</td> 
		  	</tr>

		  	<tr> 
			  	<td>LTP</td> 
			  	<td>{kitedata.ticks[symbol].lastTradedPrice}</td> 
		  	</tr>

		  	<tr> 
			  	<td>Chg%</td> 
			  	<td className={kitedata.ticks[symbol].change<0?'red':'green'}>{(kitedata.ticks[symbol].change).toFixed(2)}%</td> 
		  	</tr>
		  	<tr> 
			  	<td>Up%</td> 
			  	<td>{((kitedata.ticks[symbol].lastTradedPrice - kitedata.ticks[symbol].lowPrice)*100/kitedata.ticks[symbol].lowPrice).toFixed(2)}%</td> 
		  	</tr>	
		  	<tr> 
			  	<td>Down%</td> 
			  	<td>{((kitedata.ticks[symbol].highPrice - kitedata.ticks[symbol].lastTradedPrice)*100/kitedata.ticks[symbol].highPrice).toFixed(2)}%</td> 
		  	</tr>	

		  	<tr> 
			  	<td>OP</td> 
			  	<td>{kitedata.ticks[symbol].openPrice}</td> 
		  	</tr>
		  	<tr> 
			  	<td>CL</td> 
			  	<td>{kitedata.ticks[symbol].closePrice}</td> 
		  	</tr>


		  { LC && 
		  	<tr> 
			  	<td>LC</td> 
			  	<td>{LC}</td> 
		  	</tr>
		  }

		  { UC && 
		  	<tr> 
			  	<td>UC</td> 
			  	<td>{UC}</td> 
		  	</tr>
		  }


 
		  	<tr className="grpah-prefButton"> 
			  	<td colSpan="2"><input onInput={this.onColorInput} type="color" className="favcolor" name="favcolor" value="#ff0000"></input>
			  	<button className="favButton"   onClick={(evt)=>{window.open(hrefGraph, "kiteAppGraph", "width=1980,height=1080");}} type="button">G</button> 
			  	<button className="favButton"   onClick={(evt)=>{this.setState({isShowCandle:!isShowCandle})}} type="button">C</button>

		        <div className="dropdown">
		          <button style={{backgroundColor:(isShowDailyCandle?'red':'initial')}} className="dropbtn favButton">D</button>
		          <div style={{minWidth:'20px'}} className="dropdown-content secFilter" >
		          	<a  style={{backgroundColor:(isShowDailyCandle?'red':'initial')}}  onClick={(evt)=>{this.setState({isShowDailyCandle:!isShowDailyCandle});  if(!isShowDailyCandle){localStorage.setItem('graphTimeFrame',"MINUTE")}else{localStorage.setItem('graphTimeFrame',"DAY")} }}  >E</a>
		          	<a style={{backgroundColor:(isSyncDayChart?'red':'initial')}}  onClick={(evt)=>{ this.setState({isSyncDayChart:!isSyncDayChart}); localStorage.setItem('isSyncDayChart',!isSyncDayChart)}}>R</a>
		            <a  style={{backgroundColor:(minInterval=='minute'?'darkseagreen':'initial')}}  onClick={(evt)=>{ this.fetchDailyLiveDataByMin('minute');    this.setState({minInterval:'minute'});  localStorage.setItem('minInterval',"minute"); }}  >1</a>
		            <a  style={{backgroundColor:(minInterval=='3minute'?'darkseagreen':'initial')}}  onClick={(evt)=>{   this.fetchDailyLiveDataByMin('3minute');  this.setState({minInterval:'3minute'});  localStorage.setItem('minInterval',"3minute"); }}   >3</a>
		            <a  style={{backgroundColor:(minInterval=='5minute'?'darkseagreen':'initial')}}  onClick={(evt)=>{   this.fetchDailyLiveDataByMin('5minute');  this.setState({minInterval:'5minute'});  localStorage.setItem('minInterval',"5minute"); }}   >5</a>
		            <a  style={{backgroundColor:(minInterval=='10minute'?'darkseagreen':'initial')}}  onClick={(evt)=>{   this.fetchDailyLiveDataByMin('10minute');  this.setState({minInterval:'10minute'});  localStorage.setItem('minInterval',"10minute"); }}   >10</a>
		            <a   style={{backgroundColor:(minInterval=='15minute'?'darkseagreen':'initial')}}  onClick={(evt)=>{ this.fetchDailyLiveDataByMin('15minute');  this.setState({minInterval:'15minute'});  localStorage.setItem('minInterval',"15minute"); }}  >15</a>
		            

		            <a  onClick={(evt)=>{ this.createAlert('>='); }}  >{'>='}</a>
		            <a   onClick={(evt)=>{ this.createAlert('<='); }}  >{'<='}</a>


		          </div>
		        </div>			  	

		       </td>  
		  	</tr>
		  </tbody>
		</table>	

		{positions && <table className="positionInfo">

			  <tbody>			  
			 	{positions.mis && <tr><td>M</td><td>{positions.mis.qty}</td><td>{positions.mis.value}k</td><td style={{color:(positions.mis.pnl>0?'green':'red')}} >{positions.mis.pnl}</td></tr> }
			 	{positions.cnc &&  <tr><td>C</td><td>{positions.cnc.qty}</td><td>{positions.cnc.value}k</td>  <td style={{color:(positions.cnc.pnl>0?'green':'red')}}>{positions.cnc.pnl}</td></tr>}
			 	{positions.hold &&  <tr><td>H</td><td>{positions.hold.qty}</td><td>{positions.hold.value}k</td><td style={{color:(positions.hold.pnl>0?'green':'red')}}>{positions.hold.pnl}</td></tr>}
			  </tbody>

			</table>	
		}

	</div>	


	{hPerformance &&
	    	<table className='stockInfoTable historyTable'>
			  <tbody>
			  	<tr> 
				  	<td>1D</td><td>{d1}</td> 
				</tr>
			  	<tr> 
				  	<td>2D</td><td>{d2}</td> 
				</tr>
			  	<tr> 
				  	<td>3D</td><td>{d3}</td> 
				</tr>
			  	<tr> 
				  	<td>1W</td><td>{w1}</td> 
				</tr>
			  	<tr> 
				  	<td>2W</td><td>{w2}</td> 
				</tr>
			  	<tr> 
				  	<td>1M</td><td>{m1}</td> 
				</tr>
			  	<tr> 
				  	<td>6M</td><td>{m6}</td> 
				</tr>
			  	<tr> 
				  	<td>1Y</td><td>{y1}</td> 
				</tr>
			  	<tr> 
				  	<td>2Y</td><td>{y2}</td> 
				</tr>
			  	<tr> 
				  	<td>3Y</td><td>{y3}</td> 
				</tr>
			  	<tr> 
				  	<td>4Y</td><td>{y4}</td> 
				</tr>
			  	<tr> 
				  	<td>5Y</td><td>{y5}</td> 
				</tr>					
			  </tbody>
			</table>	

	}
	    	

		<br/>
		

		<button className="favButton green"   onClick={(evt)=>{addToFavList(symbol,'0');}} type="button">A 0</button>
		<button className="favButton green"   onClick={(evt)=>{addToFavList(symbol,'MIS');}} type="button">MIS</button>
	    {tableId!=undefined &&	<button className="favButton red"   onClick={(evt)=>{removeFromFavList(symbol,tableId);}} type="button">R {tableId}</button> }


		<OrderWindow updateMarginData={updateMarginData} kitedata={kitedata} symbol={symbol} />

		<br/>
		{ tradingviewdata[symbol] && <div><span style={{fontWeight: 'bold'}}>52W:</span> {tradingviewdata[symbol].price_52_week_high?tradingviewdata[symbol].price_52_week_high.toFixed(0):''}&nbsp;-&nbsp;{tradingviewdata[symbol].price_52_week_low?tradingviewdata[symbol].price_52_week_low.toFixed(0):''} &nbsp; <span  style={{fontWeight: 'bold'}}>&nbsp;&nbsp;ATH:</span> {tradingviewdata[symbol].HighAll.toFixed(0)}</div>}

		
		<div style={{fontWeight: 'bold'}}>H: <span className='HLVdiv'>{kitedata.ticks[symbol].highPrice}</span>&nbsp;&nbsp;L: <span style={{'margin-right': '15px'}} className='HLVdiv'>{kitedata.ticks[symbol].lowPrice}</span>&nbsp;V: <span  style={{'margin-right': '15px'}}  className='HLVdiv'>{    (''+kitedata.ticks[symbol].volumeTradedToday).length <= 5 ?(kitedata.ticks[symbol].volumeTradedToday/1000).toFixed(1)+'K':(kitedata.ticks[symbol].volumeTradedToday/100000).toFixed(1)+'L'} &nbsp;<span style={{fontWeight: '500',color:'brown'}}>{avg_Volume!=0?(kitedata.ticks[symbol].volumeTradedToday/avg_Volume).toFixed(1)+'x':''}</span></span></div>
{ depth && depth.buy.length == 5 &&  depth.sell.length==5 &&

		<table className="bidTable">
		  <tbody>
		  
		  <tr></tr>

		  <tr>
			  <td className='blue'>{depth.buy[0].price}</td>
			  <td className='blue'>{depth.buy[0].quantity}</td>
			  <td className='red'>{depth.sell[0].price}</td>
			  <td className='red'>{depth.sell[0].quantity}</td>
		  </tr>

		  <tr>
			  <td className='blue'>{depth.buy[1].price}</td>
			  <td className='blue'>{depth.buy[1].quantity}</td>
			  <td className='red'>{depth.sell[1].price}</td>
			  <td className='red'>{depth.sell[1].quantity}</td>
		  </tr>

		  <tr>
			  <td className='blue'>{depth.buy[2].price}</td>
			  <td className='blue'>{depth.buy[2].quantity}</td>
			  <td className='red'>{depth.sell[2].price}</td>
			  <td className='red'>{depth.sell[2].quantity}</td>
		  </tr>

		  <tr>
			  <td className='blue'>{depth.buy[3].price}</td>
			  <td className='blue'>{depth.buy[3].quantity}</td>
			  <td className='red'>{depth.sell[3].price}</td>
			  <td className='red'>{depth.sell[3].quantity}</td>
		  </tr>

		  <tr>
			  <td className='blue'>{depth.buy[4].price}</td>
			  <td className='blue'>{depth.buy[4].quantity}</td>
			  <td className='red'>{depth.sell[4].price}</td>
			  <td className='red'>{depth.sell[4].quantity}</td>
		  </tr>		  		  		  
		 <tr></tr>
		  <tr>
			  <td colSpan="2" className='blue'>{kitedata.ticks[symbol].totalBuyQuantity}</td>
			  <td></td>
			  <td colSpan="2" className='red'>{kitedata.ticks[symbol].totalSellQuantity}</td>
			  <td></td>
		  </tr>
		  </tbody>
		</table>


}



	{symbol === 'NIFTY 50'  && TFPropertyMap && 

	<div style={{fontSize: '14px'}}>
		<p><span><b>S(30M)</b> {TFPropertyMap['NIFTY50_SUPPORT_30MIN'].split(',').slice(0,5).join(',')}</span>
			<br/>
			<span><b>S(D)</b> {TFPropertyMap['NIFTY50_SUPPORT_DAILY'].split(',').slice(0,5).join(',')}</span>	
		</p>


		<p><span><b>R(30M)</b> {TFPropertyMap['NIFTY50_RESISTENT_30MIN'].split(',').slice(0,5).join(',')}</span>
			<br/>
			<span><b>R(D)</b> {TFPropertyMap['NIFTY50_RESISTENT_DAILY'].split(',').slice(0,5).join(',')}</span>
		</p>
		

		<p><span><b>SH(30M)</b> {TFPropertyMap['NIFTY50_PREV_HIGH_1_30MIN']},{TFPropertyMap['NIFTY50_PREV_HIGH_2_30MIN']},{TFPropertyMap['NIFTY50_PREV_HIGH_3_30MIN']}</span>
			<br/>
			<span><b>SH(D)</b> {TFPropertyMap['NIFTY50_PREV_HIGH_1_DAILY']},{TFPropertyMap['NIFTY50_PREV_HIGH_2_DAILY']},{TFPropertyMap['NIFTY50_PREV_HIGH_3_DAILY']}</span>
		</p>

		<p><span><b>SL(30M)</b> {TFPropertyMap['NIFTY50_PREV_LOW_1_30MIN']},{TFPropertyMap['NIFTY50_PREV_LOW_2_30MIN']},{TFPropertyMap['NIFTY50_PREV_LOW_3_30MIN']}</span>
			<br/>
			<span><b>SL(D)</b> {TFPropertyMap['NIFTY50_PREV_LOW_1_DAILY']},{TFPropertyMap['NIFTY50_PREV_LOW_2_DAILY']},{TFPropertyMap['NIFTY50_PREV_LOW_3_DAILY']}</span>
		</p>

		<p><span><b>YH</b> {TFPropertyMap['NIFTY50_PREV_DAY_HIGH']}</span>
			<br/>
			<span><b>YL</b> {TFPropertyMap['NIFTY50_PREV_DAY_LOW']}</span>
		</p>
	</div>
	}
		

	{symbol === 'NIFTY BANK' && TFPropertyMap && 

	<div style={{fontSize: '14px'}}>
		<p><span><b>S(30M)</b> {TFPropertyMap['BANKNIFTY_SUPPORT_30MIN'].split(',').slice(0,5).join(',')}</span>
			<br/>
			<span><b>S(D)</b> {TFPropertyMap['BANKNIFTY_SUPPORT_DAILY'].split(',').slice(0,5).join(',')}</span>	
		</p>


		<p><span><b>R(30M)</b> {TFPropertyMap['BANKNIFTY_RESISTENT_30MIN'].split(',').slice(0,5).join(',')}</span>
			<br/>
			<span><b>R(D)</b> {TFPropertyMap['BANKNIFTY_RESISTENT_DAILY'].split(',').slice(0,5).join(',')}</span>
		</p>
		

		<p><span><b>SH(30M)</b> {TFPropertyMap['BANKNIFTY_PREV_HIGH_1_30MIN']},{TFPropertyMap['BANKNIFTY_PREV_HIGH_2_30MIN']},{TFPropertyMap['BANKNIFTY_PREV_HIGH_3_30MIN']}</span>
			<br/>
			<span><b>SH(D)</b> {TFPropertyMap['BANKNIFTY_PREV_HIGH_1_DAILY']},{TFPropertyMap['BANKNIFTY_PREV_HIGH_2_DAILY']},{TFPropertyMap['BANKNIFTY_PREV_HIGH_3_DAILY']}</span>
		</p>

		<p><span><b>SL(30M)</b> {TFPropertyMap['BANKNIFTY_PREV_LOW_1_30MIN']},{TFPropertyMap['BANKNIFTY_PREV_LOW_2_30MIN']},{TFPropertyMap['BANKNIFTY_PREV_LOW_3_30MIN']}</span>
			<br/>
			<span><b>SL(D)</b> {TFPropertyMap['BANKNIFTY_PREV_LOW_1_DAILY']},{TFPropertyMap['BANKNIFTY_PREV_LOW_2_DAILY']},{TFPropertyMap['BANKNIFTY_PREV_LOW_3_DAILY']}</span>
		</p>

		<p><span><b>YH</b> {TFPropertyMap['BANKNIFTY_PREV_DAY_HIGH']}</span>
			<br/>
			<span><b>YL</b> {TFPropertyMap['BANKNIFTY_PREV_DAY_LOW']}</span>
		</p>
	</div>


	}




    	</div>
    )
  }

}


export default StockInfo;
