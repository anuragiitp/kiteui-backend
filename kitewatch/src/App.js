import React from 'react';
import './App.css';

import WatchList from './WatchList';
import GlobalindexList from './GlobalindexList';
import HoldingList from './HoldingList';

import StockInfo from './StockInfo';

import BasketOrderDialog from './BasketOrderDialog';
import FundamentalsDialog from './Fundamentals';

import toaster from "toasted-notes";
import "toasted-notes/src/styles.css"; 

import CurrentTime from './CurrentTime';

import Search from './Search';
import Screener from './Screener';


import {getMargin,showNotification,getFullQuote} from './OrderUtil';

import HoldingOrderDialog from './HoldingOrderDialog';

import { IoMdAddCircle ,IoMdNotifications,IoMdNotificationsOff,IoMdRemove,IoMdTrash,IoIosAdd,IoIosCreate} from 'react-icons/io'

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.customWatchListRefreshCounter=-1;

   //"{"favSymbols":["JAMNAAUTO","ABFRL","BAJFINANCE","GRAUWEIL","JMFINANCIL","VIPIND","HERITGFOOD","GARFIBRES","NESCO","APLAPOLLO","HESTERBIO","SHOPERSTOP","SARDAEN","BHARATFORG","WHIRLPOOL","HAVELLS","TEAMLEASE","TRENT","AVANTIFEED","CHOLAFIN","SBICARD","RITES","MINDAIND","APEX","HDFCAMC","ECLERX","NAUKRI","CGCL","CONTROLPR","VMART","NIITTECH","SAKUMA","ITI","JINDALSTEL","NAM-INDIA","TIINDIA","RUPA","DLF","IRCTC","FINCABLES","CUB","MAITHANALL","KRBL","AXISBANK","VBL","PVR","UPL","APCOTEXIND","SRF","BORORENEW","GMMPFAUDLR","CENTURYPLY","ISEC","ALKYLAMINE","TITAN","TASTYBIT","FILATEX","ADFFOODS","CAPLIPOINT","GUJALKALI","SUPREMEIND","SUDARSCHEM","SURYAROSNI","SHAKTIPUMP","GNA","SRTRANSFIN","MOTHERSUMI","MINDACORP","MEGH","KPRMILL","SUBROS","JKPAPER","CARBORUNIV","KEC","POLYCAB","CCL","ICICIBANK","DCMSHRIRAM","ENDURANCE","PHOENIXLTD","KALPATPOWR","ORIENTREF","ASTRAL","SPICEJET","KOTAKBANK","RAJESHEXPO","NITINSPIN","AEGISCHEM","TRIDENT","INDIGO","METROPOLIS","APOLLOPIPE","HONAUT","GODREJCP","INDHOTEL","ASIANPAINT","MUTHOOTCAP","ZYDUSWELL","ALKEM","CHAMBLFERT","INDOAMIN","VIRINCHI","GRANULES","MAHSCOOTER","AIAENG","ORIENTELEC","INOXLEISUR","CANTABIL","ATUL","VGUARD","POLYPLEX","INFIBEAM","FAIRCHEM","ESCORTS","PIDILITIND","JBCHEPHARM","JUBLFOOD","GMBREW","DAAWAT","GODREJAGRO","VINATIORGA","SUNDRMFAST","GODREJPROP","AARTIIND","SUVEN","PIIND","ASTEC","STARPAPER","CANFINHOME","GODFRYPHLP","TASTYBITE","pvr","del","DELTACORP","WELCORP","VENKEYS","upl","spic","PGHH","PGHL","atul","star","WSTCSTPAPR","NRAIL","AFFLE-BE","LINDEINDIA","SHILPAMED","GLOBUSSPR","BERGEPAINT","NESTLEIND","IPCALAB","THYROCARE","gnfc","GNFC","apex","WATERBASE","BIOCON","bi","BRITANNIA","SKFINDIA","BATAINDIA","MCDOWELL-N","abb","ABBOTINDIA","TCIEXP","TATAMETALI","NEOGEN-BE","HAWKINCOOK","VRLLOG","HATSUN","gmm","GMM","MARUTI","DMART-BE","ESSELPACK","megh","NOCIL","UFLEX","gna","JSWSTEEL","NMDC","JAICORPLTD","SEPERATOR","SEPERATOR","irctc"],"favSymbols1":["RUPA","krbl","KPRMILL","SUNDRMFAST","CARBORUNIV","KRBL","TIINDIA","TEAMLEASE","NAUKRI","vbl","VBL","INDIAMART","METROPOLIS","IRCTC","JUBILANT","GODFRYPHLP","TCIEXP","igl","IGL","MGL","GARFIBRES","ASTRAL","ccl","CCL","ESCORTS","INOXLEISUR","WHIRLPOOL","JBCHEPHARM","BRITANNIA","ABBOTINDIA","AIAENG","iolcp","IOLCP","SANOFI","HATSUN","TRENT","hdfc","HDFCAMC","MUTHOOTFIN","ASIANPAINT","TRANSPEK","RITES","kei","KEC","KEI","CAPLIPOINT","ORIENTELEC","HERITGFOOD","ADFFOODS","POLYPLEX","RADICO","ASALCBR","HONAUT","SYMPHONY","ti","TIMKEN","MINDAIND","HARITASEAT","NIITTECH","POLYCAB","pvr","PVR","JUBLFOOD","THYROCARE","VIPIND","srf","atul","GRANULES","CANFINHOME","BAJFINANCE","itc","ITC","MIDHANI","FINCABLES","vmart","VMART","NESCO","ALEMBICLTD","CONTROLPR","GMM","MAHSCOOTER","mgl","SEPERATOR","gmm","ATUL","SRF","BALAMINES","VINATIORGA","FINEORG","AARTIIND","UPL","ALKYLAMINE","SUDARSCHEM","NAVINFLUOR","DEEPAKNTR","FAIRCHEM","DIAMINESQ","MEGH","SEPERATOR","AVANTIFEED","WATERBASE","VENKEYS","APEX","apex","SEPERATOR","JKPAPER","STARPAPER","WSTCSTPAPR","NRAIL","ORIENTPPR","RUCHIRA","YASHPAKKA","SEPERATOR","DAAWAT","megh","EVERESTIND","itdc","ITDCEM","rain","RAIN","MENONBE","RICOAUTO","ACE","INDOAMIN","TIMETECHNO","PRAKASH","AEGISCHEM","AEGISLOG","SPICEJET","AVTNPL","GENUSPOWER","SHAKTIPUMP","WELCORP","DELTACORP","SURYAROSNI","EMMBI","NITINSPIN"],"favSymbols2":["RELIANCE","HDFCBANK","hdfc","HDFC","AXISBANK","ICICIBANK","KOTAKBANK","CUB","SBIN","DCBBANK","RBLBANK","BANDHANBNK","AUBANK","INDUSINDBK","YESBANK","FEDERALBNK","BANKBARODA","SRTRANSFIN","BAJFINANCE","CANFINHOME","CREDITACC","HDFCLIFE","HDFCAMC","ISEC","ICICIGI","ICICIPRULI","CHOLAFIN","CHOLAHLDNG","SBICARD","SBILIFE","PNB","MFSL","MASFIN","MUTHOOTFIN","MUTHOOTCAP","CHEVIOT","NAM-INDIA","BAJAJFINSV","BAJAJHLDNG","IBULHSGFIN","IBVENTURES","AAVAS","dlf","SEPERATOR","SEPERATOR","DLF","IBREALEST","IBULISL","SOBHA","GODREJPROP","SEPERATOR","tcs","SEPERATOR","TCS","INFY","NIITTECH","MASTEK","MPHASIS","SONATSOFTW","SASKEN","HEXAWARE","iti","ITI","MINDTREE","CYIENT","SEPERATOR","mrf","SEPERATOR","FRETAIL","FLFL","ABFRL","RAYMOND","TRIDENT","SHOPERSTOP","SEPERATOR","SEPERATOR","TAJGVK","LEMONTREE","INDHOTEL","ORIENTHOT","MHRIL","SEPERATOR","SEPERATOR","GMM","3MINDIA","WHIRLPOOL","ABBOTINDIA","HONAUT","NESTLEIND","VBL","PGHH","SEPERATOR","SEPERATOR","PIIND","SRF","BALAMINES","VINATIORGA","FINEORG","DEEPAKNTR","TRANSPEK","AARTIIND","GUJALKALI","UPL","ALKYLAMINE","JBCHEPHARM","NAVINFLUOR","SUDARSCHEM","NEOGEN-BE","FAIRCHEM","DIAMINESQ","MEGH","ATUL","SEPERATOR","SEPERATOR","LUPIN","LALPATHLAB","BIOCON","CIPLA","KOPRAN","HESTERBIO","ALKEM","MARKSANS","AUROPHARMA","TORNTPHARM","DRREDDY","ALEMBICLTD","NECLIFE","ASTRAZEN","GLAXO","GRANULES","JUBILANT","METROPOLIS","THYROCARE","CAPLIPOINT","MOREPENLAB","SEPERATOR","SEPERATOR","KEI","FINCABLES","PRINCEPIPE","ASTRAL","FINPIPE","SUPREMEIND","NILKAMAL","POLYCAB","SEPERATOR","SEPERATOR","VEDL","TATASTEEL","TATAMETALI","TINPLATE","JAICORPLTD","HINDZINC","COALINDIA","JSWSTEEL","JINDALSTEL","NMDC","MAITHANALL","NELCO-BE","MOIL","SEPERATOR","SEPERATOR","MARUTI","ESCORTS","MINDAIND","HARITASEAT","BAJAJ-AUTO","M&M","NRBBEARING","AUTOAXLES","WABCOINDIA","MRF","AIAENG","apollo","APOLLOTYRE","BOSCHLTD","AMARAJABAT","EXIDEIND","EICHERMOT","ENDURANCE","JAMNAAUTO","JAYBARMARU","SUBROS","gna","GNA","MENONBE","MOTHERSUMI","SEPERATOR","SEPERATOR","AVANTIFEED","WATERBASE","VENKEYS","APEX","SEPERATOR","SEPERATOR","JKPAPER","STARPAPER","WSTCSTPAPR","NRAIL","ORIENTPPR","RUCHIRA","YASHPAKKA"],"favSymbols3":["NIFTY 50","NIFTY BANK","nifty it","INDIA VIX","NIFTY IT","NIFTY AUTO","NIFTY PHARMA","NIFTY FMCG","NIFTY METAL","NIFTY CONSUMPTION","NIFTY NEXT 50","NIFTY MIDCAP 100","NIFTY SMLCAP 100","SEPERATOR","RELIANCE","SEPERATOR","NESTLEIND","HINDUNILVR","BRITANNIA","ASIANPAINT","DMART-BE","INDIAMART","vmart","VMART","3MINDIA","TITAN","GSKCONS","PGHL","PGHH","ASTRAL","KANSAINER","ORIENTELEC","BERGEPAINT","GILLETTE","JUBLFOOD","pvr","ABBOTINDIA","MARICO","NESCO","itc","ITC","VSTIND","GODFRYPHLP","ntpc","MARUTI","RAYMOND","SYMPHONY","PAGEIND","GODREJCP","PVR","BATAINDIA","PIDILITIND","PIIND","HAVELLS","DABUR","AIAENG","TTKPRESTIG","VOLTAS","WHIRLPOOL","RELAXO","BANKNIFTY20MAY19000CE"],"kitePerfData":{"INFIBEAM":{"color":"#ffffff"},"GRANULES":{"color":"#ffffff"},"RELIANCE":{"color":"#bfffff"},"HDFCBANK":{"color":"#bfffff"},"HDFC":{"color":"#bfffff"},"NIFTY 50":{"color":"#b6ebaf"},"NIFTY BANK":{"color":"#b6ebaf"}},"kiteBasketOrderData":["NESCO","ASTRAL","VGUARD","PHOENIXLTD","JAMNAAUTO","JUBLFOOD","ABFRL","INDUSINDBK","BAJFINANCE","SUPREMEIND","CENTURYPLY","VMART","PVR","TEAMLEASE","RITES","CARBORUNIV","JMFINANCIL","VIPIND","INDHOTEL","SHOPERSTOP","UPL","TIINDIA","ASIANPAINT","AIAENG","ITC","NIITTECH","BHARATFORG","APLAPOLLO","MOTHERSUMI","CHOLAFIN","CUB","ICICIBANK","AXISBANK","NAUKRI","MINDAIND","TRENT","GODFRYPHLP","ESCORTS","ATUL","ALKYLAMINE","SRF","VBL","DLF","KOTAKBANK","SBICARD","JINDALSTEL","CCL","INDIAMART"]}"


   // trmi data

   if(localStorage.getItem("kiteBasketOrderData.json") && JSON.parse(localStorage.getItem("kiteBasketOrderData.json")).length > 50){
     localStorage.setItem("kiteBasketOrderData.json",JSON.stringify(JSON.parse(localStorage.getItem("kiteBasketOrderData.json")).slice(0,50)))    
   }
   if(localStorage.getItem("kite_favSymbols") && JSON.parse(localStorage.getItem("kite_favSymbols")).length > 100){
     localStorage.setItem("kite_favSymbols",JSON.stringify(JSON.parse(localStorage.getItem("kite_favSymbols")).slice(0,100)))
   }


    let favSymbols = localStorage.getItem("kite_favSymbols")!=undefined ?JSON.parse(localStorage.getItem("kite_favSymbols")):[];
    let favSymbols1 = localStorage.getItem("kite_favSymbols1")!=undefined ?JSON.parse(localStorage.getItem("kite_favSymbols1")):[];
    let favSymbols2 = localStorage.getItem("kite_favSymbols2")!=undefined ?JSON.parse(localStorage.getItem("kite_favSymbols2")):[];
    let favSymbols3 = localStorage.getItem("kite_favSymbols3")!=undefined ?JSON.parse(localStorage.getItem("kite_favSymbols3")):[];

    let kitePerfData = localStorage.getItem("kitePerfData.json")!=undefined ?JSON.parse(localStorage.getItem("kitePerfData.json")):[];

    let kiteBasketOrderData = localStorage.getItem("kiteBasketOrderData.json")!=undefined ?JSON.parse(localStorage.getItem("kiteBasketOrderData.json")):[];

    this.kiteOldPriceData = localStorage.getItem("kiteOldChanges.json")!=undefined ?JSON.parse(localStorage.getItem("kiteOldChanges.json")):[];
    let resultCalenderData = localStorage.getItem("kite_resultCalender")!=undefined ?JSON.parse(localStorage.getItem("kite_resultCalender")):[];

    this.state={isShowEditor:false,isShowVolumeGainers:false,isEnableCustomWatchList:false,isEnableIntraPosition:false,isEnableATMStrike:false,isShowResults:false,isShowMIS:false,isShowNotification:true,isShowGL:true,favSymbols:favSymbols,favSymbols1:favSymbols1,favSymbols2:favSymbols2,favSymbols3:favSymbols3,kitePerfData:kitePerfData,kiteBasketOrderData:kiteBasketOrderData,symbolSelector:{cursor:undefined,isAdd:true,isShow:false},isLoadOldPrice:false,resultCalenderData:resultCalenderData};

    this.alertMap ={};

    this.indexSymbols=['NIFTY 50','NIFTY BANK','INDIA VIX','NIFTY IT','NIFTY AUTO','NIFTY PHARMA','NIFTY FMCG','NIFTY METAL','NIFTY CONSUMPTION','NIFTY PSU BANK','NIFTY PVT BANK','NIFTY REALTY','NIFTY INFRA','NIFTY ENERGY','NIFTY FIN SERVICE','NIFTY COMMODITIES','NIFTY MEDIA','NIFTY NEXT 50','NIFTY MIDCAP 100','NIFTY SMLCAP 100','N100','GOLDBEES'];


  }





