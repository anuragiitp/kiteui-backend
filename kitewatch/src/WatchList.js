import React from 'react';
import './App.css';


class WatchList extends React.Component {
  constructor(props) {
    super(props);
    this.state={isShortByVolume:false,isInfoOnHover:false,isShortIntraList:false};
  }




bringRusultsComingTodayInView=()=>{
      let today = new Date().toISOString().split('T')[0];
      let selector = "tr[rowid='RESULT-DATE-"+today+"']";
      if(document.querySelectorAll(selector) && document.querySelectorAll(selector)[0]){
        document.querySelectorAll(selector)[0].scrollIntoView();  
      }     
}


 getVolumeFactor=(symbol,withoutUnit)=>{    
    if(this.props.tradingviewdata && this.props.tradingviewdata[symbol]){
          let ticks = this.props.kitedata.ticks;
          let avg_volume = this.props.tradingviewdata[symbol].average_volume_10d_calc;
          let todayVolume = ticks[symbol].volumeTradedToday;
          let fact = todayVolume/avg_volume;
          return (fact).toFixed(1)+ (withoutUnit?"":'x');
    }   
    return '';
  }


toogleShortByVolume=()=>{
  this.setState({isShortByVolume:!this.state.isShortByVolume});
}


toogleShortIntraList=()=>{
  this.setState({isShortIntraList:!this.state.isShortIntraList});
}




toogleInfoOnHover=()=>{
  this.setState({isInfoOnHover:!this.state.isInfoOnHover});
}


toogleCustomWatlistKeyDisplay=(key)=>{
  this.customWatchListKeyDisplay[key] = !this.customWatchListKeyDisplay[key];
  localStorage.setItem('CUSTOM_WATLIST_DISPLAY_KEYS',JSON.stringify(this.customWatchListKeyDisplay));
}


isShowCustomWatchListKey=(key)=>{
  if(this.customWatchListKeyDisplay == undefined){
    if(localStorage.getItem('CUSTOM_WATLIST_DISPLAY_KEYS')){
      this.customWatchListKeyDisplay = JSON.parse(localStorage.getItem('CUSTOM_WATLIST_DISPLAY_KEYS'));
    }else{
       this.customWatchListKeyDisplay ={};
    }
  }
  if(this.customWatchListKeyDisplay[key] == undefined){
    this.customWatchListKeyDisplay[key]=true;  
  }
  return this.customWatchListKeyDisplay[key];
}







