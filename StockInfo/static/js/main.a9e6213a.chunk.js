(this.webpackJsonpkitewatch=this.webpackJsonpkitewatch||[]).push([[0],{16:function(e,t,a){e.exports=a(25)},21:function(e,t,a){},25:function(e,t,a){"use strict";a.r(t);var n=a(0),l=a.n(n),r=a(11),s=a.n(r),o=(a(21),a(1)),i=a(4),c=a(5),u=a(3),m=a(2),d=(a(6),function(e){Object(u.a)(a,e);var t=Object(m.a)(a);function a(e){return Object(o.a)(this,a),t.call(this,e)}return Object(i.a)(a,[{key:"render",value:function(){var e=this.props,t=e.kitedata,a=e.symbolList,n=e.kitePerfData,r=e.onTableRowclick,s=e.tableId,o=e.showToast,i=[];return t&&(i=a.filter((function(e){return"SEPERATOR"==e||void 0!=t.ticks[e]}))),l.a.createElement("table",null,l.a.createElement("thead",null,l.a.createElement("tr",null,l.a.createElement("th",null,"Name"),l.a.createElement("th",null,"Change"),l.a.createElement("th",null,"LTP"))),l.a.createElement("tbody",null,i.map((function(e,a){return l.a.createElement(p,{showToast:o,tableId:s,onTableRowclick:r,key:e+a,kitedata:t,kitePerfData:n,symbol:e})}))))}}]),a}(l.a.Component)),p=function(e){Object(u.a)(a,e);var t=Object(m.a)(a);function a(e){var n;return Object(o.a)(this,a),(n=t.call(this,e)).openStockInfo=function(){n.props.onTableRowclick(n.props.symbol,n.props.tableId)},n}return Object(i.a)(a,[{key:"componentDidUpdate",value:function(e){var t=this.props.symbol;"SEPERATOR"!=t&&e.symbol==t&&((e.kitedata.ticks[t].change<3&&this.props.kitedata.ticks[t].change>3||e.kitedata.ticks[t].change<5&&this.props.kitedata.ticks[t].change>5||e.kitedata.ticks[t].change<8&&this.props.kitedata.ticks[t].change>8||e.kitedata.ticks[t].change<9.5&&this.props.kitedata.ticks[t].change>9.5||e.kitedata.ticks[t].change<13&&this.props.kitedata.ticks[t].change>13||e.kitedata.ticks[t].change<15&&this.props.kitedata.ticks[t].change>15)&&this.props.showToast(l.a.createElement("div",{className:"green"},this.props.symbol+"  ->  "+this.props.kitedata.ticks[t].change.toFixed(2)),this.props.symbol),(e.kitedata.ticks[t].change>-3&&this.props.kitedata.ticks[t].change<-3||e.kitedata.ticks[t].change>-5&&this.props.kitedata.ticks[t].change<-5||e.kitedata.ticks[t].change>-8&&this.props.kitedata.ticks[t].change<-8||e.kitedata.ticks[t].change>-9.5&&this.props.kitedata.ticks[t].change<-9.5||e.kitedata.ticks[t].change>-13&&this.props.kitedata.ticks[t].change<-13||e.kitedata.ticks[t].change>-15&&this.props.kitedata.ticks[t].change<-15)&&this.props.showToast(l.a.createElement("div",{className:"red"},this.props.symbol+"  ->  "+this.props.kitedata.ticks[t].change.toFixed(2)),this.props.symbol))}},{key:"render",value:function(){var e=this.props,t=e.kitedata,a=e.symbol,n=e.kitePerfData,r=(e.onTableRowclick,e.tableId,"SEPERATOR"==a),s="";t.ticks[a]&&(s=t.ticks[a].change<0?"red":"green");var o={};return n&&n[a]&&(o.backgroundColor=n[a].color),l.a.createElement("tr",{onClick:this.openStockInfo},!r&&l.a.createElement("td",{style:o},t.ticks[a].name),!r&&l.a.createElement("td",{className:s},t.ticks[a].change.toFixed(2)),!r&&l.a.createElement("td",null,t.ticks[a].lastTradedPrice))}}]),a}(l.a.Component),y=a(7),h=a(8),b=a(9),E=a(10),k=function(e){Object(E.a)(a,e);var t=Object(b.a)(a);function a(e){return Object(y.a)(this,a),t.call(this,e)}return Object(h.a)(a,[{key:"render",value:function(){var e=this.props.investingdata;return l.a.createElement("table",null,l.a.createElement("thead",null,l.a.createElement("tr",null,l.a.createElement("th",null,"Name"),l.a.createElement("th",null,"Change"))),l.a.createElement("tbody",null,e.index.map((function(t,a){return l.a.createElement(f,{key:t[0]+a,investingdata:e,data:t})}))))}}]),a}(l.a.Component),f=function(e){Object(E.a)(a,e);var t=Object(b.a)(a);function a(e){return Object(y.a)(this,a),t.call(this,e)}return Object(h.a)(a,[{key:"render",value:function(){var e=this.props.data,t=e[13].startsWith("-")?"red":"green";return l.a.createElement("tr",null,l.a.createElement("td",null,e[0]),l.a.createElement("td",{className:t},e[13]))}}]),a}(l.a.Component),v=function(e){Object(u.a)(a,e);var t=Object(m.a)(a);function a(e){return Object(o.a)(this,a),t.call(this,e)}return Object(i.a)(a,[{key:"render",value:function(){var e=this.props,t=e.positionsdata,a=e.holdingsdata,n=0,r=0,s=0,o=0,i=0,c=0,u=0,m=0,d=0;if(a&&a.data&&t&&t.data){for(var p=0;p<a.data.length;p++){var y=a.data[p];n+=y.quantity+y.t1_quantity}if(t.data.net)for(var h=0;h<t.data.net.length;h++){var b=t.data.net[h];"CNC"==b.product?(b.quantity>0?r+=b.quantity:s+=b.quantity,i+=b.pnl,d+=b.value):"MIS"==b.product&&(o+=b.pnl,m+=b.value),c+=b.pnl,u+=b.value}}a.data.sort((function(e,t){return e.day_change_percentage-t.day_change_percentage})),t.data.net.sort((function(e,t){return"MIS"==e.product&&"MIS"==t.product?0!=e.quantity&&0!=t.quantity?e.pnl-t.pnl:t.quantity-e.quantity:"MIS"==e.product&&"CNC"==t.product?-1:"CNC"==e.product&&"MIS"==t.product?1:0}));for(var E,k=0,f=0,v=0;v<a.data.length;v++){var O=a.data[v];k+=(O.quantity+O.t1_quantity)*O.last_price,f+=(O.quantity+O.t1_quantity)*O.average_price}var I=(E=Math.round(k-f))<0?"red":"green";return document.title=Math.round(E/1e3)+"K ( "+(100*E/f).toFixed(2)+"%) ",l.a.createElement("table",null,l.a.createElement("thead",null,l.a.createElement("tr",null,l.a.createElement("th",null,"Name"),l.a.createElement("th",null,"Change"))),l.a.createElement("tbody",null,l.a.createElement("tr",{key:"summary"},l.a.createElement("td",{colSpan:"2",className:"summaryRow"},l.a.createElement("span",{className:"totalValue"},(k/1e5).toFixed(2)),"L\xa0\xa0\xa0",l.a.createElement("span",{className:I},"".concat(Math.round(E),"(").concat((100*E/f).toFixed(2),"%)")))),l.a.createElement("tr",{key:"position"},l.a.createElement("td",{colSpan:"2",className:"positionRow"},l.a.createElement("span",null,n,"\xa0|",r,"\xa0|",s,"\xa0\xa0=\xa0",n+r))),l.a.createElement("tr",{key:"daypositionsummary"},l.a.createElement("td",{colSpan:"2",className:"summaryRow"},l.a.createElement("span",{className:c<0?"red":"green"},(c/1e3).toFixed(2),"K"),"\xa0\xa0\xa0",l.a.createElement("span",{className:"bracketValue"},"\xa0",l.a.createElement("span",{className:i<0?"red":"green"},"".concat(i.toFixed(2))),"C"),"\xa0\xa0",l.a.createElement("span",{className:"bracketValue"},"\xa0",l.a.createElement("span",{className:o<0?"red":"green"},"".concat(Math.round(o))),"M"))),l.a.createElement("tr",{key:"dayposition"},l.a.createElement("td",{colSpan:"2",className:"positionRow"},l.a.createElement("span",null,d.toFixed(0),"\xa0|\xa0",m.toFixed(0),"\xa0\xa0\xa0=\xa0",u.toFixed(0)))),t.data.net.map((function(e,t){return l.a.createElement(g,{key:"POS"+e.tradingsymbol+t,data:e})})),l.a.createElement("tr",null),l.a.createElement("tr",{key:"summary-row-2"},l.a.createElement("td",{colSpan:"2",className:"summaryRow"},l.a.createElement("span",{className:"totalValue"},(k/1e5).toFixed(2)),"L\xa0\xa0\xa0",l.a.createElement("span",{className:I},"".concat(Math.round(E),"(").concat((100*E/f).toFixed(2),"%)")))),a.data.map((function(e,t){return l.a.createElement(S,{key:"HOLD"+e.tradingsymbol+t,data:e})}))))}}]),a}(l.a.Component),g=function(e){Object(u.a)(a,e);var t=Object(m.a)(a);function a(e){return Object(o.a)(this,a),t.call(this,e)}return Object(i.a)(a,[{key:"render",value:function(){var e=this.props.data,t=e.pnl<0?"red":"green";return l.a.createElement("tr",{className:0==e.quantity?"lightgrey":""},l.a.createElement("td",{style:{position:"relative"}},e.tradingsymbol,"\xa0",l.a.createElement("span",{className:"holdQty "+(e.quantity<0?"red":"green")},"(",e.quantity,")"),l.a.createElement("span",{className:"productType"},e.product)),l.a.createElement("td",null,l.a.createElement("span",{className:"last_price"},e.last_price.toFixed(2)),"\xa0\xa0",l.a.createElement("span",{style:{fontWeight:"bold"},className:"holdDayChg "+t},e.pnl.toFixed(2)),l.a.createElement("br",null),l.a.createElement("span",{className:"positionValue"},Math.round(e.value/1e3),"k")))}}]),a}(l.a.Component),S=function(e){Object(u.a)(a,e);var t=Object(m.a)(a);function a(e){return Object(o.a)(this,a),t.call(this,e)}return Object(i.a)(a,[{key:"render",value:function(){var e=this.props.data,t=(e.quantity+e.t1_quantity)*e.last_price-(e.quantity+e.t1_quantity)*e.average_price,a=e.day_change_percentage<0?"red":"green",n=t<0?"red":"green";return l.a.createElement("tr",null,l.a.createElement("td",null,e.tradingsymbol,l.a.createElement("span",{className:"holdQty"},"(",e.quantity+e.t1_quantity,")"),"\xa0\xa0",l.a.createElement("span",{className:"holdValue"},"(",Math.round((e.quantity+e.t1_quantity)*e.last_price/1e3),")")),l.a.createElement("td",null,l.a.createElement("span",{className:"last_price"},e.last_price.toFixed(2)),"\xa0\xa0",l.a.createElement("span",{className:"holdDayChg "+a},e.day_change_percentage.toFixed(2)),l.a.createElement("br",null),l.a.createElement("span",{className:"holdPL "+n},Math.round(t)),"\xa0\xa0",l.a.createElement("span",{className:"holdPLPec "+n},(100*t/((e.quantity+e.t1_quantity)*e.average_price)).toFixed(2),"%")))}}]),a}(l.a.Component),O=a(12),I=function(e){e.order_type="LIMIT",e.product="CNC",e.validity="DAY",e.disclosed_quantity=0,e.trigger_price=0,e.squareoff=0,e.stoploss=0,e.trailing_stoploss=0,e.variety="regular",e.user_id="DA6170"},N=function(e){e.order_type="LIMIT",e.product="MIS",e.validity="DAY",e.disclosed_quantity=0,e.trigger_price=0,e.squareoff=0,e.stoploss=0,e.trailing_stoploss=0,e.variety="regular",e.user_id="DA6170"},w=function(e,t,a){var n=[];for(var l in e)n.push(l+"="+e[l]);var r=n.join("&");fetch("https://kite.zerodha.com/oms/orders/regular",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",authorization:window.authKey},body:r}).then((function(e){return e.json()})).then((function(e){console.info(e),"success"==e.status?t(e):"error"==e.status&&a(e)})).catch((function(e){console.error(e),a(e)}))},T=function(e){Object(E.a)(a,e);var t=Object(b.a)(a);function a(e){var n;Object(y.a)(this,a),(n=t.call(this,e)).fillInputWithLatestPrice=function(){var e=n.props,t=e.kitedata,a=e.symbol,l=t.ticks[a].depth;l&&(n.setState({orderStatus:t.ticks[a].exchange+"::"+a,orderStatusStyle:{},buyQuantity:1,buyPrice:l.buy[0].price,sellQuantity:1,sellPrice:l.sell[0].price}),n.setFocusonOrderWindow())},n.setFocusonOrderWindow=function(){setTimeout((function(){n.textInputBuyQty?n.textInputBuyQty.select():n.textInputSellQty&&n.textInputSellQty.select()}),5)},n.updaetOrderStatus=function(e){n.setState({orderStatus:e})},n.onInputValueChange=function(e){var t=n.state,a=t.buyQuantity,l=t.buyPrice,r=t.sellQuantity,s=t.sellPrice,o=(t.orderStatus,t.orderStatusStyle,n.props),i=o.kitedata,c=o.symbol;"buyQuantity"==e.target.name?(a=e.target.value,n.setState({buyQuantity:a,orderStatusStyle:{color:"green"},orderStatus:i.ticks[c].exchange+"::"+c+" ( Q-> "+a+" )  ( P-> "+l+" )"})):"buyPrice"==e.target.name?(l=e.target.value,n.setState({buyPrice:l,orderStatusStyle:{color:"green"},orderStatus:i.ticks[c].exchange+"::"+c+" ( Q-> "+a+" )  ( P-> "+l+" )"})):"sellQuantity"==e.target.name?(r=e.target.value,n.setState({sellQuantity:r,orderStatusStyle:{color:"red"},orderStatus:i.ticks[c].exchange+"::"+c+" ( Q-> "+r+" )  ( P-> "+s+" )"})):"sellPrice"==e.target.name&&(s=e.target.value,n.setState({sellPrice:s,orderStatusStyle:{color:"red"},orderStatus:i.ticks[c].exchange+"::"+c+" ( Q-> "+r+" )  ( P-> "+s+" )"}))},n.toogleBuyView=function(){var e=n.state.orderWindowView;e.buyView=!e.buyView,n.setState({orderWindowView:e}),localStorage.setItem("orderWindowView.json",JSON.stringify(e))},n.toogleSellView=function(){var e=n.state.orderWindowView;e.sellView=!e.sellView,n.setState({orderWindowView:e}),localStorage.setItem("orderWindowView.json",JSON.stringify(e))},n.onOrderSuccess=function(e){n.setState({orderStatus:e.data.order_id,buyQuantity:0,sellQuantity:0}),n.setFocusonOrderWindow()},n.onOrderError=function(e){n.setState({orderStatus:e.message,buyQuantity:0,sellQuantity:0}),n.setFocusonOrderWindow()},n.sendBuyOrderRequest=function(){var e,t,a,l=n.state,r=l.buyQuantity,s=l.buyPrice,o=n.props,i=o.kitedata,c=o.symbol;e={exchange:i.ticks[c].exchange,tradingsymbol:c,price:s,quantity:r,transaction_type:"BUY",order_type:"LIMIT"},t=n.onOrderSuccess,a=n.onOrderError,e.transaction_type="BUY",I(e),w(e,t,a)},n.sendSellOrderRequest=function(){var e,t,a,l=n.state,r=l.sellQuantity,s=l.sellPrice,o=n.props,i=o.kitedata,c=o.symbol;e={exchange:i.ticks[c].exchange,tradingsymbol:c,price:s,quantity:r,transaction_type:"SELL",order_type:"LIMIT"},t=n.onOrderSuccess,a=n.onOrderError,e.transaction_type="SELL",I(e),w(e,t,a)};var l={buyView:!0,sellView:!0};return l=void 0!=localStorage.getItem("orderWindowView.json")?JSON.parse(localStorage.getItem("orderWindowView.json")):l,n.state={orderWindowView:l},n.textInputBuyQty=null,n.textInputSellQty=null,n}return Object(h.a)(a,[{key:"componentDidMount",value:function(){this.fillInputWithLatestPrice()}},{key:"componentDidUpdate",value:function(e){e.symbol!=this.props.symbol&&this.fillInputWithLatestPrice()}},{key:"render",value:function(){var e=this,t=this.props,a=t.kitedata,n=t.symbol,r=this.state,s=r.buyQuantity,o=r.buyPrice,i=r.sellQuantity,c=r.sellPrice,u=r.orderStatus,m=r.orderStatusStyle,d=r.orderWindowView,p=a.ticks[n].depth;return l.a.createElement("div",{className:"orderView"},l.a.createElement("button",{className:"favButton orderToggleBtn",onClick:this.toogleSellView,type:"button"},"SW"),l.a.createElement("button",{className:"favButton orderToggleBtn",onClick:this.toogleBuyView,type:"button"},"BW"),l.a.createElement("div",{className:"line"}),l.a.createElement("div",{style:m,className:"orderStatusView"},u),l.a.createElement("br",null),d.buyView&&p&&l.a.createElement("div",{className:"buyOrderView",onKeyUp:function(t){13===t.keyCode&&e.sendBuyOrderRequest()}},l.a.createElement("label",{for:"buyQuantity"},"Q:"),l.a.createElement("input",{type:"number",ref:function(t){return e.textInputBuyQty=t},onClick:function(e){return e.target.select()},onInput:this.onInputValueChange,className:"buyQuantity",step:1,name:"buyQuantity",min:"1",max:"1000",value:s}),l.a.createElement("label",{for:"buyPrice"},"P:"),l.a.createElement("input",{type:"number",onClick:function(e){return e.target.select()},onInput:this.onInputValueChange,className:"buyPrice",step:.2,name:"buyPrice",min:"1",max:"10000",value:o}),l.a.createElement("button",{className:"buyButton",onClick:this.sendBuyOrderRequest}," BUY ")),d.sellView&&p&&l.a.createElement("div",{className:"sellOrderView",onKeyUp:function(t){13===t.keyCode&&e.sendSellOrderRequest()}},l.a.createElement("label",{for:"sellQuantity"},"Q:"),l.a.createElement("input",{type:"number",ref:function(t){return e.textInputSellQty=t},onClick:function(e){return e.target.select()},onInput:this.onInputValueChange,className:"sellQuantity",step:1,name:"sellQuantity",min:"1",max:"1000",value:i}),l.a.createElement("label",{for:"sellPrice"},"P:"),l.a.createElement("input",{type:"number",onClick:function(e){return e.target.select()},onInput:this.onInputValueChange,className:"sellPrice",step:.2,name:"sellPrice",min:"1",max:"10000",value:c}),l.a.createElement("button",{className:"sellButton",onClick:this.sendSellOrderRequest}," SELL ")))}}]),a}(l.a.Component),C=function(e){Object(E.a)(a,e);var t=Object(b.a)(a);function a(e){var n;return Object(y.a)(this,a),(n=t.call(this,e)).onColorInput=function(e){var t=n.props,a=t.stockInfo;(0,t.updateKitePerfData)(a.symbol,"color",e.target.value)},n.fetchHistoricalData=function(){var e=n.props.kitedata.ticks[n.props.stockInfo.symbol],t=new Date;t.setDate(t.getDate()-2e3),fetch("https://api.kite.trade/instruments/historical/"+e.token+"/day?from="+t.toISOString().split("T")[0]+"&to="+(new Date).toISOString().split("T")[0],{method:"GET",headers:{"X-Kite-Version":"3","Content-Type":"application/x-www-form-urlencoded",authorization:window.authKey}}).then((function(e){return e.json()})).then(function(e){this.setState({hCandles:e.data.candles})}.bind(Object(O.a)(n))).catch((function(e){console.error(e)}))},n.state={},n}return Object(h.a)(a,[{key:"componentDidMount",value:function(){this.fetchHistoricalData()}},{key:"componentDidUpdate",value:function(e){e.stockInfo.symbol!==this.props.stockInfo.symbol&&this.fetchHistoricalData()}},{key:"render",value:function(){var e,t,a,n,r,s,o,i,c,u,m,d,p=this.state.hCandles,y=this.props,h=y.kitedata,b=(y.updateKitePerfData,y.stockInfo),E=y.hideStokInfo,k=y.addToFavList,f=y.removeFromFavList,v=b.symbol,g=b.tableId;if(p){var S=p,O=S.length-1,I=S[O][4];e=Number.parseInt(100*-(S[O-1][4]-I)/S[O-1][4]),t=Number.parseInt(100*-(S[O-2][4]-I)/S[O-2][4]),a=Number.parseInt(100*-(S[O-3][4]-I)/S[O-3][4]),n=Number.parseInt(100*-(S[O-5][4]-I)/S[O-5][4]),r=Number.parseInt(100*-(S[O-10][4]-I)/S[O-10][4]),O-23>0&&(s=Number.parseInt(100*-(S[O-23][4]-I)/S[O-23][4])),O-140>0&&(o=Number.parseInt(100*-(S[O-140][4]-I)/S[O-140][4])),O-269>0&&(i=Number.parseInt(100*-(S[O-269][4]-I)/S[O-269][4])),O-540>0&&(c=Number.parseInt(100*-(S[O-540][4]-I)/S[O-540][4])),O-807>0&&(u=Number.parseInt(100*-(S[O-807][4]-I)/S[O-807][4])),O-1076>0&&(m=Number.parseInt(100*-(S[O-1076][4]-I)/S[O-1076][4])),O-1150>0&&(d=Number.parseInt(100*-(S[0][4]-I)/S[0][4]))}var N="https://kite.zerodha.com/chart/ext/tvc/NSE/"+h.ticks[v].tradingsymbol+"/"+h.ticks[v].token,w=h.ticks[v].depth;return l.a.createElement("div",{className:"stockInfo"},l.a.createElement("p",{onDoubleClick:E,className:"name"},h.ticks[v].name),l.a.createElement("table",{className:"stockInfoTable"},l.a.createElement("tbody",null,l.a.createElement("tr",null,l.a.createElement("td",null,"Symbol"),l.a.createElement("td",null,l.a.createElement("a",{rel:"noreferrer",target:"_blank",href:N},h.ticks[v].tradingsymbol))),l.a.createElement("tr",null,l.a.createElement("td",null,"LTP"),l.a.createElement("td",null,h.ticks[v].lastTradedPrice)),l.a.createElement("tr",null,l.a.createElement("td",null,"Change"),l.a.createElement("td",null,h.ticks[v].change.toFixed(2),"%")),l.a.createElement("tr",null,l.a.createElement("td",null,"Volume"),l.a.createElement("td",null,h.ticks[v].volumeTradedToday)),l.a.createElement("tr",null,l.a.createElement("td",null,"High"),l.a.createElement("td",null,h.ticks[v].highPrice)),l.a.createElement("tr",null,l.a.createElement("td",null,"Low"),l.a.createElement("td",null,h.ticks[v].lowPrice)),l.a.createElement("tr",null,l.a.createElement("td",null,"Open"),l.a.createElement("td",null,h.ticks[v].openPrice)),l.a.createElement("tr",null,l.a.createElement("td",null,"Close"),l.a.createElement("td",null,h.ticks[v].closePrice)),l.a.createElement("tr",null,l.a.createElement("td",null,"Color"),l.a.createElement("td",null,l.a.createElement("input",{onInput:this.onColorInput,type:"color",className:"favcolor",name:"favcolor",value:"#ff0000"}))))),p&&l.a.createElement("table",{className:"stockInfoTable historyTable"},l.a.createElement("tbody",null,l.a.createElement("tr",null,l.a.createElement("td",null,"1D"),l.a.createElement("td",null,e)),l.a.createElement("tr",null,l.a.createElement("td",null,"2D"),l.a.createElement("td",null,t)),l.a.createElement("tr",null,l.a.createElement("td",null,"3D"),l.a.createElement("td",null,a)),l.a.createElement("tr",null,l.a.createElement("td",null,"1W"),l.a.createElement("td",null,n)),l.a.createElement("tr",null,l.a.createElement("td",null,"2W"),l.a.createElement("td",null,r)),l.a.createElement("tr",null,l.a.createElement("td",null,"1M"),l.a.createElement("td",null,s)),l.a.createElement("tr",null,l.a.createElement("td",null,"6M"),l.a.createElement("td",null,o)),l.a.createElement("tr",null,l.a.createElement("td",null,"1Y"),l.a.createElement("td",null,i)),l.a.createElement("tr",null,l.a.createElement("td",null,"2Y"),l.a.createElement("td",null,c)),l.a.createElement("tr",null,l.a.createElement("td",null,"3Y"),l.a.createElement("td",null,u)),l.a.createElement("tr",null,l.a.createElement("td",null,"4Y"),l.a.createElement("td",null,m)),l.a.createElement("tr",null,l.a.createElement("td",null,"5Y"),l.a.createElement("td",null,d)))),l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("button",{className:"favButton green",onClick:function(e){k(v,"0")},type:"button"},"A 0"),l.a.createElement("button",{className:"favButton green",onClick:function(e){k(v,"MIS")},type:"button"},"MIS"),void 0!=g&&l.a.createElement("button",{className:"favButton red",onClick:function(e){f(v,g)},type:"button"},"R ",g),l.a.createElement(T,{kitedata:h,symbol:v}),l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("br",null),w&&5==w.buy.length&&5==w.sell.length&&l.a.createElement("table",{className:"bidTable"},l.a.createElement("tbody",null,l.a.createElement("tr",null,l.a.createElement("td",{className:"blue"},w.buy[0].price),l.a.createElement("td",{className:"blue"},w.buy[0].quantity),l.a.createElement("td",{className:"red"},w.sell[0].price),l.a.createElement("td",{className:"red"},w.sell[0].quantity)),l.a.createElement("tr",null,l.a.createElement("td",{className:"blue"},w.buy[1].price),l.a.createElement("td",{className:"blue"},w.buy[1].quantity),l.a.createElement("td",{className:"red"},w.sell[1].price),l.a.createElement("td",{className:"red"},w.sell[1].quantity)),l.a.createElement("tr",null,l.a.createElement("td",{className:"blue"},w.buy[2].price),l.a.createElement("td",{className:"blue"},w.buy[2].quantity),l.a.createElement("td",{className:"red"},w.sell[2].price),l.a.createElement("td",{className:"red"},w.sell[2].quantity)),l.a.createElement("tr",null,l.a.createElement("td",{className:"blue"},w.buy[3].price),l.a.createElement("td",{className:"blue"},w.buy[3].quantity),l.a.createElement("td",{className:"red"},w.sell[3].price),l.a.createElement("td",{className:"red"},w.sell[3].quantity)),l.a.createElement("tr",null,l.a.createElement("td",{className:"blue"},w.buy[4].price),l.a.createElement("td",{className:"blue"},w.buy[4].quantity),l.a.createElement("td",{className:"red"},w.sell[4].price),l.a.createElement("td",{className:"red"},w.sell[4].quantity)),l.a.createElement("tr",null),l.a.createElement("tr",null,l.a.createElement("td",{colSpan:"2",className:"blue"},h.ticks[v].totalBuyQuantity),l.a.createElement("td",null),l.a.createElement("td",{colSpan:"2",className:"red"},h.ticks[v].totalSellQuantity),l.a.createElement("td",null)))))}}]),a}(l.a.Component),P=function(e){Object(u.a)(a,e);var t=Object(m.a)(a);function a(e){var n;return Object(o.a)(this,a),(n=t.call(this,e)).updateOrderStatus=function(e){n.setState({orderStatus:e})},n.state={},n}return Object(i.a)(a,[{key:"componentDidMount",value:function(){}},{key:"componentDidUpdate",value:function(e){}},{key:"render",value:function(){var e=this,t=this.props,a=t.kitedata,n=t.kiteBasketOrderData,r=t.hideBasketOrderDialog,s=t.tableId,o=t.addToFavList,i=t.removeFromFavList,c=this.state.orderStatus;return l.a.createElement("div",{className:"modal"},l.a.createElement("div",{className:"modal-content"},l.a.createElement("div",{className:"orderStatusView"},c),l.a.createElement("span",{onClick:r,className:"close"},"\xd7"),l.a.createElement("div",{className:"basket-orders"},l.a.createElement("table",null,l.a.createElement("thead",null,l.a.createElement("tr",null,l.a.createElement("th",null,"Name"),l.a.createElement("th",null,"Change"),l.a.createElement("th",null,"LTP"),l.a.createElement("th",null,"BID"),l.a.createElement("th",null,"ASK"),l.a.createElement("th",null,"Qty"),l.a.createElement("th",null,"Price"),l.a.createElement("th",null,"BUY"),l.a.createElement("th",null,"SELL"))),l.a.createElement("tbody",null,n.map((function(t,n){return l.a.createElement(D,{addToFavList:o,removeFromFavList:i,tableId:s,updateOrderStatus:e.updateOrderStatus,key:t+n,kitedata:a,symbol:t})})))))))}}]),a}(l.a.Component),D=function(e){Object(u.a)(a,e);var t=Object(m.a)(a);function a(e){var n;return Object(o.a)(this,a),(n=t.call(this,e)).fillInputWithLatestPrice=function(){var e=n.props,t=e.kitedata,a=e.symbol;t.ticks[a].depth&&n.setState({quantity:0,price:t.ticks[a].lastTradedPrice})},n.onInputValueChange=function(e){var t=n.state,a=t.quantity,l=t.price;"quantity"==e.target.name?(a=e.target.value,n.setState({quantity:a})):"price"==e.target.name&&(l=e.target.value,n.setState({price:l}))},n.onOrderSuccess=function(e){(0,n.props.updateOrderStatus)(e.data.order_id),n.setState({quantity:0})},n.onOrderError=function(e){(0,n.props.updateOrderStatus)(e.message),n.setState({quantity:0})},n.sendBuyOrderRequest=function(){var e,t,a,l=n.state,r=l.quantity,s=l.price,o=n.props,i=o.kitedata,c=o.symbol,u=o.updateOrderStatus;e={exchange:i.ticks[c].exchange,tradingsymbol:c,price:s,quantity:r,transaction_type:"BUY",order_type:"LIMIT"},t=n.onOrderSuccess,a=n.onOrderError,e.transaction_type="BUY",N(e),w(e,t,a),u(c+" -> BUY  -> LIMIT -> MIS ->        Q: "+r+"   P: "+s)},n.sendSellOrderRequest=function(){var e,t,a,l=n.state,r=l.quantity,s=l.price,o=n.props,i=o.kitedata,c=o.symbol,u=o.updateOrderStatus;e={exchange:i.ticks[c].exchange,tradingsymbol:c,price:s,quantity:r,transaction_type:"SELL",order_type:"LIMIT"},t=n.onOrderSuccess,a=n.onOrderError,e.transaction_type="SELL",N(e),w(e,t,a),u(c+" -> SELL  -> LIMIT -> MIS ->        Q: "+r+"   P: "+s)},n.state={},n}return Object(i.a)(a,[{key:"componentDidMount",value:function(){this.fillInputWithLatestPrice()}},{key:"componentDidUpdate",value:function(e){}},{key:"render",value:function(){var e=this.props,t=e.kitedata,a=e.symbol,n=(e.tableId,e.addToFavList),r=(e.removeFromFavList,this.state),s=r.quantity,o=r.price,i="";return t.ticks[a]&&(i=t.ticks[a].change<0?"red":"green"),l.a.createElement("tr",null,l.a.createElement("td",{onDoubleClick:function(e){n(a,"MIS")}},a,l.a.createElement("span",{className:"exchangeSuffix"},"\xa0\xa0",t.ticks[a].exchange)),l.a.createElement("td",{className:i},t.ticks[a].change.toFixed(2),"%"),l.a.createElement("td",null,t.ticks[a].lastTradedPrice),l.a.createElement("td",{className:"bidAskCell"},t.ticks[a].depth.buy[0].price,"\xa0\xa0(",l.a.createElement("span",null,t.ticks[a].depth.buy[0].quantity),"\xa0)"),l.a.createElement("td",{className:"bidAskCell"},t.ticks[a].depth.sell[0].price,"\xa0\xa0(",l.a.createElement("span",null,t.ticks[a].depth.sell[0].quantity),"\xa0)"),l.a.createElement("td",null,l.a.createElement("input",{type:"number",autoComplete:"off",onClick:function(e){return e.target.select()},onInput:this.onInputValueChange,className:"quantity",step:1,name:"quantity",min:"1",max:"1000",value:s})),l.a.createElement("td",null,l.a.createElement("input",{type:"number",autoComplete:"off",onClick:function(e){return e.target.select()},onInput:this.onInputValueChange,className:"price",step:.2,name:"price",min:"1",max:"10000",value:o})),l.a.createElement("td",null,l.a.createElement("button",{className:"buyButton",onClick:this.sendBuyOrderRequest}," BUY ")),l.a.createElement("td",null," ",l.a.createElement("button",{style:{backgroundColor:"#e86666"},className:"sellButton",onClick:this.sendSellOrderRequest}," SELL ")))}}]),a}(l.a.Component),j=a(15),L=(a(24),function(e){Object(u.a)(a,e);var t=Object(m.a)(a);function a(e){var n;Object(o.a)(this,a),(n=t.call(this,e)).removeOldAlerts=function(){var e=Object.keys(n.alertMap).filter(function(e){return Date.now()-this.alertMap[e].time<3e5}.bind(Object(c.a)(n)));n.alertMap=e.reduce(function(e,t){return e[t]=this.alertMap[t],e}.bind(Object(c.a)(n)),{})},n.showToast=function(e,t){void 0==n.alertMap[t]&&(j.a.notify(e,{position:"bottom-left",duration:6e4}),n.alertMap[t]={time:Date.now()})},n.showBasketOrderDialog=function(){n.setState({isShowBasketOrderDialog:!0})},n.hideBasketOrderDialog=function(){n.setState({isShowBasketOrderDialog:void 0})},n.hideStokInfo=function(){n.setState({stockInfo:void 0})},n.escFunction=function(e){27===e.keyCode&&(n.hideStokInfo(),n.hideBasketOrderDialog())},n.refreshData=function(){var e="http://localhost:9000/";fetch(e+"kiteticks.json?v="+(new Date).getTime()).then((function(e){return e.json()})).then(function(e){this.state.isLoadOldPrice?this.kitedata=this.kiteOldPriceData:this.kitedata=e}.bind(Object(c.a)(n))).catch((function(e){console.error(e)})),fetch(e+"changes.json?v="+(new Date).getTime()).then((function(e){return e.json()})).then(function(e){this.investingdata=e}.bind(Object(c.a)(n))).catch((function(e){console.error(e)})),fetch(e+"positions.json?v="+(new Date).getTime()).then((function(e){return e.json()})).then(function(e){this.positionsdata=e}.bind(Object(c.a)(n))).catch((function(e){console.error(e)})),fetch(e+"holdings.json?v="+(new Date).getTime()).then((function(e){return e.json()})).then(function(e){this.holdingsdata=e}.bind(Object(c.a)(n))).catch((function(e){console.error(e)})),fetch(e+"kiteAllSymbols.json?v="+(new Date).getTime()).then((function(e){return e.json()})).then(function(e){this.kiteAllSymbols=e}.bind(Object(c.a)(n))).catch((function(e){console.error(e)})),n.setState({kitedata:n.kitedata,investingdata:n.investingdata,positionsdata:n.positionsdata,holdingsdata:n.holdingsdata,kiteAllSymbols:n.kiteAllSymbols})},n.saveCurrentPrice=function(){localStorage.setItem("kiteOldChanges.json",JSON.stringify(n.kitedata))},n.onTableRowclick=function(e,t){var a=n.state.symbolSelector;a.isShow&&[0,1,2,3].includes(t)&&(a.cursor=e,document.getElementById("portfolioInput").value=t),n.setState({stockInfo:{symbol:e,tableId:t},symbolSelector:a})},n.onSelectorInput=function(e){var t=document.getElementById("inputSymbol").value;if(n.state.kiteAllSymbols.allSymbols.filter((function(e){return e.tradingsymbol.toUpperCase()==t.toUpperCase()})).length>0||"SEPERATOR"==t.toUpperCase()){var a=document.getElementById("portfolioInput").value,l=n.state.symbolSelector.isAdd;["0","1","2","3"].includes(a)&&(l?n.addToFavList(t,a):n.removeFromFavList(t,a)),document.getElementById("inputSymbol").select()}},n.getFavSymbols=function(e){switch(e){case"0":return n.state.favSymbols;case"1":return n.state.favSymbols1;case"2":return n.state.favSymbols2;case"3":return n.state.favSymbols3;case"MIS":return n.state.kiteBasketOrderData}},n.setFavSymbols=function(e,t){switch(e){case"0":n.setState({favSymbols:t}),localStorage.setItem("kite_favSymbols",JSON.stringify(t));break;case"1":n.setState({favSymbols1:t}),localStorage.setItem("kite_favSymbols1",JSON.stringify(t));break;case"2":n.setState({favSymbols2:t}),localStorage.setItem("kite_favSymbols2",JSON.stringify(t));break;case"3":n.setState({favSymbols3:t}),localStorage.setItem("kite_favSymbols3",JSON.stringify(t));break;case"MIS":n.setState({kiteBasketOrderData:t}),localStorage.setItem("kiteBasketOrderData.json",JSON.stringify(t))}},n.addToFavList=function(e,t){t=void 0==t?"":t+"";var a=n.getFavSymbols(t);if("SEPERATOR"!=e&&(a=a.filter((function(t,a){return t!=e}))),"SEPERATOR"==e||n.state.kitedata.ticks[e]){var l=n.state.symbolSelector.cursor?n.state.symbolSelector.cursor:"",r=a.indexOf(l);r>=0?a.splice(r,0,e):a.unshift(e),n.setFavSymbols(t,a)}"SEPERATOR"==e||n.state.kitedata.ticks[e]||console.error(e)},n.removeFromFavList=function(e,t){t=void 0==t?"":t+"";var a=n.getFavSymbols(t);if("SEPERATOR"!=e)a=a.filter((function(t,a){return t!=e}));else{var l=n.state.symbolSelector.cursor?n.state.symbolSelector.cursor:"",r=a.indexOf(l);a.splice(r+1,1)}n.setFavSymbols(t,a)},n.updateKitePerfData=function(e,t,a){var l=n.state.kitePerfData;void 0==l[e]&&(l[e]={}),l[e][t]=a,localStorage.setItem("kitePerfData.json",JSON.stringify(l)),n.setState({kitePerfData:l})};var l=void 0!=localStorage.getItem("kite_favSymbols")?JSON.parse(localStorage.getItem("kite_favSymbols")):[],r=void 0!=localStorage.getItem("kite_favSymbols1")?JSON.parse(localStorage.getItem("kite_favSymbols1")):[],s=void 0!=localStorage.getItem("kite_favSymbols2")?JSON.parse(localStorage.getItem("kite_favSymbols2")):[],i=void 0!=localStorage.getItem("kite_favSymbols3")?JSON.parse(localStorage.getItem("kite_favSymbols3")):[],u=void 0!=localStorage.getItem("kitePerfData.json")?JSON.parse(localStorage.getItem("kitePerfData.json")):[],m=void 0!=localStorage.getItem("kiteBasketOrderData.json")?JSON.parse(localStorage.getItem("kiteBasketOrderData.json")):[];return n.kiteOldPriceData=void 0!=localStorage.getItem("kiteOldChanges.json")?JSON.parse(localStorage.getItem("kiteOldChanges.json")):[],n.state={favSymbols:l,favSymbols1:r,favSymbols2:s,favSymbols3:i,kitePerfData:u,kiteBasketOrderData:m,symbolSelector:{cursor:void 0,isAdd:!0,isShow:!1},isLoadOldPrice:!1},n.alertMap={},n}return Object(i.a)(a,[{key:"componentDidMount",value:function(){this.interval=setInterval(this.refreshData,2e3),this.alertInterval=setInterval(this.removeOldAlerts,3e3),document.addEventListener("keyup",this.escFunction,!1)}},{key:"componentWillUnmount",value:function(){document.removeEventListener("keyup",this.escFunction,!1),clearInterval(this.interval),clearInterval(this.alertInterval)}},{key:"render",value:function(){var e=this,t=this.state,a=t.kitedata,n=t.investingdata,r=t.positionsdata,s=t.holdingsdata,o=t.favSymbols,i=t.favSymbols1,c=t.favSymbols2,u=t.favSymbols3,m=t.kitePerfData,p=t.stockInfo,y=t.isShowBasketOrderDialog,h=t.kiteBasketOrderData,b=t.symbolSelector,E=t.kiteAllSymbols,f=[],g=[];if(a){for(var S=Object.keys(a.ticks),O=[],I=0;I<S.length;I++)"NFO"!=a.ticks[S[I]].exchange&&O.push(S[I]);O.sort((function(e,t){return a.ticks[t].change-a.ticks[e].change}));for(var N=0;N<O.length&&!(a.ticks[O[N]].change<2);N++)f.push(O[N]);for(var w=O.length-1;w>=0&&!(a.ticks[O[w]].change>-2);w--)g.push(O[w])}var T={};if(a&&n){var D=n.time,j=a.time,L=new Date,F=60*L.getHours()+L.getMinutes();Math.abs(F-D)>5||Math.abs(F-j)>5?T.display="block":T.display="none"}return l.a.createElement("div",null,l.a.createElement("div",{style:T,className:"feed-status"}),a&&l.a.createElement("div",{className:"tableContainer holding"},l.a.createElement(v,{positionsdata:r,holdingsdata:s})),a&&l.a.createElement("div",{className:"tableContainer loser"},l.a.createElement(d,{showToast:this.showToast,onTableRowclick:this.onTableRowclick,kitedata:a,symbolList:g})),a&&l.a.createElement("div",{className:"tableContainer gainers"},l.a.createElement(d,{showToast:this.showToast,onTableRowclick:this.onTableRowclick,kitedata:a,symbolList:f})),a&&l.a.createElement("div",{className:"tableContainer watchlistclass"},l.a.createElement(d,{showToast:this.showToast,tableId:0,onTableRowclick:this.onTableRowclick,kitePerfData:m,kitedata:a,symbolList:o})),a&&l.a.createElement("div",{className:"tableContainer watchlistclass"},l.a.createElement(d,{showToast:this.showToast,tableId:1,onTableRowclick:this.onTableRowclick,kitePerfData:m,kitedata:a,symbolList:i})),a&&l.a.createElement("div",{className:"tableContainer watchlistclass"},l.a.createElement(d,{showToast:this.showToast,tableId:2,onTableRowclick:this.onTableRowclick,kitePerfData:m,kitedata:a,symbolList:c})),a&&l.a.createElement("div",{className:"tableContainer watchlistclass"},l.a.createElement(d,{showToast:this.showToast,tableId:3,onTableRowclick:this.onTableRowclick,kitePerfData:m,kitedata:a,symbolList:u})),a&&l.a.createElement("div",{className:"tableContainer index"},l.a.createElement(k,{investingdata:n})),p&&l.a.createElement(C,{addToFavList:this.addToFavList,removeFromFavList:this.removeFromFavList,hideStokInfo:this.hideStokInfo,stockInfo:p,updateKitePerfData:this.updateKitePerfData,kitePerfData:m,kitedata:a}),y&&l.a.createElement(P,{addToFavList:this.addToFavList,removeFromFavList:this.removeFromFavList,kiteBasketOrderData:h,hideBasketOrderDialog:this.hideBasketOrderDialog,kitedata:a}),l.a.createElement("div",{className:"tool-bar"},l.a.createElement("button",{type:"button",onClick:this.saveCurrentPrice},"SAVE"),l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("br",null),l.a.createElement("button",{type:"button",onClick:function(t){e.setState({isLoadOldPrice:!e.state.isLoadOldPrice})}},this.state.isLoadOldPrice?"NEW":"OLD"),l.a.createElement("br",null),l.a.createElement("button",{type:"button",onClick:function(t){b.isShow=!b.isShow,e.setState({symbolSelector:b})}},"ADD"),l.a.createElement("br",null),l.a.createElement("button",{type:"button",onClick:this.showBasketOrderDialog},"MIS")),b.isShow&&E&&l.a.createElement("div",{className:"symbolSelector"},l.a.createElement("button",{className:"addRemove",style:{backgroundColor:b.isAdd?"green":"red"},onClick:function(t){b.isAdd=!b.isAdd,e.setState({symbolSelector:b})},type:"button"},"ADD"),l.a.createElement("input",{type:"text",onInput:this.onSelectorInput,id:"inputSymbol",list:"inputdlist"}),l.a.createElement("datalist",{id:"inputdlist"},E.allSymbols.map((function(e,t){if("NFO"!=e.exchange)return l.a.createElement("option",{key:e.tradingsymbol,value:e.tradingsymbol},e.name);if("NIFTY"==e.name||"BANKNIFTY"==e.name){if("NFO-OPT"==e.segment){var a=e.name+" "+e.expiry.split(" ")[0]+" "+e.strike+" "+e.instrument_type+" | "+e.expiry.split(" ")[1]+" "+e.expiry.split(" ")[2];return l.a.createElement("option",{key:e.tradingsymbol,value:e.tradingsymbol},a)}if("NFO-FUT"==e.segment){var n=e.name+" "+e.expiry.split(" ")[0]+" "+e.expiry.split(" ")[1]+" "+e.instrument_type;return l.a.createElement("option",{key:e.tradingsymbol,value:e.tradingsymbol},n)}}})),l.a.createElement("option",{key:"SEPERATOR",value:"SEPERATOR"},"SEPERATOR")),l.a.createElement("input",{type:"text",id:"portfolioInput",list:"portfolioList"}),l.a.createElement("datalist",{id:"portfolioList"},l.a.createElement("option",{value:0},"0"),l.a.createElement("option",{value:1},"1"),l.a.createElement("option",{value:2},"2"),l.a.createElement("option",{value:3},"3")),l.a.createElement("label",{className:"cursor"},b.cursor)))}}]),a}(l.a.Component));s.a.render(l.a.createElement(l.a.StrictMode,null,l.a.createElement(L,null)),document.getElementById("root"))},6:function(e,t,a){}},[[16,1,2]]]);
//# sourceMappingURL=main.a9e6213a.chunk.js.map