showToast=(content,symbol)=>{
    if(this.state.isShowNotification){
        let delay = (symbol === 'NIFTY 50' || symbol === 'NIFTY BANK')?30*1000:10*60*1000;
        let position = (symbol === 'NIFTY 50' || symbol === 'NIFTY BANK')?"top":"bottom-left";
        let duration =(symbol === 'NIFTY 50' || symbol === 'NIFTY BANK')?20000:100000;

        if(this.alertMap.hasOwnProperty(symbol) &&  (( Date.now() - this.alertMap[symbol]) < delay )){
          return;
        }

        toaster.notify(content, {
          position: position, // top-left, top, top-right, bottom-left, bottom, bottom-right
          duration: duration // This notification will not automatically close
        });
        this.alertMap[symbol]=Date.now();
    }
}



updateMarginData=()=>{
  getMargin(this.onMarginSuccess,this.onMarginError);
}

onMarginSuccess=(data)=>{
  this.setState({margin:data}); 
}
onMarginError=()=>{
}


showBasketOrderDialog=()=>{
  this.setState({isShowBasketOrderDialog:true});
  if(this.basketOrderDialogRef){
    this.basketOrderDialogRef.showDialog();
  }
}

hideBasketOrderDialog=()=>{
  this.setState({isShowBasketOrderDialog:undefined});
}