  render() {

    const{
      kitedata,
      symbolList,
      kitePerfData,
      onTableRowclick,
      tableId,
      showToast,
      resultCalenderData,
      recentResultCalender,
      kiteBasketOrderData,
      volumeGainers,
      tableName,
      tradingviewdata,
      isEnableCustomWatchList,
      customWatchList,
      positionsdata,
      showCount,
      isBlinkDayHL,
      isIndexTable,
      latIntralong,
      latIntraSort,
      niftyBankniftyData,
      ATMStrike
    }=this.props;

    let tempSymbols=[];
    if(kitedata){
       tempSymbols = symbolList.filter(function(symbol){ return (symbol == 'SEPERATOR' || kitedata.ticks[symbol]!=undefined) });
    }


    const{
      isShortByVolume,
      isInfoOnHover,
      isShortIntraList
    }=this.state;

    let volumeGainersTemp = volumeGainers;
    if(volumeGainersTemp){
      if(isShortByVolume){
        volumeGainersTemp = volumeGainersTemp.slice(0).sort((a,b)=>{ return ( this.getVolumeFactor(b,true) - this.getVolumeFactor(a,true))});
      }else{
        volumeGainersTemp = volumeGainersTemp.slice(0).reverse();
      }
    }


    let updatedCustumList=customWatchList;
    if(isShortIntraList && customWatchList){
        let tempCustumList={};
        Object.keys(customWatchList).map((key,keyindex)=>{
          let symbols  = Object.keys(customWatchList[key]);

          if(key=="INTRA SHORT"){
            symbols =  symbols.sort(function(t1, t2){return kitedata.ticks[t1].change - kitedata.ticks[t2].change});
          }else{
            symbols =  symbols.sort(function(t1, t2){return kitedata.ticks[t2].change - kitedata.ticks[t1].change});
          }
          
          
          let temp = {};
          for(let i=0;i<symbols.length;i++){
            temp[symbols[i]]=customWatchList[key][symbols[i]];
          }
          tempCustumList[key]=temp;
        });      
       updatedCustumList= tempCustumList;
    }

    let sortedCustumListKeys;
    if(updatedCustumList){
       sortedCustumListKeys = Object.keys(updatedCustumList);
        sortedCustumListKeys.forEach(function(item,i){
          if(item === "15Min Change"){
            sortedCustumListKeys.splice(i, 1);
            sortedCustumListKeys.unshift(item);
          }
        });
    }

    if(niftyBankniftyData){

      Object.keys(niftyBankniftyData).forEach((item,i)=>{

        niftyBankniftyData[item]['UP'] =   (kitedata.ticks[item].lastTradedPrice - kitedata.ticks[item].lowPrice).toFixed(0);
        niftyBankniftyData[item]['DOWN'] =   (kitedata.ticks[item].highPrice - kitedata.ticks[item].lastTradedPrice).toFixed(0);          
        niftyBankniftyData[item]['FOPEN'] = (kitedata.ticks[item].lastTradedPrice - kitedata.ticks[item].openPrice).toFixed(0);

        let ltp = kitedata.ticks[item].lastTradedPrice;
        let prevDayH = niftyBankniftyData[item]['pdc'][2];
        let prevDayL = niftyBankniftyData[item]['pdc'][3];
        let prevDayC = niftyBankniftyData[item]['pdc'][4];

        niftyBankniftyData[item]['ltp']=(ltp).toFixed(0);
        niftyBankniftyData[item]['change']=(kitedata.ticks[item].change).toFixed(2);

        if(ltp > prevDayH){
          niftyBankniftyData[item]['FPREVDR']= ( ltp - prevDayH ).toFixed(0);
        }else if(ltp< prevDayL){
          niftyBankniftyData[item]['FPREVDR']= ( ltp - prevDayL ).toFixed(0);
        }else{
           niftyBankniftyData[item]['FPREVDC']= ( ltp - prevDayC ).toFixed(0);
        }

        let range = item === 'NIFTY 50'?25:50;

        if(Math.abs(ltp - prevDayH) < range){
          this.props.showToast( <div className={'green'}>{ item +"  |  " + (ltp - prevDayH).toFixed(0)}  <sup>YH</sup></div>,item);        
        }else if(Math.abs(ltp - prevDayL) < range){
         this.props.showToast( <div className={'red'}>{ item +"  | " + (ltp - prevDayL).toFixed(0)}  <sup>YL</sup></div>,item);           
        }else if(Math.abs(niftyBankniftyData[item]['FOPEN']) < range){
           this.props.showToast( <div className={niftyBankniftyData[item]['FOPEN']>0?'green':'red'}>{ item +"  |  " + (niftyBankniftyData[item]['FOPEN'])}  <sup>OP</sup></div>,item);  
        }else if(Math.abs(ltp - prevDayC) < range){
           this.props.showToast( <div className={(ltp - prevDayC)>0?'green':'red'}>{ item +"  |  " + (ltp - prevDayC).toFixed(0)}  <sup>C</sup></div>,item);        
        }

        else if(niftyBankniftyData[item]['DOWN'] < range){
           this.props.showToast( <div className={'green'}>{ item +"  |  " + niftyBankniftyData[item]['DOWN']}  <sup>H</sup></div>,item);        
        }
        else if(niftyBankniftyData[item]['UP'] < range){
           this.props.showToast( <div className={'red'}>{ item +"  |  " + niftyBankniftyData[item]['UP']}  <sup>L</sup></div>,item);        
        }

      });


    }


    return (
          <table>
            <thead>

            {!tableName &&  <tr><th>Name {showCount && tempSymbols && <span>&nbsp;({tempSymbols.length})</span>} </th><th>Change</th><th>LTP</th></tr> }
            {tableName &&  <tr ><th className="tableName" colSpan="3">{tableName}</th></tr> }


            </thead>

            <tbody>
            
            

            { latIntraSort && <React.Fragment > {latIntraSort.map((symbol,index)=> <WatchListRow isShowVol={true} isIndexTable={isIndexTable} isBlinkDayHL={isBlinkDayHL} getVolumeFactor={this.getVolumeFactor} isInfoOnHover={isInfoOnHover} tradingviewdata={ tradingviewdata} showToast={showToast} tableId={tableId} onTableRowclick={onTableRowclick} key={'SRT_LAT ' +symbol+index} kitedata={kitedata} kitePerfData={kitePerfData} symbol={symbol} />) } <tr className="gainerSeperator"><td colSpan="3"></td></tr></React.Fragment>}

            { latIntralong  && <React.Fragment > {latIntralong.map((symbol,index)=> <WatchListRow isShowVol={true} isIndexTable={isIndexTable} isBlinkDayHL={isBlinkDayHL} getVolumeFactor={this.getVolumeFactor} isInfoOnHover={isInfoOnHover} tradingviewdata={ tradingviewdata} showToast={showToast} tableId={tableId} onTableRowclick={onTableRowclick} key={'SRT_LONG ' +symbol+index} kitedata={kitedata} kitePerfData={kitePerfData} symbol={symbol} />)} <tr className="gainerSeperator"><td colSpan="3"> </td></tr></React.Fragment>}



             { tempSymbols.map((symbol,index)=> <WatchListRow isIndexTable={isIndexTable} isBlinkDayHL={isBlinkDayHL} getVolumeFactor={this.getVolumeFactor} isInfoOnHover={isInfoOnHover} tradingviewdata={ tradingviewdata} showToast={showToast} tableId={tableId} onTableRowclick={onTableRowclick} key={symbol+index} kitedata={kitedata} kitePerfData={kitePerfData} symbol={symbol} />)}
            
            { resultCalenderData && <React.Fragment >
               <tr></tr>
               <tr></tr>
               <tr onClick={this.bringRusultsComingTodayInView} rowId={"RES-RESCALENDER"}><td colSpan="3" style={{textAlign:'center',fontWeight:'bold'}}>RES CALENDER</td></tr> 
               { resultCalenderData.map((symbol,index)=> <WatchListRow   getVolumeFactor={this.getVolumeFactor} tradingviewdata={ tradingviewdata} showToast={showToast} tableId={'RES'} onTableRowclick={onTableRowclick} key={'RES-'+index+symbol} kitedata={kitedata} kitePerfData={kitePerfData} symbol={symbol} />)}
               
               <tr><td colSpan="3" style={{textAlign:'center'}}>UPCOMMING RESULTS</td></tr>
               {
                Object.keys(recentResultCalender).map((key,keyindex)=>{
                  return <React.Fragment key={key} ><tr rowId={'RESULT-DATE-'+key} key={key+keyindex}><td colSpan="3" className="resultDate">{new Date(key).toDateString()}</td></tr>
                  {recentResultCalender[key].map((data,index)=> <WatchListRow   getVolumeFactor={this.getVolumeFactor} tradingviewdata={ tradingviewdata} showToast={showToast}  onTableRowclick={onTableRowclick} key={'UPCOMMING-RES-'+index+data.symbol} kitedata={kitedata} kitePerfData={kitePerfData} symbol={data.symbol} inHolding={data.inHolding}/>)}
                </React.Fragment>
                })
               }                
             </React.Fragment>}



            { updatedCustumList && <React.Fragment >
               <tr></tr>
               <tr  onClick={this.toogleShortIntraList} rowid="CUSTUM_WATCH_LIST"><td colSpan="3" style={{textAlign:'center',fontWeight:'bold'}}>CUSTOM WATCH LIST</td></tr>                            
               { 
               sortedCustumListKeys.map((key,keyindex)=>{
                  return <React.Fragment key={key} ><tr></tr><tr  onClick={()=>{this.toogleCustomWatlistKeyDisplay(key)}} rowId={'CUSTUM_WATCH_LIST-'+key} key={key+keyindex}><td colSpan="3" className="resultDate" style={{textAlign:'center',fontWeight:'bold'}}>{key}</td></tr>
                  
                { this.isShowCustomWatchListKey(key) && <React.Fragment>

                  { Object.keys(updatedCustumList[key]).filter(function(fv,fi){ return kitedata.ticks[fv]!=undefined}).map((data,index)=> <WatchListRow  isBlinkDayHL={0.007} isShowVol={true} getVolumeFactor={this.getVolumeFactor} tradingviewdata={ tradingviewdata} showToast={showToast}  onTableRowclick={onTableRowclick} key={'CUSTUM_WATCH_LIST-'+index+data} kitedata={kitedata} kitePerfData={kitePerfData} symbol={data} />)}
                

                   </React.Fragment>
                }  
                </React.Fragment>
                })
               }                
             </React.Fragment>}




             {positionsdata && <React.Fragment >
                 <tr></tr>
                 <tr  onClick={this.toogleShortIntraList} rowid="INTRA_POSITION_LIST"><td colSpan="3" style={{textAlign:'center',fontWeight:'bold'}}>INTRA_POSITION_LIST</td></tr>      

                 {positionsdata.dayPNL && 
                    <tr key='INTRA_POSITION-daypositionsummary' >
                      <td colSpan='3' className='summaryRow'>
                       <span className={ positionsdata.dayPNL<0 ?'red':'green'}>{(positionsdata.dayPNL/1000).toFixed(2)}K</span>&nbsp;&nbsp;&nbsp;
                       <span className='bracketValue'>&nbsp;<span className={ positionsdata.dayPNLCNC<0 ?'red':'green'}>{`${(positionsdata.dayPNLCNC).toFixed(2)}` }</span>C</span>&nbsp;&nbsp;                 
                       <span className='bracketValue'>&nbsp;<span className={ positionsdata.dayPNLMIS<0 ?'red':'green'}>{`${Math.round(positionsdata.dayPNLMIS)}` }</span>M</span>
                      </td> 
                    </tr>
                 }

                 { positionsdata.data.net.map((data,index)=> <PositionWatchListRow  onTableRowclick={onTableRowclick}  key={'INTRA_POSITION-'+index+ data.tradingsymbol} data={data} />) }

                 {positionsdata.dayPNL && 
                    <tr key='INTRA_POSITION-daypositionsummary' >
                      <td colSpan='3' className='summaryRow'>
                       <span className={ positionsdata.dayPNL<0 ?'red':'green'}>{(positionsdata.dayPNL/1000).toFixed(2)}K</span>&nbsp;&nbsp;&nbsp;
                       <span className='bracketValue'>&nbsp;<span className={ positionsdata.dayPNLCNC<0 ?'red':'green'}>{`${(positionsdata.dayPNLCNC).toFixed(2)}` }</span>C</span>&nbsp;&nbsp;                 
                       <span className='bracketValue'>&nbsp;<span className={ positionsdata.dayPNLMIS<0 ?'red':'green'}>{`${Math.round(positionsdata.dayPNLMIS)}` }</span>M</span>
                      </td> 
                    </tr>
                 }
                 <tr></tr>
             </React.Fragment>}





            { volumeGainersTemp && <React.Fragment >
               <tr></tr>
               <tr></tr>
               <tr onClick={this.toogleShortByVolume} rowId={"VOL-VOLGAINERS"} ><td colSpan="3" style={{textAlign:'center',fontWeight:'bold'}}>VOLUME GAINERS</td></tr> 
               { volumeGainersTemp.map((symbol,index)=> <WatchListRow  getVolumeFactor={this.getVolumeFactor}  isShowVol={true} tradingviewdata={ tradingviewdata} showToast={showToast}  onTableRowclick={onTableRowclick} key={'VOL-'+index+symbol} kitedata={kitedata} kitePerfData={kitePerfData} symbol={symbol} />)}
             </React.Fragment>}


            { kiteBasketOrderData && <React.Fragment >
               <tr></tr>
               <tr></tr>
               <tr rowId={"MIS-MISSCRIPTS"} ><td colSpan="3" style={{textAlign:'center',fontWeight:'bold'}}>MIS SCRIPTS</td></tr> 
               { kiteBasketOrderData.filter(function(symbol){ return (symbol == 'SEPERATOR' || kitedata.ticks[symbol]!=undefined) }).map((symbol,index)=> <WatchListRow   isBlinkDayHL={0.005} getVolumeFactor={this.getVolumeFactor}  tradingviewdata={ tradingviewdata} showToast={showToast} tableId={'MIS'} onTableRowclick={onTableRowclick} key={'MIS-'+index+symbol} kitedata={kitedata} kitePerfData={kitePerfData} symbol={symbol} />)}
             </React.Fragment>}



             {niftyBankniftyData && niftyBankniftyData["NIFTY 50"] && niftyBankniftyData["NIFTY BANK"] && <React.Fragment >

               <IndexListRow niftyBankniftyData={niftyBankniftyData} symbol="NIFTY 50"/>
               <IndexListRow niftyBankniftyData={niftyBankniftyData} symbol="NIFTY BANK"/> 

              </React.Fragment>

             }

             { ATMStrike && <React.Fragment >
              <tr></tr>
              <ATMStrikeListRow ATMStrike={ATMStrike['NIFTY']}  />
              <ATMStrikeListRow ATMStrike={ATMStrike['BANK']}  />

              </React.Fragment >

             }



            </tbody>


        </table>
    )
  }

}


