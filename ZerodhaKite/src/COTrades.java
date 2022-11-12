import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;

import org.json.JSONException;

import com.zerodhatech.kiteconnect.kitehttp.exceptions.KiteException;
import com.zerodhatech.models.Instrument;
import com.zerodhatech.models.Quote;


public class COTrades extends TradeUtil{

	public COTrades(String authorization) throws JSONException, IOException, KiteException {
		super(authorization);		
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
	            	double triggerPrice = price - price*2/100;   // 2 pec trigger
	            	
	            	if(price*totalQty > 50000){
	            		System.err.println(" Value exceed ----------  50K");
	            		continue;
	            	}
	            	placeCOBuyOrder(inst, totalQty, price, triggerPrice);
	            	System.out.println("CO BUY ORDER -> " +hl.tradingSymbol +"  "+ hl.quantity +"  "+ price +"  "+ triggerPrice);	        		
	        	}
	        }
	    }     
	    
	    
	    public void pleaceBuyCNCOrders(ArrayList<SymbolQty> trades) throws KiteException, IOException {
            
	        System.out.println("Total CNC trades -> " + trades.size());        
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
	            	double price =  quote.lastPrice + 10*tickSize;
	            	
	            	if(price*totalQty > 50000){
	            		System.err.println(" Value exceed ----------  50K");
	            		continue;
	            	}
	            	placeLimitBuyOrder(inst, totalQty, price);
	            	System.out.println("CNC BUY ORDER -> " +hl.tradingSymbol +"  "+ hl.quantity );	        		
	        	}
	        }
	    }	    
	    
	    

	    
	    public void createLongPosition() throws KiteException, IOException {
	    	executeCoverOrderPosition();
	    // 	executeCNCPosition();
	    }	    
	    

	    public void executeCNCPosition() throws KiteException, IOException {
	    	ArrayList<SymbolQty> trades = new ArrayList<SymbolQty>();
	    		    	
	    	trades.add(new SymbolQty("IBULHSGFIN", "NSE", 30));
    	trades.add(new SymbolQty("BANDHANBNK", "NSE", 40));	    	
   		    	
	    	pleaceBuyCNCOrders(trades);
	    }	    
	    

	    
	    
	    
	    

	    
	    
	    public void executeCoverOrderPosition() throws KiteException, IOException {
	    	ArrayList<SymbolQty> trades = new ArrayList<SymbolQty>();
	    	
//	    	trades.add(new SymbolQty("BAJFINANCE", "NSE", 5));
//	    	trades.add(new SymbolQty("VBL", "NSE", 30));
//	    	trades.add(new SymbolQty("AXISBANK", "NSE", 50));
//	    	trades.add(new SymbolQty("UPL", "NSE", 50));
//	    	trades.add(new SymbolQty("PVR", "NSE", 10));
//	    	trades.add(new SymbolQty("HDFCAMC", "NSE", 5));
//	    	trades.add(new SymbolQty("JMFINANCIL", "NSE", 150));
	    	
	    	pleaceBuyCOOrders(trades);
	    }
	    
	    
	    
	    
	    public static void main(String[] args){
	        try {
	        		String authorization = "enctoken TaulDYeZjgxvaD8PXwtT/Zp/HSBEh24Bn9FhrV5dfm9nEuDp0FLuBoL6u0m31U5wBY9QID14tsI73SpSHV7w8u7ypjs08w==";
	        		COTrades th = new COTrades(authorization);          	
	        		th.executeCoverOrderPosition();
	        } catch (Exception | KiteException e) {
	            e.printStackTrace();           
	        } 
	    }

	
}