showHoldingOrderDialog=()=>{
  this.setState({isShowHoldingOrderDialog:true});
  if(this.holdingOrderDialogRef){
    this.holdingOrderDialogRef.showDialog();
  }
}

hideHoldingOrderDialog=()=>{
  this.setState({isShowHoldingOrderDialog:undefined});
}



hideStokInfo=()=>{
  this.setState({stockInfo:undefined});
}

hideSymbolSelector=()=>{
  this.setState({symbolSelector:{cursor:undefined,isAdd:true,isShow:false}}); // rest selector
}


hideFundamentalsDialog=()=>{
  this.setState({showFundamental:undefined});
}

showFundamentalsDialog=(symbol)=>{
  this.setState({showFundamental:symbol});
}


escFunction=(event)=>{
    if(event.keyCode === 27) {
      this.hideStokInfo();
      this.hideBasketOrderDialog();
      this.hideFundamentalsDialog();
      this.hideHoldingOrderDialog();
      this.hideSymbolSelector();
    }
}



componentDidMount() {
  this.fetchAllKiteSymbolsList();
  this.fetchBSEtoNSEmaapingList();
  this.fetchTradingViewSiteData();
  this.fetchCustomWatchList();

  
  this.resCalenderTimout=setTimeout(this.fetchRecentCalenderCSVFile,5000);

  this.TFPropertyTimout=setTimeout(this.fetchTFPropertyFile,5000);

  this.marketQuoteTimeout=setTimeout(this.fetchMarketQuote,5000);

  this.fetchHistoricalDataTimeout=setTimeout(this.fetchHistoricalDataForNiftyBanknifty,5000);
  this.fetchHistoricalDataTimeout20Min=setTimeout(this.fetchHistoricalDataForNiftyBanknifty,20*60*1000);
  this.fetchHistoricalDataTimeout30Min=setTimeout(this.fetchHistoricalDataForNiftyBanknifty,30*60*1000);

  this.updateMarginData();
  this.refreshData();
  this.refreshKiteTicksData();

  this.interval = setInterval(this.refreshData, 1200);
  this.kiteTickinterval = setInterval(this.refreshKiteTicksData, 800);
  document.addEventListener("keyup", this.escFunction, false);

  this.ATMStrikeInterval = setInterval(this.fetchATMStrikePrice, 25*1000);

}

  componentWillUnmount(){
    document.removeEventListener("keyup", this.escFunction, false);
    clearInterval( this.interval );
    clearInterval( this.kiteTickinterval );
    clearTimeout( this.resCalenderTimout);
    clearTimeout( this.TFPropertyTimout);
    clearTimeout( this.fetchMarketQuote);
    clearTimeout( this.ATMStrikeInterval);

    clearTimeout( this.fetchHistoricalDataTimeout);
    clearTimeout( this.fetchHistoricalDataTimeout20Min);
    clearTimeout( this.fetchHistoricalDataTimeout30Min);
  }


 refreshKiteTicksData =()=>{

      fetch(window.domain+'kiteticks.json?v='+(new Date().getTime()))
        .then(response => response.json())
        .then(function(jsonData){

         if(this.state.isLoadOldPrice){
              this.kitedata = this.kiteOldPriceData
         } else{
            this.kitedata =  jsonData;
         }
         
      //  this.createDummyTicks();

        this.setState({kitedata:this.kitedata,investingdata:this.investingdata,positionsdata:this.positionsdata,holdingsdata:this.holdingsdata,kiteAllSymbols:this.kiteAllSymbols});

        }.bind(this))
        .catch((error) => {
          console.error(error)
        })

        
}

 refreshData =()=>{

      fetch(window.domain+'changes.json?v='+(new Date().getTime()))
        .then(response => response.json())
        .then(function(jsonData){
         this.investingdata = jsonData;
        }.bind(this))
        .catch((error) => {
          console.error(error)
        })


      fetch(window.domain+'positions.json?v='+(new Date().getTime()))
        .then(response => response.json())
        .then(function(jsonData){
         this.positionsdata = jsonData;
        }.bind(this))
        .catch((error) => {
          console.error(error)
        })

      fetch(window.domain+'holdings.json?v='+(new Date().getTime()))
        .then(response => response.json())
        .then(function(jsonData){
         this.holdingsdata = jsonData;
        }.bind(this))
        .catch((error) => {
          console.error(error)
        })


        this.fetchCustomWatchList();


     //  this.setState({kitedata:this.kitedata,investingdata:this.investingdata,positionsdata:this.positionsdata,holdingsdata:this.holdingsdata,kiteAllSymbols:this.kiteAllSymbols});

 }







