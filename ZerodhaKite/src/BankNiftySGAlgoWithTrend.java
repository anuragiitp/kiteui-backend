
import com.neovisionaries.ws.client.WebSocketException;
import com.zerodhatech.kiteconnect.KiteConnect;
import com.zerodhatech.kiteconnect.kitehttp.SessionExpiryHook;
import com.zerodhatech.kiteconnect.kitehttp.exceptions.KiteException;
import com.zerodhatech.kiteconnect.utils.Constants;
import com.zerodhatech.models.Instrument;
import com.zerodhatech.models.Order;
import com.zerodhatech.models.OrderParams;
import com.zerodhatech.models.Quote;
import com.zerodhatech.models.Tick;
import com.zerodhatech.ticker.KiteTicker;
import com.zerodhatech.ticker.OnConnect;
import com.zerodhatech.ticker.OnDisconnect;
import com.zerodhatech.ticker.OnError;
import com.zerodhatech.ticker.OnOrderUpdate;
import com.zerodhatech.ticker.OnTicks;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.FileHandler;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;
import java.util.stream.Collectors;
import java.util.zip.GZIPOutputStream;

import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.gson.Gson;


//Order rejectioon handling
//no overlap of strike 

public class BankNiftySGAlgoWithTrend extends TradeUtil{
	
	
	private String algoPropsFile = "../StockInfo/SGAlgo.properties";
	private OrderedProperties algoProps;
	
	private final String underline = "BANKNIFTY"; 
	
	private String expiryDate;
	private int lowStrike=-1,highStrike=-1;	
	private int nextTradeGap=128;	
	private int exitGapForEachLeg=155;	
	
	private int legSLPoints=70;	
	private int orderTriggerPoints=45;	
	
	private int SGQty=100;	
	private int maxTriggerCount=4;	
	private int todayTriggerCount=0;	
	
	
	DescriptiveStatistics stats = new DescriptiveStatistics();
	
	
	private Date startTime,endTime;
	
	List<Order> openTriggerOrders;
	
	private final ScheduledThreadPoolExecutor threadPool= new ScheduledThreadPoolExecutor(1);
	
	final AtomicBoolean isStaleOpenOrders = new AtomicBoolean(true);
	
	final  Logger logger = Logger.getLogger("BankNiftySGAlgo");  
	
	public BankNiftySGAlgoWithTrend(String authorization) throws JSONException, IOException, KiteException {
		super(authorization);
			      
		FileHandler fh = new FileHandler("C:\\Users\\anurkuma\\OneDrive - Adobe\\DRIVE D\\workspace\\StockInfo\\BankNiftySGAlgo.log",true);  
        logger.addHandler( fh);
        fh.setFormatter(new SimpleFormatter());  
        logger.setUseParentHandlers(false);
        
		OrderedProperties.OrderedPropertiesBuilder builder = new OrderedProperties.OrderedPropertiesBuilder();
		builder.withSuppressDateInComment(false);
		algoProps = builder.build();
		
		algoProps.load(new FileReader(algoPropsFile));  
	    
		if(algoProps.containsProperty("lowStrike")) {
			lowStrike = Integer.parseInt(algoProps.getProperty("lowStrike"));
		}
		
		if(algoProps.containsProperty("highStrike")) {
			highStrike = Integer.parseInt(algoProps.getProperty("highStrike"));
		}
		
		lowStrike = Math.min(lowStrike, highStrike);
		highStrike = Math.max(lowStrike, highStrike);
		
		
		if(algoProps.containsProperty("nextTradeGap")) {
			nextTradeGap = Integer.parseInt(algoProps.getProperty("nextTradeGap"));
		}
		if(algoProps.containsProperty("exitGapForEachLeg")) {
			exitGapForEachLeg = Integer.parseInt(algoProps.getProperty("exitGapForEachLeg"));
		}		
				
		if(algoProps.containsProperty("legSLPoints")) {
			legSLPoints = Integer.parseInt(algoProps.getProperty("legSLPoints"));
		}
		if(algoProps.containsProperty("orderTriggerPoints")) {
			orderTriggerPoints = Integer.parseInt(algoProps.getProperty("orderTriggerPoints"));
		}
		
		
		if(algoProps.containsProperty("SGQty")) {
			SGQty = Integer.parseInt(algoProps.getProperty("SGQty"));
		}		

		if(algoProps.containsProperty("maxTriggerCount")) {
			maxTriggerCount = Integer.parseInt(algoProps.getProperty("maxTriggerCount"));
		}
		
		if(algoProps.containsProperty("todayTriggerCount")) {
			todayTriggerCount = Integer.parseInt(algoProps.getProperty("todayTriggerCount"));
		}	
		
		if(algoProps.containsProperty("expiryDate")) {
			expiryDate = algoProps.getProperty("expiryDate");
		}
				
				
		stats.setWindowSize(5);   
		
		
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.SECOND,1);   
		
