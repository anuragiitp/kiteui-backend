import React from 'react';
import './App.css';
import StrategyRowSelector from './StrategyRowSelector';
import StrategyItemRowView from './StrategyItemRowView';
import ValueGraph from './ValueGraph';
import StrategyTable from './StrategyTable';
import OptionSLOrder from './OptionSLOrder';
import {getPosition,showToastMsg} from './OrderUtil';


class OPSStrategyScreener extends React.Component {
  constructor(props) {
    super(props); 
    let strategyList=localStorage.getItem('strategyList')?JSON.parse(localStorage.getItem('strategyList')):{};
    this.state={};
    this.state.strategyList= strategyList?strategyList:{};
    this.state.activeStrategie=strategyList['Temp']?strategyList['Temp']:{};
    this.state.NiftybankniftySLLimit=localStorage.getItem('SLLimitNiftyBanknifty')?JSON.parse(localStorage.getItem('SLLimitNiftyBanknifty')):{'Nifty':15,'Banknifty':35,enable:false};

    const{
		kiteAllSymbols
	}=props;


	this.state.newKiteAllSymbols={};
          
    kiteAllSymbols.allSymbols.map((item,i)=> { 
       if(item.exchange == 'NFO'){
        if(item.name == 'NIFTY' || item.name == 'BANKNIFTY'){
          if(item.segment=='NFO-OPT' || item.segment=='NFO-FUT'){
          	this.state.newKiteAllSymbols[item.tradingsymbol]=item;
          }
        }                 
      }
    });
      

  }


getId=()=>{
	let d = new Date();
	return d.getTime();
}

componentDidMount() {
	this.fetchPositionData();
	this.interval = setInterval(this.fetchPositionData, 2000);
}

componentWillUnmount(){
	clearInterval( this.interval );
}


addStrategyItem=(rowValues,rowId)=>{

	const{
		activeStrategie
	}=this.state;

	if(!rowId){
		activeStrategie[rowValues.symbol]=rowValues;
	}else{
		if(rowId != rowValues.symbol){
			delete activeStrategie[rowId];
		}		
		activeStrategie[rowValues.symbol]=rowValues;
	}
	this.setState({editRowId:undefined,activeStrategie:activeStrategie});

	this.addToLocalStore('Temp',activeStrategie);
}



onEditStrategyItem=(rowId)=>{
	this.setState({editRowId:rowId});
}

onDeltrategyItem=(rowId)=>{
	const{
		activeStrategie
	}=this.state;

	delete activeStrategie[rowId];
	this.setState({activeStrategie: activeStrategie});
	this.addToLocalStore('Temp',activeStrategie);

}

onDeltrategyStrategy=(rowId)=>{
	const{
		strategyList
	}=this.state;
	let temp = strategyList[rowId];
	delete strategyList[rowId];
	this.setState({strategyList: strategyList});
	this.addToLocalStore('Temp',temp);
	if(this.strategyTableRef){
		this.strategyTableRef.createtableData(strategyList);
	}
	
}



printStrategyRow=(strategy,isPositionRow)=>{

	const{
		editRowId,
		newKiteAllSymbols,
		NiftybankniftySLLimit
	}=this.state;

	    const{
			kitedata
		}=this.props;	

	return Object.keys(strategy).map((key,keyindex)=>{
			return( <StrategyItemRowView isPositionRow={isPositionRow} kitedata={kitedata} key={key} NiftybankniftySLLimit={NiftybankniftySLLimit} quoteData={this.quoteData} kiteAllSymbols={newKiteAllSymbols} onDeltrategyItem={this.onDeltrategyItem} onEditStrategyItem={this.onEditStrategyItem} isSelected={editRowId==key} rowId={key} rowValues={strategy[key]} />
					);

		});

}


addToLocalStore=(name,strategy)=>{
	let{
		strategyList
	}=this.state;

//	let strategyList=localStorage.getItem('strategyList')?JSON.parse(localStorage.getItem('strategyList')):{};
	strategyList[name]=strategy;
	localStorage.setItem('strategyList',JSON.stringify(strategyList));
	this.state.strategyList=strategyList;
	this.setState({strategyList:strategyList});
}



onSelectStrategy=(evt)=>{
	let{
		strategyList
	}=this.state;

	let copyValue = JSON.parse(JSON.stringify(strategyList[evt.target.value]));
	this.setState({activeStrategie: copyValue , activeStrategieName:evt.target.value});
}



onSaveStrategy=(e)=>{
	let{
		strategyList,
		activeStrategie
	}=this.state;

	const name = window.prompt('Strategy Name');
	if(name!=undefined){
		this.addToLocalStore(name,activeStrategie);
		this.addToLocalStore('Temp',activeStrategie);
	}	

	let copyValue = JSON.parse(JSON.stringify(activeStrategie));
	this.setState({activeStrategie: copyValue});

	if(this.strategyTableRef){
		this.strategyTableRef.createtableData(strategyList);
	}	
}


onPlotStrategy=(e)=>{
	if(this.valueGraphRef){
		this.valueGraphRef.updateCandleData();
	}	
}

onPlotAllStrategy=(e)=>{
	if(this.valueGraphRef){
		this.valueGraphRef.updateCandleData(true);
	}	
}


onPriceFetched=(quoteData)=>{
	 this.quoteData=quoteData;
}


onClearAllSTR=()=>{
	localStorage.setItem('strategyList','{}');
	this.setState({strategyList:{}});
	this.strategyTableRef.createtableData({});
}




createSDStrategy=(underline,dateString,strike)=>{

	let fleg ={symbol:'',side:'SELL',qty:1};
	let sleg ={symbol:'',side:'SELL',qty:1};

	let sName = underline+' '+strike +" A";

	fleg.symbol = underline + dateString + strike + 'CE';
	sleg.symbol = underline + dateString + strike +'PE';

	let trade = {}; 
	trade[fleg.symbol]=fleg;
	trade[sleg.symbol]=sleg;

	this.addToLocalStore(sName,trade);

	return trade;	
}


createSGStrategy=(underline,dateString,ceStrike,peStrike)=>{

	let fleg ={symbol:'',side:'SELL',qty:1};
	let sleg ={symbol:'',side:'SELL',qty:1};

	let sName = underline+' '+peStrike+"/"+ceStrike +" A";

	fleg.symbol = underline + dateString + ceStrike + 'CE';
	sleg.symbol = underline + dateString + peStrike +'PE';

	let trade = {}; 
	trade[fleg.symbol]=fleg;
	trade[sleg.symbol]=sleg;

	this.addToLocalStore(sName,trade);

	return trade;
}


createICStrategy=(underline,dateString,ceStrike,peStrike)=>{

	let fleg ={symbol:'',side:'SELL',qty:1};
	let flegBUY ={symbol:'',side:'BUY',qty:1};
	let sleg ={symbol:'',side:'SELL',qty:1};
	let slegBUY ={symbol:'',side:'BUY',qty:1};

	let sName = underline+' '+peStrike+"/"+ceStrike +" (IC) A";

	fleg.symbol = underline + dateString + ceStrike + 'CE';
	sleg.symbol = underline + dateString + peStrike +'PE';

	flegBUY.symbol = underline + dateString + (ceStrike + 400) + 'CE';
	slegBUY.symbol = underline + dateString + (peStrike - 400) +'PE';


	let trade = {}; 
	trade[flegBUY.symbol]=flegBUY;
	trade[slegBUY.symbol]=slegBUY;	
	trade[fleg.symbol]=fleg;
	trade[sleg.symbol]=sleg;

	this.addToLocalStore(sName,trade);

	return trade;
}



createCEPESpread=(underline,dateString,type,strike,strikeGap)=>{

	let fleg ={symbol:'',side:'BUY',qty:1};
	let sleg ={symbol:'',side:'SELL',qty:1};


	let sName = (type=='CE')?( underline+' '+strike +" (CS) A"):( underline+' '+strike +" (PS) A")

	strikeGap = (type=='CE')?strikeGap:-strikeGap;



	fleg.symbol = underline + dateString + (strike )+ type;
	sleg.symbol = underline + dateString + (strike + strikeGap )+ type;

	let trade = {}; 
	trade[fleg.symbol]=fleg;
	trade[sleg.symbol]=sleg;

	this.addToLocalStore(sName,trade);

	return trade;	
}


createSELLNCCEPE=(underline,dateString,type,strike,strikeGap)=>{

	let fleg ={symbol:'',side:'SELL',qty:1};
	let sleg ={symbol:'',side:'BUY',qty:1};


	let sName = (type=='CE')?( underline+' '+strike +" (NCE) A"):( underline+' '+strike +" (NPE) A")

	strikeGap = (type=='CE')?strikeGap:-strikeGap;



	fleg.symbol = underline + dateString + (strike )+ type;
	sleg.symbol = underline + dateString + (strike + strikeGap )+ type;

	let trade = {}; 
	trade[sleg.symbol]=sleg;
	trade[fleg.symbol]=fleg;
	

	this.addToLocalStore(sName,trade);


	return trade;	
}




createAllStrike=(underline,dateString,type,strike,strikeGap)=>{

	let trade ={};
	let limit= 50;
	let sName = (type=='CE')?( underline + " ( CE ) A"):( underline+" ( PE ) A")

	strike = strike - ((type=='CE')?15:35)*strikeGap;

	for(let i=0;i<limit;i++){
		let fleg ={symbol:'',side:'BUY',qty:1};
		fleg.symbol = underline + dateString + (strike )+ type;
		trade[fleg.symbol]=fleg;
		strike=strike+strikeGap;
	}

	this.addToLocalStore(sName,trade);

	return trade;	

}


createOTMStrike=(underline,dateString,strike,strikeGap)=>{

	let trade ={};
	let limit= underline=='NIFTY'?8:12;
	let sName = underline+" OTM"

	for(let i=limit-1;i>=0;i--){
		let fleg ={symbol:'',side:'SELL',qty:1};
		fleg.symbol = underline + dateString + (strike  -i*strikeGap)+ 'PE';
		trade[fleg.symbol]=fleg;
	}

	for(let i=0;i<limit;i++){
		let fleg ={symbol:'',side:'SELL',qty:1};
		fleg.symbol = underline + dateString + (strike  + i*strikeGap)+ 'CE';
		trade[fleg.symbol]=fleg;
	}

	this.addToLocalStore(sName,trade);

	return trade;	

}


createITMStrike=(underline,dateString,strike,strikeGap)=>{

	let trade ={};
	let limit= 12;
	let sName = underline+" ITM"

	for(let i=limit-1;i>=0;i--){
		let fleg ={symbol:'',side:'SELL',qty:1};
		fleg.symbol = underline + dateString + (strike  -i*strikeGap)+ 'CE';
		trade[fleg.symbol]=fleg;
	}

	for(let i=0;i<limit;i++){
		let fleg ={symbol:'',side:'SELL',qty:1};
		fleg.symbol = underline + dateString + (strike  + i*strikeGap)+ 'PE';
		trade[fleg.symbol]=fleg;
	}


	this.addToLocalStore(sName,trade);

	return trade;	

}


onRefreshStrategy=(e)=>{
	this.onClearAllSTR();
	this.onCreateSDSG(null,true);
	// setTimeout(()=>{this.onCreateSDSG(null,true);},500 );	
}


onCreateSDSG=(e,isRefresh)=>{
	const dateString = isRefresh==true?localStorage.getItem('OPTDateString'):window.prompt('Enter date/year string (21-7-01)');

	if(dateString!=undefined){

		localStorage.setItem('OPTDateString',dateString);

	    const{
			kitedata
		}=this.props;

		let niftyLevel =  Math.round(  kitedata.ticks['NIFTY 50'].lastTradedPrice / 100)*100;
		let bankNIftyLevel = Math.round(  kitedata.ticks['NIFTY BANK'].lastTradedPrice / 100)*100;


		if(isRefresh !== true){
			const niftyInput = window.prompt('Enter Nifty level:');
			if(niftyInput){
				niftyLevel= parseInt(niftyInput);
			}

			const bankNiftyInput = window.prompt('Enter BankNifty level:');
			if(bankNiftyInput){
				bankNIftyLevel= parseInt(bankNiftyInput);
			}
		}

		this.addToLocalStore("MIS_POSITION",{});

		this.createOTMStrike('BANKNIFTY',dateString,bankNIftyLevel,100);
		this.createAllStrike('BANKNIFTY',dateString,'CE',bankNIftyLevel,100);
		this.createAllStrike('BANKNIFTY',dateString,'PE',bankNIftyLevel,100);
		this.createITMStrike('BANKNIFTY',dateString,bankNIftyLevel,100);

		this.createOTMStrike('NIFTY',dateString,niftyLevel,50);
		this.createAllStrike('NIFTY',dateString,'CE',niftyLevel,50);
		this.createAllStrike('NIFTY',dateString,'PE',niftyLevel,50);
		this.createITMStrike('NIFTY',dateString,niftyLevel,50);


		//Fill BANKNIFTY SD
		for(let i=0;i<8 ;i++){
			let strike =  bankNIftyLevel -400  + 100*i;
			this.createSDStrategy('BANKNIFTY',dateString,strike);
		}



		//Fill BANKNIFTY SG
		for(let i=0;i<=16 ;i++){
			let ceStrike =  bankNIftyLevel   + 100*i;
			let peStrike =  bankNIftyLevel   - 100*i;
			this.createSGStrategy('BANKNIFTY',dateString,ceStrike,peStrike);
		}


		//Fill NIFTY SD
		for(let i=0;i<8 ;i++){
			let strike =  niftyLevel -400  + 100*i;
			this.createSDStrategy('NIFTY',dateString,strike);
		}


		//Fill NIFTY SG
		for(let i=0;i<16 ;i++){
			let ceStrike =  niftyLevel   + 100*i;
			let peStrike =  niftyLevel   - 100*i;
			this.createSGStrategy('NIFTY',dateString,ceStrike,peStrike);
		}





		//Fill NIFTY IC
		for(let i=1;i<9 ;i++){
			let ceStrike =  niftyLevel   + 100*i;
			let peStrike =  niftyLevel   - 100*i;
			this.createICStrategy('NIFTY',dateString,ceStrike,peStrike);
		}


		//Fill BANKNIFTY IC
		for(let i=1;i<=15 ;i++){
			let ceStrike =  bankNIftyLevel   + 100*i;
			let peStrike =  bankNIftyLevel   - 100*i;
			this.createICStrategy('BANKNIFTY',dateString,ceStrike,peStrike);
		}




		//Fill NIFTY CE Spread
		for(let i=0;i<8 ;i++){
			let strike =  niftyLevel + 50  + 100*i;
			this.createCEPESpread('NIFTY',dateString,'CE',strike,200);
		}
		//Fill BANKNIFTY CE Spread
		for(let i=0;i<=8 ;i++){
			let strike =  bankNIftyLevel + 100  + 100*i;
			this.createCEPESpread('BANKNIFTY',dateString,'CE',strike,400);
		}


		//Fill NIFTY PE Spread
		for(let i=0;i<8 ;i++){
			let strike =  niftyLevel - 50  - 100*i;
			this.createCEPESpread('NIFTY',dateString,'PE',strike,200);
		}
		//Fill BANKNIFTY CE Spread
		for(let i=0;i<=8;i++){
			let strike =  bankNIftyLevel - 100  - 100*i;
			this.createCEPESpread('BANKNIFTY',dateString,'PE',strike,400);
		}



		// ADD naked OTM cell/PE sell with deep OTM headge
		
		for(let i=0;i<8 ;i++){
			let strike =  niftyLevel + 100  + 100*i;
			this.createSELLNCCEPE('NIFTY',dateString,'CE',strike,500);
		}

		for(let i=0;i<=8 ;i++){
			let strike =  bankNIftyLevel + 200  + 100*i;
			this.createSELLNCCEPE('BANKNIFTY',dateString,'CE',strike,1300);
		}

		for(let i=0;i<5 ;i++){
			let strike =  niftyLevel - 100  - 100*i;
			this.createSELLNCCEPE('NIFTY',dateString,'PE',strike,500);
		}

		for(let i=0;i<=8;i++){
			let strike =  bankNIftyLevel - 200  - 100*i;
			this.createSELLNCCEPE('BANKNIFTY',dateString,'PE',strike,1300);
		}



		if(this.strategyTableRef){
			this.strategyTableRef.createtableData(this.state.strategyList);
		}

	}	
}

placeFNOSLOrders=()=>{
	let osl = new OptionSLOrder();
	osl.resetFNOSLOrders();
}

cancelSLOrders=()=>{
	let osl = new OptionSLOrder();
	osl.cancelSLOrders();
}



placeOrdersForStrategy=()=>{
	const{
		activeStrategie
	}=this.state;

	let osl = new OptionSLOrder();
	osl.placeOrdersForStrategy(activeStrategie);
}


enableSLorderBuySell=(isChange)=>{

	const{
		NiftybankniftySLLimit
	}=this.state;

	if(isChange==true){

	    let limit=  window.prompt('Nifty order SL limit : ->'+ '\n');
	     if(limit != null && !isNaN(limit)){
	      NiftybankniftySLLimit['Nifty']=limit;
	     }


	     limit=  window.prompt('Banknifty order SL limit : ->'+ '\n');
	     if(limit !=null && !isNaN(limit)){
	      NiftybankniftySLLimit['Banknifty']=limit;
	     }

	}else{
		NiftybankniftySLLimit.enable = !NiftybankniftySLLimit.enable;
	}


	if(NiftybankniftySLLimit.enable){
		window.alert('SL limit for Nifty ' + NiftybankniftySLLimit['Nifty'] +"\nBanknifty "+NiftybankniftySLLimit['Banknifty']);
	}
	localStorage.setItem('SLLimitNiftyBanknifty',JSON.stringify(NiftybankniftySLLimit));
	this.setState({NiftybankniftySLLimit:NiftybankniftySLLimit});
}



createStrategyFromMISPosition=()=>{
    const{
      kitedata,
  //    positionsdata
    }=this.props;

    //REVERT

    const{
      positionsdata
    }=this.state;


    let trade = {}; 

    if(positionsdata){
    	let positions = positionsdata.data.net.filter((data)=>{return data.product == 'MIS' && data.exchange=='NFO' && ( data.tradingsymbol.startsWith('BANKNIFTY')  || data.tradingsymbol.startsWith('NIFTY'))});

		 positions.sort(function(a, b){
				if(a.quantity != 0 && b.quantity != 0) 
		          return (a.tradingsymbol<b.tradingsymbol?-1:(a.tradingsymbol>b.tradingsymbol?1:0));         
		        else if(a.quantity == 0)
		            return 1;
		        else if(b.quantity == 0)
		            return -1;
		        else
		          return 0;  
		 });

    	for(var i=0;i<positions.length;i++){
    		let data = positions[i];
    		let side = data.quantity==0?'': (data.quantity > 0?'BUY':'SELL');
			let rowdata ={symbol:data.tradingsymbol,side:side,qty:1,inputQty:data.quantity};
			trade[rowdata.symbol]=rowdata;    		
    	}

    }
    return trade;
}



