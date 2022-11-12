
import com.neovisionaries.ws.client.WebSocketException;
import com.zerodhatech.kiteconnect.KiteConnect;
import com.zerodhatech.kiteconnect.kitehttp.SessionExpiryHook;
import com.zerodhatech.kiteconnect.kitehttp.exceptions.KiteException;
import com.zerodhatech.models.Instrument;
import com.zerodhatech.models.Order;
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
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.zip.GZIPOutputStream;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.gson.Gson;

/**
 * Created by sujith on 7/10/16.
 * This class has example of how to initialize kiteSdk and make rest api calls to place order, get orders, modify order, cancel order,
 * get positions, get holdings, convert positions, get instruments, logout user, get historical data dump, get trades
 */
public class FeedSubscribe extends TradeUtil{
	

	public FeedSubscribe(String authorization) throws JSONException, IOException, KiteException {
		super(authorization);
	}

	
	
	public void startFeed(ArrayList<Long> tokens){

        try {
                // First you should get request_token, public_token using kitconnect login and then use request_token, public_token, api_secret to make any kiteConnect api call.
                // Initialize KiteSdk with your apiKey.
                KiteConnect kiteConnect = new KiteConnect(getAuthorization());

                // Set userId
                kiteConnect.setUserId("DA6170");

                //Enable logs for debugging purpose. This will log request and response.
                kiteConnect.setEnableLogging(true);


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
            System.out.println(e.message+" "+e.code+" "+e.getClass().getName());
        } catch (IOException e) {
            e.printStackTrace();
        }
            catch (WebSocketException e) {
            e.printStackTrace();
        }
    		
		
	}
	
	
	
	private JSONObject outputJson = new JSONObject();
	

	private SimpleDateFormat optExpiryFormat = new SimpleDateFormat("dd-MMM-yy");
	private SimpleDateFormat futExpiryFormat = new SimpleDateFormat("MMM-yy");
	
	public void startDumpingTick(){
	
		Thread zerodhaThreadHolding = new Thread(new Runnable() {			
			
			Gson gson = new Gson(); 
			
			@Override
			public void run() {	
				while(true){			
					try {				
					//	long t1 = System.currentTimeMillis();
												
						Calendar rightNow = Calendar.getInstance();
						int time = rightNow.get(Calendar.HOUR_OF_DAY)*60+rightNow.get(Calendar.MINUTE);						
						outputJson.put("time", time);						
						
						
						JSONObject tickJson = new JSONObject();
						for(Long id:priceTick.keySet()){							
							Instrument inst = instrumentsMap.get(String.valueOf(id));
							JSONObject j1 = new JSONObject( gson.toJson(priceTick.get(id)));
							j1.put("tradingsymbol",inst.getTradingsymbol());
							j1.put("exchange",inst.getExchange());
							String name = inst.getName();
							if("INDICES".equals(inst.getSegment())){
								j1.put("change",(100*priceTick.get(id).getChange())/priceTick.get(id).getClosePrice());								
							}else if("NFO-OPT".equals(inst.getSegment())){
								 name = inst.getName()+"-"+ optExpiryFormat.format(inst.getExpiry())+"-"+inst.getStrike()+inst.getInstrument_type();
								
							}else if("NFO-FUT".equals(inst.getSegment())){
								 name = inst.getName()+"-"+ futExpiryFormat.format(inst.getExpiry())+"-"+inst.getInstrument_type();								
							}
							j1.put("name",name!=null?name.toUpperCase():inst.getTradingsymbol());
							tickJson.put(inst.getTradingsymbol(),j1 );							
						}
						
						outputJson.put("ticks", tickJson);	
						
						FileWriter writer = new FileWriter("../StockInfo/kiteticks.json");	 		    
					    writer.append(outputJson.toString());
					    writer.flush();
					    writer.close();			
					    
					    compress("../StockInfo/kiteticks.json", "../StockInfo/kiteticks.json.gz");
					//    System.out.println(System.currentTimeMillis()-t1);
					} catch (Exception e) {
						e.printStackTrace();
					}
					
					try {
						Thread.sleep(200);
					} catch (InterruptedException e) {
						e.printStackTrace();
					}					
										
				}
			}
		});
		
		zerodhaThreadHolding.setDaemon(false);
		zerodhaThreadHolding.start();		 		
					
	}
	
	
	public static void compress(String inputFile,String outputFile) 
    { 
        byte[] buffer = new byte[1024]; 
        try
        { 
            GZIPOutputStream os = new GZIPOutputStream(new FileOutputStream(outputFile));                       
            FileInputStream in = new FileInputStream(inputFile);               
            int totalSize; 
            while((totalSize = in.read(buffer)) > 0 ) 
            { 
                os.write(buffer, 0, totalSize); 
            } 
              
            in.close(); 
            os.finish(); 
            os.close(); 
              
           // System.out.println("File Successfully compressed"); 
        } 
        catch (IOException e) 
        { 
            e.printStackTrace(); 
        } 
          
    } 	
	