fetchATMStrikePrice=()=>{

    if(this.state.isEnableATMStrike &&  this.kitedata){
        let niftyLevel =  Math.round(  this.kitedata.ticks['NIFTY 50'].lastTradedPrice / 50)*50;
        let bankNIftyLevel = Math.round(  this.kitedata.ticks['NIFTY BANK'].lastTradedPrice / 100)*100;
        let dateString=localStorage.getItem('OPTDateString')
        if(dateString){
          let nce =  'NFO:NIFTY' + dateString + niftyLevel + 'CE';
          let npe =  'NFO:NIFTY' + dateString + niftyLevel + 'PE';
          let bce =  'NFO:BANKNIFTY' + dateString + bankNIftyLevel + 'CE';
          let bpe =  'NFO:BANKNIFTY' + dateString + bankNIftyLevel + 'PE';

          let queryString =  'i='+nce + '&i='+npe + '&i='+bce + '&i='+bpe;

          getFullQuote(queryString,(data)=>{
            if(data && data.data){
              this.ATMStrike={};
              this.ATMStrike['NIFTY'] ={symbol:niftyLevel, open:(data.data[nce].ohlc.close + data.data[npe].ohlc.close),close:(data.data[npe].last_price+data.data[nce].last_price)};
              this.ATMStrike['BANK'] ={symbol:bankNIftyLevel, open:(data.data[bce].ohlc.close + data.data[bpe].ohlc.close),close:(data.data[bpe].last_price+data.data[bce].last_price)};

            }
          }
          ,()=>{});

        }
    }



}



randomFloat=(min, max) =>{
  let rand = (min + (max - min) * Math.random());
  return Math.round(rand * 100)/100 
}

createDummyTicks=()=>{
  let min =0;
  let keys=Object.keys(this.kitedata.ticks);
  let max = keys.length;

  for(let i=0;i<4;i++){
    let randomKey = min + Math.floor((max - min) * Math.random());

    this.kitedata.ticks['TATAMOTORS'].lastTradedPrice = this.randomFloat(300,315);
    this.kitedata.ticks['TATAMOTORS'].change = this.randomFloat(0,30);

    this.kitedata.ticks[keys[randomKey]].lastTradedPrice = this.randomFloat(0,500);
    this.kitedata.ticks[keys[randomKey]].change = this.randomFloat(0,30);
  }
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
 }

 
 onFetchMarketQuoteError=(data)=>{
  window.alert('Error to fetch Market Quotes');
 }

 fetchMarketQuote=()=>{
  if(this.kitedata){
      let ticks = this.kitedata.ticks;
      let keys = Object.keys(ticks);
      let queryString = '';
      for(let i=0;i<keys.length;i++){
        queryString += ('i='+ ticks[keys[i]].exchange +":" + ticks[keys[i]].tradingsymbol +'&');
        if(i==499 || i==keys.length-1){
          getFullQuote(queryString,this.onFetchMarketQuoteSuccess,this.onFetchMarketQuoteError);
          queryString='';
        }        
      }      
  }else{
    window.alert('Unable to fetch Market Quotes');
  }
 }


  fetchTradingViewSiteData=()=>{
      fetch(window.domain+'tradingviewdata.json?v='+(new Date().getTime()))
        .then(response => response.json())
        .then(function(jsonData){
         this.tradingviewdata = jsonData;
         this.setState({tradingviewdata:this.tradingviewdata});
        }.bind(this))
        .catch((error) => {
          console.error(error)
        })
  }



  fetchBSEtoNSEmaapingList=()=>{
      fetch(window.domain+'BSEtoNSEsymbolsMapping.json?v='+(new Date().getTime()))
        .then(response => response.json())
        .then(function(jsonData){
         this.BSEtoNSEsymbolsMapping = jsonData;
         this.setState({BSEtoNSEsymbolsMapping:this.BSEtoNSEsymbolsMapping});
        }.bind(this))
        .catch((error) => {
          console.error(error)
        })
  }

  fetchCustomWatchList=()=>{
      fetch(window.domain+'customWatchList.json?v='+(new Date().getTime()))
        .then(response => response.json())
        .then(function(jsonData){
         this.customWatchList = jsonData;
         this.setState({customWatchList:this.customWatchList});
        }.bind(this))
        .catch((error) => {
          console.error(error)
        })
  }


  fetchAllKiteSymbolsList=()=>{
      fetch(window.domain+'kiteAllSymbols.json?v='+(new Date().getTime()))
        .then(response => response.json())
        .then(function(jsonData){
         this.kiteAllSymbols = jsonData;
         this.setState({kiteAllSymbols:this.kiteAllSymbols});
        }.bind(this))
        .catch((error) => {
          console.error(error)
        })
  }


  fetchTFPropertyFile =()=>{

      fetch(window.domain+'TrendFollowing.properties?v='+(new Date().getTime()))
        .then(response => response.text())
        .then(function(textData){

        let TFPropertyMap = {};

        let rows = textData.split("\n") ;

         for(let i=0;i<rows.length;i++){
            if(rows[i].trim().length > 0){
              let kv =rows[i].trim().split('=');
              if(kv.length >1){
                 TFPropertyMap[kv[0]]=kv[1].replaceAll('\\#',',')
              }
               
            }
         }
         this.setState({TFPropertyMap:TFPropertyMap});

        }.bind(this))
        .catch((error) => {
          console.error(error)
        })

  }

  fetchRecentCalenderCSVFile=()=>{
      fetch(window.domain+'output/result-calendar.csv?v='+(new Date().getTime()))
        .then(response => response.text())
        .then(function(textData){
          if(this.kitedata == undefined || this.holdingsdata == undefined){
            window.alert('Upcoming results not loaded');
            return;
          }

          let holdingMap = {};
          for(let i=0;i<this.holdingsdata.data.length;i++){
            holdingMap[this.holdingsdata.data[i].tradingsymbol]=true;
          }


         let rows = textData.split("\n") ;
/*         
         let todayDate = new Date();          
         if(todayDate.getDay() == 6 || todayDate.getDay() == 0){
           todayDate.setDate(todayDate.getDate()-3);
         }else{
           todayDate.setDate(todayDate.getDate()-1);
         }
*/
         let recentResultCalender={};
         for(let i=0;i<rows.length;i++){
            if(rows[i].trim().length > 0){
              let symbol =rows[i].trim().split(',')[0].toUpperCase();
              let date = rows[i].trim().split(',')[1];
              if(this.kitedata.ticks[symbol] !=undefined){
                let rowDate = new Date(rows[i].trim().split(',')[1]);
                //if(rowDate >= todayDate){
                  if(recentResultCalender[date] ==undefined){
                    recentResultCalender[date]=[];
                  }
                  recentResultCalender[date].push({symbol:symbol,date:new Date(date).toDateString(),inHolding:holdingMap[symbol]});
              //  }
              }
            }
         }
         this.setState({recentResultCalender:recentResultCalender});

        }.bind(this))
        .catch((error) => {
          console.error(error)
        })
  }


 
  saveCurrentPrice=()=>{
      let ticks = this.kitedata.ticks;
      let keys = Object.keys(ticks);
      for(let i=0;i<keys.length;i++){
        delete ticks[keys[i]].depth;
        delete ticks[keys[i]].tickTimestamp;
        delete ticks[keys[i]].lastTradedTime;
      }
     localStorage.setItem("kiteOldChanges.json", JSON.stringify(this.kitedata));   
  }


 onTableRowclick=(data,tableId,isOpenGraph)=>{
    let symbolSelector = this.state.symbolSelector; 
    if(symbolSelector.isShow && [0,1,2,3,'MIS','RES'].includes(tableId) ){
      symbolSelector.cursor=data;
      document.getElementById("portfolioInput").value=tableId;
    }
    this.setState({stockInfo:{symbol:data,tableId:tableId,isOpenGraph:isOpenGraph},symbolSelector:symbolSelector});
 }



 onSelectorInput=(evt)=>{
    let val = document.getElementById("inputSymbol").value;    
    

    let tempMatch = this.state.kiteAllSymbols.allSymbols.filter(function(item){ return item.tradingsymbol.toUpperCase()==val.toUpperCase()});
    if(tempMatch.length >0 || val.toUpperCase()=='SEPERATOR'){
        let portfolioId = document.getElementById("portfolioInput").value;
        let isAdd = this.state.symbolSelector.isAdd;

        if(['0','1','2','3','MIS','RES'].includes(portfolioId) ){
          if(isAdd){
            this.addToFavList(val,portfolioId);            
          }else{
            this.removeFromFavList(val,portfolioId);           
          }         
        }
        document.getElementById("inputSymbol").select();
    }
 }



