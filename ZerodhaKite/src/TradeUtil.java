import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.JSONException;
import org.json.JSONObject;
import com.zerodhatech.kiteconnect.KiteConnect;
import com.zerodhatech.kiteconnect.kitehttp.SessionExpiryHook;
import com.zerodhatech.kiteconnect.kitehttp.exceptions.KiteException;
import com.zerodhatech.kiteconnect.utils.Constants;
import com.zerodhatech.models.Holding;
import com.zerodhatech.models.Instrument;
import com.zerodhatech.models.Margin;
import com.zerodhatech.models.Order;
import com.zerodhatech.models.OrderParams;
import com.zerodhatech.models.Position;
import com.zerodhatech.models.Profile;
import com.zerodhatech.models.Quote;
import com.zerodhatech.models.Trade;


public class TradeUtil {

	public KiteConnect kiteConnect;	
	public Map<String,Instrument> instrumentsMap;
	public static String INSTRUMENTS_FILE_NAME = "instruments.csv";

	private String authorization ;
	
	public TradeUtil(String authorization) throws JSONException, IOException, KiteException{
		this.authorization=authorization;
		initKite();
	}
	
    public void initKite() throws JSONException, IOException, KiteException{
        kiteConnect = new KiteConnect(authorization);
        kiteConnect.setUserId("DA6170");
        kiteConnect.setEnableLogging(true);
        kiteConnect.setSessionExpiryHook(new SessionExpiryHook() {
            @Override
            public void sessionExpired() {
                System.out.println("session expired");
            }
        });   	
        readInstruments();   
        
    }
    
    
    public String getAuthorization() {
    	return authorization;
    }
    
    public boolean isDownloadRequired(String fileName){
    	File file = new File(fileName);   	
    	boolean isDownload = !file.exists();
    	Date fileCreateTime = new Date(file.lastModified());
    	Date marketTime = new Date();
    	marketTime.setHours(8);
    	marketTime.setMinutes(30);
    	if(fileCreateTime.before(marketTime)){
    		isDownload = true;
    	}
    	return isDownload;
    }
    
    public void readInstruments() throws JSONException, IOException, KiteException{
    	  	    	
    	boolean isDownload =  isDownloadRequired("data\\"+INSTRUMENTS_FILE_NAME);   
    	List<Instrument> instruments;    	
    	if(isDownload){
    		String data = kiteConnect.getInstrumentsData();
    		instruments = kiteConnect.formatInstruments(data);    		    		
    		BufferedWriter bw = new BufferedWriter(new FileWriter("data\\"+INSTRUMENTS_FILE_NAME));
    		bw.write(data);
    		bw.flush();
    	}else{
    		StringBuilder sb = new StringBuilder();
    		BufferedReader br  = new BufferedReader(new FileReader("data\\"+INSTRUMENTS_FILE_NAME));
    		String sCurrentLine;
    		while((sCurrentLine = br.readLine()) != null){
    			sb.append(sCurrentLine+"\n");
    		}
    		instruments = kiteConnect.formatInstruments(sb.toString());  
    	}
    	instrumentsMap = new HashMap<String,Instrument>();  
        for(Instrument instrument : instruments){
        	if( instrument.getExchange().equals("NSE") || instrument.getExchange().equals("NFO") || instrument.getExchange().equals("BSE")){
            		String key = instrument.getTradingsymbol()+"#"+instrument.getExchange();
            		instrumentsMap.put(key, instrument);
            		instrumentsMap.put(String.valueOf(instrument.instrument_token), instrument);
        	}        	
        }    	    	
    	System.out.println("Total Instuments Read : "+instrumentsMap.size());    	
    }
    
    
    public Profile getProfile(KiteConnect kiteConnect) throws IOException, KiteException {
       return kiteConnect.getProfile();
    }    
    
    
    public Margin getMargins(KiteConnect kiteConnect) throws KiteException, IOException {
         return  kiteConnect.getMargins("equity");
    }
               
    public Order placeLimitBuyOrder(Instrument instrument,Integer quantity,double price) throws KiteException, IOException {
        return placeOrder(instrument, Constants.TRANSACTION_TYPE_BUY,Constants.ORDER_TYPE_LIMIT, quantity, price,0);
    }        
    public Order placeLimitSellOrder(Instrument instrument,Integer quantity,double price) throws KiteException, IOException {        
        return placeOrder( instrument, Constants.TRANSACTION_TYPE_SELL, Constants.ORDER_TYPE_LIMIT,quantity, price,99999);
    }
    public Order placeSLBuyOrder(Instrument instrument,Integer quantity,double price,double trPrice) throws KiteException, IOException {
        return placeOrder(instrument, Constants.TRANSACTION_TYPE_BUY,Constants.ORDER_TYPE_SL, quantity, price,trPrice);
    }
        
    public Order placeSLSellOrder(Instrument instrument,Integer quantity,double price,double trPrice) throws KiteException, IOException {        
        return placeOrder( instrument, Constants.TRANSACTION_TYPE_SELL, Constants.ORDER_TYPE_SL,quantity, price,trPrice);
    }     
    
