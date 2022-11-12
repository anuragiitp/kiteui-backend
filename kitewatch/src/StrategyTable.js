import React from 'react';
import './App.css';

import {getFullQuote,createBasket,addToBasket} from './OrderUtil';
import { AiFillDelete} from 'react-icons/ai'
import toaster from "toasted-notes";
import "toasted-notes/src/styles.css"; 



class StrategyTable extends React.Component {
  constructor(props) {
    super(props); 
    this.state={};
    this.state.tableData={};

    let favStrategyList=localStorage.getItem('favStrategyList')?JSON.parse(localStorage.getItem('favStrategyList')):{};
    this.state.favStrategyList= favStrategyList;
  }



  componentDidMount() {
	this.fetchMarketQuote();
	this.refrehInterval=window.setInterval(this.fetchMarketQuote, 2500);
  }


  componentWillUnmount() {
	window.clearInterval(this.refrehInterval);
  }


showToastMsg=(content)=>{
    toaster.notify(content, {
      position: "top-right", // top-left, top, top-right, bottom-left, bottom, bottom-right
      duration: 3000 // This notification will not automatically close
    });		
}

onBAKAddSuccess=(data)=>{
	this.showToastMsg((<span className={'green'}>{JSON.stringify(data)}</span>));
}
onBAKAddError=(data)=>{
	this.showToastMsg((<span className={'red'}>{JSON.stringify(data)}</span>));
}


onBAKCreatSuccess=(data)=>{
	let{
		kiteAllSymbols,
		strategyList
	}=this.props;


	let activeStrategie = strategyList[this.isPendingBAK];
	let symbols = Object.keys(activeStrategie);
	for(let i=0;i<symbols.length;i++){
		let str = activeStrategie[symbols[i]];
		let exchange = kiteAllSymbols[symbols[i]].exchange;
		let qty= symbols[i].startsWith('NIFTY')?100:100;
		qty=qty*str.qty; //multiple factor
		let transaction_type=str.side=='BUY'?'BUY':'SELL';
		let payload = `tradingsymbol=${symbols[i]}&exchange=${exchange}&weight=${i}&params=%7B%22transaction_type%22%3A%22${transaction_type}%22%2C%22product%22%3A%22MIS%22%2C%22order_type%22%3A%22MARKET%22%2C%22validity%22%3A%22DAY%22%2C%22variety%22%3A%22regular%22%2C%22quantity%22%3A${qty}%2C%22price%22%3A0%2C%22trigger_price%22%3A0%2C%22disclosed_quantity%22%3A0%7D`;
		addToBasket(data.data,payload,this.onBAKAddSuccess,this.onBAKAddError);
	}

	this.isPendingBAK=undefined;
	this.showToastMsg((<span className={'green'}>{JSON.stringify(data)}</span>));
}





onBAKCreateError=(data)=>{
	this.showToastMsg((<span className={'red'}>{JSON.stringify(data)}</span>));
}


onAddtoBasketStrategy=(name)=>{
	if(!this.isPendingBAK){
		let {
			favStrategyList
		}=this.state;
		createBasket(name,this.onBAKCreatSuccess,this.onBAKCreateError);
		this.isPendingBAK=name;		
	}else{
		this.showToastMsg((<span className={'red'}>Pending {this.isPendingBAK}</span>));
	}
}


onSaveBasketStrategy=(name)=>{
	let{
		kiteAllSymbols,
		strategyList
	}=this.props;

	let baksetData=[];

	let activeStrategie = strategyList[name];
	let symbols = Object.keys(activeStrategie);
	for(let i=0;i<symbols.length;i++){
		let str = activeStrategie[symbols[i]];
		let exchange = kiteAllSymbols[symbols[i]].exchange;
		let qty= symbols[i].startsWith('NIFTY')?100:100;
		qty=qty*str.qty; //multiple factor
		let transaction_type=str.side=='BUY'?'BUY':'SELL';
		
		let tempdata = JSON.parse('{"instrument":{"tradingsymbol":"BANKNIFTY2181836100CE","exchange":"NFO"},"weight":0,"params":{"transactionType":"SELL","product":"MIS","orderType":"MARKET","validity":"DAY","quantity":100,"price":0,"triggerPrice":0,"variety":"regular","disclosed_quantity":0}}')
		tempdata['instrument'].tradingsymbol=symbols[i];
		tempdata['instrument'].exchange=exchange;
		tempdata['params'].transactionType=transaction_type;
		tempdata['params'].quantity=qty;

		baksetData.push(tempdata);
	}

	let fileContent = JSON.stringify(baksetData);
	let bb = new Blob([fileContent ], { type: 'text/plain' });
	let a = document.createElement('a');
	a.download = name+'.json';
	a.href = window.URL.createObjectURL(bb);
	a.click();
//	console.info(JSON.stringify(baksetData));
}


onFavBTNClick=(name)=>{
	let {
		favStrategyList
	}=this.state;

	let favData = favStrategyList[name];
	if(favData){
		favData.isFav=!favData.isFav;
	}else{
		favData={isFav:true};
	}
	
	favStrategyList[name]=favData;	
	localStorage.setItem('favStrategyList',JSON.stringify(favStrategyList));
	this.setState({favStrategyList:favStrategyList});
}