export default WatchList;




class ATMStrikeListRow extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    const{
        ATMStrike,
    }=this.props;

    let change = ATMStrike.close - ATMStrike.open;
    let changeClass=change<0 ?'red':'green';

    return(

        <React.Fragment >
              <tr className={'NBRow'} >
                <td>{ATMStrike.symbol} </td>
                <td  className={changeClass} >{(change).toFixed(0)} </td>
                <td>{(ATMStrike.close).toFixed(0)} </td> 
              </tr>
         </React.Fragment>     
      ) ;
  }

}




class IndexListRow extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    const{
        niftyBankniftyData,
        symbol
    }=this.props;


    let FOPENClass  = '';
    if( niftyBankniftyData[symbol]['FOPEN'] ){
      FOPENClass=niftyBankniftyData[symbol]['FOPEN']<0 ?'red':'green';
    }


    let FPREVDCClass  = '';
    if( niftyBankniftyData[symbol]['FPREVDC'] ){
      FPREVDCClass=niftyBankniftyData[symbol]['FPREVDC']<0 ?'red':'green';
    }

    let FPREVDRClass  = '';
    if( niftyBankniftyData[symbol]['FPREVDR'] ){
      FPREVDRClass=niftyBankniftyData[symbol]['FPREVDR']<0 ?'red':'green';
    }


    let changeClass  = '';
    if( niftyBankniftyData[symbol]['change'] ){
      changeClass=niftyBankniftyData[symbol]['change']<0 ?'red':'green';
    }

    return(
        <React.Fragment >
              <tr className={'NBRow'} ><td>{symbol=='NIFTY 50'?'N':'B'}</td> <td colSpan="2">

                <span  className={changeClass}  style={{'fontWeight':'bold'}}>{niftyBankniftyData[symbol]['change']}</span> 
       
                <span className={FOPENClass} >{niftyBankniftyData[symbol]['FOPEN']}<sup  className={'supClass'}>O</sup> </span> 

                {niftyBankniftyData[symbol]['FPREVDC'] && <span className={FPREVDCClass} >{niftyBankniftyData[symbol]['FPREVDC']}<sup className={'supClass'} >C</sup> </span> }
                {niftyBankniftyData[symbol]['FPREVDR'] && <span className={FPREVDRClass} >{niftyBankniftyData[symbol]['FPREVDR']}<sup className={'supClass'}>{niftyBankniftyData[symbol]['FPREVDR']>0?'YH':'YL'}</sup> </span> }
                
                <span>{niftyBankniftyData[symbol]['DOWN']}<sup className={'supClass'} >H</sup> </span> 
                <span>{niftyBankniftyData[symbol]['UP']}<sup className={'supClass'} >L</sup> </span> 
                </td>
              </tr>
         </React.Fragment>     
      ) ;
  }

}