fetchHistoricalDataForNiftyBanknifty=()=>{
  this.fetchHistoricalData('NIFTY 50');
  this.fetchHistoricalData('NIFTY BANK');
}

 fetchHistoricalData =(symbol)=>{
    let ticker = this.state.kitedata.ticks[symbol];

     let fromdate = new Date();
     fromdate.setDate(fromdate.getDate()-2000);

      fetch('https://api.kite.trade/instruments/historical/'+ticker.token+'/day?from='+fromdate.toISOString().split('T')[0]+'&to='+new Date().toISOString().split('T')[0],
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
          //save last day data;
          if(!this.niftyBankniftyData){
            this.niftyBankniftyData={};
          }          
          let candles= jsonData.data.candles;
          this.niftyBankniftyData[symbol]= {pdc:candles[candles.length-2]};          
        }.bind(this))
        .catch((error) => {
          console.error(error)
        });

}




  getFavSymbols=(listId)=>{
    switch(listId){
      case "0": return this.state.favSymbols;
      case "1": return this.state.favSymbols1;
      case "2": return this.state.favSymbols2;
      case "3": return this.state.favSymbols3;
      case "MIS": return this.state.kiteBasketOrderData;  //MIS
      case "RES": return this.state.resultCalenderData;  //MIS
      default:break;    
    }
  }

  setFavSymbols=(listId,tempSymbols)=>{
    switch(listId){
      case "0":  this.setState({favSymbols:tempSymbols});localStorage.setItem("kite_favSymbols", JSON.stringify(tempSymbols)); break;    
      case "1":  this.setState({favSymbols1:tempSymbols});  localStorage.setItem("kite_favSymbols1", JSON.stringify(tempSymbols)); break;
      case "2":  this.setState({favSymbols2:tempSymbols});localStorage.setItem("kite_favSymbols2", JSON.stringify(tempSymbols)); break;
      case "3":  this.setState({favSymbols3:tempSymbols});localStorage.setItem("kite_favSymbols3", JSON.stringify(tempSymbols)); break;
      case "MIS": this.setState({kiteBasketOrderData:tempSymbols});localStorage.setItem("kiteBasketOrderData.json", JSON.stringify(tempSymbols));break;
      case "RES": this.setState({resultCalenderData:tempSymbols});localStorage.setItem("kite_resultCalender", JSON.stringify(tempSymbols));break;
      default: break;  
    }
  }



  addToFavList=(data,listId)=>{

    listId = listId==undefined?"":listId+"";
    let tempSymbols = this.getFavSymbols(listId);    

    if(data != 'SEPERATOR'){
      tempSymbols = tempSymbols.filter(function(value, index){
        return value != data;
      });   
    }

    if(data == 'SEPERATOR' || this.state.kitedata.ticks[data]){
      let cursorRowId = this.state.symbolSelector.cursor?this.state.symbolSelector.cursor:'';  
      let indertPos = tempSymbols.indexOf(cursorRowId);
      if(indertPos >= 0){
        tempSymbols.splice(indertPos, 0, data);
      }else{
        tempSymbols.unshift(data);
      }

      this.setFavSymbols(listId,tempSymbols);       
    }

    if(data != 'SEPERATOR' && !this.state.kitedata.ticks[data]){
      console.error(data);
    }

  }


  removeFromFavList=(data,listId)=>{
    listId = listId==undefined?"":listId+"";
    let tempSymbols = this.getFavSymbols(listId);
    
    if(data != 'SEPERATOR'){
      tempSymbols = tempSymbols.filter(function(value, index){
        return value != data;
      });
    }else{
      let cursorRowId = this.state.symbolSelector.cursor?this.state.symbolSelector.cursor:'';  
      let deletePos = tempSymbols.indexOf(cursorRowId);
      tempSymbols.splice(deletePos+1,1)
      
    }     
    this.setFavSymbols(listId,tempSymbols);
  }



  updateKitePerfData=(tradingSymbol,porpKey,propValue)=>{

    const{
      kitePerfData
    }=this.state;

    if( kitePerfData[tradingSymbol] == undefined){
       kitePerfData[tradingSymbol] = {};
    }
    kitePerfData[tradingSymbol][porpKey]=propValue;
    localStorage.setItem("kitePerfData.json", JSON.stringify(kitePerfData));

    this.setState({kitePerfData:kitePerfData});
  }


  bringElementInView(selector){
      if(document.querySelectorAll(selector) && document.querySelectorAll(selector)[0]){
        document.querySelectorAll(selector)[0].scrollIntoView();  
      }      
  }


 handleChange=(content, delta, source, editor) =>{
      localStorage.setItem('editorText',editor.getHTML());
  }

  render() {

    const{
      kitedata,
      investingdata,
      positionsdata,
      holdingsdata,
      favSymbols,
      favSymbols1,
      favSymbols2,
      favSymbols3,
      kitePerfData,
      stockInfo,
      isShowBasketOrderDialog,
      isShowHoldingOrderDialog,
      kiteBasketOrderData,
      symbolSelector,
      kiteAllSymbols,
      showFundamental,
      resultCalenderData,
      margin,
      isShowGL,
      isShowMIS,
      isShowResults,
      isShowVolumeGainers,
      isEnableCustomWatchList,
      isEnableIntraPosition,
      isEnableATMStrike,
      recentResultCalender,
      isShowEditor,
      BSEtoNSEsymbolsMapping,
      customWatchList,
      tradingviewdata,
      TFPropertyMap
    }=this.state;




    let gainers=[];
    let loosers=[];


    if(kitedata){
      let tempSortedTicks = Object.keys(kitedata.ticks);
      let sortedTicks = [];
      for(let i=0;i<tempSortedTicks.length;i++){
        if(kitedata.ticks[tempSortedTicks[i]].exchange == 'NFO') continue;
        sortedTicks.push(tempSortedTicks[i]);
      }  

      if(isShowGL){
        sortedTicks.sort(function(t1, t2){return kitedata.ticks[t2].change - kitedata.ticks[t1].change});
        for (let i = 0; i < sortedTicks.length; i++) {
            if(kitedata.ticks[sortedTicks[i]].change < 2)break;
            gainers.push(sortedTicks[i]);
        }

        for (let i = sortedTicks.length-1; i >= 0; i--) {
            if(kitedata.ticks[sortedTicks[i]].change > -2)break;
              loosers.push(sortedTicks[i]);
        }
      }else{

        sortedTicks.sort(function(t1, t2){
          let v1 = (kitedata.ticks[t1].highPrice - kitedata.ticks[t1].lastTradedPrice)*100/kitedata.ticks[t1].highPrice;
          let v2 = (kitedata.ticks[t2].highPrice - kitedata.ticks[t2].lastTradedPrice)*100/kitedata.ticks[t2].highPrice;
          return v1 - v2;
        });
        for (let i = 0; i < sortedTicks.length && i< 300; i++) {
            let down = (kitedata.ticks[sortedTicks[i]].highPrice - kitedata.ticks[sortedTicks[i]].lastTradedPrice)*100/kitedata.ticks[sortedTicks[i]].highPrice;
            if(down > 6)break;
            gainers.push(sortedTicks[i]);
        }

        sortedTicks.sort(function(t1, t2){
          let v1 = (kitedata.ticks[t1].lastTradedPrice - kitedata.ticks[t1].lowPrice)*100/kitedata.ticks[t1].lowPrice;
          let v2 = (kitedata.ticks[t2].lastTradedPrice - kitedata.ticks[t2].lowPrice)*100/kitedata.ticks[t2].lowPrice;
          return v1 - v2;
        });
         for (let i = 0; i < sortedTicks.length && i < 300 ; i++) {
            let up = (kitedata.ticks[sortedTicks[i]].lastTradedPrice - kitedata.ticks[sortedTicks[i]].lowPrice)*100/kitedata.ticks[sortedTicks[i]].lowPrice;
            if(up > 6)break;
            loosers.push(sortedTicks[i]);
        }


      }

    }


  let volumeGainers = [];
  if(kitedata && tradingviewdata){
      let FACTOR = 1.5;
      let now = new Date();
      let hour = now.getHours();
      let minutes = now.getMinutes();      

      if(hour >=9 && hour < 10){
        FACTOR = 0.5
      }else if(hour >= 10 && hour < 12){
        FACTOR = 0.75
      }else if(hour >= 12 && hour < 14){
         FACTOR = 1
      }else if(hour >= 14 ){
         FACTOR = 1.5
      }

      let isFirstTime = false;
      if(this.volumeGainersMap == undefined){
        isFirstTime = true;
        this.volumeGainersMap={};
      }

      let ticks = this.kitedata.ticks;
      let keys = Object.keys(ticks);
      for(let i=0;i<keys.length;i++){
        if(tradingviewdata[keys[i]] != undefined){
            let avg_volume = tradingviewdata[keys[i]].average_volume_10d_calc;
            let todayVolume = ticks[keys[i]].volumeTradedToday;
            let fact = todayVolume/avg_volume;
            if(fact >= FACTOR){
              if(!isFirstTime && this.volumeGainersMap[keys[i]] == undefined){
                this.showToast(<div onClick={(evt)=>{this.onTableRowclick(keys[i])}} className='green'>{keys[i] +"  ->  " + (this.kitedata.ticks[keys[i]].lastTradedPrice)}&nbsp;(<span>{(this.kitedata.ticks[keys[i]].change).toFixed(2)}</span>%)  &nbsp;(<span style={{color: 'brown','font-weight': 'bold'}}>{(fact).toFixed(1)}x</span>)</div>,keys[i]);
              }
              this.volumeGainersMap[keys[i]]=fact;
            }else{
              delete this.volumeGainersMap[keys[i]];
            }
        }
      }

      volumeGainers = Object.keys(this.volumeGainersMap);
  } 



    if(kitedata && this.quoteData && this.customWatchList){

        let tempSortedTicks = Object.keys(kitedata.ticks);
        let sortedTicks = [];


        for(let i=0;i<tempSortedTicks.length;i++){
          if(kitedata.ticks[tempSortedTicks[i]].exchange == 'NFO' || tempSortedTicks[i].endsWith('-BE')) continue;

            let ucLimit ;
            let lcLimit ;
            if(this.quoteData['BSE:'+tempSortedTicks[i]] ){
              ucLimit = this.quoteData['BSE:'+tempSortedTicks[i]].upper_circuit_limit;
              lcLimit = this.quoteData['BSE:'+tempSortedTicks[i]].lower_circuit_limit; 
            }else if(this.quoteData['NSE:'+tempSortedTicks[i]] ){
              ucLimit = this.quoteData['NSE:'+tempSortedTicks[i]].upper_circuit_limit;
              lcLimit = this.quoteData['NSE:'+tempSortedTicks[i]].lower_circuit_limit
            }


          let isSkip = ucLimit && (Math.abs(ucLimit - kitedata.ticks[tempSortedTicks[i]].lastTradedPrice )*100/kitedata.ticks[tempSortedTicks[i]].lastTradedPrice) < 1.5
          isSkip = isSkip ||  lcLimit && (Math.abs(lcLimit - kitedata.ticks[tempSortedTicks[i]].lastTradedPrice )*100/kitedata.ticks[tempSortedTicks[i]].lastTradedPrice) < 1.5;
          isSkip = isSkip || ( ( kitedata.ticks[tempSortedTicks[i]].highPrice - kitedata.ticks[tempSortedTicks[i]].lowPrice )*100/kitedata.ticks[tempSortedTicks[i]].lastTradedPrice < 2.3 )

          if(isSkip){
            continue;
          }
          sortedTicks.push(tempSortedTicks[i]);
        }  

        let intraLong={}; let intraSort={};
        sortedTicks.sort(function(t1, t2){
          let v1 = (kitedata.ticks[t1].highPrice - kitedata.ticks[t1].lastTradedPrice)*100/kitedata.ticks[t1].highPrice;
          let v2 = (kitedata.ticks[t2].highPrice - kitedata.ticks[t2].lastTradedPrice)*100/kitedata.ticks[t2].highPrice;
          return v1 - v2;
        });
        for (let i = 0; i < sortedTicks.length && i< 300; i++) {
            let down = (kitedata.ticks[sortedTicks[i]].highPrice - kitedata.ticks[sortedTicks[i]].lastTradedPrice)*100/kitedata.ticks[sortedTicks[i]].highPrice;
            if(down > 0.75)break;
            intraLong[sortedTicks[i]]={};
        }


        sortedTicks.sort(function(t1, t2){
          let v1 = (kitedata.ticks[t1].lastTradedPrice - kitedata.ticks[t1].lowPrice)*100/kitedata.ticks[t1].lowPrice;
          let v2 = (kitedata.ticks[t2].lastTradedPrice - kitedata.ticks[t2].lowPrice)*100/kitedata.ticks[t2].lowPrice;
          return v1 - v2;
        });
         for (let i = 0; i < sortedTicks.length && i < 300 ; i++) {
            let up = (kitedata.ticks[sortedTicks[i]].lastTradedPrice - kitedata.ticks[sortedTicks[i]].lowPrice)*100/kitedata.ticks[sortedTicks[i]].lowPrice;
            if(up > 0.75)break;                              
            intraSort[sortedTicks[i]]={};
        }

       // const intersection = array1.filter(element => array2.includes(element));

       
         // make change at top 
       if(this.prevCustomWatchList ){

           let tempintraLong={}; let tempintraSort={};let tempChange15min={};let tempNew52Whigh={};

           Object.keys(intraLong).map((value,index)=>{ if(!this.prevCustomWatchList['INTRA LONG'][value]) { tempintraLong[value]={};} })
           Object.keys(intraLong).map((value,index)=>{ if(!tempintraLong[value]) { tempintraLong[value]={};} })

           Object.keys(intraSort).map((value,index)=>{ if(!this.prevCustomWatchList['INTRA SHORT'][value]) { tempintraSort[value]={};} })
           Object.keys(intraSort).map((value,index)=>{ if(!tempintraSort[value]) { tempintraSort[value]={};} })


           Object.keys(this.customWatchList['15Min Change']).map((value,index)=>{ if(!this.prevCustomWatchList['15Min Change'][value]) { tempChange15min[value]={};} })
           Object.keys(this.customWatchList['15Min Change']).map((value,index)=>{ if(!tempChange15min[value]) { tempChange15min[value]={};} })

           Object.keys(this.customWatchList['New 52W High']).map((value,index)=>{ if(!this.prevCustomWatchList['New 52W High'][value]) { tempNew52Whigh[value]={};} })
           Object.keys(this.customWatchList['New 52W High']).map((value,index)=>{ if(!tempNew52Whigh[value]) { tempNew52Whigh[value]={};} })
    

          this.customWatchList['INTRA LONG']=tempintraLong;
          this.customWatchList['INTRA SHORT']=tempintraSort;         
          this.customWatchList['15Min Change']=tempChange15min;
          this.customWatchList['New 52W High']=tempNew52Whigh;             


          this.latIntralong = Object.keys(this.customWatchList['INTRA LONG']).slice(0,10);
          this.latIntraSort = Object.keys(this.customWatchList['INTRA SHORT']).slice(0,10);


       }



      if(this.customWatchListRefreshCounter > 150){
        this.customWatchListRefreshCounter=0;
        this.prevCustomWatchList = this.customWatchList;     
      }else if(this.customWatchListRefreshCounter == -1 ){
        this.prevCustomWatchList = this.customWatchList;
      }
      this.customWatchListRefreshCounter++;


  }




  let feedStatusStyle ={};
  if(kitedata && investingdata ){
        let servTime = investingdata.time;
        let kiteTime = kitedata.time;
        let date = new Date();
        let clientTime = date.getHours()*60+date.getMinutes()
        if(Math.abs(clientTime - servTime) > 5 || Math.abs(clientTime - kiteTime) > 5){
          feedStatusStyle.display = "block";
        }else{
          feedStatusStyle.display = "none"
        }
  }




    return (

      <div>
        <div style={feedStatusStyle} className='feed-status'></div>

        {kitedata && holdingsdata && positionsdata &&  BSEtoNSEsymbolsMapping && <div className='tableContainer holding'><HoldingList BSEtoNSEsymbolsMapping={BSEtoNSEsymbolsMapping} kitedata={kitedata} margin={margin} onTableRowclick={this.onTableRowclick} positionsdata={positionsdata} holdingsdata={holdingsdata}/></div>}

        {kitedata &&  investingdata &&
          <div className='indexColumn'>
            <div className='tableContainer niftyIndex'><WatchList  isIndexTable={true} tradingviewdata={this.tradingviewdata} showToast={this.showToast} onTableRowclick={this.onTableRowclick}  kitePerfData={kitePerfData}  kitedata={kitedata} symbolList={this.indexSymbols} isBlinkDayHL={0.001}/></div>  
            <div className='tableContainer index'><GlobalindexList  investingdata={investingdata} /></div>
            <div className='tableContainer watchlistclass'><WatchList   tradingviewdata={this.tradingviewdata}  showToast={this.showToast} tableId={3}   onTableRowclick={this.onTableRowclick} kitePerfData={kitePerfData} kitedata={kitedata} symbolList={[]}   niftyBankniftyData={undefined}   
            ATMStrike={this.state.isEnableATMStrike && this.ATMStrike ? this.ATMStrike:undefined}/></div>
          </div>
        }

        {kitedata && <div className='tableContainer loser'><WatchList  latIntraSort={this.latIntraSort}  isBlinkDayHL={0.005} showCount={true}  tradingviewdata={this.tradingviewdata}  volumeGainers={isShowVolumeGainers?volumeGainers:undefined}  showToast={this.showToast} onTableRowclick={this.onTableRowclick} kitedata={kitedata} symbolList={loosers}/></div>}
        {kitedata && <div className='tableContainer gainers'><WatchList latIntralong={this.latIntralong} isBlinkDayHL={0.005} showCount={true}   tradingviewdata={this.tradingviewdata}  showToast={this.showToast} onTableRowclick= {this.onTableRowclick} kitedata={kitedata} symbolList={gainers}/></div>}
       
        {kitedata && <div className='tableContainer watchlistclass'><WatchList   isBlinkDayHL={0.005} tradingviewdata={this.tradingviewdata} showToast={this.showToast} tableId={0} onTableRowclick={this.onTableRowclick}  kitePerfData={kitePerfData} kitedata={kitedata} symbolList={favSymbols}/></div>}
        {kitedata && <div className='tableContainer watchlistclass'><WatchList   isBlinkDayHL={0.005} tradingviewdata={this.tradingviewdata}  recentResultCalender={recentResultCalender}    resultCalenderData={isShowResults?resultCalenderData:undefined}  kiteBasketOrderData={isShowMIS?kiteBasketOrderData:undefined}  showToast={this.showToast} tableId={1}  onTableRowclick={this.onTableRowclick} kitePerfData={kitePerfData} kitedata={kitedata} symbolList={favSymbols1}/></div>}
        {kitedata && <div className='tableContainer watchlistclass'><WatchList   isBlinkDayHL={0.005} tradingviewdata={this.tradingviewdata}  showToast={this.showToast} tableId={2}   customWatchList={isEnableCustomWatchList?customWatchList:undefined}  positionsdata={isEnableIntraPosition?positionsdata:undefined}    onTableRowclick={this.onTableRowclick} kitePerfData={kitePerfData} kitedata={kitedata} symbolList={favSymbols2}/></div>}


        {stockInfo && <StockInfo tradingviewdata={this.tradingviewdata} TFPropertyMap={TFPropertyMap} isOpenGraph={stockInfo.isOpenGraph} positionsdata={positionsdata} holdingsdata={holdingsdata} quoteData={this.quoteData} updateMarginData={this.updateMarginData} showFundamentalsDialog={this.showFundamentalsDialog} addToFavList={this.addToFavList} removeFromFavList={this.removeFromFavList} hideStokInfo={this.hideStokInfo} stockInfo={stockInfo} updateKitePerfData={this.updateKitePerfData} kitePerfData={kitePerfData} kitedata={kitedata}/> }

        { isShowBasketOrderDialog && <BasketOrderDialog updateMarginData={this.updateMarginData} ref={(ref) => this.basketOrderDialogRef = ref} positionsdata={positionsdata} onTableRowclick={this.onTableRowclick} addToFavList={this.addToFavList} removeFromFavList={this.removeFromFavList} kiteBasketOrderData={kiteBasketOrderData} hideBasketOrderDialog={this.hideBasketOrderDialog} kitedata={kitedata} /> }

        { isShowHoldingOrderDialog && BSEtoNSEsymbolsMapping &&  <HoldingOrderDialog BSEtoNSEsymbolsMapping={BSEtoNSEsymbolsMapping} updateMarginData={this.updateMarginData} ref={(ref) => this.holdingOrderDialogRef = ref} positionsdata={positionsdata} holdingsdata={holdingsdata} onTableRowclick={this.onTableRowclick} addToFavList={this.addToFavList} removeFromFavList={this.removeFromFavList}  hideHoldingOrderDialog={this.hideHoldingOrderDialog} kitedata={kitedata} /> }


        <CurrentTime />
       


        {showFundamental && <FundamentalsDialog symbol={showFundamental} hideFundamentalsDialog={this.hideFundamentalsDialog} kitedata={kitedata} /> }

        { isShowEditor && <ReactQuill  theme="snow" defaultValue={localStorage.getItem('editorText')} onChange={this.handleChange} /> }

        <div className='tool-bar' >


          <button type="button"  onClick={this.saveCurrentPrice}>SAVE</button> 
          <button type="button"  style={{backgroundColor:(this.state.isLoadOldPrice?'red':'initial')}} onClick={(evt)=>{ this.kiteOldPriceData = localStorage.getItem("kiteOldChanges.json")!=undefined ?JSON.parse(localStorage.getItem("kiteOldChanges.json")):[]; this.setState({isLoadOldPrice:!this.state.isLoadOldPrice});} } >{!this.state.isLoadOldPrice?'OLD':'NEW'}</button> 
          <br/>
          <button type="button" className="fontBold" onClick={this.showBasketOrderDialog}>MIS</button>    
          <Search kitedata={kitedata} onTableRowclick={this.onTableRowclick}  showToast={this.showToast} />
          <Screener positionsdata={positionsdata} kiteAllSymbols={kiteAllSymbols} addToFavList={this.addToFavList} kitedata={kitedata} onTableRowclick={this.onTableRowclick}/>

          <button type="button"  onClick={(evt)=>{symbolSelector.isShow = !symbolSelector.isShow ;  symbolSelector.isShow?this.setState({symbolSelector:symbolSelector}):this.setState({symbolSelector:{cursor:undefined,isAdd:true,isShow:false}});}} >{symbolSelector.isShow?<IoMdRemove className="appicon"/>:<IoMdAddCircle className="appicon"/>}</button>

          <button type="button" style={{backgroundColor:(!this.state.isShowNotification?'red':'initial')}} onClick={(evt)=>{ showNotification(!this.state.isShowNotification); this.setState({isShowNotification:!this.state.isShowNotification}); } } >{this.state.isShowNotification?<IoMdNotifications className="appicon"/>:<IoMdNotificationsOff className="appicon"/>}</button> 


        <div className="dropdown">
          <button className="dropbtn">SEC</button>
          <div className="dropdown-content secFilter" >

            <a style={{backgroundColor:(isShowMIS?'green':'red')}} onClick={(evt)=>{ this.setState({isShowMIS:!isShowMIS}); if(!isShowMIS) setTimeout(this.bringElementInView,500,"tr[rowid='MIS-MISSCRIPTS']") }}>MIS</a>
            <a style={{backgroundColor:(isShowResults?'green':'red')}} onClick={(evt)=>{ this.setState({isShowResults:!isShowResults}); if(!isShowResults) setTimeout(this.bringElementInView,500,"tr[rowid='RES-RESCALENDER']")}}>Result</a>

            <a style={{backgroundColor:(isShowVolumeGainers?'green':'red')}} onClick={(evt)=>{ this.setState({isShowVolumeGainers:!isShowVolumeGainers}); if(!isShowVolumeGainers) setTimeout(this.bringElementInView,500,"tr[rowid='VOL-VOLGAINERS']")}}>Volume Gain</a>

            <a style={{backgroundColor:(isEnableCustomWatchList?'green':'red')}} onClick={(evt)=>{ this.setState({isEnableCustomWatchList:!isEnableCustomWatchList}); setTimeout(this.bringElementInView,500,"tr[rowid='CUSTUM_WATCH_LIST']")}}>My List</a>  

            <a style={{backgroundColor:(isEnableIntraPosition?'green':'red')}} onClick={(evt)=>{ this.setState({isEnableIntraPosition:!isEnableIntraPosition}); setTimeout(this.bringElementInView,500,"tr[rowid='INTRA_POSITION_LIST']")}}>Day Pos</a>  
           

            <a style={{backgroundColor:(isEnableATMStrike?'green':'red')}} onClick={(evt)=>{ this.setState({isEnableATMStrike:!isEnableATMStrike});}}>ATM Strike</a>  

           
            <a ></a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-HDFCBANK']")}}>Bank</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-HINDUNILVR']")}}>Fmcg</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-TCS']")}}>IT</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-MARUTI']")}}>Auto</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-AARTIIND']")}}>Chemical</a>          
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-DLF']")}}>Real state</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-FRETAIL']")}}>Retail</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-TAJGVK']")}}>Hotel</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-GMM']")}}>MNC</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-LUPIN']")}}>Pharma</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-RADICO']")}}>Alcohol</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-KEI']")}}>Cable</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-VEDL']")}}>Metal</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-HINDPETRO']")}}>Oil</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-AVANTIFEED']")}}>Food</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-JKPAPER']")}}>Paper</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-ULTRACEMCO']")}}>Cement</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-TV18BRDCST']")}}>Media</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-PAGEIND']")}}>Textile</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-BLUEDART']")}}>Logistic</a>
            <a onClick={(evt)=>{this.bringElementInView("tr[rowid='2-EIDPARRY']")}}>Sugar</a>
          </div>
        </div>


        <button style={{backgroundColor:(!isShowGL?'red':'initial')}} type="button" onClick={(evt)=>{ this.setState({isShowGL:!this.state.isShowGL});} }>{isShowGL?'N-HL':'GL'}</button>    

        <button type="button" onClick={(evt)=>{this.setState({isShowEditor:!isShowEditor});}}><IoIosCreate className="appicon"/></button>

        <button type="button" onClick={this.showHoldingOrderDialog}>HOLD</button>

        
         
        

        </div>



