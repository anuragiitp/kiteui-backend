
import React from 'react';
import './App.css';
import WatchList from './WatchList';

class AllStocksScreener extends React.Component {
  constructor(props) {
    super(props); 

    let kitedata = props.kitedata;

	  let tempSortedTicks = Object.keys(kitedata.ticks);
	  let sortedTicks = [];
	  for(let i=0;i<tempSortedTicks.length;i++){
	    if(kitedata.ticks[tempSortedTicks[i]].exchange == 'NFO') continue;
	    sortedTicks.push(tempSortedTicks[i]);
	  }  

	  sortedTicks.sort(function(t1, t2){return kitedata.ticks[t2].change - kitedata.ticks[t1].change});

     this.state={symbolList:sortedTicks};
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
  let element = document.querySelectorAll('.allStocksScreener tr[rowid="'+ evt.target.value +'"]');
  if(element && element.length>0){
    element[0].scrollIntoView();
    element[0].classList.remove('blinkRow');
    setTimeout((value)=>{document.querySelectorAll('.allStocksScreener tr[rowid="'+ value +'"]')[0].classList.add('blinkRow')},50,evt.target.value);

    this.onTableRowclick(evt.target.value);
  }  
}


render() {
 	
    const{
      kitedata,
      onTableRowclick,
      showToast,
      addToFavList
    }=this.props;


    const{
      symbolList,
      hrefGraph,
      symbol
    }=this.state;



 	return (
	      <div className="allStocksScreener">       
	      	{kitedata && <div className='tableContainer watchlistclass'><WatchList  onTableRowclick={this.onTableRowclick} kitedata={kitedata} symbolList={symbolList}/></div>}

	      	
			{hrefGraph && <iframe className='screenerFrame' src={hrefGraph}></iframe> }



		<div className="screenerToolbar">	
			<div >S: {symbol}</div>
			<button className="favButton green"   onClick={(evt)=>{addToFavList(symbol,'0');}} type="button">A 0</button>
			<button className="favButton green"   onClick={(evt)=>{addToFavList(symbol,'MIS');}} type="button">MIS</button>			
      <select className="" onChange={this.onSymbolSelect}>
             { symbolList.map((symbol,index)=> <option key={index} value={symbol}>{symbol}</option>)}
      </select>
		</div>		

	     </div>
    )
  }

}


export default AllStocksScreener;
