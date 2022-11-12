import React from 'react';
import './App.css';


class Fundamentals extends React.Component {
  constructor(props) {
    super(props);    
    this.state={};
  }



render() {
 	
    const{
      kitedata,
      symbol,
      hideFundamentalsDialog
    }=this.props;

  let hrefGraph = 'https://kite.zerodha.com/chart/ext/tvc/'+kitedata.ticks[symbol].exchange+'/'+kitedata.ticks[symbol].tradingsymbol+'/'+kitedata.ticks[symbol].token
	let hrefFunda = 'https://stocks.tickertape.in/'+symbol+'?broker=kite';


 	return (
	      <div className="modal">       
	        <div style={{width:'1200px'}} className="modal-content">
	        <span onClick={hideFundamentalsDialog} className="close">&times;</span>



        <div className='fundamental-dialog'>

        <iframe className='graphFrame' src={hrefGraph}></iframe>
        
        <iframe style={{height:'1000px'}} className='graphFrame' src={'https://www.screener.in/company/'+(symbol.endsWith('-BE')?symbol.replace('-BE',''):symbol)+'/consolidated/'}></iframe>

        <iframe className='fundamentalFrame' src={hrefFunda}></iframe>

        


          </div>

	    	</div>
	     </div>
    )
  }

}


export default Fundamentals;