class PositionWatchListRow extends React.Component {
  constructor(props) {
    super(props);
  }

  openStockInfo=()=>{
    this.props.onTableRowclick(this.props.data.tradingsymbol);
  }

  render() {

    const{
  data
    }=this.props;


    let changeClass  = '';
    if( data.change ){
      changeClass=data.change<0 ?'red':'green';
    }
    


    let dayChangeClass  = data.pnl <0 ?'red':'green';

      if(data.exchange == 'NFO'){
        return <React.Fragment ></React.Fragment >

      }else {

          return (
            <tr style={{'line-height':'18px'}}  rowId={'INTRA_POSITION-'+data.tradingsymbol} onClick={this.openStockInfo} className={data.quantity==0?'lavender':''}>
            <td  style={{position:'relative'}} >{data.tradingsymbol} <sup>{<span className='last_price positionValue'>{Math.round((data.value)/1000) }k</span>} </sup> 
            
             <span  style={{fontWeight:'bold',float: 'right' }} className={'holdDayChg ' + dayChangeClass}>{ data.pnl.toFixed(0)}</span>
  
            </td>

            <td className={changeClass} style={{position: 'relative' }}> {data.change.toFixed(1)} </td>
            <td> {data.last_price.toFixed(1)} </td>
            </tr>
          );
      }

  }

}