    public Order placeOrder(Instrument instrument,String transactionType,String orderType,Integer quantity,double price,double trPrice) throws KiteException, IOException {
    	double tickSize = instrument.tick_size;
    	price = price - price % tickSize + ((price % tickSize < tickSize / 2) ? 0.0 : tickSize);
    	
    	//rms check
    	    	
        OrderParams orderParams = new OrderParams();
        orderParams.tradingsymbol = instrument.getTradingsymbol();
        orderParams.quantity = quantity;
        orderParams.price = price;
        orderParams.orderType = orderType;
        orderParams.product = Constants.PRODUCT_CNC;
        orderParams.exchange = instrument.getExchange();
        orderParams.transactionType = transactionType;
        orderParams.validity = Constants.VALIDITY_DAY;
        orderParams.triggerPrice = 0.0;
    	if(Constants.ORDER_TYPE_SL.equals(orderType) || Constants.ORDER_TYPE_SLM.equals(orderType)){
    		trPrice = trPrice - trPrice % tickSize + ((trPrice % tickSize < tickSize / 2) ? 0.0 : tickSize);
    		orderParams.triggerPrice =trPrice;
    	}        
        orderParams.tag = "app"; //tag is optional and it cannot be more than 8 characters and only alphanumeric is allowed
        Order order = kiteConnect.placeOrder(orderParams, Constants.VARIETY_REGULAR);
        System.out.println(order.orderId);
        return order;    	
    }
    
    
    
    public Order placeCOBuyOrder(Instrument instrument,Integer quantity,double price,double trPrice) throws KiteException, IOException {
        return placeCoverOrder(instrument, Constants.TRANSACTION_TYPE_BUY,Constants.ORDER_TYPE_LIMIT, quantity, price,trPrice);
    }
        
    public Order placeCOSellOrder(Instrument instrument,Integer quantity,double price,double trPrice) throws KiteException, IOException {        
        return placeCoverOrder( instrument, Constants.TRANSACTION_TYPE_SELL, Constants.ORDER_TYPE_LIMIT,quantity, price,trPrice);
    }      
    
    public Order placeCoverOrder(Instrument instrument,String transactionType,String orderType,Integer quantity,double price,double trPrice) throws KiteException, IOException {
    	double tickSize = instrument.tick_size;
    	price = price - price % tickSize + ((price % tickSize < tickSize / 2) ? 0.0 : tickSize);
    	trPrice = trPrice - trPrice % tickSize + ((trPrice % tickSize < tickSize / 2) ? 0.0 : tickSize);
    	//rms check    	    	
        OrderParams orderParams = new OrderParams();
        orderParams.tradingsymbol = instrument.getTradingsymbol();
        orderParams.quantity = quantity;
        orderParams.price = price;
        orderParams.orderType = orderType;
        orderParams.product = Constants.PRODUCT_MIS;
        orderParams.exchange = instrument.getExchange();
        orderParams.transactionType = transactionType;
        orderParams.validity = Constants.VALIDITY_DAY;
        orderParams.triggerPrice = trPrice;      
        orderParams.tag = "app"; //tag is optional and it cannot be more than 8 characters and only alphanumeric is allowed
        Order order = kiteConnect.placeOrder(orderParams, Constants.VARIETY_CO);
        System.out.println(order.orderId);
        return order;    	
    }    
    
    /** Cancel an order*/
    public void cancelOrder(String orderId) throws KiteException, IOException {
        // Order modify request will return order model which will contain only order_id.
        // Cancel order will return order model which will only have orderId.
        Order order2 = kiteConnect.cancelOrder(orderId, Constants.VARIETY_REGULAR);
        System.out.println(order2.orderId);
    }    
    
    
    public void cancelAllOpenOrder() throws JSONException, IOException, KiteException {
        List<Order> orders = kiteConnect.getOrders();
        System.out.println("list of orders size is "+orders.size());
        for(int i = 0; i< orders.size(); i++){
        	Order order = orders.get(i);
        	if(Constants.ORDER_STATUS_OPEN.equals(order.status)){
        		cancelOrder(order.orderId);
        		System.out.println("canceling order : "+ orders.get(i).tradingSymbol+" "+orders.get(i).orderId+" "+orders.get(i).parentOrderId+" "+orders.get(i).orderType+" "+orders.get(i).averagePrice+" "+orders.get(i).exchangeTimestamp);
        	}            
        }
    }
    
    /** Get tradebook*/
    public void getTrades(KiteConnect kiteConnect) throws KiteException, IOException {
        // Returns tradebook.
        List<Trade> trades = kiteConnect.getTrades();
        for (int i=0; i < trades.size(); i++) {
            System.out.println(trades.get(i).tradingSymbol+" "+trades.size());
        }
        System.out.println(trades.size());
    }    

    /** Get all positions.*/
    public void getPositions(KiteConnect kiteConnect) throws KiteException, IOException {
        // Get positions returns position model which contains list of positions.
        Map<String, List<Position>> position = kiteConnect.getPositions();
        System.out.println(position.get("net").size());
        System.out.println(position.get("day").size());
    }

    /** Get holdings.*/
    public List<Holding> getHoldings(KiteConnect kiteConnect) throws KiteException, IOException {
        List<Holding> holdings = kiteConnect.getHoldings();        
        System.out.println(holdings.size());
        return holdings;
    }    
    
    public void writeHoldingsToFile(String data) throws IOException{
    	DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH-mm-ss");
    	String fileNaame = "data/holdings-"+dateFormat.format(new Date())+".json";
    	FileWriter file = new FileWriter(fileNaame);
    	file.write(data);
        file.flush();
    }
    
}
