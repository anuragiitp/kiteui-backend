import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Random;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.logging.FileHandler;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;
import java.util.stream.Collectors;

import com.zerodhatech.ticker.OnOrderUpdate;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.json.JSONException;

import com.neovisionaries.ws.client.WebSocketException;
import com.zerodhatech.kiteconnect.KiteConnect;
import com.zerodhatech.kiteconnect.kitehttp.SessionExpiryHook;
import com.zerodhatech.kiteconnect.kitehttp.exceptions.KiteException;
import com.zerodhatech.kiteconnect.utils.Constants;
import com.zerodhatech.models.HistoricalData;
import com.zerodhatech.models.Instrument;
import com.zerodhatech.models.Order;
import com.zerodhatech.models.OrderParams;
import com.zerodhatech.models.Quote;
import com.zerodhatech.models.Tick;
import com.zerodhatech.ticker.KiteTicker;
import com.zerodhatech.ticker.OnConnect;
import com.zerodhatech.ticker.OnDisconnect;
import com.zerodhatech.ticker.OnTicks;

public class IndexBuying extends TradeUtil{
	
	/*	 TODO	
	 *   SL Shifting based on daily S/R or pint based
	 *   auto reload some values from props files
	 *   Decide wait time (avg) for entry/exit based on no of attempts taken to breach that level
	 * 
	 * 
	 */
	
	
	
	
	private String algoPropsFile = "../StockInfo/IndexBuying.properties";
	private OrderedProperties algoProps;
	final  Logger logger = Logger.getLogger("TrendFollowing");  
	
	DescriptiveStatistics nifty50Stats1min = new DescriptiveStatistics();	
	DescriptiveStatistics bankNiftyStats1min = new DescriptiveStatistics();
	
	DescriptiveStatistics nifty50Stats3min = new DescriptiveStatistics();	
	DescriptiveStatistics bankNiftyStats3min = new DescriptiveStatistics();
	
	DescriptiveStatistics nifty50Stats5min = new DescriptiveStatistics();	
	DescriptiveStatistics bankNiftyStats5min = new DescriptiveStatistics();
		
	DescriptiveStatistics nifty50Stats10min = new DescriptiveStatistics();	
	DescriptiveStatistics bankNiftyStats10min = new DescriptiveStatistics();
	
	DescriptiveStatistics nifty50Stats15min = new DescriptiveStatistics();	
	DescriptiveStatistics bankNiftyStats15min = new DescriptiveStatistics();

	DescriptiveStatistics nifty50Stats5sec = new DescriptiveStatistics();	
	DescriptiveStatistics bankNiftyStats5sec = new DescriptiveStatistics();

	long lastRecTimeNifty5sec = System.currentTimeMillis();
	long lastRecTimeBankNifty5sec = System.currentTimeMillis();

	
	boolean NIFTY50_ENABLE=false,BANKNIFTY_ENABLE=false;
	double NIFTY50_LONG_TRIGGER=-1,BANKNIFTY_LONG_TRIGGER=-1;
	double NIFTY50_LONG_SL=-1,BANKNIFTY_LONG_SL=-1;
	long NIFTY50_LONG_SL_ORDER_ID=-1,BANKNIFTY_LONG_SL_ORDER_ID=-1;
	long NIFTY50_LONG_PLACED_AT=-1,BANKNIFTY_LONG_PLACED_AT=-1;
	double NIFTY50_SHORT_TRIGGER=-1,BANKNIFTY_SHORT_TRIGGER=-1;
	double NIFTY50_SHORT_SL=-1,BANKNIFTY_SHORT_SL=-1;
	long NIFTY50_SHORT_SL_ORDER_ID=-1,BANKNIFTY_SHORT_SL_ORDER_ID=-1;
		
	long NIFTY50_SHORT_PLACED_AT=-1,BANKNIFTY_SHORT_PLACED_AT=-1;
	int NIFTY50_QTY=0,BANKNIFTY_QTY=0;
	int NIFTY50_TODAY_TRADE=0,BANKNIFTY_TODAY_TRADE=0;
	int NIFTY50_MAXTRADE=0,BANKNIFTY_MAXTRADE=0;
		
	
	Order nifty50LongSLOrder=null,nifty50ShortSLOrder=null;
	Order bankLongSLOrder=null,bankShortSLOrder=null;
	
	double gapFromATMStrike=200;
	
	private final ScheduledThreadPoolExecutor threadPool= new ScheduledThreadPoolExecutor(1);
	
	private Date startTime,endTime;
	private String expiryDate;
	
	int niftyOrdertriggerPoints=15,bankNIftyOrderTriggerPoints=30;
	