  fetchPositionData=(data)=>{
	const{
		activeStrategieName
	}=this.state;

	if(activeStrategieName == "MIS_POSITION"){
	    getPosition((data)=>{
	    	this.setState({positionsdata:data});  
	    },
	   	(data)=>{
	   		showToastMsg((<span className={'red'}>{'Error in fetching position data'}</span>)); 
	   	});		
	}
  }






render() { 	
	const{
		kiteAllSymbols
	}=this.props;

	const{
		strategyList,
		activeStrategieName,
		editRowId,
		newKiteAllSymbols,
		NiftybankniftySLLimit
	}=this.state;

	let{
		activeStrategie
	}=this.state;


	if(activeStrategieName == "MIS_POSITION"){
		activeStrategie = this.createStrategyFromMISPosition();
	}

 	return (
	      <div className="allStocksScreener strategyScreener">     

	      <div className="strategyEditor">

		     {kiteAllSymbols &&  <StrategyRowSelector addStrategyItem={this.addStrategyItem} kiteAllSymbols={kiteAllSymbols} rowId={editRowId} rowValues={editRowId?activeStrategie[editRowId]:undefined}/> }


		      {this.printStrategyRow(activeStrategie ,activeStrategieName == "MIS_POSITION")}



		      <div className='strategyToolbar'>
		       <button type="button" onClick={this.onPlotStrategy}>Plot</button>
		       <button type="button" onClick={this.onPlotAllStrategy}>PlotAll</button>
		       <button type="button" onClick={this.onSaveStrategy}>Save</button>
		       

		        <select className="selectStrategyBox" onChange={this.onSelectStrategy}>
		             { Object.keys(strategyList).map((name,index)=> <option key={name+index} value={name}>{name}</option>)}
		        </select>	      	

		     	{activeStrategie  && (activeStrategieName && activeStrategieName !== "MIS_POSITION") && Object.keys(activeStrategie).length < 7 && <button type="button" onClick={this.placeOrdersForStrategy}>Order</button> }

		      </div>  

	      </div>


	      <div className='OPTToolbar'>
			<button type="button" onClick={this.placeFNOSLOrders}>SLOrder</button>
			<button type="button" onClick={this.cancelSLOrders}>CALOrder</button>
	        <button type="button" onClick={this.onCreateSDSG}>Auto</button>
	        <button type="button" onClick={this.onRefreshStrategy}>Refresh</button>
	        <button type="button" onClick={this.onClearAllSTR}>Clear</button>
	        <input type="checkbox" id="sl-limit" name="sl-limit" checked={NiftybankniftySLLimit.enable} onClick={this.enableSLorderBuySell} /><label onClick={()=>{this.enableSLorderBuySell(true)}} style={{backgroundColor:NiftybankniftySLLimit.enable?'Red':''}}> SLLimit</label>
	      </div>  

	      <StrategyTable  onPriceFetched={this.onPriceFetched} ref={ele => this.strategyTableRef = ele} kiteAllSymbols={newKiteAllSymbols}  onSelectStrategy={this.onSelectStrategy} onDeltrategyStrategy={this.onDeltrategyStrategy} strategyList={strategyList}/>

	      <ValueGraph  ref={ele => this.valueGraphRef = ele} kiteAllSymbols={newKiteAllSymbols} activeStrategie={activeStrategie}/>


	     </div>
    )
  }

}


export default OPSStrategyScreener;
