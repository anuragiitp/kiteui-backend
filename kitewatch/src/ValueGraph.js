import React from 'react';
import './App.css';
import CanvasJSReact from './canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;


class ValueGraph extends React.Component {
  constructor(props) {
    super(props); 
    this.graphData={};
    this.state={};
  }



	updateCandleData=(isDisplayAll)=>{

		const{
			activeStrategie,
		}=this.props;

		let symbols = Object.keys(activeStrategie);
		for(let i=0;i<symbols.length;i++){
			if(this.graphData[symbols[i]]==undefined){
				this.getGraphDataForSymbol(symbols[i]);
				return;
			}
		}

		let dataPoints = [];

		let startFromEndIndex=-1;

//fill alone
		for(let k=0;k<symbols.length;k++){
			let symbol = symbols[k];
			let jsonData= this.graphData[symbol];
			let hCandles = jsonData.data.candles;
			

			let latestTickDay= hCandles[hCandles.length - 1][0].split("T")[0];
			let startFromEnd =380;

			for(let i=hCandles.length-1;i>=0;i--){
				if(hCandles[i][0].split("T")[0] !== latestTickDay){
					startFromEnd = hCandles.length-i-1;
					if(startFromEndIndex==-1){
						startFromEndIndex=startFromEnd;
					}
					break;
				}
			}

			for(let i=Math.min(380,startFromEnd);i>0;i--){
				let day = hCandles.length -i;
				if(isDisplayAll){
					dataPoints.push({s:symbol, x: new Date(hCandles[day][0]), y: [hCandles[day][1], hCandles[day][2], hCandles[day][3], hCandles[day][4]]});	
				}				
			}

		}


//combine
	if(symbols.length!=0){
		for(let i=Math.min(380,startFromEndIndex);i>0;i--){
			let finalData = {s:'STRG', x: '', y: [0, 0, 0, 0]};

			for(let k=0;k<symbols.length;k++){
				let symbol = symbols[k];
				let jsonData= this.graphData[symbol];
				let hCandles = jsonData.data.candles;
				let day = hCandles.length -i;

				let fact = activeStrategie[symbol].qty;
				if(activeStrategie[symbol].side=='BUY'){
					fact = -1*fact;
				}


				finalData.x=new Date(hCandles[day][0]);
				finalData.y[0]=finalData.y[0] + (fact* hCandles[day][1]);
				finalData.y[1]=finalData.y[1] + (fact* hCandles[day][2]);
				finalData.y[2]=finalData.y[2] + (fact* hCandles[day][3]);
				finalData.y[3]=finalData.y[3] + (fact* hCandles[day][4]);
			}
			
			dataPoints.push(finalData);

			finalData.y[0] = Math.abs(finalData.y[0]);finalData.y[1] = Math.abs(finalData.y[1]);finalData.y[2] = Math.abs(finalData.y[2]);finalData.y[3] = Math.abs(finalData.y[3]);


		}
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
			data: [{
				type: "candlestick",
				toolTipContent:"{s}<hr/><br/>{y[3]}",
				risingColor: "#008000",
				fallingColor: "#ff0000",
				exportEnabled: true,			
				dataPoints:dataPoints
			}
		  ]
		}

	  this.setState({dailyCandleOptions:candleOptions});




	}


	getGraphDataForSymbol =(symbol,minInterval='minute')=>{
		const{
			kiteAllSymbols
		}=this.props;

	 	  let ticker = kiteAllSymbols[symbol];
		  let fromdate = new Date();
		  fromdate.setDate(fromdate.getDate()-4);

	      fetch('https://api.kite.trade/instruments/historical/'+ticker.instrument_token+'/'+minInterval+'?&oi=1&from='+fromdate.toISOString().split('T')[0]+'&to='+new Date().toISOString().split('T')[0],
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
	        	this.graphData[symbol]=jsonData;
	        	this.updateCandleData();
	        }.bind(this))
	        .catch((error) => {
	          console.error(error)
	        });
	}





	render() { 	

		const{
			activeStrategie,
		}=this.props;

	    const{
			dailyCandleOptions
	    }=this.state;


		return (
				<div className="valueGraph">


					{dailyCandleOptions && <CanvasJSChart  options = {dailyCandleOptions}/> }

				</div>
			);



	  }

	}


export default ValueGraph;