	private final static String VARIETY_REGULAR =Constants.VARIETY_REGULAR ;// Constants.VARIETY_AMO; //REVERT
	
	
	public IndexBuying(String authorization) throws JSONException, IOException, KiteException {
		super(authorization);
	
		FileHandler fh = new FileHandler("C:\\Users\\anurkuma\\OneDrive - Adobe\\DRIVE D\\workspace\\StockInfo\\IndexBuying.log",true);  
        logger.addHandler( fh);
        fh.setFormatter(new SimpleFormatter());  
        logger.setUseParentHandlers(false);
        
		OrderedProperties.OrderedPropertiesBuilder builder = new OrderedProperties.OrderedPropertiesBuilder();
		builder.withSuppressDateInComment(false);
		algoProps = builder.build();
		
		algoProps.load(new FileReader(algoPropsFile));          
        
		nifty50Stats1min.setWindowSize(12);bankNiftyStats1min.setWindowSize(12);
		nifty50Stats3min.setWindowSize(36);bankNiftyStats3min.setWindowSize(36);
		nifty50Stats5min.setWindowSize(60);bankNiftyStats5min.setWindowSize(60);
		nifty50Stats10min.setWindowSize(120);bankNiftyStats10min.setWindowSize(120);
		nifty50Stats15min.setWindowSize(180);bankNiftyStats15min.setWindowSize(180);
		
				
		if(algoProps.containsProperty("NIFTY50_ENABLE")) {
			NIFTY50_ENABLE = Boolean.parseBoolean(algoProps.getProperty("NIFTY50_ENABLE"));
		}
		if(NIFTY50_ENABLE) {
			NIFTY50_LONG_TRIGGER = Double.parseDouble(algoProps.getProperty("NIFTY50_LONG_TRIGGER"));
			NIFTY50_LONG_SL = Double.parseDouble(algoProps.getProperty("NIFTY50_LONG_SL"));
			NIFTY50_LONG_PLACED_AT = Long.parseLong(algoProps.getProperty("NIFTY50_LONG_PLACED_AT"));
			NIFTY50_SHORT_TRIGGER = Double.parseDouble(algoProps.getProperty("NIFTY50_SHORT_TRIGGER"));
			NIFTY50_SHORT_SL = Double.parseDouble(algoProps.getProperty("NIFTY50_SHORT_SL"));
			NIFTY50_SHORT_PLACED_AT = Long.parseLong(algoProps.getProperty("NIFTY50_SHORT_PLACED_AT"));			
			NIFTY50_QTY = Integer.parseInt(algoProps.getProperty("NIFTY50_QTY"));
			NIFTY50_TODAY_TRADE = Integer.parseInt(algoProps.getProperty("NIFTY50_TODAY_TRADE"));
			NIFTY50_MAXTRADE = Integer.parseInt(algoProps.getProperty("NIFTY50_MAXTRADE"));
		}
		
		
		
		
		if(algoProps.containsProperty("BANKNIFTY_ENABLE")) {
			BANKNIFTY_ENABLE = Boolean.parseBoolean(algoProps.getProperty("BANKNIFTY_ENABLE"));
		}		
		if(BANKNIFTY_ENABLE) {
			BANKNIFTY_LONG_TRIGGER = Double.parseDouble(algoProps.getProperty("BANKNIFTY_LONG_TRIGGER"));
			BANKNIFTY_LONG_SL = Double.parseDouble(algoProps.getProperty("BANKNIFTY_LONG_SL"));
			BANKNIFTY_LONG_PLACED_AT = Long.parseLong(algoProps.getProperty("BANKNIFTY_LONG_PLACED_AT"));
			BANKNIFTY_SHORT_TRIGGER = Double.parseDouble(algoProps.getProperty("BANKNIFTY_SHORT_TRIGGER"));
			BANKNIFTY_SHORT_SL = Double.parseDouble(algoProps.getProperty("BANKNIFTY_SHORT_SL"));
			BANKNIFTY_SHORT_PLACED_AT = Long.parseLong(algoProps.getProperty("BANKNIFTY_SHORT_PLACED_AT"));			
			BANKNIFTY_QTY = Integer.parseInt(algoProps.getProperty("BANKNIFTY_QTY"));
			BANKNIFTY_TODAY_TRADE = Integer.parseInt(algoProps.getProperty("BANKNIFTY_TODAY_TRADE"));
			BANKNIFTY_MAXTRADE = Integer.parseInt(algoProps.getProperty("BANKNIFTY_MAXTRADE"));			
		}
		
		if(algoProps.containsProperty("EXPIRY_DATE")) {
			expiryDate = algoProps.getProperty("EXPIRY_DATE");
		}		
		
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.SECOND,1);   
		
		if(algoProps.containsProperty("START_TIME")) {			
			try {
				String time = algoProps.getProperty("START_TIME");
				cal.set(Calendar.HOUR_OF_DAY,Integer.parseInt(time.split(":")[0])); 
				cal.set(Calendar.MINUTE,Integer.parseInt(time.split(":")[1]));		
			} catch (Exception e) {
				cal.set(Calendar.HOUR_OF_DAY,9);
				cal.set(Calendar.MINUTE,20);
			}
		}else {
			cal.set(Calendar.HOUR_OF_DAY,9);
			cal.set(Calendar.MINUTE,20);
		}
				
		startTime = cal.getTime();
		
		
		cal.set(Calendar.HOUR_OF_DAY,15);
		cal.set(Calendar.MINUTE,15);
		
