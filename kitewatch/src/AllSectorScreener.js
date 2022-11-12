import React from 'react';
import './App.css';
import WatchList from './WatchList';

class AllSectorScreener extends React.Component {
  constructor(props) {
    super(props); 
    this.state={};
  }



componentDidMount() {
	this.fetchAllKiteSectorList();
}




fetchAllKiteSectorList=()=>{




      fetch(window.domain+'kiteAllSector.json?v='+(new Date().getTime()))
        .then(response => response.json())
        .then(function(jsonData){
         this.kiteSectorList = jsonData;
	    const{
	      kitedata,  
	    }=this.props;
         for(let i=0;i< this.kiteSectorList.length;i++){
        	 this.kiteSectorList[i].list.sort((t1, t2)=>{
        	 	let v1 = kitedata.ticks[t1]?kitedata.ticks[t1].change:-100;
        	 	let v2 = kitedata.ticks[t2]?kitedata.ticks[t2].change:-100;

        	 	return v2 - v1})

        	 ; 	
         }
	 	

         this.setState({kiteSectorList:this.kiteSectorList});
        }.bind(this))
        .catch((error) => {
          console.error(error)
       })
}


onTableRowclick=(data,tableId)=>{

    const{
      onTableRowclick,
    }=this.props;

    const{
      kitedata,     
    }=this.props;

    const{
      symbol
    }=this.state;


    window.open('https://kite.zerodha.com/chart/ext/tvc/'+kitedata.ticks[data].exchange+'/'+kitedata.ticks[data].tradingsymbol+'/'+kitedata.ticks[data].token , "kiteAppGraph", "width=1980,height=1080");  
    onTableRowclick(data,tableId,false);
    this.setState({symbol:data});    
}


render() {
 	
    const{
      kitedata,
      onTableRowclick,
      addToFavList      
    }=this.props;




    const{
      symbol,
      kiteSectorList
    }=this.state;




 	return (
	      <div className="allSectorScreener">       
	      	{kitedata && kiteSectorList && 


	      	kiteSectorList.map((data,index)=>{ return <div key={index} className='tableContainer watchlistclass'><WatchList  onTableRowclick={this.onTableRowclick} kitedata={kitedata} symbolList={data.list} tableName={data.sector}/></div> })	}

	      	
			<div className="screenerToolbar">	
				<div >S: {symbol}</div>
				<button className="favButton green"   onClick={(evt)=>{addToFavList(symbol,'0');}} type="button">A 0</button>
				<button className="favButton green"   onClick={(evt)=>{addToFavList(symbol,'MIS');}} type="button">MIS</button>			
			</div>		

	     </div>
    )
  }

}


export default AllSectorScreener;
