
import React from 'react';
import './App.css';


class TradingviewScreener extends React.Component {
  constructor(props) {
    super(props); 
    this.state={srcUrl:'https://www.screener.in'};
  }


//  All time high https://www.screener.in/screen/raw/?sort=Return+on+capital+employed&order=desc&source=225544&query=Current+price+%3E+High+price+all+time+*+.90+AND%0D%0AMarket+Capitalization+%3E+300
// 52 week  https://www.screener.in/screen/raw/?sort=&order=&source=194743&query=Down+from+52w+high+%3C10%25+AND%0D%0AMarket+Capitalization+%3E300
// Growth  https://www.screener.in/screen/raw/?sort=short_name&order=asc&source=86&query=Net+Profit+latest+quarter+%3E+Net+Profit+preceding+quarter+AND%0D%0ANet+Profit+preceding+quarter+%3E+Net+profit+2quarters+back+AND%0D%0ANet+profit+2quarters+back+%3E+Net+profit+3quarters+back+AND%0D%0AMarket+Capitalization+%3E+300%0D%0A&latest=on
//Dividend https://www.screener.in/screens/3/Highest-Dividend-Yield-Shares/?sort=Dividend+yield&order=desc
//Debt free https://www.screener.in/screen/raw/?sort=Return+on+equity&order=desc&source=27897&query=Debt+%3D0+and+%0D%0ASales+growth++and+%0D%0AMarket+Capitalization+%3E300&latest=on
//High-ROE-Stock https://www.screener.in/screens/136413/High-ROE-Stocks/
//52w-doublers https://www.screener.in/screens/1937/52w-doublers/


// UsIndex  https://www.investing.com/markets/united-states


setUrl=(key)=>{

	switch (key){

		case 'ATH':
				this.setState({srcUrl:'https://www.screener.in/screen/raw/?sort=Return+on+capital+employed&order=desc&source=225544&query=Current+price+%3E+High+price+all+time+*+.90+AND%0D%0AMarket+Capitalization+%3E+300'});
				break;
		case '52WH':
					this.setState({srcUrl:'https://www.screener.in/screen/raw/?sort=&order=&source=194743&query=Down+from+52w+high+%3C10%25+AND%0D%0AMarket+Capitalization+%3E300'});
					break;

		case 'Growth':
					this.setState({srcUrl:'https://www.screener.in/screen/raw/?sort=short_name&order=asc&source=86&query=Net+Profit+latest+quarter+%3E+Net+Profit+preceding+quarter+AND%0D%0ANet+Profit+preceding+quarter+%3E+Net+profit+2quarters+back+AND%0D%0ANet+profit+2quarters+back+%3E+Net+profit+3quarters+back+AND%0D%0AMarket+Capitalization+%3E+300%0D%0A&latest=on'});
					break;

		case 'Dividend':
					this.setState({srcUrl:'https://www.screener.in/screens/3/Highest-Dividend-Yield-Shares/?sort=Dividend+yield&order=desc'});
					break;

		case 'Debtfree':
					this.setState({srcUrl:'https://www.screener.in/screen/raw/?sort=Return+on+equity&order=desc&source=27897&query=Debt+%3D0+and+%0D%0ASales+growth++and+%0D%0AMarket+Capitalization+%3E300&latest=on'});
					break;

		case 'High-ROE':
					this.setState({srcUrl:'https://www.screener.in/screens/136413/High-ROE-Stocks/'});
					break;

		case '52w-doublers':
					this.setState({srcUrl:'https://www.screener.in/screens/1937/52w-doublers/'});
					break;
		case 'NSE Index':
					this.setState({srcUrl:'https://www.nseindia.com/market-data/live-equity-market?symbol=NIFTY%2050'});
					break;					
		default:
				this.setState({srcUrl:'https://www.screener.in'});
				

}




}


render() { 	
 	return (
	      <div className="allStocksScreener">     
	      	<button  className="favButton screenerButton"  onClick={(evt)=>{this.setUrl('ATH');}} type="button">ATH</button>
	        <button  className="favButton screenerButton"  onClick={(evt)=>{this.setUrl('52WH');}} type="button">52Wh</button>
	        <button  className="favButton screenerButton"  onClick={(evt)=>{this.setUrl('Growth');}} type="button">Growth</button>
	        <button  className="favButton screenerButton"  onClick={(evt)=>{this.setUrl('Dividend');}} type="button">Dividend</button>
	        <button  className="favButton screenerButton"  onClick={(evt)=>{this.setUrl('Debtfree');}} type="button">Debtfree</button>
	        <button  className="favButton screenerButton"  onClick={(evt)=>{this.setUrl('High-ROE');}} type="button">High-ROE</button>
	        <button  className="favButton screenerButton"  onClick={(evt)=>{this.setUrl('52w-doublers');}} type="button">52w-doublers</button>
	        <button  className="favButton screenerButton"  onClick={(evt)=>{this.setUrl('NSE Index');}} type="button">NSE Index</button>

	      	<iframe className='tradingviewFrame' src={this.state.srcUrl}></iframe>
	     </div>
    )
  }

}


export default TradingviewScreener;
