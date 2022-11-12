import React from 'react';
import './App.css';
import AllStocksScreener from './AllStocksScreener';
import AllSectorScreener from './AllSectorScreener';
import PerformanceScreener from './PerformanceScreener';
import TradingviewScreener from './TradingviewScreener';
import OPSStrategyScreener from './OPSStrategyScreener';



import { AiOutlineFundView } from 'react-icons/ai'

class Screener extends React.Component {
	  constructor(props) {
	    super(props);
	    this.state={isShowScreener:false};
	  }



	escFunction=(event)=>{
	    if(event.keyCode === 27) {
	    	this.hideScreener();
	    }
	}



	componentDidMount() {
	  	document.addEventListener("keyup", this.escFunction, false);
	}

	componentWillUnmount(){
		document.removeEventListener("keyup", this.escFunction, false);
	}



	showScreener=(showScreener)=>{
		this.setState({isShowScreener:true,isShowAllStockScreener:false,isShowAllSectorScreener:false,isShowPerformanceScreener:false,isTradingview:false,isOPSStrategy:false});
		let newSate = {};
		newSate[showScreener]=true;
		this.setState(newSate);
	}

	hideScreener=()=>{
		this.setState({isShowScreener:false});
	}



  render() {

    const{
      kitedata,
      onTableRowclick,
      showToast,
      addToFavList,
      kiteAllSymbols,
      positionsdata
    }=this.props;



    const{
      isShowScreener,
      isShowAllStockScreener,
      isShowAllSectorScreener,
      isShowPerformanceScreener,
      isTradingview,
      isOPSStrategy
    }=this.state;




    return (
    	<div className="screener">
	    	<div className="dropdown">
	          <button className="dropbtn"><AiOutlineFundView className="appicon"/></button>
	          <div className="dropdown-content screenerList">
	          	<a onClick={(evt)=>{this.showScreener('isOPSStrategy');}}>Options</a>
	          	<a onClick={(evt)=>{this.showScreener('isShowAllSectorScreener');;}}>All Sectors</a>	          	
	          	<a onClick={(evt)=>{this.showScreener('isTradingview');}}>Screener</a>	          	
		        <a onClick={(evt)=>{this.showScreener('isShowAllStockScreener');;}}>All Stocks</a>		           
		        <a onClick={(evt)=>{this.showScreener('isShowPerformanceScreener');}}>Performance</a>
		           
		           

	          </div>
	        </div>


			{ isShowScreener == true &&        
			      <div className="modal">       
			        <div className="modal-content">
			        <span onClick={(evt)=>{this.hideScreener()}} className="close">&times;</span>

					    <div className='screener-dialog'>

					    { isOPSStrategy && <OPSStrategyScreener positionsdata={positionsdata} kitedata={kitedata} kiteAllSymbols={kiteAllSymbols}/>   }	 


					    { isShowAllSectorScreener && <AllSectorScreener addToFavList={addToFavList} kitedata={kitedata} onTableRowclick={onTableRowclick}   />   }	 


					    { isTradingview && <TradingviewScreener  />   }	 

					   
					    { isShowAllStockScreener &&	<AllStocksScreener addToFavList={addToFavList} kitedata={kitedata} onTableRowclick={onTableRowclick}   />   }	 


					    { isShowPerformanceScreener && <PerformanceScreener addToFavList={addToFavList} kitedata={kitedata} onTableRowclick={onTableRowclick}   />   }	 





				        </div>

			    	</div>
			     </div>

			}     


		</div>


    )
  }



}


export default Screener;