	public void dumpAllInstrument(){
		Map<String,Instrument> tmpMap = new HashMap<String,Instrument>();
		for(Instrument inst : instrumentsMap.values()){
			
			if(inst.getExchange().equals("NSE") || inst.getExchange().equals("NFO")){
				tmpMap.put(inst.getTradingsymbol(), inst);				
			}else if(inst.getExchange().equals("BSE") && !tmpMap.containsKey(inst.getTradingsymbol())){				
				tmpMap.put(inst.getTradingsymbol(), inst);	
			}
		}
		
		
		JSONObject jout = new JSONObject();
		
		JSONArray jarry = new JSONArray();

		Gson gson = new Gson(); 
		for(Instrument inst : tmpMap.values()){
			if((inst.getExchange().equals("NSE") || inst.getExchange().equals("BSE")) && (inst.getName() == null || inst.getName().trim().length()==0)){
				continue;				
			}
			
			JSONObject j1 = new JSONObject( gson.toJson(inst));
			jarry.put(j1);
		}
		
		jout.put("allSymbols", jarry);
		
		   
	    try {
	    	FileWriter writer = new FileWriter("../StockInfo/kiteAllSymbols.json");	 		 
			writer.append(jout.toString());
		    writer.flush();
		    writer.close();
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
					
	    
	    
	    try {
	    	FileWriter writer = new FileWriter("../StockInfo/kiteSubcribedSymbols.json");	 		 
			writer.append(outputJson.toString());
		    writer.flush();
		    writer.close();
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
	    
		 		
					
	}
	
	
	
	public  ArrayList<Long> getTokens(){
		ArrayList<Long> tokens = new ArrayList<>();
		Set<String> watchSet = new HashSet<String>();
		
		try{
			String file = "config/watch.list";
			BufferedReader br = null;
			String line = "";
			
					 
			try {	 
				br = new BufferedReader(new FileReader(file));
				while ((line = br.readLine()) != null) {										
					line=line.trim();
					if(line.length() > 0) {
						watchSet.add(line.toUpperCase());
					}					
				}
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			} finally {
				if (br != null) {
					try {
						br.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
				}
			}			
		}catch(Exception e){
			e.printStackTrace();
		}	
		
		
		JSONArray symbolsList = new JSONArray();
		
		for(String symbol:watchSet){			
			if(instrumentsMap.containsKey(symbol+"#NSE")){
				  Instrument inst = instrumentsMap.get(symbol+"#NSE");
				  tokens.add(inst.instrument_token);
				  symbolsList.put(inst.getTradingsymbol());
			}else if(instrumentsMap.containsKey(symbol+"-BE"+"#NSE")){
				 Instrument inst = instrumentsMap.get(symbol+"-BE"+"#NSE");
				 tokens.add(inst.instrument_token);
				 symbolsList.put(inst.getTradingsymbol());
			}else if(instrumentsMap.containsKey(symbol+"#BSE")){
				 Instrument inst = instrumentsMap.get(symbol+"#BSE");
				 tokens.add(inst.instrument_token);
				 symbolsList.put(inst.getTradingsymbol());
			}else if(instrumentsMap.containsKey(symbol+"#NFO")){
				 Instrument inst = instrumentsMap.get(symbol+"#NFO");
				 tokens.add(inst.instrument_token);
				 symbolsList.put(inst.getTradingsymbol());
			}			
		}

			
		outputJson.put("SYMBOLS", symbolsList);
		
				
        return tokens;
	}
	

    
    private Map<Long,Tick>  priceTick = new ConcurrentHashMap<Long,Tick>();
		
    
    public void onNewTicks(ArrayList<Tick> ticks){
        NumberFormat formatter = new DecimalFormat();
        System.out.println("received ticks size "+ticks.size());        
        for(int i = 0 ; i < ticks.size(); i++){
        	Tick tk = ticks.get(i);
        	priceTick.put(tk.getInstrumentToken(), tk);        	
        }    	    	
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
            	System.out.println(" Connected to websocket subrcribing tokens " + tokens.size());
                tickerProvider.subscribe(tokens);
                tickerProvider.setMode(tokens, KiteTicker.modeFull);
            }
        });

        
        tickerProvider.setOnDisconnectedListener(new OnDisconnect() {
            @Override
            public void onDisconnected() {
            	System.out.println("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Websocket disconnected XXXXXXXXXXXXXXXXXXXXXXXXXXX " + tokens.size());
            }
        });

        
        /** Set listener to get order updates.*/
//        tickerProvider.setOnOrderUpdateListener(new OnOrderUpdate() {
//            @Override
//            public void onOrderUpdate(Order order) {
//                System.out.println("order update "+order.orderId);
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

    
    
    
    
    
    
    
    public static void main(String[] args){
    	
		Properties prop = new Properties();
		InputStream input = null;

		try {
			input = new FileInputStream("../StockInfo/config.properties");
			prop.load(input);
			String autZerodha = prop.getProperty("zerodha-key");					
        	FeedSubscribe feedSubscribe = new FeedSubscribe(autZerodha);                    	
        	ArrayList<Long> tokens = feedSubscribe.getTokens();         
        	feedSubscribe.dumpAllInstrument();
            feedSubscribe.startFeed( tokens);
            feedSubscribe.startDumpingTick();
						
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
    
    
}