{
  symbolSelector.isShow && kiteAllSymbols &&
      <div className="symbolSelector">
      
        <button className="addRemove" style={{backgroundColor:symbolSelector.isAdd?'green':'red'}} onClick={(evt)=>{symbolSelector.isAdd = !symbolSelector.isAdd ; this.setState({symbolSelector:symbolSelector});}} type="button">{symbolSelector.isAdd?<IoIosAdd className="appicon"/>:<IoMdTrash className="appicon"/>}</button>
          
          <input type='text'  onInput={this.onSelectorInput} id='inputSymbol' list='inputdlist'></input>
          <datalist id='inputdlist'>

           { kiteAllSymbols.allSymbols.map((item,i)=> 
            { 

               if(item.exchange == 'NFO'){
                if(item.name == 'NIFTY' || item.name == 'BANKNIFTY'){
                  if(item.segment=='NFO-OPT'){
                    let textName = item.name + " " + item.expiry.split(' ')[0] + " " + item.strike +" "+item.instrument_type +" | " + item.expiry.split(' ')[1] +" " + item.expiry.split(' ')[2];
                     return (<option key={item.tradingsymbol} value={item.tradingsymbol}>{textName}</option>);            
                  }else if(item.segment=='NFO-FUT'){
                    let textName = item.name + " " + item.expiry.split(' ')[0] + " " + item.expiry.split(' ')[1] +" "+item.instrument_type;
                     return (<option key={item.tradingsymbol} value={item.tradingsymbol}>{textName}</option>);            
                  }
                }                 
              }else{
                 return (<option key={item.tradingsymbol} value={item.tradingsymbol}>{item.name}</option>);  
              }

            })}

            <option key='SEPERATOR' value="SEPERATOR">SEPERATOR</option>
          </datalist> 
          
          <input type='text'  id='portfolioInput' list='portfolioList' ></input>
          <datalist id='portfolioList'>
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={'MIS'}>MIS</option> 
            <option value={'RES'}>RES</option>     
          </datalist>   
          
          <label className="cursor">{symbolSelector.cursor}</label> 
        
      </div>

}



      </div>


    )
  }

}


export default App;



