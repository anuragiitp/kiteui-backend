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



public class TradeHelper {
	private KiteConnect kiteConnect;	
	private Map<String,Instrument> instrumentsMap;
	private static String INSTRUMENTS_FILE_NAME = "instruments.csv";
	
	
	public TradeHelper() throws JSONException, IOException, KiteException{
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
    public boolean isDownloadRequired(String fileName){
    	File file = new File(fileName);   	
    	boolean isDownload = !file.exists();
    	Date fileCreateTime = new Date(file.lastModified());
    	Date marketTime = new Date();
    	marketTime.setHours(9);
    	marketTime.setMinutes(0);
    	if(fileCreateTime.before(marketTime)){
    		isDownload = true;
    	}
    	return isDownload;
    }
    
    public void readInstruments() throws JSONException, IOException, KiteException{
    	  	    	
    	boolean isDownload = isDownloadRequired("data\\"+INSTRUMENTS_FILE_NAME);    	
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
    
    
    public void squareOffHoldingsAtLTP(int sqPer) throws KiteException, IOException {
    	JSONObject response = kiteConnect.getHoldingsData();
    	writeHoldingsToFile(response.toString());    	
        List<Holding> holdings = kiteConnect.formatHoldings(response);               
        System.out.println("SQUARE OFF POSITIONS -> " + holdings.size());
        for(Holding hl: holdings){
        	Integer quantity = Integer.parseInt(hl.quantity);
        	Integer t1Quantity = Integer.parseInt(hl.t1Quantity);
        	Integer totalQty =   quantity + t1Quantity;      	        	
        	if(totalQty > 0){
        		totalQty = (int)(totalQty*sqPer/100);
        		Instrument inst = instrumentsMap.get(hl.instrumentToken);
            	double tickSize = inst.tick_size;
            	double price = Double.parseDouble( hl.lastPrice) - 3*tickSize;
            	placeLimitSellOrder(inst, totalQty, price);
            	System.out.println("SQUARE OFF -> " +hl.tradingSymbol +"  "+ hl.quantity +"  "+ hl.lastPrice);	        		
        	}
        }
    }     
    
    //check for bracket range
    public void squareOffHoldingsAtBid(int sqPer) throws KiteException, IOException {
    	JSONObject response = kiteConnect.getHoldingsData();
    	writeHoldingsToFile(response.toString());    	
        List<Holding> holdings = kiteConnect.formatHoldings(response);                 
        System.out.println("SQUARE OFF POSITIONS -> " + holdings.size());
        
        ArrayList<String> instuments = new ArrayList<String>();
        for(Holding hl: holdings){
        	instuments.add(hl.exchange+":"+hl.tradingSymbol);
        }
        Map<String, Quote> holdingQuotes = kiteConnect.getQuote(instuments.toArray(new String[instuments.size()]));
        
        for(Holding hl: holdings){
        	Integer quantity = Integer.parseInt(hl.quantity);
        	Integer t1Quantity = Integer.parseInt(hl.t1Quantity);
        	Integer totalQty =   quantity + t1Quantity;      	        	
        	if(totalQty > 0){
        		totalQty = (int)(totalQty*sqPer/100);
        		Instrument inst = instrumentsMap.get(hl.instrumentToken);
            	double tickSize = inst.tick_size;
            	double price = Double.parseDouble( hl.lastPrice) - 3*tickSize;
            	if(holdingQuotes.containsKey(hl.exchange+":"+hl.tradingSymbol)){
            		price = holdingQuotes.get(hl.exchange+":"+hl.tradingSymbol).depth.buy.get(1).getPrice();
            	}           	
            	placeLimitSellOrder(inst, totalQty, price);
            	System.out.println("SQUARE OFF -> " +hl.tradingSymbol +"  "+ hl.quantity +"  "+ hl.lastPrice);	        		
        	}
        }
    }         
    //
    
    /* 	stop loss sell order to sq-off portfolio
	    limitPec - min sell price
	    triggerPec - order trigger per  
	    triggerPec < limitPec
	    th.squareOffHoldingsBySLOrder(50, 1, 2);  
	    */
    public void squareOffHoldingsBySLOrder(int sqPer , int triggerPec , int limitPec ) throws KiteException, IOException {
    	JSONObject response = kiteConnect.getHoldingsData();
    	writeHoldingsToFile(response.toString());    	
        List<Holding> holdings = kiteConnect.formatHoldings(response);                 
        System.out.println("SQUARE OFF POSITIONS -> " + holdings.size());
        
        //check for price band
        for(Holding hl: holdings){
        	Integer quantity = Integer.parseInt(hl.quantity);
        	Integer t1Quantity = Integer.parseInt(hl.t1Quantity);
        	Integer totalQty =   quantity + t1Quantity;      	        	
        	if(totalQty > 0){
        		totalQty = (int)(totalQty*sqPer/100);
        		Instrument inst = instrumentsMap.get(hl.instrumentToken);            	
            	double ltpPrice = Double.parseDouble( hl.lastPrice) ;            	
            	double price = ltpPrice - ltpPrice*limitPec/100;
            	double triggerPrice = ltpPrice - ltpPrice*triggerPec/100;            	
            	placeSLSellOrder(inst, totalQty, price,triggerPrice);
            	System.out.println("SQUARE OFF -> " +hl.tradingSymbol +"  "+ hl.quantity +"  "+ hl.lastPrice);	        		
        	}
        }
    }  
   
    
    
       
    public void pleaceSellCOOrders(ArrayList<SymbolQty> trades) throws KiteException, IOException {
        
        System.out.println("Total CO trades -> " + trades.size());        
        ArrayList<String> instuments = new ArrayList<String>();
        for(SymbolQty hl: trades){
        	instuments.add(hl.exchange+":"+hl.tradingSymbol);
        }
        Map<String, Quote> holdingQuotes = kiteConnect.getQuote(instuments.toArray(new String[instuments.size()]));
        
        if(holdingQuotes.size() != trades.size()){
        	System.err.println("Response size mismatch "+ holdingQuotes.size());
        	return;
        }
        
        for(SymbolQty hl: trades){
        	Integer totalQty =  hl.quantity;            	
        	if(totalQty > 0){
        		String key = hl.tradingSymbol+"#"+hl.exchange;
        		Instrument inst = instrumentsMap.get(key);
            	double tickSize = inst.tick_size;
            	Quote quote = holdingQuotes.get(hl.exchange+":"+hl.tradingSymbol);
            	double price =  quote.lastPrice - 3*tickSize;
            	double triggerPrice = price + price*2/100;   // 3pec trigger
            	
            	if(price*totalQty > 50000){
            		System.err.println(" Value exceed ----------  50K");
            		continue;
            	}
            	placeCOSellOrder(inst, totalQty, price, triggerPrice);
            	System.out.println("CO SELL ORDER -> " +hl.tradingSymbol +"  "+ hl.quantity +"  "+ price +"  "+ triggerPrice);	        		
        	}
        }
    }    
    
    public void pleaceBuyCOOrders(ArrayList<SymbolQty> trades) throws KiteException, IOException {
            
        System.out.println("Total CO trades -> " + trades.size());        
        ArrayList<String> instuments = new ArrayList<String>();
        for(SymbolQty hl: trades){
        	instuments.add(hl.exchange+":"+hl.tradingSymbol);
        }
        Map<String, Quote> holdingQuotes = kiteConnect.getQuote(instuments.toArray(new String[instuments.size()]));
        
        if(holdingQuotes.size() != trades.size()){
        	System.err.println("Response size mismatch "+ holdingQuotes.size());
        	return;
        }
        
        for(SymbolQty hl: trades){
        	Integer totalQty =  hl.quantity;            	
        	if(totalQty > 0){
        		String key = hl.tradingSymbol+"#"+hl.exchange;
        		Instrument inst = instrumentsMap.get(key);
            	double tickSize = inst.tick_size;
            	Quote quote = holdingQuotes.get(hl.exchange+":"+hl.tradingSymbol);
            	double price =  quote.lastPrice + 3*tickSize;
            	double triggerPrice = price - price*3/100;   // 3pec trigger
            	
            	if(price*totalQty > 50000){
            		System.err.println(" Value exceed ----------  50K");
            		continue;
            	}
            	placeCOBuyOrder(inst, totalQty, price, triggerPrice);
            	System.out.println("CO BUY ORDER -> " +hl.tradingSymbol +"  "+ hl.quantity +"  "+ price +"  "+ triggerPrice);	        		
        	}
        }
    }     
    
    
    
    public void executeCOTrades() throws KiteException, IOException {
    	ArrayList<SymbolQty> trades = new ArrayList<SymbolQty>();
    	trades.add(new SymbolQty("DLF", "NSE", 1));
    	trades.add(new SymbolQty("FRETAIL", "NSE", 1));
    	pleaceBuyCOOrders(trades);
    }
    
    
    
    
    
    
	private String authorization = "enctoken ----------------------------------";

    public static void main(String[] args){
        try {
        		TradeHelper th = new TradeHelper();          	
        		th.squareOffHoldingsAtBid(1);
        } catch (Exception | KiteException e) {
            e.printStackTrace();           
        } 
    }
    
    
    
    
    
    
}