class WatchListRow extends React.Component {
  constructor(props) {
    super(props);
  }

 
  componentDidUpdate(prevProps) {

    if(this.props.showToast){
      let symbol = this.props.symbol;
       if (symbol!= 'SEPERATOR' && prevProps.symbol == symbol && this.props.kitedata.ticks[symbol]!=undefined) {






         if(prevProps.kitedata.ticks[symbol].change < 1.5 && this.props.kitedata.ticks[symbol].change > 1.5
          ||   prevProps.kitedata.ticks[symbol].change < 3 && this.props.kitedata.ticks[symbol].change > 3
          || prevProps.kitedata.ticks[symbol].change < 5 && this.props.kitedata.ticks[symbol].change > 5
          || prevProps.kitedata.ticks[symbol].change < 8 && this.props.kitedata.ticks[symbol].change > 8
          || prevProps.kitedata.ticks[symbol].change < 9.5 && this.props.kitedata.ticks[symbol].change > 9.5
          || prevProps.kitedata.ticks[symbol].change < 13 && this.props.kitedata.ticks[symbol].change > 13
          || prevProps.kitedata.ticks[symbol].change < 15 && this.props.kitedata.ticks[symbol].change > 15
          ){

            let nClass = 'green';
            let isDayHigh = Math.abs (this.props.kitedata.ticks[symbol].lastTradedPrice - this.props.kitedata.ticks[symbol].highPrice) <= this.props.kitedata.ticks[symbol].highPrice*0.004; 

            if(isDayHigh){
               nClass = nClass+" dayHighPrice";
            }

            if(this.props.tradingviewdata && this.props.tradingviewdata[symbol]){
               let is52KHigh = this.props.kitedata.ticks[symbol].lastTradedPrice >= this.props.tradingviewdata[symbol].price_52_week_high;
               if(is52KHigh){
                  nClass = nClass+" high52w";
               }
            }

           this.props.showToast(<div onClick={this.openStockInfo}  className={nClass}>{this.props.symbol +"  ->  " + (this.props.kitedata.ticks[symbol].lastTradedPrice)}&nbsp;(<span>{(this.props.kitedata.ticks[symbol].change).toFixed(2)}</span>%)  &nbsp;(<span style={{color: 'brown'}}>{this.props.getVolumeFactor(this.props.symbol)}</span>)</div>,this.props.symbol);

         }


         if( prevProps.kitedata.ticks[symbol].change > -1.5 && this.props.kitedata.ticks[symbol].change < -1.5
          || prevProps.kitedata.ticks[symbol].change > -3 && this.props.kitedata.ticks[symbol].change < -3
          || prevProps.kitedata.ticks[symbol].change > -5 && this.props.kitedata.ticks[symbol].change < -5
          || prevProps.kitedata.ticks[symbol].change > -8 && this.props.kitedata.ticks[symbol].change < -8
          || prevProps.kitedata.ticks[symbol].change > -9.5 && this.props.kitedata.ticks[symbol].change < -9.5
          || prevProps.kitedata.ticks[symbol].change > -13 && this.props.kitedata.ticks[symbol].change < -13
          || prevProps.kitedata.ticks[symbol].change > -15 && this.props.kitedata.ticks[symbol].change < -15
          ){

            let nClass = 'red'
            let isDayLow = Math.abs (this.props.kitedata.ticks[symbol].lastTradedPrice - this.props.kitedata.ticks[symbol].lowPrice) <= this.props.kitedata.ticks[symbol].highPrice*0.004;
            if(isDayLow){
              nClass = nClass+" dayLowPrice";
            }

            if(this.props.tradingviewdata && this.props.tradingviewdata[symbol]){
               let is52KLow = this.props.kitedata.ticks[symbol].lastTradedPrice <= this.props.tradingviewdata[symbol].price_52_week_low;
               if(is52KLow){
                  nClass = nClass+" low52w";
               }
            }
          
           this.props.showToast(<div onClick={this.openStockInfo} className={nClass}>{this.props.symbol +"  ->  " + (this.props.kitedata.ticks[symbol].lastTradedPrice)}&nbsp;(<span>{(this.props.kitedata.ticks[symbol].change).toFixed(2)}</span>%) &nbsp;(<span style={{color: 'brown'}}>{this.props.getVolumeFactor(this.props.symbol)}</span>) </div>,this.props.symbol);

         }


       }
    }



  }