		if(algoProps.containsProperty("startTime")) {			
			try {
				String time = algoProps.getProperty("startTime");
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
		cal.set(Calendar.MINUTE,0);
		
		endTime = cal.getTime();
		
		scheduleOrderBookUpdate(0);scheduleOrderBookUpdate(10);scheduleOrderBookUpdate(30);
		
		printLog("Starting Algo");
		printLog(algoProps.toString());
	}

	
	public void scheduleOrderBookUpdate(int sec) {
		isStaleOpenOrders.compareAndSet(false, true);
		
		Runnable t1 = new Runnable() {			
			@Override
			public void run() {
				isStaleOpenOrders.compareAndSet(false, true);												
				try {					
					openTriggerOrders = kiteConnect.getOrders().stream().filter(order -> order.tag!=null && order.tag.equals("bnk_sg") && order.transactionType.equals(Constants.TRANSACTION_TYPE_BUY) && (order.status.equals("TRIGGER PENDING") || order.status.equals("OPEN") ) && order.tradingSymbol.startsWith(underline) ).collect(Collectors.toList());
					printLog("order book updated");
				}catch (JSONException | IOException | KiteException e) {
	    			e.printStackTrace();
	    			printLog(e.toString());
	    		}     		    		
								
				isStaleOpenOrders.compareAndSet(true, false);
			}
		};
		
		threadPool.schedule(t1, sec, TimeUnit.SECONDS);

	}
	


	
	
	public void scheduleAllAlgoOrderCancelation(int sec, Order s1,Order s2,Order b1,Order b2) {
		
		Runnable t1 = new Runnable() {			
			@Override
			public void run() {				
				printLog("Canceling algo orders schedule after -> " + sec);												
				cancelAlgoOrder(s1);
				cancelAlgoOrder(s2);
				cancelAlgoOrder(b1);
				cancelAlgoOrder(b2);							
			}
		};
		threadPool.schedule(t1, sec, TimeUnit.SECONDS);		  
	}
	
	
	public void saveAlgoProps() {
		try {
			algoProps.setProperty("lowStrike", Integer.toString(lowStrike));
			algoProps.setProperty("highStrike", Integer.toString(highStrike));
			algoProps.setProperty("todayTriggerCount", Integer.toString(todayTriggerCount));
			
			FileOutputStream out = new FileOutputStream(algoPropsFile);
			algoProps.store(out,null);
			out.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			 logger.info(e.toString());	
		}
	}

	
    public Order placeAlgoOrder(Instrument instrument,String transactionType,String orderType,Integer quantity,double price,double trPrice) throws KiteException, IOException {
    	//rms check
    	if(quantity > 200) {
    		printLog("placeAlgoOrder qty > 200 " + quantity);
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
        orderParams.tag = "bnk_sg"; //tag is optional and it cannot be more than 8 characters and only alphanumeric is allowed
        Order order = kiteConnect.placeOrder(orderParams, Constants.VARIETY_REGULAR); 
        printLog(order.orderId);
        return order;    	
    }
    
    public void cancelAlgoOrder(Order order) {
    	if(order != null && order.orderId != null) {   
    		printLog("cancelAlgoOrder -> " + order.orderId);
    		
        	try {
    			kiteConnect.cancelOrder(order.orderId, Constants.VARIETY_REGULAR);
    		} catch (JSONException | IOException | KiteException e) {
    			e.printStackTrace();
    			printLog(e.toString());
    		}     		    		
    	}

    }
    
    
  //Handle order rejection case
	public void scheduleOrderValidationCheck(int sec,double ceLtp,double peLtp, Order s1,Order s2,Order b1,Order b2) {
		
		Runnable t1 = new Runnable() {			
			@Override
			public void run() {				
				printLog("Checking for order validation  ");
																
				try {
					
					Set<String> orderIds = new HashSet<String>();
					if(s1!=null && s1.orderId != null) {
						orderIds.add(s1.orderId);
					}
					if(s2!=null && s2.orderId != null) {
						orderIds.add(s2.orderId);
					}
					if(b1!=null && b1.orderId != null) {
						orderIds.add(b1.orderId);
					}
					if(b2!=null && b2.orderId != null) {
						orderIds.add(b2.orderId);
					}
					

					List<Order> orders = kiteConnect.getOrders();
					
					List<Order> rejectedOrders = orders.stream().filter(order -> order.tag!=null && order.tag.equals("bnk_sg") && order.status.equals("REJECTED") && orderIds.contains(order.orderId) && order.tradingSymbol.startsWith(underline) ).collect(Collectors.toList());
					List<Order> openOrders = orders.stream().filter(order -> order.tag!=null && order.tag.equals("bnk_sg") && order.status.equals("OPEN") && orderIds.contains(order.orderId) && order.tradingSymbol.startsWith(underline) ).collect(Collectors.toList());
					List<Order> triggerPendinOrders = orders.stream().filter(order -> order.tag!=null && order.tag.equals("bnk_sg") && order.status.equals("TRIGGER PENDING") && orderIds.contains(order.orderId) && order.tradingSymbol.startsWith(underline) ).collect(Collectors.toList());
										
					printLog("rejectedOrders -> " + rejectedOrders.size() + " openOrders -> " + openOrders.size() + " triggerPendinOrders -> "+triggerPendinOrders.size());
					
					if(rejectedOrders.size() > 0) {
						printLog("Cancelling Algo order due to rejection  " + rejectedOrders.size());
						scheduleAllAlgoOrderCancelation(1, s1, s2, b1, b2);
						scheduleAllAlgoOrderCancelation(20, s1, s2, b1, b2);
						
					}else if(openOrders.size() == 2 && triggerPendinOrders.size() == 2) {
						
						printLog("modifying back to market -> " + s1.orderId);
				        OrderParams s1Params =  new OrderParams();
				        s1Params.price= ceLtp - orderTriggerPoints;	 			
						kiteConnect.modifyOrder(s1.orderId, s1Params, Constants.VARIETY_REGULAR); // Now place to market for fill
						
						
						printLog("modifying back to market -> " + s2.orderId);
				        OrderParams s2Params =  new OrderParams();
				        s2Params.price= peLtp - orderTriggerPoints;	 				
						kiteConnect.modifyOrder(s2.orderId, s2Params, Constants.VARIETY_REGULAR); // Now place to market for fill			
						
					}
										
				} catch (JSONException | IOException | KiteException e) {
					e.printStackTrace();
					printLog(e.toString());
				}
				
			}
		};
		threadPool.schedule(t1, sec, TimeUnit.SECONDS);		  
	}
	
    
    
    
    public void scheduleTriggerSGorder(int level,int sec) {
    	
		
		Runnable t1 = new Runnable() {			
			@Override
			public void run() {
		    	
				     Order s1=null,s2=null,b1=null,b2=null;
				     try {
			
				    	printLog("triggerSGorder ->" + level);
			    	 	
				     	Instrument CEInstument=  instrumentsMap.get(underline + expiryDate + Integer.toString(level )+ "CE#NFO");
				     	Instrument PEInstument=   instrumentsMap.get(underline + expiryDate + Integer.toString(level )+ "PE#NFO");
				
						Map<String, Quote> quotes = kiteConnect.getQuote(new String[] {CEInstument.getExchange()+":"+CEInstument.getTradingsymbol(),PEInstument.getExchange()+":"+PEInstument.getTradingsymbol()});
						
						
						double ceLtp = quotes.get(CEInstument.getExchange()+":"+CEInstument.getTradingsymbol()).lastPrice;
						double peLtp = quotes.get(PEInstument.getExchange()+":"+PEInstument.getTradingsymbol()).lastPrice;
			
						s1 = placeAlgoOrder(CEInstument, Constants.TRANSACTION_TYPE_SELL, Constants.ORDER_TYPE_LIMIT, SGQty, ceLtp + orderTriggerPoints, 0); //high price to so we cancel all if one fails
						s2 = placeAlgoOrder(PEInstument, Constants.TRANSACTION_TYPE_SELL, Constants.ORDER_TYPE_LIMIT, SGQty, peLtp + orderTriggerPoints, 0); //high price to so we cancel all if one fails
						
						b1 = placeAlgoOrder(CEInstument, Constants.TRANSACTION_TYPE_BUY, Constants.ORDER_TYPE_SL, SGQty, ceLtp+legSLPoints+orderTriggerPoints , ceLtp+legSLPoints);
						b2 = placeAlgoOrder(PEInstument, Constants.TRANSACTION_TYPE_BUY, Constants.ORDER_TYPE_SL, SGQty, peLtp+legSLPoints+orderTriggerPoints, peLtp+legSLPoints);
						
						
						scheduleOrderValidationCheck(0,ceLtp,peLtp, s1, s2, b1, b2);
						scheduleOrderValidationCheck(4,ceLtp,peLtp, s1, s2, b1, b2);
						scheduleOrderValidationCheck(20,ceLtp,peLtp, s1, s2, b1, b2);
						
						
						printLog("triggerSGorder completed -> " + level);
															
					} catch (Exception | KiteException e) {
						e.printStackTrace();
						printLog(e.toString());
						scheduleAllAlgoOrderCancelation(1, s1, s2, b1, b2);scheduleAllAlgoOrderCancelation(10, s1, s2, b1, b2);scheduleAllAlgoOrderCancelation(40, s1, s2, b1, b2);						
					} finally {
						scheduleOrderBookUpdate(4);scheduleOrderBookUpdate(20);scheduleOrderBookUpdate(40);
					}				
			}
		};
				
		threadPool.schedule(t1, sec, TimeUnit.SECONDS);

    }

    
    
    public void scheduleModifySLOrderToMarket(Instrument inst,Order order,int sec) {
    	
		Runnable t1 = new Runnable() {			
			@Override
			public void run() {				
		    	try {
		    		printLog("modifySLOrderToMarket -> " + order.tradingSymbol);
		    		    		 
					Map<String, Quote> quotes = kiteConnect.getQuote(new String[] {inst.getExchange()+":"+inst.getTradingsymbol()});			
					double ltp = quotes.get(inst.getExchange()+":"+inst.getTradingsymbol()).lastPrice;
					
			        OrderParams orderParams =  new OrderParams();
			        orderParams.orderType = Constants.ORDER_TYPE_LIMIT;
			        orderParams.price= ltp + orderTriggerPoints;	        
			        kiteConnect.modifyOrder(order.orderId, orderParams, Constants.VARIETY_REGULAR); 
			        	        	        
		    		printLog("modifySLOrderToMarket completed  ");
			        
				} catch (JSONException | IOException | KiteException e) {
					e.printStackTrace();
					printLog(e.toString());
				}
				
			}
		};
		threadPool.schedule(t1, sec, TimeUnit.SECONDS);
    }
    
    
    
    public void printLog(String log) {
		System.out.println(log);
		logger.info(log);    	
    }
    
    
	  public void onBankNiftyNewTick(Tick tk){
		  int ltp = (int)tk.getLastTradedPrice();
		  stats.addValue(ltp);

		  int mean = (int)stats.getMean();		  
		  int atmStrike = (int)(Math.round(mean /  100.0 )*100);		  
		  
//		  logger.info(String.format("ltp(%d)  mean(%d) openOrders(%d)", ltp,mean,(openOrders==null?0:openOrders.size())));
		  
		  //Modify trigger order to market
		  if(!isStaleOpenOrders.get() && openTriggerOrders!=null) {
			  
			  boolean isUpdateOrder = false;
			  for(Order order:openTriggerOrders) {			 
				  Instrument inst = instrumentsMap.get(order.tradingSymbol +"#"+order.exchange);
				  int strike = Integer.parseInt(inst.getStrike());
						  
				  if(order.tradingSymbol.endsWith("CE")) {
					  
					  if(mean - strike >= exitGapForEachLeg) {
						  scheduleModifySLOrderToMarket(inst,order,0);
						  isUpdateOrder=true;
					  }
					  
				  }else if(order.tradingSymbol.endsWith("PE")) {
					  if( strike - mean >= exitGapForEachLeg) {
						  scheduleModifySLOrderToMarket(inst,order,0);
						  isUpdateOrder=true;
					  }
				  }
			  }		  		  
			  if(isUpdateOrder) {
				  scheduleOrderBookUpdate(2);scheduleOrderBookUpdate(15);scheduleOrderBookUpdate(50);
			  }			  
		  }
		  
		  
		 
		  Date lastTime = tk.getLastTradedTime();
		  if( lastTime== null) {
			  Calendar cal = Calendar.getInstance();
			  lastTime=cal.getTime();
		  }
		  boolean canPlaceOrder = lastTime.after(startTime) && lastTime.before(endTime); // REVERT 		  
		  if(!canPlaceOrder) {
			  return;
		  }
		  
		  boolean isLargeGap = Math.abs(mean - ltp) > 50;	
		  boolean triggerLeft = todayTriggerCount < maxTriggerCount;
		  		  
		  if(triggerLeft && !isLargeGap) {
			  boolean isFirstTradePlaced = !(lowStrike == -1 || highStrike == -1);			  
			  boolean canPlaceNextOrder =( (ltp - highStrike) > nextTradeGap  ) || ( (lowStrike - ltp) > nextTradeGap);
			  
			  boolean placeSGOrder=false;
			  
			  if(!isFirstTradePlaced) {
				  printLog(String.format("First Trade -> ltp(%d)  mean(%d)", ltp,mean));
				  
				  lowStrike = atmStrike;
				  highStrike = atmStrike;
				  placeSGOrder=true;
				 
			  }else if(canPlaceNextOrder){
					  
				  if((ltp - highStrike) > nextTradeGap) {
					  atmStrike =  (int)(Math.round((mean -6)/  100.0 )*100);	
				  }else if((lowStrike - ltp) > nextTradeGap) {
					  atmStrike =  (int)(Math.round((mean + 6)/  100.0 )*100);	
				  }
				  boolean isNewStrike = atmStrike > highStrike || atmStrike < lowStrike;
				  
				  if(isNewStrike) {
					  printLog(String.format("Next Trade -> ltp(%d)  mean(%d)", ltp,mean));	
					  
					  placeSGOrder=true;					  
				  }
			  }
			  
			  if(placeSGOrder) {
				  lowStrike =Math.min(lowStrike, atmStrike);
				  highStrike = Math.max(highStrike, atmStrike);				  
				  todayTriggerCount++;
				  saveAlgoProps();
				  scheduleTriggerSGorder(atmStrike,0);
			  }
			  
			  
		  }
		  
		  
	  }

	
	    public void onNewTicks(ArrayList<Tick> ticks){     
	        for(int i = 0 ; i < ticks.size(); i++){
	        	Tick tk = ticks.get(i);
	        	if(tk.getInstrumentToken() == bankNiftyInstrument.getInstrument_token()) {
	        		onBankNiftyNewTick(tk);
	        	}
	        }    	
	        
	       // testAlgo(); //REVERT	       
	    }
	      
    
    /** Demonstrates com.zerodhatech.ticker connection, subcribing for instruments, unsubscribing for instruments, set mode of tick data, com.zerodhatech.ticker disconnection*/
    public void tickerUsage(KiteConnect kiteConnect, final ArrayList<Long> tokens) throws IOException, WebSocketException, KiteException {
        /** To get live price use websocket connection.
         * It is recommended to use only one websocket connection at any point of time and make sure you stop connection, once user goes out of app.
         * custom url points to new endpoint which can be used till complete Kite Connect 3 migration is done. */
    	
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

       
//        /** Set listener to get order updates.*/
//        tickerProvider.setOnOrderUpdateListener(new OnOrderUpdate() {
//            @Override
//            public void onOrderUpdate(Order order) {
//                System.out.println("order update "+order.tradingSymbol);
//            }
//        });

        
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

        
        
        
        /** set mode is used to set mode in which you need tick for list of tokens.
         * Ticker allows three modes, modeFull, modeQuote, modeLTP.
         * For getting only last traded price, use modeLTP
         * For getting last traded price, last traded quantity, average price, volume traded today, total sell quantity and total buy quantity, open, high, low, close, change, use modeQuote
         * For getting all data with depth, use modeFull*/
        tickerProvider.setMode(tokens, KiteTicker.modeFull);

        // Unsubscribe for a token.
   //     tickerProvider.unsubscribe(tokens);

        // After using com.zerodhatech.com.zerodhatech.ticker, close websocket connection.
    //    tickerProvider.disconnect();
    }

    
    
    
	public void startFeed(ArrayList<Long> tokens){

        try {
                // First you should get request_token, public_token using kitconnect login and then use request_token, public_token, api_secret to make any kiteConnect api call.
                // Initialize KiteSdk with your apiKey.
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

                /* The request token can to be obtained after completion of login process. Check out https://kite.trade/docs/connect/v1/#login-flow for more information.
                   A request token is valid for only a couple of minutes and can be used only once. An access token is valid for one whole day. Don't call this method for every app run.
                   Once an access token is received it should be stored in preferences or database for further usage.
                 */
                
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
    
	
	private Instrument bankNiftyInstrument=null;
	
	public  ArrayList<Long> getTokens(){
		ArrayList<Long> tokens = new ArrayList<>();
				
		bankNiftyInstrument = instrumentsMap.get("NIFTY BANK"+"#NSE");
		tokens.add(bankNiftyInstrument.instrument_token);
		
		 		
        return tokens;
	}
	
    
    public static void main(String[] args){
    	System.setProperty("java.util.logging.SimpleFormatter.format","%1$tF %1$tT %5$s%6$s%n");    	
		Properties prop = new Properties();
		InputStream input = null;

		try {
			input = new FileInputStream("../StockInfo/config.properties");
			prop.load(input);
			String autZerodha = prop.getProperty("zerodha-key");					
        	BankNiftySGAlgoWithTrend instance = new BankNiftySGAlgoWithTrend(autZerodha);
        	
        	ArrayList<Long> tokens = instance.getTokens();     
        	        	
        	instance.startFeed( tokens);
            
        	
						
		} catch (IOException ex) {
			ex.printStackTrace();
		} catch (KiteException e) {
            System.out.println(e.message+" "+e.code+" "+e.getClass().getName());
        } catch (JSONException e) {
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
    
    
    
    
	  int count =0 ; 
	  public void testAlgo() {
		  	if(count >= 60) {
	        	Tick t1 = new Tick();t1.setLastTradedPrice(34590);
	        	onBankNiftyNewTick(t1);	        	
	        }else if(count >= 50) {
	        	Tick t1 = new Tick();t1.setLastTradedPrice(34861);
	        	onBankNiftyNewTick(t1);	        	
	        }else if(count >= 40) {
	        	Tick t1 = new Tick();t1.setLastTradedPrice(34655);
	        	onBankNiftyNewTick(t1);	        	
	        }else if(count >= 30) {
	        	Tick t1 = new Tick();t1.setLastTradedPrice(34600);
	        	onBankNiftyNewTick(t1);	        	
	        }else if(count >= 20) {
	        	Tick t1 = new Tick();t1.setLastTradedPrice(34555);
	        	onBankNiftyNewTick(t1);	        	
	        }else if(count >= 10) {
	        	Tick t1 = new Tick();t1.setLastTradedPrice(34239);
	        	onBankNiftyNewTick(t1);
	        }
	        count++;		  
	  }
	
	
	
    
    
    
}