 onFetchMarketQuoteSuccess=(data)=>{
   if(this.quoteData){
      let keys = Object.keys(data.data);
      for(let i=0;i<keys.length;i++){
        this.quoteData[keys[i]]=data.data[keys[i]];
      }
   }else{
      this.quoteData=data.data;
   }

   this.createtableData();
   this.props.onPriceFetched(this.quoteData);

 }

 
 onFetchMarketQuoteError=(data)=>{
   window.alert('Error to fetch Market Quotes');
 }



 fetchMarketQuote=()=>{
	let{
		kiteAllSymbols,
		strategyList
	}=this.props;


	let symbols=[];
	let skeys= Object.keys(strategyList);
	skeys.map((key,index)=>{ Array.prototype.push.apply(symbols,Object.keys(strategyList[key]))  });

	  if(kiteAllSymbols){
	      let queryString = '';
	      for(let i=0;i<symbols.length;i++){
	      	if(kiteAllSymbols[symbols[i]] == undefined){
	      		continue;
	      	}

	        queryString += ('i='+ kiteAllSymbols[symbols[i]].exchange +":" + kiteAllSymbols[symbols[i]].tradingsymbol +'&');
	        if(i==499 || i==symbols.length-1){
	          getFullQuote(queryString,this.onFetchMarketQuoteSuccess,this.onFetchMarketQuoteError);
	          queryString='';
	        }        
	      }      
	  }else{
	    window.alert('Unable to fetch Market Quotes');
	  }
}







createtableData=(newStrategyList)=>{
	let{
		kiteAllSymbols,
		strategyList
	}=this.props;

	if(newStrategyList){
		strategyList=newStrategyList;
		this.fetchMarketQuote();
		return;
	}


	let tableData={};

	let allStrategy = Object.keys(strategyList);
	for(let i=0;i<allStrategy.length;i++){
		let strName =  allStrategy[i];
		let activeStrategie= strategyList[strName];

		let rowdata = {name:strName,change:0,ltp:0,open:0,high:0,low:0};
		tableData[allStrategy[i]]=rowdata;

		let allStrSymbols = Object.keys(activeStrategie);

		for(let k=0;k<allStrSymbols.length;k++){
			if(kiteAllSymbols[allStrSymbols[k]] == undefined){
				continue;
			}

			let exchangeSymbolKey =  kiteAllSymbols[allStrSymbols[k]].exchange+":"+allStrSymbols[k];
			if(this.quoteData == undefined || this.quoteData[exchangeSymbolKey] == undefined){
				continue;
			}

			let fact = activeStrategie[allStrSymbols[k]].qty;
			if(activeStrategie[allStrSymbols[k]].side=='BUY'){
				fact = -1*fact;
			}

			rowdata.ltp = rowdata.ltp + (fact*  this.quoteData[exchangeSymbolKey].last_price );
			rowdata.open = rowdata.open + (fact*  this.quoteData[exchangeSymbolKey].ohlc.close );
		}


		rowdata.change=(rowdata.ltp - rowdata.open).toFixed(0);  //POINTS CHANGE

	}

	this.setState({tableData:tableData});
}




render() { 	
	const{
		tableData,
		favStrategyList
	}=this.state;


	const{
		kiteAllSymbols,
		onSelectStrategy,
		onDeltrategyStrategy
	}=this.props;




	return (

			<div  className="strategyTable">

	          <table>
	            <thead>
	              <tr>
	                <th>Name</th>
	                <th>LTP</th>
	                <th>Open</th>
	                <th>%Ch</th>
	                <th>Action</th>
	              </tr>
	            </thead>

	            <tbody>
	            
	             { Object.keys(tableData).map((name,index)=> <StrategyTableRow onAddtoBasketStrategy={this.onSaveBasketStrategy} onFavBTNClick={this.onFavBTNClick} onSelectStrategy={onSelectStrategy} onDeltrategyStrategy={onDeltrategyStrategy}  favData={favStrategyList[name]} rowId={name} rowData={tableData[name]} key={'STR_TABLE '+name}/> )}
	             
	            </tbody>
	            

	        </table>



			</div>
		);



  }




}


export default StrategyTable;




class StrategyTableRow extends React.Component {
  constructor(props) {
    super(props); 
  }



render() { 	

	const{
		rowData,
		onSelectStrategy,
		onDeltrategyStrategy,
		favData,
		onFavBTNClick,
		onAddtoBasketStrategy
	}=this.props;

    let changeClass  = rowData.change<0 ?'red':'green';

	let favClass  = (favData && favData.isFav) ?'red':'green';


	return (		
			<tr  className="strategyTableRow">
				<td    style={ {backgroundColor:(favData && favData.isFav)?'lavender':''} } onDoubleClick={(evt)=>{ onSelectStrategy({target:{value:rowData.name}}); }} >{rowData.name}</td>
				<td>{rowData.ltp.toFixed(2)}</td>
				<td>{rowData.open.toFixed(2)}</td>
				<td className={changeClass}>{rowData.change}</td>
				<td className="strategyTableAction" >
					<button className="strategyTableDELBtn" style={{backgroundColor:'grey'}} onClick={ (evt)=>{onDeltrategyStrategy(rowData.name)} }> DL </button>
					<button className="strategyTableBAKBtn" style={{backgroundColor:'grey'}} onClick={ (evt)=>{onAddtoBasketStrategy(rowData.name)} }> BK </button>
					<button className="strategyTableFAVBtn" style={{backgroundColor:'grey'}} onClick={ (evt)=>{onFavBTNClick(rowData.name)} }> FV </button>
				</td>
			</tr>
		);



  }




}