  openStockInfo=()=>{
    this.props.onTableRowclick(this.props.symbol,this.props.tableId);
  }


  
  shouldComponentUpdate(nextProps) {
    const{
      symbol,
      kitedata
    }=this.props;

    if(symbol != nextProps.symbol ){
      return true;
    }else if(symbol=='SEPERATOR'){
      return false;
    }else if(Math.abs(kitedata.ticks[symbol].lastTradedPrice - nextProps.kitedata.ticks[symbol].lastTradedPrice) > 0.04){
      return true;
    }else{
      return false;
    }        
  }


  render() {

    const{
      kitedata,
      symbol,
      kitePerfData,
      onTableRowclick,
      tableId,
      inHolding, //use for result calender
      isShowVol,
      getVolumeFactor,
      isBlinkDayHL,
      isIndexTable
    }=this.props;



    let isSeperator = (symbol =='SEPERATOR')?true:false;
    if(isSeperator){
      return (<tr rowId={tableId?(tableId+"-"+symbol):symbol}></tr>);
    }else if( kitedata.ticks[symbol] == undefined){
      return (<React.Fragment></React.Fragment>);
    }


    let changeClass  = '';
    if( kitedata.ticks[symbol] ){
      changeClass=kitedata.ticks[symbol].change<0 ?'red':'green';
    }
    
    let prefStyle = {};
    if(kitePerfData && kitePerfData[symbol]){
      prefStyle.backgroundColor=kitePerfData[symbol].color;
    }
    if(inHolding==true){
      prefStyle.backgroundColor = 'lightgray';
    }

    if(isBlinkDayHL){
        let isDayHigh = Math.abs (kitedata.ticks[symbol].lastTradedPrice - kitedata.ticks[symbol].highPrice) <= kitedata.ticks[symbol].highPrice*isBlinkDayHL; 
        let isDayLow = Math.abs (kitedata.ticks[symbol].lastTradedPrice - kitedata.ticks[symbol].lowPrice) <= kitedata.ticks[symbol].highPrice*isBlinkDayHL;

        let isHighLowGap = true;
        if(!isIndexTable){
          isHighLowGap = Math.abs (kitedata.ticks[symbol].highPrice - kitedata.ticks[symbol].lowPrice) >= kitedata.ticks[symbol].lastTradedPrice*0.017;
        }

        if(isHighLowGap){
          if(isDayHigh){
            prefStyle.borderLeft=' 3px solid green';
          }else if(isDayLow){
            prefStyle.borderLeft=' 3px solid red';
          }          
        }
    }


    return (
      <tr  onClick={this.openStockInfo} rowId={tableId?(tableId+"-"+symbol):symbol}>
          <td style={prefStyle} >  {kitedata.ticks[symbol].name}    </td> 
          <td className={changeClass} style={{position: 'relative' }}> {isShowVol && <span style={{color: 'brown',fontSize:'14px',display:'block',position:'block',position:'absolute',top:'-1px',left:'-8px'}}>{getVolumeFactor(symbol,true)}</span>} {(kitedata.ticks[symbol].change).toFixed(2)} </td>
          <td>{kitedata.ticks[symbol].lastTradedPrice}</td>              
       </tr>
    );


  }

}