		endTime = cal.getTime();		
				
	}
	
	
	public void validateInput() throws Exception, KiteException {
		Map<String, Quote> quotes = kiteConnect.getQuote(new String[] {nifty50Instrument.getExchange()+":"+nifty50Instrument.getTradingsymbol(),bankNiftyInstrument.getExchange()+":"+bankNiftyInstrument.getTradingsymbol()});		
		double niftyLtp = quotes.get(nifty50Instrument.getExchange()+":"+nifty50Instrument.getTradingsymbol()).lastPrice;
		double bankLtp = quotes.get(bankNiftyInstrument.getExchange()+":"+bankNiftyInstrument.getTradingsymbol()).lastPrice;

		
		if(NIFTY50_LONG_TRIGGER !=-1 && ( NIFTY50_LONG_TRIGGER < (niftyLtp - niftyLtp*0.05)  ||   NIFTY50_LONG_TRIGGER > (niftyLtp + niftyLtp*0.05) )) {
			throw new Exception("invalid input NIFTY50_LONG_TRIGGER");
		}
		if(NIFTY50_LONG_TRIGGER !=-1  && NIFTY50_LONG_SL_ORDER_ID==-1  && ( NIFTY50_LONG_SL > NIFTY50_LONG_TRIGGER ||  (NIFTY50_LONG_TRIGGER - NIFTY50_LONG_SL) > 200)) {
			throw new Exception("invalid input NIFTY50_LONG_SL");
		}
							
		if(NIFTY50_SHORT_TRIGGER !=-1 && ( NIFTY50_SHORT_TRIGGER < (niftyLtp - niftyLtp*0.05)  ||   NIFTY50_SHORT_TRIGGER > (niftyLtp + niftyLtp*0.05) )) {
			throw new Exception("invalid input NIFTY50_SHORT_TRIGGER");
		}
		if(NIFTY50_SHORT_TRIGGER !=-1 && NIFTY50_SHORT_SL_ORDER_ID==-1 && ( NIFTY50_SHORT_SL < NIFTY50_SHORT_TRIGGER || (NIFTY50_SHORT_SL - NIFTY50_SHORT_TRIGGER) > 200)) {
			throw new Exception("invalid input NIFTY50_SHORT_SL");
		}
		
		
		if(BANKNIFTY_SHORT_TRIGGER !=-1 && ( BANKNIFTY_SHORT_TRIGGER < (bankLtp - bankLtp*0.05)  ||   BANKNIFTY_SHORT_TRIGGER > (bankLtp + bankLtp*0.05) )) {
			throw new Exception("invalid input BANKNIFTY_SHORT_TRIGGER");
		}
		if(BANKNIFTY_LONG_TRIGGER !=-1  && BANKNIFTY_LONG_SL_ORDER_ID==-1  && ( BANKNIFTY_LONG_SL > BANKNIFTY_LONG_TRIGGER ||  (BANKNIFTY_LONG_TRIGGER - BANKNIFTY_LONG_SL) > 200)) {
			throw new Exception("invalid input BANKNIFTY_LONG_SL");
		}
		
		
		if(BANKNIFTY_LONG_TRIGGER !=-1 && ( BANKNIFTY_LONG_TRIGGER < (bankLtp - bankLtp*0.05)  ||   BANKNIFTY_LONG_TRIGGER > (bankLtp + bankLtp*0.05) )) {
			throw new Exception("invalid input BANKNIFTY_LONG_TRIGGER");
		}
		if(BANKNIFTY_SHORT_TRIGGER !=-1  && BANKNIFTY_SHORT_SL_ORDER_ID==-1 && ( BANKNIFTY_SHORT_SL < BANKNIFTY_SHORT_TRIGGER || (BANKNIFTY_SHORT_SL - BANKNIFTY_SHORT_TRIGGER) > 200)) {
			throw new Exception("invalid input BANKNIFTY_SHORT_SL");
		}		
		
		
		
		if(NIFTY50_QTY > 300) {
			throw new Exception("invalid input NIFTY50_QTY > 300");
		}
		if(BANKNIFTY_QTY > 300) {
			throw new Exception("invalid input BANKNIFTY_QTY > 300");
		}		
		
	}
	
	
	
    public void scheduleUpdateSlorders(int sec) {
    	printLog("updateSLOrders schedule after -> " + sec);
		Runnable t1 = new Runnable() {			
			@Override
			public void run() {				
		    	try {
		    		updateSLOrders();			        
				} catch (JSONException | IOException | KiteException e) {
					e.printStackTrace();
					printLog(e.toString());
				}
				
			}
		};
		threadPool.schedule(t1, sec, TimeUnit.SECONDS);
    }
    
	
	public void updateSLOrders() throws JSONException, IOException, KiteException {
		printLog("updateSLOrders -> ");
		List<Order> openOrder = kiteConnect.getOrders();
				
		if(NIFTY50_LONG_SL_ORDER_ID !=-1) {
				List<Order> openSLOrder = openOrder.stream().filter(order -> order.orderId.equals(Long.toString(NIFTY50_LONG_SL_ORDER_ID)) && order.transactionType.equals(Constants.TRANSACTION_TYPE_SELL) && (order.status.equals("TRIGGER PENDING") || order.status.equals("OPEN") ) &&  order.tradingSymbol.startsWith("NIFTY") ).collect(Collectors.toList());
				if(openSLOrder.size()==0) {
					NIFTY50_LONG_SL_ORDER_ID=-1;
				}else {
					nifty50LongSLOrder = openSLOrder.get(0);
				}
		}
		
		if(NIFTY50_SHORT_SL_ORDER_ID !=-1) {
			List<Order> openSLOrder = openOrder.stream().filter(order -> order.orderId.equals(Long.toString(NIFTY50_SHORT_SL_ORDER_ID)) && order.transactionType.equals(Constants.TRANSACTION_TYPE_SELL) && (order.status.equals("TRIGGER PENDING") || order.status.equals("OPEN") ) &&  order.tradingSymbol.startsWith("NIFTY") ).collect(Collectors.toList());
			if(openSLOrder.size()==0) {
				NIFTY50_SHORT_SL_ORDER_ID=-1;
			}else {
				nifty50ShortSLOrder = openSLOrder.get(0);
			}
		}
		
		
		if(BANKNIFTY_LONG_SL_ORDER_ID !=-1) {
			List<Order> openSLOrder = openOrder.stream().filter(order -> order.orderId.equals(Long.toString(BANKNIFTY_LONG_SL_ORDER_ID)) && order.transactionType.equals(Constants.TRANSACTION_TYPE_SELL) && (order.status.equals("TRIGGER PENDING") || order.status.equals("OPEN") ) &&  order.tradingSymbol.startsWith("BANKNIFTY") ).collect(Collectors.toList());
			if(openSLOrder.size()==0) {
				BANKNIFTY_LONG_SL_ORDER_ID=-1;
			}else {
				bankLongSLOrder = openSLOrder.get(0);
			}
		}
		
		if(BANKNIFTY_SHORT_SL_ORDER_ID !=-1) {
			List<Order> openSLOrder = openOrder.stream().filter(order -> order.orderId.equals(Long.toString(BANKNIFTY_SHORT_SL_ORDER_ID)) && order.transactionType.equals(Constants.TRANSACTION_TYPE_SELL) && (order.status.equals("TRIGGER PENDING") || order.status.equals("OPEN") ) &&  order.tradingSymbol.startsWith("BANKNIFTY") ).collect(Collectors.toList());
			if(openSLOrder.size()==0) {
				BANKNIFTY_SHORT_SL_ORDER_ID=-1;
			}else {
				bankShortSLOrder = openSLOrder.get(0);
			}
		}
		
		saveAlgoProps();		
	}
	
	
	public int roundLevel(double ltp , double strike) {
		 return (int)(Math.round(ltp / strike )*strike);
	}
	
	
	

	public void saveAlgoProps() {
		try {			
			algoProps.setProperty("NIFTY50_LONG_PLACED_AT", Long.toString(NIFTY50_LONG_PLACED_AT));
			algoProps.setProperty("NIFTY50_LONG_SL_ORDER_ID", Long.toString(NIFTY50_LONG_SL_ORDER_ID));
			algoProps.setProperty("NIFTY50_SHORT_PLACED_AT", Long.toString(NIFTY50_SHORT_PLACED_AT));
			algoProps.setProperty("NIFTY50_SHORT_SL_ORDER_ID", Long.toString(NIFTY50_SHORT_SL_ORDER_ID));
			algoProps.setProperty("NIFTY50_TODAY_TRADE", Integer.toString(NIFTY50_TODAY_TRADE));
			algoProps.setProperty("BANKNIFTY_LONG_PLACED_AT", Long.toString(BANKNIFTY_LONG_PLACED_AT));
			algoProps.setProperty("BANKNIFTY_SHORT_PLACED_AT", Long.toString(BANKNIFTY_SHORT_PLACED_AT));			
			algoProps.setProperty("BANKNIFTY_TODAY_TRADE", Integer.toString(BANKNIFTY_TODAY_TRADE));
			algoProps.setProperty("BANKNIFTY_LONG_SL_ORDER_ID", Long.toString(BANKNIFTY_LONG_SL_ORDER_ID));
			algoProps.setProperty("BANKNIFTY_SHORT_SL_ORDER_ID", Long.toString(BANKNIFTY_SHORT_SL_ORDER_ID));			
			FileOutputStream out = new FileOutputStream(algoPropsFile);
			algoProps.store(out,null);
			out.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			 logger.info(e.toString());	
		}
	}
	
	
	
    public void scheduleModifySLOrderToMarket(Order order,int sec,double orderTriggerPoints) {
    	Instrument inst = instrumentsMap.get(order.tradingSymbol +"#"+order.exchange);
		Runnable t1 = new Runnable() {			
			@Override
			public void run() {				
		    	try {
		    		printLog("modifySLOrderToMarket -> " + order.tradingSymbol);
		    		    		 
					Map<String, Quote> quotes = kiteConnect.getQuote(new String[] {inst.getExchange()+":"+inst.getTradingsymbol()});			
					double ltp = quotes.get(inst.getExchange()+":"+inst.getTradingsymbol()).lastPrice;
					
			        OrderParams orderParams =  new OrderParams();
			        orderParams.orderType = Constants.ORDER_TYPE_LIMIT;
			        orderParams.price= ltp - orderTriggerPoints;	        
			        kiteConnect.modifyOrder(order.orderId, orderParams, VARIETY_REGULAR); 
			        	        	        
		    		printLog("modifySLOrderToMarket completed  ");
			        
				} catch (JSONException | IOException | KiteException e) {
					e.printStackTrace();
					printLog(e.toString());
				}
				
			}
		};
		threadPool.schedule(t1, sec, TimeUnit.SECONDS);
    }
    
    
    public Order placeAlgoOrder(Instrument instrument,String transactionType,String orderType,Integer quantity,double price,double trPrice) throws KiteException, IOException {
    	//rms check
    	if(quantity > 500) {
    		printLog("placeAlgoOrder qty > 500 " + quantity);
    		return null;
    	}
    	
    	double tickSize = instrument.tick_size;
    	price = price - price % tickSize + ((price % tickSize < tickSize / 2) ? 0.0 : tickSize);
    	

        OrderParams orderParams = new OrderParams();
        orderParams.tradingsymbol = instrument.getTradingsymbol();
        orderParams.quantity = quantity;
        orderParams.price = price;
        orderParams.orderType = orderType;
        orderParams.product = Constants.PRODUCT_MIS;
        orderParams.exchange = instrument.getExchange();
        orderParams.transactionType = transactionType;
        orderParams.validity = Constants.VALIDITY_DAY;
        orderParams.triggerPrice = 0.0;
    	if(Constants.ORDER_TYPE_SL.equals(orderType) || Constants.ORDER_TYPE_SLM.equals(orderType)){
    		trPrice = trPrice - trPrice % tickSize + ((trPrice % tickSize < tickSize / 2) ? 0.0 : tickSize);
    		orderParams.triggerPrice =trPrice;
    	}        
        orderParams.tag = "ind_by"; //tag is optional and it cannot be more than 8 characters and only alphanumeric is allowed
        Order order = kiteConnect.placeOrder(orderParams, VARIETY_REGULAR);
        printLog(order.orderId);
        return order;    	
    }
    
    public void cancelAlgoOrder(Order order) {
    	if(order != null && order.orderId != null) {   
    		printLog("cancelAlgoOrder -> " + order.orderId);    		
        	try {
    			kiteConnect.cancelOrder(order.orderId, VARIETY_REGULAR);
    		} catch (JSONException | IOException | KiteException e) {
    			e.printStackTrace();
    			printLog(e.toString());
    		}     		    		
    	}

    }    
    
    
	public void scheduleAllAlgoOrderCancelation(int sec, Order s1,Order b1) {
		
		Runnable t1 = new Runnable() {			
			@Override
			public void run() {				
				printLog("Canceling algo orders schedule after -> " + sec);												
				cancelAlgoOrder(s1);
				cancelAlgoOrder(b1);						
			}
		};
		threadPool.schedule(t1, sec, TimeUnit.SECONDS);		  
	}
	
	
	
    //Handle order rejection case
  	public void scheduleOrderValidationCheck(int sec, Order s1,Order b1,double ltp,double orderTriggerPoints) {
  		
  		Runnable t1 = new Runnable() {			
  			@Override
  			public void run() {				
  				printLog("Checking for order validation  ");
  																
  				try {
  					
  					Set<String> orderIds = new HashSet<String>();
  					if(s1!=null && s1.orderId != null) {
  						orderIds.add(s1.orderId);
  					}
  					if(b1!=null && b1.orderId != null) {
  						orderIds.add(b1.orderId);
  					}


  					List<Order> orders = kiteConnect.getOrders();
  					
  					List<Order> rejectedOrders = orders.stream().filter(order -> order.tag!=null && order.tag.equals("ind_by") && order.status.equals("REJECTED") && orderIds.contains(order.orderId)  ).collect(Collectors.toList());
  					List<Order> openOrders = orders.stream().filter(order -> order.tag!=null && order.tag.equals("ind_by") && order.status.equals("OPEN") && orderIds.contains(order.orderId)  ).collect(Collectors.toList());
  					List<Order> triggerPendinOrders = orders.stream().filter(order -> order.tag!=null && order.tag.equals("ind_by") && order.status.equals("TRIGGER PENDING") && orderIds.contains(order.orderId) ).collect(Collectors.toList());
  										
  					printLog("rejectedOrders -> " + rejectedOrders.size() + " openOrders -> " + openOrders.size() + " triggerPendinOrders -> "+triggerPendinOrders.size());
  					
  					if(rejectedOrders.size() > 0 ) {
  						printLog("Cancelling Algo order due to rejection  " + rejectedOrders.size());
  						scheduleAllAlgoOrderCancelation(1, s1, b1);
  						scheduleAllAlgoOrderCancelation(20, s1, b1);
  						
  					}else if(openOrders.size() == 1 && triggerPendinOrders.size() == 1) {  						
  						printLog("modifying back to market -> " + b1.orderId);
  				        OrderParams b1Params =  new OrderParams();
  				        b1Params.price= ltp + orderTriggerPoints;	 			
  						kiteConnect.modifyOrder(b1.orderId, b1Params, VARIETY_REGULAR); // Now place to market for fill  						
  					}  										
  				} catch (JSONException | IOException | KiteException e) {
  					e.printStackTrace();
  					printLog(e.toString());
  				}
  				
  			}
  		};
  		threadPool.schedule(t1, sec, TimeUnit.SECONDS);		  
  	}    

  	
    public void logSLOrderDetails(int sec,Instrument instument,Order order) {    	    	
		Runnable t1 = new Runnable() {			
			@Override
			public void run() {				
		    	String symbol =  instument.getTradingsymbol();
		    	if(symbol.startsWith("NIFTY") && symbol.endsWith("CE")) {
		    		NIFTY50_LONG_SL_ORDER_ID=Long.parseLong(order.orderId);
		    	}else if(symbol.startsWith("NIFTY") && symbol.endsWith("PE")) {
		    		NIFTY50_SHORT_SL_ORDER_ID=Long.parseLong(order.orderId);
		    	}else if(symbol.startsWith("BANKNIFTY") && symbol.endsWith("CE")) {
		    		BANKNIFTY_LONG_SL_ORDER_ID=Long.parseLong(order.orderId);
		    	}else if(symbol.startsWith("BANKNIFTY") && symbol.endsWith("PE")) {
		    		BANKNIFTY_SHORT_SL_ORDER_ID=Long.parseLong(order.orderId);
		    	}
		    	saveAlgoProps();				
				
			}
		};				
		threadPool.schedule(t1, sec, TimeUnit.SECONDS);

    }
    
    
    public void scheduleTriggerBuyorder(Instrument instument,int sec,int qty,double slDiff,double orderTriggerPoints) {
    	
		
		Runnable t1 = new Runnable() {			
			@Override
			public void run() {
		    	
				     Order b1=null,s1=null;
				     try {
			
				    	printLog("trigger buy order for  -> " + instument.getTradingsymbol());
			    	 					
						Map<String, Quote> quotes = kiteConnect.getQuote(new String[] {instument.getExchange()+":"+instument.getTradingsymbol()});
												
						double ltp = quotes.get(instument.getExchange()+":"+instument.getTradingsymbol()).lastPrice;
						
						 			
						b1 = placeAlgoOrder(instument, Constants.TRANSACTION_TYPE_BUY, Constants.ORDER_TYPE_LIMIT, qty,ltp + orderTriggerPoints , 0);						
						s1 = placeAlgoOrder(instument, Constants.TRANSACTION_TYPE_SELL, Constants.ORDER_TYPE_SL, qty, ltp -slDiff -orderTriggerPoints, ltp -slDiff);
						
						logSLOrderDetails(10,instument, s1);logSLOrderDetails(20,instument, s1);
						
						scheduleOrderValidationCheck(2,s1,b1,ltp,orderTriggerPoints);scheduleOrderValidationCheck(4,s1,b1,ltp,orderTriggerPoints);scheduleOrderValidationCheck(10,s1,b1,ltp,orderTriggerPoints);scheduleOrderValidationCheck(20,s1,b1,ltp,orderTriggerPoints);scheduleOrderValidationCheck(50,s1,b1,ltp,orderTriggerPoints);
						
						
						printLog("trigger buy order completed");
															
					} catch (Exception | KiteException e) {
						e.printStackTrace();
						printLog(e.toString());
						scheduleAllAlgoOrderCancelation(1, s1,b1);scheduleAllAlgoOrderCancelation(10, s1,b1);scheduleAllAlgoOrderCancelation(40, s1,b1);						
					} finally {
						scheduleUpdateSlorders(1);scheduleUpdateSlorders(5);scheduleUpdateSlorders(15);
					}				
			}
		};
				
		threadPool.schedule(t1, sec, TimeUnit.SECONDS);

    }
    
	  
    public boolean isTimeWindowOpen(Tick tk) {
		  Date lastTime = tk.getLastTradedTime();
		  if( lastTime== null) {
			  Calendar cal = Calendar.getInstance();
			  lastTime=cal.getTime();
		  }
		  boolean canPlaceOrder = lastTime.after(startTime) && lastTime.before(endTime); // REVERT 		  
		  return canPlaceOrder;	    	
    }
    
    
	public void onNifty50NewTick(Tick tk){		  
		  double ltp = tk.getLastTradedPrice();
		  nifty50Stats5sec.addValue(ltp);		  
		  if(System.currentTimeMillis() - lastRecTimeNifty5sec > 5000) {
			  lastRecTimeNifty5sec = System.currentTimeMillis();
			  double mean = nifty50Stats5sec.getMean();
			  nifty50Stats1min.addValue(mean);
			  nifty50Stats3min.addValue(mean);
			  nifty50Stats5min.addValue(mean);
			  nifty50Stats10min.addValue(mean);
			  nifty50Stats15min.addValue(mean);
			  nifty50Stats5sec.clear();
			  
			  printLog( "STATS : " + ltp+ " " + mean  + " " +nifty50Stats1min.getMean() + " " +nifty50Stats3min.getMean() +" " + nifty50Stats5min.getMean() + "  " + nifty50Stats10min.getMean() + "  " + nifty50Stats15min.getMean());//REVERT
		  }
		    
		  
		  
		  // Add trailing modify NIFTY50_LONG_SL on 100 points gain
		  
		  if(nifty50LongSLOrder != null && ltp < NIFTY50_LONG_SL) {
			  printLog( "SL CHECK : "+ ltp+ " " +nifty50Stats1min.getMean() + " " +nifty50Stats3min.getMean() +" " + nifty50Stats5min.getMean() + "  " + nifty50Stats10min.getMean() + "  " + nifty50Stats15min.getMean());//REVERT
			  
			  double ltpAvg1Min = nifty50Stats1min.getMean();
			  if(ltpAvg1Min < NIFTY50_LONG_SL || NIFTY50_LONG_SL -ltp > ltp*0.0015) {
				  scheduleModifySLOrderToMarket(nifty50LongSLOrder, 0, niftyOrdertriggerPoints);
				  scheduleUpdateSlorders(2);
			  }			  
		  }
		  
		  if(nifty50ShortSLOrder != null && ltp > NIFTY50_SHORT_SL) {
			  printLog( "SL CHECK : "+ ltp+ " " +nifty50Stats1min.getMean() + " " +nifty50Stats3min.getMean() +" " + nifty50Stats5min.getMean() + "  " + nifty50Stats10min.getMean() + "  " + nifty50Stats15min.getMean());//REVERT
			  
			  double ltpAvg1Min = nifty50Stats1min.getMean();
			  if(ltpAvg1Min > NIFTY50_SHORT_SL || ltp-NIFTY50_SHORT_SL > ltp*0.0015) {
				  scheduleModifySLOrderToMarket(nifty50ShortSLOrder, 0, niftyOrdertriggerPoints);
				  scheduleUpdateSlorders(2);
			  }				  
		  }
		  
		  if(!isTimeWindowOpen(tk)) {
			  return;
		  }
		  
		//CE order		  				  
		  if(NIFTY50_LONG_TRIGGER != -1 && NIFTY50_LONG_PLACED_AT ==-1  && NIFTY50_TODAY_TRADE < NIFTY50_MAXTRADE && ltp > NIFTY50_LONG_TRIGGER) {
			  printLog( "ORDER CHECK : "+ ltp+ " " +nifty50Stats1min.getMean() + " " +nifty50Stats3min.getMean() +" " + nifty50Stats5min.getMean() + "  " + nifty50Stats10min.getMean() + "  " + nifty50Stats15min.getMean());//REVERT
			  
			  double ltpAvg3Min = nifty50Stats3min.getMean();
			  double ltpAvg10Min = nifty50Stats10min.getMean();
			  
			  if(ltpAvg3Min > NIFTY50_LONG_TRIGGER && Math.abs( ltpAvg10Min - NIFTY50_LONG_TRIGGER) < ltp*0.0020  ) {				  				   
				  NIFTY50_TODAY_TRADE++;
				  NIFTY50_LONG_PLACED_AT=(long)ltp;
				  int strike = roundLevel(ltp - gapFromATMStrike, 100.0);
				  Instrument instument=  instrumentsMap.get("NIFTY" + expiryDate + Integer.toString(strike )+ "CE#NFO");				  
				  saveAlgoProps();
				  double slDiff = NIFTY50_LONG_TRIGGER - NIFTY50_LONG_SL;
				  scheduleTriggerBuyorder(instument, 0, NIFTY50_QTY, slDiff, niftyOrdertriggerPoints);
			  }			  			  
		  }
		  	
			//PE order		  				  
		  else if(NIFTY50_SHORT_TRIGGER != -1 && NIFTY50_SHORT_PLACED_AT ==-1 && NIFTY50_TODAY_TRADE < NIFTY50_MAXTRADE && ltp < NIFTY50_SHORT_TRIGGER) {
			  printLog( "ORDER CHECK : "+ ltp+ " " +nifty50Stats1min.getMean() + " " +nifty50Stats3min.getMean() +" " + nifty50Stats5min.getMean() + "  " + nifty50Stats10min.getMean() + "  " + nifty50Stats15min.getMean());//REVERT
			  
			  double ltpAvg3Min = nifty50Stats3min.getMean();
			  double ltpAvg10Min = nifty50Stats10min.getMean();
			  
			  if(ltpAvg3Min < NIFTY50_SHORT_TRIGGER && Math.abs( ltpAvg10Min - NIFTY50_SHORT_TRIGGER) < ltp*0.0020  ) {				  				   
				  NIFTY50_TODAY_TRADE++;
				  NIFTY50_SHORT_PLACED_AT=(long)ltp;
				  int strike = roundLevel(ltp + gapFromATMStrike, 100.0);
				  Instrument instument=  instrumentsMap.get("NIFTY" + expiryDate + Integer.toString(strike )+ "PE#NFO");				  
				  saveAlgoProps();
				  double slDiff =   NIFTY50_SHORT_SL - NIFTY50_SHORT_TRIGGER;
				  scheduleTriggerBuyorder(instument, 0, NIFTY50_QTY, slDiff, niftyOrdertriggerPoints);
			  }			  			  
		  }
		  
		  
		  
	  }
	
	  
	  
	  
    
	  public void onBankNiftyNewTick(Tick tk){  
		  double ltp = tk.getLastTradedPrice();
		  bankNiftyStats5sec.addValue(ltp);		  
		  if(System.currentTimeMillis() - lastRecTimeBankNifty5sec > 5000) {
			  lastRecTimeBankNifty5sec = System.currentTimeMillis();
			  double mean = bankNiftyStats5sec.getMean();
			  bankNiftyStats1min.addValue(mean);
			  bankNiftyStats3min.addValue(mean);
			  bankNiftyStats5min.addValue(mean);
			  bankNiftyStats10min.addValue(mean);
			  bankNiftyStats15min.addValue(mean);
			  bankNiftyStats5sec.clear();
			  
			  printLog( "STATS : " +ltp+" " + mean+ " " +bankNiftyStats1min.getMean() + " " +bankNiftyStats3min.getMean() +" " + bankNiftyStats5min.getMean() +"  "+ bankNiftyStats10min.getMean()  + " " +bankNiftyStats15min.getMean());//REVERT
		  }
		  
	
		  if(bankLongSLOrder != null && ltp < BANKNIFTY_LONG_SL) {
			  printLog( "SL CHECK : " +ltp+" " +  +bankNiftyStats1min.getMean() + " " +bankNiftyStats3min.getMean() +" " + bankNiftyStats5min.getMean() +"  "+ bankNiftyStats10min.getMean()  + " " +bankNiftyStats15min.getMean());//REVERT
			  
			  double ltpAvg1Min = bankNiftyStats1min.getMean();
			  if(ltpAvg1Min < BANKNIFTY_LONG_SL || BANKNIFTY_LONG_SL -ltp > ltp*0.0015) {
				  scheduleModifySLOrderToMarket(bankLongSLOrder, 0, bankNIftyOrderTriggerPoints);
				  scheduleUpdateSlorders(2);
			  }			  
		  }
		  
		  if(bankShortSLOrder != null && ltp > BANKNIFTY_SHORT_SL) {
			  printLog( "SL CHECK : " +ltp+" " +  +bankNiftyStats1min.getMean() + " " +bankNiftyStats3min.getMean() +" " + bankNiftyStats5min.getMean() +"  "+ bankNiftyStats10min.getMean()  + " " +bankNiftyStats15min.getMean());//REVERT
			  
			  double ltpAvg1Min = bankNiftyStats1min.getMean();
			  if(ltpAvg1Min > BANKNIFTY_SHORT_SL || ltp-BANKNIFTY_SHORT_SL > ltp*0.0015) {
				  scheduleModifySLOrderToMarket(bankShortSLOrder, 0, bankNIftyOrderTriggerPoints);
				  scheduleUpdateSlorders(2);
			  }				  
		  }
		  
		  if(!isTimeWindowOpen(tk)) {
			  return;
		  }
		  
		//CE order		  				  
		  if(BANKNIFTY_LONG_TRIGGER != -1 && BANKNIFTY_LONG_PLACED_AT ==-1 && BANKNIFTY_TODAY_TRADE < BANKNIFTY_MAXTRADE && ltp > BANKNIFTY_LONG_TRIGGER) {
			  printLog( "ORDER CHECK : " +ltp+" " +  +bankNiftyStats1min.getMean() + " " +bankNiftyStats3min.getMean() +" " + bankNiftyStats5min.getMean() +"  "+ bankNiftyStats10min.getMean()  + " " +bankNiftyStats15min.getMean());//REVERT
			  
			  double ltpAvg3Min = bankNiftyStats3min.getMean();
			  double ltpAvg10Min = bankNiftyStats10min.getMean();
			  
			  if(ltpAvg3Min > BANKNIFTY_LONG_TRIGGER && Math.abs( ltpAvg10Min - BANKNIFTY_LONG_TRIGGER) < ltp*0.0020  ) {				  				   
				  BANKNIFTY_TODAY_TRADE++;
				  BANKNIFTY_LONG_PLACED_AT=(long)ltp;
				  int strike = roundLevel(ltp - gapFromATMStrike, 100.0);
				  Instrument instument=  instrumentsMap.get("BANKNIFTY" + expiryDate + Integer.toString(strike )+ "CE#NFO");				  
				  saveAlgoProps();
				  double slDiff = BANKNIFTY_LONG_TRIGGER - BANKNIFTY_LONG_SL;
				  scheduleTriggerBuyorder(instument, 0, BANKNIFTY_QTY, slDiff, bankNIftyOrderTriggerPoints);
			  }			  			  
		  }
		  	
			//PE order		  				  
		  else if(BANKNIFTY_SHORT_TRIGGER != -1 && BANKNIFTY_SHORT_PLACED_AT ==-1 && BANKNIFTY_TODAY_TRADE < BANKNIFTY_MAXTRADE && ltp < BANKNIFTY_SHORT_TRIGGER) {
			  printLog( "ORDER CHECK : " +ltp+" " +  +bankNiftyStats1min.getMean() + " " +bankNiftyStats3min.getMean() +" " + bankNiftyStats5min.getMean() +"  "+ bankNiftyStats10min.getMean()  + " " +bankNiftyStats15min.getMean());//REVERT
			  
			  double ltpAvg3Min = bankNiftyStats3min.getMean();
			  double ltpAvg10Min = bankNiftyStats10min.getMean();
			  
			  if(ltpAvg3Min < BANKNIFTY_SHORT_TRIGGER && Math.abs( ltpAvg10Min - BANKNIFTY_SHORT_TRIGGER) < ltp*0.0020  ) {				  				   
				  BANKNIFTY_TODAY_TRADE++;
				  BANKNIFTY_SHORT_PLACED_AT=(long)ltp;
				  int strike = roundLevel(ltp + gapFromATMStrike, 100.0);
				  Instrument instument=  instrumentsMap.get("BANKNIFTY" + expiryDate + Integer.toString(strike )+ "PE#NFO");				  
				  saveAlgoProps();
				  double slDiff =   BANKNIFTY_SHORT_SL - BANKNIFTY_SHORT_TRIGGER;
				  scheduleTriggerBuyorder(instument, 0, BANKNIFTY_QTY, slDiff, bankNIftyOrderTriggerPoints);
			  }			  			  
		  }			  
		  
		  
	  }
	  
	  
	  

	  
	  
	  
	  
	  
	  
    
    public void onNewTicks(ArrayList<Tick> ticks){     
        for(int i = 0 ; i < ticks.size(); i++){
        	Tick tk = ticks.get(i);
        	if(tk.getInstrumentToken() == bankNiftyInstrument.getInstrument_token()) {
      		  if(BANKNIFTY_ENABLE) {
      			 onBankNiftyNewTick(tk);
    		  }        		
        	}else if(tk.getInstrumentToken() == nifty50Instrument.getInstrument_token()) {
      		  if(NIFTY50_ENABLE) {
      			onNifty50NewTick(tk);
    		  }        		
        	}
        }    	
        	       
    }
    
    
    /** Demonstrates com.zerodhatech.ticker connection, subcribing for instruments, unsubscribing for instruments, set mode of tick data, com.zerodhatech.ticker disconnection*/
    public void tickerUsage(KiteConnect kiteConnect, final ArrayList<Long> tokens) throws IOException, WebSocketException, KiteException {
    	
    	String token  = getAuthorization();
    	token = token.replace("enctoken ", "");
    	token=URLEncoder.encode(token, StandardCharsets.UTF_8.toString());
    	final KiteTicker tickerProvider = new KiteTicker("wss://ws.zerodha.com/?api_key=kitefront&user_id=DA6170&enctoken="+ token +"&uid=1626665519985&user-agent=kite3-web&version=2.9.2");
    	    	
        tickerProvider.setOnConnectedListener(new OnConnect() {
            @Override
            public void onConnected() {
                /** Subscribe ticks for token.
                 * By default, all tokens are subscribed for modeQuote.
                 * */
            	printLog(" Connected to websocket subrcribing tokens " + tokens.size());
                tickerProvider.subscribe(tokens);
                tickerProvider.setMode(tokens, KiteTicker.modeFull);
            }
        });

        
        tickerProvider.setOnDisconnectedListener(new OnDisconnect() {
            @Override
            public void onDisconnected() {
            	printLog("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Websocket disconnected XXXXXXXXXXXXXXXXXXXXXXXXXXX " + tokens.size());
            }
        });

       
        /** Set listener to get order updates.*/
        tickerProvider.setOnOrderUpdateListener(new OnOrderUpdate() {
            @Override
            public void onOrderUpdate(Order order) {
                System.out.println("order update "+order.tradingSymbol);
            }
        });

        
        /** Set error listener to listen to errors.*/
//        tickerProvider.setOnErrorListener(new OnError() {
//            @Override
//            public void onError(Exception exception) {
//                //handle here.
//            }
//
//            @Override
//            public void onError(KiteException kiteException) {
//                //handle here.
//            }
//        });
        

        tickerProvider.setOnTickerArrivalListener(new OnTicks() {
            @Override
            public void onTicks(ArrayList<Tick> ticks) {
            	
            	onNewTicks(ticks);

            }
        });
        
        
        // Make sure this is called before calling connect.
        tickerProvider.setTryReconnection(true);
        //maximum retries and should be greater than 0
        tickerProvider.setMaximumRetries(10);
        //set maximum retry interval in seconds
        tickerProvider.setMaximumRetryInterval(30);

        /** connects to com.zerodhatech.com.zerodhatech.ticker server for getting live quotes*/
        tickerProvider.connect();

        /** You can check, if websocket connection is open or not using the following method.*/
        boolean isConnected = tickerProvider.isConnectionOpen();
        System.out.println(isConnected);


        tickerProvider.setMode(tokens, KiteTicker.modeFull);

    }

    
    
	
	public void startFeed(ArrayList<Long> tokens){

        try {
                KiteConnect kiteConnect = new KiteConnect(getAuthorization());

                // Set userId
                kiteConnect.setUserId("DA6170");

                //Enable logs for debugging purpose. This will log request and response.
                kiteConnect.setEnableLogging(false);

                // Set session expiry callback.
                kiteConnect.setSessionExpiryHook(new SessionExpiryHook() {
                    @Override
                    public void sessionExpired() {
                        System.out.println("session expired");
                    }
                });
                
                tickerUsage(kiteConnect, tokens);
        } catch (KiteException e) {
            printLog(e.message+" "+e.code+" "+e.getClass().getName());
            printLog(e.toString());
        } catch (IOException e) {
            e.printStackTrace();
            printLog(e.toString());
        }
            catch (WebSocketException e) {
            e.printStackTrace();
            printLog(e.toString());	
        }
    		
		
	}
	
	
	private Instrument nifty50Instrument=null,bankNiftyInstrument=null;
	
	public  ArrayList<Long> getTokens(){
		ArrayList<Long> tokens = new ArrayList<>();
		
		nifty50Instrument = instrumentsMap.get("NIFTY 50"+"#NSE");
		bankNiftyInstrument = instrumentsMap.get("NIFTY BANK"+"#NSE");
		
		tokens.add(nifty50Instrument.instrument_token);
		tokens.add(bankNiftyInstrument.instrument_token);
				 		
        return tokens;
	}
	
    public void printLog(String log) {
		System.out.println(log);
		logger.info(log);    	
    }
    
    
    
    //TODO revert
    public void testNiftyTrade() {
    	Thread t1 = new Thread(new Runnable() {			
    		int count = 16500;
			Random r = new Random();
			int low = 16500;
			int high = 16750;
			
			@Override
			public void run() {
				while(true) {
					Tick tk = new Tick();

					double ltp = count++;					
					tk.setLastTradedPrice(ltp);
					
					if(count > 16750) {
						count = r.nextInt(high-low) + low;
					}
					onNifty50NewTick(tk);		
					
					try {
						Thread.sleep(500);
					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}
		});
    	
    	t1.start();    	
    }
    
    //TODO revert
    public void testBankTrade() {
    	Thread t1 = new Thread(new Runnable() {			
    		int count = 34900;
			Random r = new Random();
			int low = 34900;
			int high = 35100;
			
			@Override
			public void run() {
				while(true) {
					Tick tk = new Tick();

					double ltp = count++;					
					tk.setLastTradedPrice(ltp);
					
					if(count > high) {
						count = r.nextInt(high-low) + low;
					}
					onBankNiftyNewTick(tk);		
					
					try {
						Thread.sleep(500);
					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}
		});
    	
    	t1.start();    	
    }
    
    
    public static void main(String[] args){
    			
    	System.setProperty("java.util.logging.SimpleFormatter.format","%1$tF %1$tT %5$s%6$s%n");    	
		Properties prop = new Properties();
		InputStream input = null;

		try {
			input = new FileInputStream("../StockInfo/config.properties");
			prop.load(input);
			String autZerodha = prop.getProperty("zerodha-key");					
			IndexBuying instance = new IndexBuying(autZerodha);
						
        	ArrayList<Long> tokens = instance.getTokens();             	
        	instance.validateInput();        	    	        	
        	instance.updateSLOrders();
        	
        	instance.startFeed( tokens);
         	
        	//instance.testBankTrade();//REVERT
        	
		} catch (IOException ex) {
			ex.printStackTrace();
		} catch (KiteException e) {
            System.out.println(e.message+" "+e.code+" "+e.getClass().getName());
        } catch (JSONException e) {
            e.printStackTrace();
        }catch (Exception e) {
            e.printStackTrace();
        }			
		finally {
			if (input != null) {
				try {
					input.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
    }
	
}




