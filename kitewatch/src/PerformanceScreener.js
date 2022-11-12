import React from 'react';
import './App.css';
import WatchList from './WatchList';

class PerformanceScreener extends React.Component {
  constructor(props) {
    super(props); 
    let kitedata = props.kitedata;
	this.symbolList = Object.keys(kitedata.ticks);
	this.performanceHistory = localStorage.getItem("performanceHistory")!=undefined ?JSON.parse(localStorage.getItem("performanceHistory")):{};
	this.state={};
  }



componentDidMount() {
	this.fetchPerformanceTicksData();
}


formatData =(jsonData)=>{
	this.performanceHistory =  jsonData;

	let performance = {};
	let keys = Object.keys(this.performanceHistory.ticks);
	for(let i=0;i<keys.length;i++){
		let hCandles = JSON.parse(this.performanceHistory.ticks[keys[i]]).data.candles;
		performance[keys[i]] =  {};
		performance[keys[i]].tradingsymbol =  keys[i];



		let d1,d2,d3,d4,d5,d6,w1,w2,w3,w4,m1,m2,m3,m4,m5,m6,y1,y2,y3,y4,y5;

		if(hCandles){
			let data=hCandles;
			let totalTick = data.length-1;
			let close = data[totalTick][4];

			d1=Number.parseInt(-(data[totalTick-1][4]-close)*100/data[totalTick-1][4]);
		    d2=Number.parseInt(-(data[totalTick-2][4]-close)*100/data[totalTick-2][4]);
		    d3=Number.parseInt(-(data[totalTick-3][4]-close)*100/data[totalTick-3][4]);
		    d4=Number.parseInt(-(data[totalTick-4][4]-close)*100/data[totalTick-4][4]);
		    d5=Number.parseInt(-(data[totalTick-5][4]-close)*100/data[totalTick-5][4]);
		    d6=Number.parseInt(-(data[totalTick-6][4]-close)*100/data[totalTick-6][4]);

		    w1=Number.parseInt(-(data[totalTick-5][4]-close)*100/data[totalTick-5][4]);
		    w2=Number.parseInt(-(data[totalTick-10][4]-close)*100/data[totalTick-10][4]);
		    w3=Number.parseInt(-(data[totalTick-15][4]-close)*100/data[totalTick-15][4]);
		    w4=Number.parseInt(-(data[totalTick-20][4]-close)*100/data[totalTick-20][4]);


			if(totalTick-23 >0 ){
				m1= Number.parseInt(-(data[totalTick-23][4]-close)*100/data[totalTick-23][4]);
			}
			if(totalTick-46 >0 ){
				m2= Number.parseInt(-(data[totalTick-46][4]-close)*100/data[totalTick-46][4]);
			}
			if(totalTick-69 >0 ){
				m3= Number.parseInt(-(data[totalTick-69][4]-close)*100/data[totalTick-69][4]);
			}
			if(totalTick-95 >0 ){
				m4= Number.parseInt(-(data[totalTick-95][4]-close)*100/data[totalTick-95][4]);
			}
			if(totalTick-123 >0 ){
				m5= Number.parseInt(-(data[totalTick-123][4]-close)*100/data[totalTick-123][4]);
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

		performance[keys[i]]['d1'] =  d1;
		performance[keys[i]]['d2'] =  d2;
		performance[keys[i]]['d3'] =  d3;
		performance[keys[i]]['d4'] =  d4;
		performance[keys[i]]['d5'] =  d5;
		performance[keys[i]]['d6'] =  d6;
		performance[keys[i]]['w1'] =  w1;
		performance[keys[i]]['w2'] =  w2;
		performance[keys[i]]['w3'] =  w3;
		performance[keys[i]]['w4'] =  w4;
		performance[keys[i]]['m1'] =  m1;
		performance[keys[i]]['m2'] =  m2;
		performance[keys[i]]['m3'] =  m3;
		performance[keys[i]]['m4'] =  m4;
		performance[keys[i]]['m5'] =  m5;
		performance[keys[i]]['m6'] =  m6;
		performance[keys[i]]['y1'] =  y1;
		performance[keys[i]]['y2'] =  y2;
		performance[keys[i]]['y3'] =  y3;
		performance[keys[i]]['y4'] =  y4;
		performance[keys[i]]['y5'] =  y5;


	}


	this.setState({performanceHistory:performance,symbolList:Object.keys(performance)});
}

fetchPerformanceTicksData =()=>{

      fetch(window.domain+'performaneHistorykite.json?v='+(new Date().getTime()))
        .then(response => response.json())
        .then(function(jsonData){
        	this.formatData(jsonData);
        }.bind(this))
        .catch((error) => {
          console.error(error)
        })
        
}


onTableRowclick=(data,tableId)=>{

    const{
      kitedata,	
      onTableRowclick,
    }=this.props;


    onTableRowclick(data,tableId,false);

    // tvc or ciq
    let hrefGraph = 'https://kite.zerodha.com/chart/ext/tvc/'+kitedata.ticks[data].exchange+'/'+kitedata.ticks[data].tradingsymbol+'/'+kitedata.ticks[data].token
    this.setState({hrefGraph:hrefGraph,symbol:data});    
}



onSymbolSelect=(evt)=>{
  let element = document.querySelectorAll('.performanceScreener tr[rowid="'+ evt.target.value +'"]');
  if(element && element.length>0){
    element[0].scrollIntoView();
    element[0].classList.remove('blinkRow');
    setTimeout((value)=>{document.querySelectorAll('.performanceScreener tr[rowid="'+ value +'"]')[0].classList.add('blinkRow')},50,evt.target.value);

    this.onTableRowclick(evt.target.value);
  }  
}


sortonKey=(key)=>{

    const{
		performanceHistory,
		symbolList
    }=this.state;


    symbolList.sort((t1, t2)=>{
      let v1 = performanceHistory[t1][key]!=undefined?performanceHistory[t1][key]:-9999 ;
      let v2 = performanceHistory[t2][key]!=undefined?performanceHistory[t2][key]:-9999 ;
      return v2 - v1;
    }); 
}



render() {
 	
    const{
      kitedata,
      showToast,
      addToFavList
    }=this.props;


    const{
		performanceHistory,
		symbol,
		hrefGraph,
		symbolList
    }=this.state;



 	return (
	      <div className="performanceScreener">       

		  { performanceHistory &&  

		  	<div>Time: {this.performanceHistory.time?this.performanceHistory.time:'no data'}

			  	<div className='tableContainer watchlistclass'>
			          <table>
			            <thead>
			            	<tr><th>Name</th>
			            	<th  onClick={(evt)=>{this.sortonKey('d1')}}>d1</th>
			            	<th  onClick={(evt)=>{this.sortonKey('d2')}}>d2</th>
			            	<th  onClick={(evt)=>{this.sortonKey('d3')}}>d3</th>
			            	<th  onClick={(evt)=>{this.sortonKey('d4')}}>d4</th>
			            	<th  onClick={(evt)=>{this.sortonKey('d5')}}>d5</th>
			            	<th  onClick={(evt)=>{this.sortonKey('d6')}}>d6</th>
			            	<th  onClick={(evt)=>{this.sortonKey('w1')}}>w1</th>
			            	<th   onClick={(evt)=>{this.sortonKey('w2')}}>w2</th>
			            	<th   onClick={(evt)=>{this.sortonKey('w3')}}>w3</th>
			            	<th   onClick={(evt)=>{this.sortonKey('w4')}}>w4</th>
			            	<th   onClick={(evt)=>{this.sortonKey('m1')}}>m1</th>
			            	<th   onClick={(evt)=>{this.sortonKey('m2')}}>m2</th>
			            	<th   onClick={(evt)=>{this.sortonKey('m3')}}>m3</th>
			            	<th   onClick={(evt)=>{this.sortonKey('m4')}}>m4</th>
			            	<th   onClick={(evt)=>{this.sortonKey('m5')}}>m5</th>
			            	<th  onClick={(evt)=>{this.sortonKey('m6')}}>m6</th>
			            	<th  onClick={(evt)=>{this.sortonKey('y1')}}>y1</th>
			            	<th  onClick={(evt)=>{this.sortonKey('y2')}}>y2</th>
			            	<th  onClick={(evt)=>{this.sortonKey('y3')}}>y3</th>
			            	<th  onClick={(evt)=>{this.sortonKey('y4')}}>y4</th>
			            	<th  onClick={(evt)=>{this.sortonKey('y5')}}>y5</th>
			            	</tr>
			            </thead>

			            <tbody>		            
			             	{ symbolList.map((symbol,index)=> <WatchListRow  onTableRowclick={this.onTableRowclick} key={symbol+index} kitedata={kitedata}  performanceData={performanceHistory[symbol]} />)}		            

			            </tbody>

			        </table>
			   	</div>

			   	{hrefGraph && <iframe className='screenerFrame' src={hrefGraph}></iframe> }
		   </div>


		  }


			<div className="screenerToolbar">	
				<div >S: {symbol}</div>
				<button className="favButton green"   onClick={(evt)=>{addToFavList(symbol,'0');}} type="button">A 0</button>
				<button className="favButton green"   onClick={(evt)=>{addToFavList(symbol,'MIS');}} type="button">MIS</button>			
			    <select className="" onChange={this.onSymbolSelect}>
			             { this.symbolList.map((symbol,index)=> <option key={index} value={symbol}>{symbol}</option>)}
			    </select>
			</div>		

	     </div>
    )
  }

}


export default PerformanceScreener;





class WatchListRow extends React.Component {
  constructor(props) {
    super(props);
  }

  onTableRowclick=()=>{
    this.props.onTableRowclick(this.props.performanceData.tradingsymbol,this.props.tableId);
  }


  render() {

    const{
      kitedata,
      performanceData,
      onTableRowclick
    }=this.props;


    return (
      <tr onClick={this.openStockInfo} onClick={this.onTableRowclick} rowId={performanceData.tradingsymbol}>
        <td >{performanceData.tradingsymbol}</td> 
        <td style={{color:(performanceData.d1>0?'green':'red')}}>{performanceData.d1}</td> 
        <td style={{color:(performanceData.d2>0?'green':'red')}}>{performanceData.d2}</td>  
        <td style={{color:(performanceData.d3>0?'green':'red')}}>{performanceData.d3}</td>  
        <td style={{color:(performanceData.d4>0?'green':'red')}}>{performanceData.d4}</td>  
        <td style={{color:(performanceData.d5>0?'green':'red')}}>{performanceData.d5}</td>  
        <td style={{color:(performanceData.d6>0?'green':'red')}}>{performanceData.d6}</td>  


        <td style={{color:(performanceData.w1>0?'green':'red')}}>{performanceData.w1}</td>  
        <td style={{color:(performanceData.w2>0?'green':'red')}}>{performanceData.w2}</td>  
        <td style={{color:(performanceData.w3>0?'green':'red')}}>{performanceData.w3}</td>  
        <td style={{color:(performanceData.w4>0?'green':'red')}}>{performanceData.w4}</td>  

        <td style={{color:(performanceData.m1>0?'green':'red')}}>{performanceData.m1}</td>  
        <td style={{color:(performanceData.m2>0?'green':'red')}}>{performanceData.m2}</td>  
        <td style={{color:(performanceData.m3>0?'green':'red')}}>{performanceData.m3}</td>  
        <td style={{color:(performanceData.m4>0?'green':'red')}}>{performanceData.m4}</td>  
        <td style={{color:(performanceData.m5>0?'green':'red')}}>{performanceData.m5}</td>  
        <td style={{color:(performanceData.m6>0?'green':'red')}}>{performanceData.m6}</td>  

        <td style={{color:(performanceData.y1>0?'green':'red')}}>{performanceData.y1}</td>  
        <td style={{color:(performanceData.y2>0?'green':'red')}}>{performanceData.y2}</td>  
        <td style={{color:(performanceData.y3>0?'green':'red')}}>{performanceData.y3}</td>               
        <td style={{color:(performanceData.y4>0?'green':'red')}}>{performanceData.y4}</td>  
        <td style={{color:(performanceData.y5>0?'green':'red')}}>{performanceData.y5}</td>  
        <td style={{color:(performanceData.y6>0?'green':'red')}}>{performanceData.y6}</td>  
       </tr>
    );


  }

}