import React from 'react';
import './App.css';


class StrategyRowSelector extends React.Component {
  constructor(props) {
    super(props); 
   	this.state={symbol:'',qty:1,side:''};
  }




componentDidUpdate(prevProps) {
   if (this.props.rowId!=undefined && prevProps.rowId !== this.props.rowId) {
		const{
			rowValues,
		}=this.props;
   	    this.setState({symbol:rowValues.symbol,qty:rowValues.qty,side:rowValues.side});
   }
}



onSelectorInput=(e)=>{
	if(e.currentTarget.id=='buySelldlistInput'){
		this.setState({side:e.currentTarget.value});
	}else if(e.currentTarget.id=='strategInputSymbol'){
		this.setState({symbol:e.currentTarget.value});
	}else if(e.currentTarget.id=='strategyQtyInput'){
		this.setState({qty:e.currentTarget.value});
	}
}



onAddStrategy=(e)=>{
	const{
		symbol,
		qty,
		side	
	}=this.state;

	this.props.addStrategyItem({symbol:symbol,qty:qty,side:side});
}


onEditStrategy=(e)=>{
	const{
		symbol,
		qty,
		side	
	}=this.state;

	const{
		rowId,	
	}=this.props;

	this.props.addStrategyItem({symbol:symbol,qty:qty,side:side},rowId);
}




render() { 	

	const{
		rowId,
		symbol,
		qty,
		side	
	}=this.state;


	const{
		kiteAllSymbols
	}=this.props;


	return (
		<div className='strategyItemRowSelector'>


          <datalist id='strategyInputdlist'>
           { kiteAllSymbols.allSymbols.map((item,i)=> 
            { 

               if(item.exchange == 'NFO'){
                if(item.name == 'NIFTY' || item.name == 'BANKNIFTY'){
                  if(item.segment=='NFO-OPT'){
                    let textName = item.name + " " + item.expiry.split(' ')[1].split(',')[0] +" "+item.expiry.split(' ')[0] + " | " + item.strike +" "+item.instrument_type ;

                     return (<option key={item.tradingsymbol} value={item.tradingsymbol}>{textName.toUpperCase()}</option>);            
                  }else if(item.segment=='NFO-FUT'){
                    let textName = item.name + " " + item.expiry.split(' ')[0] + " " + item.expiry.split(' ')[1] +" "+item.instrument_type;
                     return (<option key={item.tradingsymbol} value={item.tradingsymbol}>{textName.toUpperCase()}</option>);            
                  }
                }                 
              }
            })}
          </datalist> 
          <input type='text' className="strategInputSymbol" onChange={this.onSelectorInput} id='strategInputSymbol' list='strategyInputdlist' value={symbol}></input>
          



          
          <datalist id='buySelldlist'>
          	<option key='SELL' value="SELL">SELL</option>
            <option key='BUY' value="BUY">BUY</option>
          </datalist> 
          <input className="buySelldlistInput" type='text'  onChange={this.onSelectorInput} id='buySelldlistInput' list='buySelldlist' value={side}></input>


          <input className="strategyQtyInput" type="number" id='strategyQtyInput'  ref={elem => (this.textInputSellQty = elem)} onClick={event => event.target.select()}  onChange={this.onSelectorInput}  step={1} name="strategyQtyInput" min="1" max="1000" value={qty}></input>


         <button type="button" onClick={this.onAddStrategy}>Add</button>
         <button type="button" onClick={this.onEditStrategy}>edit</button>

		</div>




		);



  }

}


export default StrategyRowSelector;
