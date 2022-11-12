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
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.TreeMap;
import java.util.logging.FileHandler;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;
import com.zerodhatech.ticker.OnOrderUpdate;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.json.JSONException;

import com.neovisionaries.ws.client.WebSocketException;
import com.zerodhatech.kiteconnect.KiteConnect;
import com.zerodhatech.kiteconnect.kitehttp.SessionExpiryHook;
import com.zerodhatech.kiteconnect.kitehttp.exceptions.KiteException;
import com.zerodhatech.models.HistoricalData;
import com.zerodhatech.models.Instrument;
import com.zerodhatech.models.Order;
import com.zerodhatech.models.Tick;
import com.zerodhatech.ticker.KiteTicker;
import com.zerodhatech.ticker.OnConnect;
import com.zerodhatech.ticker.OnDisconnect;
import com.zerodhatech.ticker.OnTicks;

public class TrendFollowing extends TradeUtil{
	
	private String algoPropsFile = "../StockInfo/TrendFollowing.properties";
	private OrderedProperties algoProps;
	final  Logger logger = Logger.getLogger("TrendFollowing");  
	
	DescriptiveStatistics nifty50Stats = new DescriptiveStatistics();	
	DescriptiveStatistics bankNiftyStats = new DescriptiveStatistics();
	
	
	int NIFTY50_PREV_HIGH_1_30MIN,NIFTY50_PREV_LOW_1_30MIN, NIFTY50_PREV_HIGH_2_30MIN,NIFTY50_PREV_LOW_2_30MIN,NIFTY50_PREV_HIGH_3_30MIN,NIFTY50_PREV_LOW_3_30MIN;
	String NIFTY50_SUPPORT_30MIN,NIFTY50_RESISTENT_30MIN;
		
	int NIFTY50_PREV_DAY_HIGH,NIFTY50_PREV_DAY_LOW,NIFTY50_PREV_DAY_CLOSE,NIFTY50_PREV_DAY_OPEN;

	int NIFTY50_PREV_HIGH_1_DAILY,NIFTY50_PREV_LOW_1_DAILY, NIFTY50_PREV_HIGH_2_DAILY,NIFTY50_PREV_LOW_2_DAILY,NIFTY50_PREV_HIGH_3_DAILY,NIFTY50_PREV_LOW_3_DAILY;
	String NIFTY50_SUPPORT_DAILY,NIFTY50_RESISTENT_DAILY;

	TREND NIFTY50_PREV_DAY_TREND,NIFTY50_PREV_WEAK_TREND,NIFTY50_PREV_MONTH_TREND;
	
	int NIFTY50_TOTAL_TRADE=0,NIFTY50_MAX_TRADE=0;
			
			
	
	int BANKNIFTY_PREV_HIGH_1_30MIN,BANKNIFTY_PREV_LOW_1_30MIN, BANKNIFTY_PREV_HIGH_2_30MIN,BANKNIFTY_PREV_LOW_2_30MIN, BANKNIFTY_PREV_HIGH_3_30MIN,BANKNIFTY_PREV_LOW_3_30MIN;
	String BANKNIFTY_SUPPORT_30MIN,BANKNIFTY_RESISTENT_30MIN;
	
	int BANKNIFTY_PREV_HIGH_1_DAILY,BANKNIFTY_PREV_LOW_1_DAILY, BANKNIFTY_PREV_HIGH_2_DAILY,BANKNIFTY_PREV_LOW_2_DAILY, BANKNIFTY_PREV_HIGH_3_DAILY,BANKNIFTY_PREV_LOW_3_DAILY;
	String BANKNIFTY_SUPPORT_DAILY,BANKNIFTY_RESISTENT_DAILY;
	
	int BANKNIFTY_PREV_DAY_HIGH,BANKNIFTY_PREV_DAY_LOW,BANKNIFTY_PREV_DAY_CLOSE,BANKNIFTY_PREV_DAY_OPEN;
	

	TREND BANKNIFTY_PREV_DAY_TREND,BANKNIFTY_PREV_WEAK_TREND,BANKNIFTY_PREV_MONTH_TREND;
	int BANKNIFTY_TOTAL_TRADE=0,BANKNIFTY_MAX_TRADE=0;
	
	
	boolean NIFTY50_ENABLE=false,BANKNIFTY_ENABLE=false;
	
	
	
	
	public TrendFollowing(String authorization) throws JSONException, IOException, KiteException {
		super(authorization);
	
		FileHandler fh = new FileHandler("C:\\Users\\anurkuma\\OneDrive - Adobe\\DRIVE D\\workspace\\StockInfo\\TrendFollowing.log",true);  
        logger.addHandler( fh);
        fh.setFormatter(new SimpleFormatter());  
        logger.setUseParentHandlers(false);
        
		OrderedProperties.OrderedPropertiesBuilder builder = new OrderedProperties.OrderedPropertiesBuilder();
		builder.withSuppressDateInComment(false);
		algoProps = builder.build();
		
		algoProps.load(new FileReader(algoPropsFile));          
        		
		nifty50Stats.setWindowSize(5);   
		bankNiftyStats.setWindowSize(5); 
		
		
		if(algoProps.containsProperty("NIFTY50_ENABLE")) {
			NIFTY50_ENABLE = Boolean.parseBoolean(algoProps.getProperty("NIFTY50_ENABLE"));
		}
				
		if(algoProps.containsProperty("BANKNIFTY_ENABLE")) {
			BANKNIFTY_ENABLE = Boolean.parseBoolean(algoProps.getProperty("BANKNIFTY_ENABLE"));
		}
	
		if(algoProps.containsProperty("NIFTY50_TOTAL_TRADE")) {
			NIFTY50_TOTAL_TRADE = Integer.parseInt(algoProps.getProperty("NIFTY50_TOTAL_TRADE"));
		}
		if(algoProps.containsProperty("NIFTY50_MAX_TRADE")) {
			NIFTY50_MAX_TRADE = Integer.parseInt(algoProps.getProperty("NIFTY50_MAX_TRADE"));
		}		
		
		if(algoProps.containsProperty("BANKNIFTY_TOTAL_TRADE")) {
			BANKNIFTY_TOTAL_TRADE = Integer.parseInt(algoProps.getProperty("BANKNIFTY_TOTAL_TRADE"));
		}
		if(algoProps.containsProperty("BANKNIFTY_MAX_TRADE")) {
			BANKNIFTY_MAX_TRADE = Integer.parseInt(algoProps.getProperty("BANKNIFTY_MAX_TRADE"));
		}				

		
	}
	
	
	public int roundLevel(double ltp , double strike) {
		 return (int)(Math.round(ltp / strike )*strike);	
	}
	
	
	
	TreeMap<Integer, String> niftySupport30Min= new TreeMap<Integer, String>();
	TreeMap<Integer, String> niftyResistence30Min= new TreeMap<Integer, String>();	
	TreeMap<Integer, String> bankNiftySupport30Min= new TreeMap<Integer, String>();
	TreeMap<Integer, String> bankNiftyResistence30Min= new TreeMap<Integer, String>();

	TreeMap<Integer, String> niftySupportDaily= new TreeMap<Integer, String>();
	TreeMap<Integer, String> niftyResistenceDaily= new TreeMap<Integer, String>();	
	TreeMap<Integer, String> bankNiftySupportDaily= new TreeMap<Integer, String>();
	TreeMap<Integer, String> bankNiftyResistenceDaily= new TreeMap<Integer, String>();
	
	
	
	
	
	public void calculateSupportResistanceNifty50Daily(long instrument_token,String timeFrame,double srFactor,int strikeGap) throws JSONException, IOException, KiteException {
//		String timeFrame = "30minute"; // "30minute";
//		double srFactor = 0.0075;
//		int strikeGap=50;
		
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.HOUR, 20);
		cal.add(Calendar.DAY_OF_MONTH, -1);   	
		Date dayTo = cal.getTime();
		
		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom = cal.getTime();
		
		List<HistoricalData> dataArrayList = new ArrayList<>();
		
	
		HistoricalData historicalData = kiteConnect.getHistoricalData(dayFrom, dayTo, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);


		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom1 = cal.getTime();
		historicalData = kiteConnect.getHistoricalData(dayFrom1, dayFrom, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);
		
		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom2 = cal.getTime();
		historicalData = kiteConnect.getHistoricalData(dayFrom2, dayFrom1, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);
		

		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom3 = cal.getTime();
		historicalData = kiteConnect.getHistoricalData(dayFrom3, dayFrom2, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);

		
		
		
		int length = dataArrayList.size();
		
		double high=-1,low=9999999;
		
		HistoricalData prevHigh1=null,prevHigh2=null,prevHigh3=null;
		
		//Rejection on up move
		for(int i =length-1; i>=0;i--) {
			
			high = Math.max(high, dataArrayList.get(i).high);
			low = Math.min(low, dataArrayList.get(i).low);
			
			boolean isLeft = false,isRight=false;
			double startPrice = dataArrayList.get(i).high;
			double endPrice = dataArrayList.get(i).low;
			
			for(int j=i;j<=length - 1 ; j++) {
				endPrice = dataArrayList.get(j).low;
				if(endPrice > startPrice || dataArrayList.get(j).high > startPrice) {
					break;
				}else if( (startPrice - endPrice)/startPrice >= srFactor  ) {
					isRight = true;
					break;
				}				
			}
			
			if(!isRight) {
				continue;
			}
			
			for(int k=i-1;k>=0 ; k--) {
				endPrice = dataArrayList.get(k).low;
				if(endPrice > startPrice || dataArrayList.get(k).high > startPrice) {
					break;
				}else if( (startPrice - endPrice)/startPrice >= srFactor  ) {
					isLeft = true;
					break;
				}					
			}
			

			if(isLeft && isRight) {
				String date = dataArrayList.get(i).timeStamp.split("T")[0];
				int level =  roundLevel(dataArrayList.get(i).high  , strikeGap);
				
				if(!niftyResistenceDaily.containsKey(level)){
					niftyResistenceDaily.put(level, date);
				}else if(niftyResistenceDaily.containsKey(level) && !niftyResistenceDaily.get(level).contains(date)) {
					niftyResistenceDaily.put(level, niftyResistenceDaily.get(level)+"#"+date);
				} 
				
				if(prevHigh1==null) {
					prevHigh1 = dataArrayList.get(i);
				}else if( prevHigh2==null &&  (!date.equals(prevHigh1.timeStamp.split("T")[0]) || (date.equals(prevHigh1.timeStamp.split("T")[0]) &&  Math.abs(prevHigh1.high - dataArrayList.get(i).high) > 2.1*strikeGap))) {
					prevHigh2 = dataArrayList.get(i);
				}else if(prevHigh2!=null && prevHigh3==null && ( !date.equals(prevHigh2.timeStamp.split("T")[0]) || ( date.equals(prevHigh2.timeStamp.split("T")[0])  &&  Math.abs(prevHigh2.high - dataArrayList.get(i).high) > 2.1*strikeGap)  )) {
					prevHigh3 = dataArrayList.get(i);
				}
				
				// System.out.println( roundLevel(dataArrayList.get(i).high, 50) +"       " + dataArrayList.get(i).timeStamp.toString());
				
			}
			
		}
		
		

		HistoricalData prevLow1=null,prevLow2=null,prevLow3=null;
		//support on down move
		for(int i =length-1; i>=0;i--) {
			
			boolean isLeft = false,isRight=false;
			double startPrice = dataArrayList.get(i).low;
			double endPrice = dataArrayList.get(i).high;
			
			for(int j=i;j<=length - 1 ; j++) {
				endPrice = dataArrayList.get(j).high;
				if(endPrice < startPrice ||  dataArrayList.get(j).low < startPrice ) {
					break;
				}else if( (endPrice - startPrice )/startPrice >= srFactor  ) {
					isRight = true;
					break;
				}				
			}
			
			if(!isRight) {
				continue;
			}
			
			for(int k=i-1;k>=0 ; k--) {
				endPrice = dataArrayList.get(k).high;
				if(endPrice < startPrice ||  dataArrayList.get(k).low < startPrice ) {
					break;
				}else if( (endPrice - startPrice)/startPrice >= srFactor  ) {
					isLeft = true;
					break;
				}					
			}
			

			if(isLeft && isRight) {
				//System.out.println( roundLevel(dataArrayList.get(i).low, 50) +"       " + dataArrayList.get(i).timeStamp.toString());
				
				String date = dataArrayList.get(i).timeStamp.split("T")[0];
				int level =  roundLevel(dataArrayList.get(i).low , strikeGap);
				
				if(!niftySupportDaily.containsKey(level)) {
					niftySupportDaily.put(level, date);
				}else if(niftySupportDaily.containsKey(level) && !niftySupportDaily.get(level).contains(date) ) {
					niftySupportDaily.put(level, niftySupportDaily.get(level)+"#"+date);
				}
				
				if(prevLow1==null) {
					prevLow1 = dataArrayList.get(i);
				}else if(prevLow2==null && ( !date.equals(prevLow1.timeStamp.split("T")[0]) ||  Math.abs(prevLow1.low - dataArrayList.get(i).low) > 2.1*strikeGap )) {
					prevLow2 = dataArrayList.get(i);
				}else if(prevLow2!=null && prevLow3==null &&  (!date.equals(prevLow2.timeStamp.split("T")[0]) || Math.abs(prevLow2.low - dataArrayList.get(i).low) > 2.1*strikeGap  )) {
					prevLow3 = dataArrayList.get(i);
				}
								
			}
			
		}
		
		
		
		int prevKey=-1;
		for (  Integer key : niftyResistenceDaily.keySet()) {
			if( prevKey != -1  && key-prevKey <=strikeGap+1 && niftyResistenceDaily.get(key).split("#").length==1 && niftyResistenceDaily.get(prevKey).split("#").length==1) {
				niftyResistenceDaily.put(key, niftyResistenceDaily.get(key)+"#"+niftyResistenceDaily.get(prevKey));
			}
			prevKey=key;
		}
		
		prevKey=-1;
		for (  Integer key : niftySupportDaily.descendingKeySet()) {
			if( prevKey != -1  && prevKey-key <=strikeGap+1 && niftySupportDaily.get(key).split("#").length==1 && niftySupportDaily.get(prevKey).split("#").length==1) {
				niftySupportDaily.put(key, niftySupportDaily.get(key)+"#"+niftySupportDaily.get(prevKey));
			}
			prevKey=key;
		}		
		
		
		
		double close = dataArrayList.get(length-1).close;
		
		
		String resistance="";
		for (  Integer key : niftyResistenceDaily.keySet()) {
			if(close < key && key < (close + 0.1*close ) && niftyResistenceDaily.get(key).split("#").length >=1 ) {
				boolean iskeyP50Possibe = niftyResistenceDaily.containsKey(key + strikeGap) && niftyResistenceDaily.get(key + strikeGap).split("#").length >=1;
				
				if(iskeyP50Possibe && ( Math.abs(niftyResistenceDaily.get(key + strikeGap).split("#").length  - niftyResistenceDaily.get(key).split("#").length) <=1 )) {
					continue;
				}else if(iskeyP50Possibe && niftySupportDaily.containsKey(key+strikeGap) && niftySupportDaily.containsKey(key) && niftySupportDaily.get(key+strikeGap).split("#").length >=  niftySupportDaily.get(key).split("#").length) {
					continue;
				}else if(iskeyP50Possibe && niftySupportDaily.containsKey(key+strikeGap) && !niftySupportDaily.containsKey(key)) {
					continue;
				}

				resistance = resistance+key+"#";
			}
		}		
		if(!resistance.contains("#"+roundLevel(high, strikeGap))) {
			resistance += roundLevel(high, strikeGap);
		}
		
		
		
		String support="";		
		for (  Integer key : niftySupportDaily.descendingKeySet()) {
			if(close > key && key > (close - 0.1*close ) && niftySupportDaily.get(key).split("#").length >=1 ) {
				boolean iskeyM50Possibe = niftySupportDaily.containsKey(key - strikeGap) && niftySupportDaily.get(key - strikeGap).split("#").length >=1;
				
				if(iskeyM50Possibe && ( Math.abs(niftySupportDaily.get(key - strikeGap).split("#").length  - niftySupportDaily.get(key).split("#").length)>= 1)) {
					continue;
				}else if(iskeyM50Possibe && niftyResistenceDaily.containsKey(key - strikeGap) && niftyResistenceDaily.containsKey(key) && niftyResistenceDaily.get(key-strikeGap).split("#").length >=  niftyResistenceDaily.get(key).split("#").length) {
					continue;
				}else if(iskeyM50Possibe && niftyResistenceDaily.containsKey(key - strikeGap) && !niftyResistenceDaily.containsKey(key)) {
					continue;
				}

				support = support+key+"#";
			}
		}	
		if(!support.contains("#"+roundLevel(low, strikeGap))) {
			support += roundLevel(low, strikeGap);
		}
		
		
		
		NIFTY50_PREV_HIGH_1_DAILY = roundLevel(prevHigh1.high, strikeGap);
		NIFTY50_PREV_HIGH_2_DAILY = roundLevel(prevHigh2.high, strikeGap);	
		NIFTY50_PREV_HIGH_3_DAILY = roundLevel(prevHigh3.high, strikeGap);	
		NIFTY50_PREV_LOW_1_DAILY = roundLevel(prevLow1.low, strikeGap);
		NIFTY50_PREV_LOW_2_DAILY = roundLevel(prevLow2.low, strikeGap);
		NIFTY50_PREV_LOW_3_DAILY = roundLevel(prevLow3.low, strikeGap);
		NIFTY50_SUPPORT_DAILY = support;
		NIFTY50_RESISTENT_DAILY =resistance;
		
		
		algoProps.setProperty("NIFTY50_PREV_HIGH_1_DAILY", Integer.toString(NIFTY50_PREV_HIGH_1_DAILY));
		algoProps.setProperty("NIFTY50_PREV_HIGH_2_DAILY", Integer.toString(NIFTY50_PREV_HIGH_2_DAILY));
		algoProps.setProperty("NIFTY50_PREV_HIGH_3_DAILY", Integer.toString(NIFTY50_PREV_HIGH_3_DAILY));
		algoProps.setProperty("NIFTY50_PREV_LOW_1_DAILY", Integer.toString(NIFTY50_PREV_LOW_1_DAILY));
		algoProps.setProperty("NIFTY50_PREV_LOW_2_DAILY", Integer.toString(NIFTY50_PREV_LOW_2_DAILY));
		algoProps.setProperty("NIFTY50_PREV_LOW_3_DAILY", Integer.toString(NIFTY50_PREV_LOW_3_DAILY));
		algoProps.setProperty("NIFTY50_SUPPORT_DAILY", NIFTY50_SUPPORT_DAILY);
		algoProps.setProperty("NIFTY50_RESISTENT_DAILY", NIFTY50_RESISTENT_DAILY);
		
		
				
		saveAlgoProps();		
		
		
	}

	
	
	
	public void calculateSupportResistanceNifty5030Min(long instrument_token,String timeFrame,double srFactor,int strikeGap) throws JSONException, IOException, KiteException {
//		String timeFrame = "30minute"; // "30minute";
//		double srFactor = 0.0075;
//		int strikeGap=50;
		
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.HOUR, 20);
		cal.add(Calendar.DAY_OF_MONTH, -1);   	
		Date dayTo = cal.getTime();
		
		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom = cal.getTime();
		
		List<HistoricalData> dataArrayList = new ArrayList<>();
		
	
		HistoricalData historicalData = kiteConnect.getHistoricalData(dayFrom, dayTo, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);


		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom1 = cal.getTime();
		historicalData = kiteConnect.getHistoricalData(dayFrom1, dayFrom, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);
		
		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom2 = cal.getTime();
		historicalData = kiteConnect.getHistoricalData(dayFrom2, dayFrom1, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);
		

		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom3 = cal.getTime();
		historicalData = kiteConnect.getHistoricalData(dayFrom3, dayFrom2, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);

		
		
		
		int length = dataArrayList.size();
		
		double high=-1,low=9999999;
		
		HistoricalData prevHigh1=null,prevHigh2=null,prevHigh3=null;
		
		//Rejection on up move
		for(int i =length-1; i>=0;i--) {
			
			high = Math.max(high, dataArrayList.get(i).high);
			low = Math.min(low, dataArrayList.get(i).low);
			
			boolean isLeft = false,isRight=false;
			double startPrice = dataArrayList.get(i).high;
			double endPrice = dataArrayList.get(i).low;
			
			for(int j=i;j<=length - 1 ; j++) {
				endPrice = dataArrayList.get(j).low;
				if(endPrice > startPrice || dataArrayList.get(j).high > startPrice) {
					break;
				}else if( (startPrice - endPrice)/startPrice >= srFactor  ) {
					isRight = true;
					break;
				}				
			}
			
			if(!isRight) {
				continue;
			}
			
			for(int k=i-1;k>=0 ; k--) {
				endPrice = dataArrayList.get(k).low;
				if(endPrice > startPrice || dataArrayList.get(k).high > startPrice) {
					break;
				}else if( (startPrice - endPrice)/startPrice >= srFactor  ) {
					isLeft = true;
					break;
				}					
			}
			

			if(isLeft && isRight) {
				String date = dataArrayList.get(i).timeStamp.split("T")[0];
				int level =  roundLevel(dataArrayList.get(i).high  , strikeGap);
				
				if(!niftyResistence30Min.containsKey(level)){
					niftyResistence30Min.put(level, date);
				}else if(niftyResistence30Min.containsKey(level) && !niftyResistence30Min.get(level).contains(date)) {
					niftyResistence30Min.put(level, niftyResistence30Min.get(level)+"#"+date);
				} 
				
				if(prevHigh1==null) {
					prevHigh1 = dataArrayList.get(i);
				}else if( prevHigh2==null &&  (!date.equals(prevHigh1.timeStamp.split("T")[0]) || (date.equals(prevHigh1.timeStamp.split("T")[0]) &&  Math.abs(prevHigh1.high - dataArrayList.get(i).high) > 2.1*strikeGap))) {
					prevHigh2 = dataArrayList.get(i);
				}else if(prevHigh2!=null && prevHigh3==null && ( !date.equals(prevHigh2.timeStamp.split("T")[0]) || ( date.equals(prevHigh2.timeStamp.split("T")[0])  &&  Math.abs(prevHigh2.high - dataArrayList.get(i).high) > 2.1*strikeGap)  )) {
					prevHigh3 = dataArrayList.get(i);
				}
				
				// System.out.println( roundLevel(dataArrayList.get(i).high, 50) +"       " + dataArrayList.get(i).timeStamp.toString());
				
			}
			
		}
		
		

		HistoricalData prevLow1=null,prevLow2=null,prevLow3=null;
		//support on down move
		for(int i =length-1; i>=0;i--) {
			
			boolean isLeft = false,isRight=false;
			double startPrice = dataArrayList.get(i).low;
			double endPrice = dataArrayList.get(i).high;
			
			for(int j=i;j<=length - 1 ; j++) {
				endPrice = dataArrayList.get(j).high;
				if(endPrice < startPrice ||  dataArrayList.get(j).low < startPrice ) {
					break;
				}else if( (endPrice - startPrice )/startPrice >= srFactor  ) {
					isRight = true;
					break;
				}				
			}
			
			if(!isRight) {
				continue;
			}
			
			for(int k=i-1;k>=0 ; k--) {
				endPrice = dataArrayList.get(k).high;
				if(endPrice < startPrice ||  dataArrayList.get(k).low < startPrice ) {
					break;
				}else if( (endPrice - startPrice)/startPrice >= srFactor  ) {
					isLeft = true;
					break;
				}					
			}
			

			if(isLeft && isRight) {
				//System.out.println( roundLevel(dataArrayList.get(i).low, 50) +"       " + dataArrayList.get(i).timeStamp.toString());
				
				String date = dataArrayList.get(i).timeStamp.split("T")[0];
				int level =  roundLevel(dataArrayList.get(i).low , strikeGap);
				
				if(!niftySupport30Min.containsKey(level)) {
					niftySupport30Min.put(level, date);
				}else if(niftySupport30Min.containsKey(level) && !niftySupport30Min.get(level).contains(date) ) {
					niftySupport30Min.put(level, niftySupport30Min.get(level)+"#"+date);
				}
				
				if(prevLow1==null) {
					prevLow1 = dataArrayList.get(i);
				}else if(prevLow2==null && ( !date.equals(prevLow1.timeStamp.split("T")[0]) ||  Math.abs(prevLow1.low - dataArrayList.get(i).low) > 2.1*strikeGap )) {
					prevLow2 = dataArrayList.get(i);
				}else if(prevLow2!=null && prevLow3==null &&  (!date.equals(prevLow2.timeStamp.split("T")[0]) || Math.abs(prevLow2.low - dataArrayList.get(i).low) > 2.1*strikeGap  )) {
					prevLow3 = dataArrayList.get(i);
				}
								
			}
			
		}
		
		
		
		int prevKey=-1;
		for (  Integer key : niftyResistence30Min.keySet()) {
			if( prevKey != -1  && key-prevKey <=strikeGap+1 && niftyResistence30Min.get(key).split("#").length==1 && niftyResistence30Min.get(prevKey).split("#").length==1) {
				niftyResistence30Min.put(key, niftyResistence30Min.get(key)+"#"+niftyResistence30Min.get(prevKey));
			}
			prevKey=key;
		}
		
		prevKey=-1;
		for (  Integer key : niftySupport30Min.descendingKeySet()) {
			if( prevKey != -1  && prevKey-key <=strikeGap+1 && niftySupport30Min.get(key).split("#").length==1 && niftySupport30Min.get(prevKey).split("#").length==1) {
				niftySupport30Min.put(key, niftySupport30Min.get(key)+"#"+niftySupport30Min.get(prevKey));
			}
			prevKey=key;
		}		
		
		
		
		double close = dataArrayList.get(length-1).close;
		
		
		String resistance="";
		for (  Integer key : niftyResistence30Min.keySet()) {
			if(close < key && key < (close + 0.1*close ) && niftyResistence30Min.get(key).split("#").length >=2 ) {
				boolean iskeyP50Possibe = niftyResistence30Min.containsKey(key + strikeGap) && niftyResistence30Min.get(key + strikeGap).split("#").length >=2;
				
				if(iskeyP50Possibe && ( Math.abs(niftyResistence30Min.get(key + strikeGap).split("#").length  - niftyResistence30Min.get(key).split("#").length) <=1 )) {
					continue;
				}else if(iskeyP50Possibe && niftySupport30Min.containsKey(key+strikeGap) && niftySupport30Min.containsKey(key) && niftySupport30Min.get(key+strikeGap).split("#").length >=  niftySupport30Min.get(key).split("#").length) {
					continue;
				}else if(iskeyP50Possibe && niftySupport30Min.containsKey(key+strikeGap) && !niftySupport30Min.containsKey(key)) {
					continue;
				}

				resistance = resistance+key+"#";
			}
		}		
		if(!resistance.contains("#"+roundLevel(high, strikeGap))) {
			resistance += roundLevel(high, strikeGap);
		}
		
		
		
		String support="";		
		for (  Integer key : niftySupport30Min.descendingKeySet()) {
			if(close > key && key > (close - 0.1*close ) && niftySupport30Min.get(key).split("#").length >=2 ) {
				boolean iskeyM50Possibe = niftySupport30Min.containsKey(key - strikeGap) && niftySupport30Min.get(key - strikeGap).split("#").length >=2;
				
				if(iskeyM50Possibe && ( Math.abs(niftySupport30Min.get(key - strikeGap).split("#").length  - niftySupport30Min.get(key).split("#").length)>= 2)) {
					continue;
				}else if(iskeyM50Possibe && niftyResistence30Min.containsKey(key - strikeGap) && niftyResistence30Min.containsKey(key) && niftyResistence30Min.get(key-strikeGap).split("#").length >=  niftyResistence30Min.get(key).split("#").length) {
					continue;
				}else if(iskeyM50Possibe && niftyResistence30Min.containsKey(key - strikeGap) && !niftyResistence30Min.containsKey(key)) {
					continue;
				}

				support = support+key+"#";
			}
		}	
		if(!support.contains("#"+roundLevel(low, strikeGap))) {
			support += roundLevel(low, strikeGap);
		}
		
		
		
		NIFTY50_PREV_HIGH_1_30MIN = roundLevel(prevHigh1.high, strikeGap);
		NIFTY50_PREV_HIGH_2_30MIN = roundLevel(prevHigh2.high, strikeGap);	
		NIFTY50_PREV_HIGH_3_30MIN = roundLevel(prevHigh3.high, strikeGap);	
		NIFTY50_PREV_LOW_1_30MIN = roundLevel(prevLow1.low, strikeGap);
		NIFTY50_PREV_LOW_2_30MIN = roundLevel(prevLow2.low, strikeGap);
		NIFTY50_PREV_LOW_3_30MIN = roundLevel(prevLow3.low, strikeGap);
		NIFTY50_SUPPORT_30MIN = support;
		NIFTY50_RESISTENT_30MIN =resistance;
		
		
		algoProps.setProperty("NIFTY50_PREV_HIGH_1_30MIN", Integer.toString(NIFTY50_PREV_HIGH_1_30MIN));
		algoProps.setProperty("NIFTY50_PREV_HIGH_2_30MIN", Integer.toString(NIFTY50_PREV_HIGH_2_30MIN));
		algoProps.setProperty("NIFTY50_PREV_HIGH_3_30MIN", Integer.toString(NIFTY50_PREV_HIGH_3_30MIN));
		algoProps.setProperty("NIFTY50_PREV_LOW_1_30MIN", Integer.toString(NIFTY50_PREV_LOW_1_30MIN));
		algoProps.setProperty("NIFTY50_PREV_LOW_2_30MIN", Integer.toString(NIFTY50_PREV_LOW_2_30MIN));
		algoProps.setProperty("NIFTY50_PREV_LOW_3_30MIN", Integer.toString(NIFTY50_PREV_LOW_3_30MIN));
		algoProps.setProperty("NIFTY50_SUPPORT_30MIN", NIFTY50_SUPPORT_30MIN);
		algoProps.setProperty("NIFTY50_RESISTENT_30MIN", NIFTY50_RESISTENT_30MIN);
		
		
				
		saveAlgoProps();		
		
		
		
		
	}
	
	
	
	
	public void calculateSupportResistanceBankNiftyDaily(long instrument_token,String timeFrame,double srFactor,int strikeGap) throws JSONException, IOException, KiteException {
//		String timeFrame = "30minute"; // "30minute";
//		double srFactor = 0.0075;
//		int strikeGap=50;
		
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.HOUR, 20);
		cal.add(Calendar.DAY_OF_MONTH, -1);   	
		Date dayTo = cal.getTime();
		
		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom = cal.getTime();
		
		List<HistoricalData> dataArrayList = new ArrayList<>();
		
	
		HistoricalData historicalData = kiteConnect.getHistoricalData(dayFrom, dayTo, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);


		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom1 = cal.getTime();
		historicalData = kiteConnect.getHistoricalData(dayFrom1, dayFrom, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);
		
		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom2 = cal.getTime();
		historicalData = kiteConnect.getHistoricalData(dayFrom2, dayFrom1, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);
		

		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom3 = cal.getTime();
		historicalData = kiteConnect.getHistoricalData(dayFrom3, dayFrom2, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);

		
		
		
		int length = dataArrayList.size();
		
		double high=-1,low=9999999;
		
		HistoricalData prevHigh1=null,prevHigh2=null,prevHigh3=null;
		
		//Rejection on up move
		for(int i =length-1; i>=0;i--) {
			
			high = Math.max(high, dataArrayList.get(i).high);
			low = Math.min(low, dataArrayList.get(i).low);
			
			boolean isLeft = false,isRight=false;
			double startPrice = dataArrayList.get(i).high;
			double endPrice = dataArrayList.get(i).low;
			
			for(int j=i;j<=length - 1 ; j++) {
				endPrice = dataArrayList.get(j).low;
				if(endPrice > startPrice || dataArrayList.get(j).high > startPrice) {
					break;
				}else if( (startPrice - endPrice)/startPrice >= srFactor  ) {
					isRight = true;
					break;
				}				
			}
			
			if(!isRight) {
				continue;
			}
			
			for(int k=i-1;k>=0 ; k--) {
				endPrice = dataArrayList.get(k).low;
				if(endPrice > startPrice || dataArrayList.get(k).high > startPrice) {
					break;
				}else if( (startPrice - endPrice)/startPrice >= srFactor  ) {
					isLeft = true;
					break;
				}					
			}
			

			if(isLeft && isRight) {
				String date = dataArrayList.get(i).timeStamp.split("T")[0];
				int level =  roundLevel(dataArrayList.get(i).high  , strikeGap);
				
				if(!bankNiftyResistenceDaily.containsKey(level)){
					bankNiftyResistenceDaily.put(level, date);
				}else if(bankNiftyResistenceDaily.containsKey(level) && !bankNiftyResistenceDaily.get(level).contains(date)) {
					bankNiftyResistenceDaily.put(level, bankNiftyResistenceDaily.get(level)+"#"+date);
				} 
				
				if(prevHigh1==null) {
					prevHigh1 = dataArrayList.get(i);
				}else if( prevHigh2==null &&  (!date.equals(prevHigh1.timeStamp.split("T")[0]) || (date.equals(prevHigh1.timeStamp.split("T")[0]) &&  Math.abs(prevHigh1.high - dataArrayList.get(i).high) > 2.1*strikeGap))) {
					prevHigh2 = dataArrayList.get(i);
				}else if(prevHigh2!=null && prevHigh3==null && ( !date.equals(prevHigh2.timeStamp.split("T")[0]) || ( date.equals(prevHigh2.timeStamp.split("T")[0])  &&  Math.abs(prevHigh2.high - dataArrayList.get(i).high) > 2.1*strikeGap)  )) {
					prevHigh3 = dataArrayList.get(i);
				}
				
				// System.out.println( roundLevel(dataArrayList.get(i).high, 50) +"       " + dataArrayList.get(i).timeStamp.toString());
				
			}
			
		}
		
		

		HistoricalData prevLow1=null,prevLow2=null,prevLow3=null;
		//support on down move
		for(int i =length-1; i>=0;i--) {
			
			boolean isLeft = false,isRight=false;
			double startPrice = dataArrayList.get(i).low;
			double endPrice = dataArrayList.get(i).high;
			
			for(int j=i;j<=length - 1 ; j++) {
				endPrice = dataArrayList.get(j).high;
				if(endPrice < startPrice ||  dataArrayList.get(j).low < startPrice ) {
					break;
				}else if( (endPrice - startPrice )/startPrice >= srFactor  ) {
					isRight = true;
					break;
				}				
			}
			
			if(!isRight) {
				continue;
			}
			
			for(int k=i-1;k>=0 ; k--) {
				endPrice = dataArrayList.get(k).high;
				if(endPrice < startPrice ||  dataArrayList.get(k).low < startPrice ) {
					break;
				}else if( (endPrice - startPrice)/startPrice >= srFactor  ) {
					isLeft = true;
					break;
				}					
			}
			

			if(isLeft && isRight) {
				//System.out.println( roundLevel(dataArrayList.get(i).low, 50) +"       " + dataArrayList.get(i).timeStamp.toString());
				
				String date = dataArrayList.get(i).timeStamp.split("T")[0];
				int level =  roundLevel(dataArrayList.get(i).low , strikeGap);
				
				if(!bankNiftySupportDaily.containsKey(level)) {
					bankNiftySupportDaily.put(level, date);
				}else if(bankNiftySupportDaily.containsKey(level) && !bankNiftySupportDaily.get(level).contains(date) ) {
					bankNiftySupportDaily.put(level, bankNiftySupportDaily.get(level)+"#"+date);
				}
				
				if(prevLow1==null) {
					prevLow1 = dataArrayList.get(i);
				}else if(prevLow2==null && ( !date.equals(prevLow1.timeStamp.split("T")[0]) ||  Math.abs(prevLow1.low - dataArrayList.get(i).low) > 2.1*strikeGap )) {
					prevLow2 = dataArrayList.get(i);
				}else if(prevLow2!=null && prevLow3==null &&  (!date.equals(prevLow2.timeStamp.split("T")[0]) || Math.abs(prevLow2.low - dataArrayList.get(i).low) > 2.1*strikeGap  )) {
					prevLow3 = dataArrayList.get(i);
				}
								
			}
			
		}
		
		
		
		int prevKey=-1;
		for (  Integer key : bankNiftyResistenceDaily.keySet()) {
			if( prevKey != -1  && key-prevKey <=strikeGap+1 && bankNiftyResistenceDaily.get(key).split("#").length==1 && bankNiftyResistenceDaily.get(prevKey).split("#").length==1) {
				bankNiftyResistenceDaily.put(key, bankNiftyResistenceDaily.get(key)+"#"+bankNiftyResistenceDaily.get(prevKey));
			}
			prevKey=key;
		}
		
		prevKey=-1;
		for (  Integer key : bankNiftySupportDaily.descendingKeySet()) {
			if( prevKey != -1  && prevKey-key <=strikeGap+1 && bankNiftySupportDaily.get(key).split("#").length==1 && bankNiftySupportDaily.get(prevKey).split("#").length==1) {
				bankNiftySupportDaily.put(key, bankNiftySupportDaily.get(key)+"#"+bankNiftySupportDaily.get(prevKey));
			}
			prevKey=key;
		}		
		
		
		
		double close = dataArrayList.get(length-1).close;
		
		
		String resistance="";
		for (  Integer key : bankNiftyResistenceDaily.keySet()) {
			if(close < key && key < (close + 0.1*close ) && bankNiftyResistenceDaily.get(key).split("#").length >=1 ) {
				boolean iskeyP50Possibe = bankNiftyResistenceDaily.containsKey(key + strikeGap) && bankNiftyResistenceDaily.get(key + strikeGap).split("#").length >=1;
				
				if(iskeyP50Possibe && ( Math.abs(bankNiftyResistenceDaily.get(key + strikeGap).split("#").length  - bankNiftyResistenceDaily.get(key).split("#").length) <=1 )) {
					continue;
				}else if(iskeyP50Possibe && bankNiftySupportDaily.containsKey(key+strikeGap) && bankNiftySupportDaily.containsKey(key) && bankNiftySupportDaily.get(key+strikeGap).split("#").length >=  bankNiftySupportDaily.get(key).split("#").length) {
					continue;
				}else if(iskeyP50Possibe && bankNiftySupportDaily.containsKey(key+strikeGap) && !bankNiftySupportDaily.containsKey(key)) {
					continue;
				}

				resistance = resistance+key+"#";
			}
		}		
		if(!resistance.contains("#"+roundLevel(high, strikeGap))) {
			resistance += roundLevel(high, strikeGap);
		}
		
		
		
		String support="";		
		for (  Integer key : bankNiftySupportDaily.descendingKeySet()) {
			if(close > key && key > (close - 0.1*close ) && bankNiftySupportDaily.get(key).split("#").length >=1 ) {
				boolean iskeyM50Possibe = bankNiftySupportDaily.containsKey(key - strikeGap) && bankNiftySupportDaily.get(key - strikeGap).split("#").length >=1;
				
				if(iskeyM50Possibe && ( Math.abs(bankNiftySupportDaily.get(key - strikeGap).split("#").length  - bankNiftySupportDaily.get(key).split("#").length)>= 1)) {
					continue;
				}else if(iskeyM50Possibe && bankNiftyResistenceDaily.containsKey(key - strikeGap) && bankNiftyResistenceDaily.containsKey(key) && bankNiftyResistenceDaily.get(key-strikeGap).split("#").length >=  bankNiftyResistenceDaily.get(key).split("#").length) {
					continue;
				}else if(iskeyM50Possibe && bankNiftyResistenceDaily.containsKey(key - strikeGap) && !bankNiftyResistenceDaily.containsKey(key)) {
					continue;
				}

				support = support+key+"#";
			}
		}	
		if(!support.contains("#"+roundLevel(low, strikeGap))) {
			support += roundLevel(low, strikeGap);
		}
		
		
		
		BANKNIFTY_PREV_HIGH_1_DAILY = roundLevel(prevHigh1.high, strikeGap);
		BANKNIFTY_PREV_HIGH_2_DAILY = roundLevel(prevHigh2.high, strikeGap);	
		BANKNIFTY_PREV_HIGH_3_DAILY = roundLevel(prevHigh3.high, strikeGap);	
		BANKNIFTY_PREV_LOW_1_DAILY = roundLevel(prevLow1.low, strikeGap);
		BANKNIFTY_PREV_LOW_2_DAILY = roundLevel(prevLow2.low, strikeGap);
		BANKNIFTY_PREV_LOW_3_DAILY = roundLevel(prevLow3.low, strikeGap);
		BANKNIFTY_SUPPORT_DAILY = support;
		BANKNIFTY_RESISTENT_DAILY =resistance;
		
		
		algoProps.setProperty("BANKNIFTY_PREV_HIGH_1_DAILY", Integer.toString(BANKNIFTY_PREV_HIGH_1_DAILY));
		algoProps.setProperty("BANKNIFTY_PREV_HIGH_2_DAILY", Integer.toString(BANKNIFTY_PREV_HIGH_2_DAILY));
		algoProps.setProperty("BANKNIFTY_PREV_HIGH_3_DAILY", Integer.toString(BANKNIFTY_PREV_HIGH_3_DAILY));
		algoProps.setProperty("BANKNIFTY_PREV_LOW_1_DAILY", Integer.toString(BANKNIFTY_PREV_LOW_1_DAILY));
		algoProps.setProperty("BANKNIFTY_PREV_LOW_2_DAILY", Integer.toString(BANKNIFTY_PREV_LOW_2_DAILY));
		algoProps.setProperty("BANKNIFTY_PREV_LOW_3_DAILY", Integer.toString(BANKNIFTY_PREV_LOW_3_DAILY));
		algoProps.setProperty("BANKNIFTY_SUPPORT_DAILY", BANKNIFTY_SUPPORT_DAILY);
		algoProps.setProperty("BANKNIFTY_RESISTENT_DAILY", BANKNIFTY_RESISTENT_DAILY);
		
		
				
		saveAlgoProps();		
		
		
	}
	
	
	public void calculateSupportResistanceBankNifty30Min(long instrument_token,String timeFrame,double srFactor,int strikeGap) throws JSONException, IOException, KiteException {
//		String timeFrame = "30minute"; // "30minute";
//		double srFactor = 0.0075;
//		int strikeGap=50;
		
		Calendar cal = Calendar.getInstance();
		cal.set(Calendar.HOUR, 20);
		cal.add(Calendar.DAY_OF_MONTH, -1);   	
		Date dayTo = cal.getTime();
		
		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom = cal.getTime();
		
		List<HistoricalData> dataArrayList = new ArrayList<>();
		
	
		HistoricalData historicalData = kiteConnect.getHistoricalData(dayFrom, dayTo, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);


		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom1 = cal.getTime();
		historicalData = kiteConnect.getHistoricalData(dayFrom1, dayFrom, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);
		
		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom2 = cal.getTime();
		historicalData = kiteConnect.getHistoricalData(dayFrom2, dayFrom1, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);
		

		cal.add(Calendar.DAY_OF_MONTH, -200);
		Date dayFrom3 = cal.getTime();
		historicalData = kiteConnect.getHistoricalData(dayFrom3, dayFrom2, Long.toString(instrument_token), timeFrame, false);		
		dataArrayList.addAll(0,  historicalData.dataArrayList);

		
		
		
		int length = dataArrayList.size();
		
		double high=-1,low=9999999;
		
		HistoricalData prevHigh1=null,prevHigh2=null,prevHigh3=null;
		
		//Rejection on up move
		for(int i =length-1; i>=0;i--) {
			
			high = Math.max(high, dataArrayList.get(i).high);
			low = Math.min(low, dataArrayList.get(i).low);
			
			boolean isLeft = false,isRight=false;
			double startPrice = dataArrayList.get(i).high;
			double endPrice = dataArrayList.get(i).low;
			
			for(int j=i;j<=length - 1 ; j++) {
				endPrice = dataArrayList.get(j).low;
				if(endPrice > startPrice || dataArrayList.get(j).high > startPrice) {
					break;
				}else if( (startPrice - endPrice)/startPrice >= srFactor  ) {
					isRight = true;
					break;
				}				
			}
			
			if(!isRight) {
				continue;
			}
			
			for(int k=i-1;k>=0 ; k--) {
				endPrice = dataArrayList.get(k).low;
				if(endPrice > startPrice || dataArrayList.get(k).high > startPrice) {
					break;
				}else if( (startPrice - endPrice)/startPrice >= srFactor  ) {
					isLeft = true;
					break;
				}					
			}
			

			if(isLeft && isRight) {
				String date = dataArrayList.get(i).timeStamp.split("T")[0];
				int level =  roundLevel(dataArrayList.get(i).high  , strikeGap);
				
				if(!bankNiftyResistence30Min.containsKey(level)){
					bankNiftyResistence30Min.put(level, date);
				}else if(bankNiftyResistence30Min.containsKey(level) && !bankNiftyResistence30Min.get(level).contains(date)) {
					bankNiftyResistence30Min.put(level, bankNiftyResistence30Min.get(level)+"#"+date);
				} 
				
				if(prevHigh1==null) {
					prevHigh1 = dataArrayList.get(i);
				}else if( prevHigh2==null &&  (!date.equals(prevHigh1.timeStamp.split("T")[0]) || (date.equals(prevHigh1.timeStamp.split("T")[0]) &&  Math.abs(prevHigh1.high - dataArrayList.get(i).high) > 2.1*strikeGap))) {
					prevHigh2 = dataArrayList.get(i);
				}else if(prevHigh2!=null && prevHigh3==null && ( !date.equals(prevHigh2.timeStamp.split("T")[0]) || ( date.equals(prevHigh2.timeStamp.split("T")[0])  &&  Math.abs(prevHigh2.high - dataArrayList.get(i).high) > 2.1*strikeGap)  )) {
					prevHigh3 = dataArrayList.get(i);
				}
				
				// System.out.println( roundLevel(dataArrayList.get(i).high, 50) +"       " + dataArrayList.get(i).timeStamp.toString());
				
			}
			
		}
		
		

		HistoricalData prevLow1=null,prevLow2=null,prevLow3=null;
		//support on down move
		for(int i =length-1; i>=0;i--) {
			
			boolean isLeft = false,isRight=false;
			double startPrice = dataArrayList.get(i).low;
			double endPrice = dataArrayList.get(i).high;
			
			for(int j=i;j<=length - 1 ; j++) {
				endPrice = dataArrayList.get(j).high;
				if(endPrice < startPrice ||  dataArrayList.get(j).low < startPrice ) {
					break;
				}else if( (endPrice - startPrice )/startPrice >= srFactor  ) {
					isRight = true;
					break;
				}				
			}
			
			if(!isRight) {
				continue;
			}
			
			for(int k=i-1;k>=0 ; k--) {
				endPrice = dataArrayList.get(k).high;
				if(endPrice < startPrice ||  dataArrayList.get(k).low < startPrice ) {
					break;
				}else if( (endPrice - startPrice)/startPrice >= srFactor  ) {
					isLeft = true;
					break;
				}					
			}
			

			if(isLeft && isRight) {
				//System.out.println( roundLevel(dataArrayList.get(i).low, 50) +"       " + dataArrayList.get(i).timeStamp.toString());
				
				String date = dataArrayList.get(i).timeStamp.split("T")[0];
				int level =  roundLevel(dataArrayList.get(i).low , strikeGap);
				
				if(!bankNiftySupport30Min.containsKey(level)) {
					bankNiftySupport30Min.put(level, date);
				}else if(bankNiftySupport30Min.containsKey(level) && !bankNiftySupport30Min.get(level).contains(date) ) {
					bankNiftySupport30Min.put(level, bankNiftySupport30Min.get(level)+"#"+date);
				}
				
				if(prevLow1==null) {
					prevLow1 = dataArrayList.get(i);
				}else if(prevLow2==null && ( !date.equals(prevLow1.timeStamp.split("T")[0]) ||  Math.abs(prevLow1.low - dataArrayList.get(i).low) > 2.1*strikeGap )) {
					prevLow2 = dataArrayList.get(i);
				}else if(prevLow2!=null && prevLow3==null &&  (!date.equals(prevLow2.timeStamp.split("T")[0]) || Math.abs(prevLow2.low - dataArrayList.get(i).low) > 2.1*strikeGap  )) {
					prevLow3 = dataArrayList.get(i);
				}
								
			}
			
		}
		
		
		
		int prevKey=-1;
		for (  Integer key : bankNiftyResistence30Min.keySet()) {
			if( prevKey != -1  && key-prevKey <=strikeGap+1 && bankNiftyResistence30Min.get(key).split("#").length==1 && bankNiftyResistence30Min.get(prevKey).split("#").length==1) {
				bankNiftyResistence30Min.put(key, bankNiftyResistence30Min.get(key)+"#"+bankNiftyResistence30Min.get(prevKey));
			}
			prevKey=key;
		}
		
		prevKey=-1;
		for (  Integer key : bankNiftySupport30Min.descendingKeySet()) {
			if( prevKey != -1  && prevKey-key <=strikeGap+1 && bankNiftySupport30Min.get(key).split("#").length==1 && bankNiftySupport30Min.get(prevKey).split("#").length==1) {
				bankNiftySupport30Min.put(key, bankNiftySupport30Min.get(key)+"#"+bankNiftySupport30Min.get(prevKey));
			}
			prevKey=key;
		}		
		
		
		
		double close = dataArrayList.get(length-1).close;
		
		
		String resistance="";
		for (  Integer key : bankNiftyResistence30Min.keySet()) {
			if(close < key && key < (close + 0.1*close ) && bankNiftyResistence30Min.get(key).split("#").length >=2 ) {
				boolean iskeyP50Possibe = bankNiftyResistence30Min.containsKey(key + strikeGap) && bankNiftyResistence30Min.get(key + strikeGap).split("#").length >=2;
				
				if(iskeyP50Possibe && ( Math.abs(bankNiftyResistence30Min.get(key + strikeGap).split("#").length  - bankNiftyResistence30Min.get(key).split("#").length) <=1 )) {
					continue;
				}else if(iskeyP50Possibe && bankNiftySupport30Min.containsKey(key+strikeGap) && bankNiftySupport30Min.containsKey(key) && bankNiftySupport30Min.get(key+strikeGap).split("#").length >=  bankNiftySupport30Min.get(key).split("#").length) {
					continue;
				}else if(iskeyP50Possibe && bankNiftySupport30Min.containsKey(key+strikeGap) && !bankNiftySupport30Min.containsKey(key)) {
					continue;
				}

				resistance = resistance+key+"#";
			}
		}		
		if(!resistance.contains("#"+roundLevel(high, strikeGap))) {
			resistance += roundLevel(high, strikeGap);
		}
		
		
		
		String support="";		
		for (  Integer key : bankNiftySupport30Min.descendingKeySet()) {
			if(close > key && key > (close - 0.1*close ) && bankNiftySupport30Min.get(key).split("#").length >=2 ) {
				boolean iskeyM50Possibe = bankNiftySupport30Min.containsKey(key - strikeGap) && bankNiftySupport30Min.get(key - strikeGap).split("#").length >=2;
				
				if(iskeyM50Possibe && ( Math.abs(bankNiftySupport30Min.get(key - strikeGap).split("#").length  - bankNiftySupport30Min.get(key).split("#").length)>= 2)) {
					continue;
				}else if(iskeyM50Possibe && bankNiftyResistence30Min.containsKey(key - strikeGap) && bankNiftyResistence30Min.containsKey(key) && bankNiftyResistence30Min.get(key-strikeGap).split("#").length >=  bankNiftyResistence30Min.get(key).split("#").length) {
					continue;
				}else if(iskeyM50Possibe && bankNiftyResistence30Min.containsKey(key - strikeGap) && !bankNiftyResistence30Min.containsKey(key)) {
					continue;
				}

				support = support+key+"#";
			}
		}	
		if(!support.contains("#"+roundLevel(low, strikeGap))) {
			support += roundLevel(low, strikeGap);
		}
		
		
		
		BANKNIFTY_PREV_HIGH_1_30MIN = roundLevel(prevHigh1.high, strikeGap);
		BANKNIFTY_PREV_HIGH_2_30MIN = roundLevel(prevHigh2.high, strikeGap);		
		BANKNIFTY_PREV_HIGH_3_30MIN = roundLevel(prevHigh3.high, strikeGap);	
		BANKNIFTY_PREV_LOW_1_30MIN = roundLevel(prevLow1.low, strikeGap);
		BANKNIFTY_PREV_LOW_2_30MIN = roundLevel(prevLow2.low, strikeGap);
		BANKNIFTY_PREV_LOW_3_30MIN = roundLevel(prevLow3.low, strikeGap);
		BANKNIFTY_SUPPORT_30MIN = support;
		BANKNIFTY_RESISTENT_30MIN =resistance;
		
		
		algoProps.setProperty("BANKNIFTY_PREV_HIGH_1_30MIN", Integer.toString(BANKNIFTY_PREV_HIGH_1_30MIN));
		algoProps.setProperty("BANKNIFTY_PREV_HIGH_2_30MIN", Integer.toString(BANKNIFTY_PREV_HIGH_2_30MIN));
		algoProps.setProperty("BANKNIFTY_PREV_HIGH_3_30MIN", Integer.toString(BANKNIFTY_PREV_HIGH_3_30MIN));
		algoProps.setProperty("BANKNIFTY_PREV_LOW_1_30MIN", Integer.toString(BANKNIFTY_PREV_LOW_1_30MIN));
		algoProps.setProperty("BANKNIFTY_PREV_LOW_2_30MIN", Integer.toString(BANKNIFTY_PREV_LOW_2_30MIN));
		algoProps.setProperty("BANKNIFTY_PREV_LOW_3_30MIN", Integer.toString(BANKNIFTY_PREV_LOW_3_30MIN));
		algoProps.setProperty("BANKNIFTY_SUPPORT_30MIN", BANKNIFTY_SUPPORT_30MIN);
		algoProps.setProperty("BANKNIFTY_RESISTENT_30MIN", BANKNIFTY_RESISTENT_30MIN);
		
		
				
		saveAlgoProps();		
		
		
	}
	
	
	public void getPrevDayDataBankNifty() throws JSONException, IOException, KiteException {
		Calendar cal = Calendar.getInstance();
		cal.add(Calendar.DAY_OF_MONTH, -1);   	
		Date dayTo = cal.getTime();
		
		cal.add(Calendar.DAY_OF_MONTH, -60);
		Date dayFrom = cal.getTime();
		

		HistoricalData bankniftyHistoricalData = kiteConnect.getHistoricalData(dayFrom, dayTo, Long.toString(bankNiftyInstrument.instrument_token), "day", false);
		HistoricalData prevDayData = bankniftyHistoricalData.dataArrayList.get(bankniftyHistoricalData.dataArrayList.size() - 1);

		BANKNIFTY_PREV_DAY_HIGH = (int)prevDayData.high; 
		BANKNIFTY_PREV_DAY_LOW =  (int)prevDayData.low; 
		BANKNIFTY_PREV_DAY_CLOSE = (int)prevDayData.close; 
		BANKNIFTY_PREV_DAY_OPEN = (int)prevDayData.open; 
		
			
		int secondHalfLow=0, secondHalfHigh=0,secondHalfOpen=0;	
		HistoricalData historicalData30Min = kiteConnect.getHistoricalData(dayFrom, dayTo, Long.toString(bankNiftyInstrument.instrument_token), "30minute", false);
		for(int i=1 ; i<= 10 ;i++) {
			HistoricalData data = historicalData30Min.dataArrayList.get(historicalData30Min.dataArrayList.size() - i);
			if(i==10) {
				secondHalfOpen = (int)data.open;
			}
			secondHalfHigh = secondHalfHigh==0? (int)data.high : Math.max(secondHalfHigh,(int)data.high);
			secondHalfLow = secondHalfLow==0? (int)data.low : Math.min(secondHalfLow,(int)data.low);			
		}		
		
		boolean isRedCandle = prevDayData.open > prevDayData.close;
		double closeRange =Math.abs( (1.0*BANKNIFTY_PREV_DAY_CLOSE- BANKNIFTY_PREV_DAY_LOW)/(1.0*BANKNIFTY_PREV_DAY_HIGH - BANKNIFTY_PREV_DAY_LOW) );
		BANKNIFTY_PREV_DAY_TREND = TREND.SIDEWAYS;  // IF RANGE BOUND CHANGE TO NOTRADE 
		if(closeRange > 0.7 && !isRedCandle) BANKNIFTY_PREV_DAY_TREND = TREND.UP;  		//NEAR DAY HIGH
		else if(closeRange <0.3 && isRedCandle) BANKNIFTY_PREV_DAY_TREND = TREND.DOWN; 	//NEAR DAY LOW
		
		double closeRangeSecnondHalf =Math.abs((1.0*BANKNIFTY_PREV_DAY_CLOSE- secondHalfLow)/ (1.0*secondHalfHigh - secondHalfLow) );
		boolean isRedCandleSecnondHalf = secondHalfOpen > BANKNIFTY_PREV_DAY_CLOSE;
		
		if(closeRangeSecnondHalf > 0.8 && !isRedCandleSecnondHalf && BANKNIFTY_PREV_DAY_TREND == TREND.DOWN) BANKNIFTY_PREV_DAY_TREND = TREND.SIDEWAYS;  // second half green
		if(closeRangeSecnondHalf < 0.2 && isRedCandleSecnondHalf && BANKNIFTY_PREV_DAY_TREND == TREND.UP) BANKNIFTY_PREV_DAY_TREND = TREND.SIDEWAYS;  // second half red

		

		algoProps.setProperty("BANKNIFTY_PREV_DAY_HIGH", Integer.toString(BANKNIFTY_PREV_DAY_HIGH));
		algoProps.setProperty("BANKNIFTY_PREV_DAY_LOW", Integer.toString(BANKNIFTY_PREV_DAY_LOW));
		algoProps.setProperty("BANKNIFTY_PREV_DAY_CLOSE", Integer.toString(BANKNIFTY_PREV_DAY_CLOSE));
		algoProps.setProperty("BANKNIFTY_PREV_DAY_OPEN", Integer.toString(BANKNIFTY_PREV_DAY_OPEN));
		algoProps.setProperty("BANKNIFTY_PREV_DAY_TREND", BANKNIFTY_PREV_DAY_TREND.toString());
		saveAlgoProps();		
	}
	
	
	public void getPrevDayDataNifty50() throws JSONException, IOException, KiteException {
		
		
		Calendar cal = Calendar.getInstance();
		cal.add(Calendar.DAY_OF_MONTH, -1);   	
		Date dayTo = cal.getTime();
		
		cal.add(Calendar.DAY_OF_MONTH, -60);
		Date dayFrom = cal.getTime();
		
		HistoricalData nifty50HistoricalData = kiteConnect.getHistoricalData(dayFrom, dayTo, Long.toString(nifty50Instrument.instrument_token), "day", false);
		HistoricalData prevDayData = nifty50HistoricalData.dataArrayList.get(nifty50HistoricalData.dataArrayList.size() - 1);
		
		NIFTY50_PREV_DAY_HIGH = (int)prevDayData.high; 
		NIFTY50_PREV_DAY_LOW =  (int)prevDayData.low; 
		NIFTY50_PREV_DAY_CLOSE = (int)prevDayData.close; 
		NIFTY50_PREV_DAY_OPEN = (int)prevDayData.open; 
		
		
		
		int secondHalfLow=0, secondHalfHigh=0,secondHalfOpen=0;	
		HistoricalData historicalData30Min = kiteConnect.getHistoricalData(dayFrom, dayTo, Long.toString(nifty50Instrument.instrument_token), "30minute", false);
		for(int i=1 ; i<= 10 ;i++) {
			HistoricalData data = historicalData30Min.dataArrayList.get(historicalData30Min.dataArrayList.size() - i);
			if(i==10) {
				secondHalfOpen = (int)data.open;
			}
			secondHalfHigh = secondHalfHigh==0? (int)data.high : Math.max(secondHalfHigh,(int)data.high);
			secondHalfLow = secondHalfLow==0? (int)data.low : Math.min(secondHalfLow,(int)data.low);			
		}		
		
		
		boolean isRedCandle = prevDayData.open > prevDayData.close;
		double closeRange =Math.abs( (1.0*NIFTY50_PREV_DAY_CLOSE- NIFTY50_PREV_DAY_LOW)/(1.0*NIFTY50_PREV_DAY_HIGH - NIFTY50_PREV_DAY_LOW) );
		NIFTY50_PREV_DAY_TREND = TREND.SIDEWAYS;
		if(closeRange > 0.75 && !isRedCandle) NIFTY50_PREV_DAY_TREND = TREND.UP;  		//NEAR DAY HIGH
		else if(closeRange <0.25 && isRedCandle) NIFTY50_PREV_DAY_TREND = TREND.DOWN; 	//NEAR DAY LOW
		
		double closeRangeSecnondHalf =Math.abs((1.0*NIFTY50_PREV_DAY_CLOSE- secondHalfLow)/ (1.0*secondHalfHigh - secondHalfLow) );
		boolean isRedCandleSecnondHalf = secondHalfOpen > NIFTY50_PREV_DAY_CLOSE;
		
		if(closeRangeSecnondHalf > 0.8 && !isRedCandleSecnondHalf && NIFTY50_PREV_DAY_TREND == TREND.DOWN) NIFTY50_PREV_DAY_TREND = TREND.SIDEWAYS;  // second half green
		if(closeRangeSecnondHalf < 0.2 && isRedCandleSecnondHalf && NIFTY50_PREV_DAY_TREND == TREND.UP) NIFTY50_PREV_DAY_TREND = TREND.SIDEWAYS;  // second half red


		algoProps.setProperty("NIFTY50_PREV_DAY_HIGH", Integer.toString(NIFTY50_PREV_DAY_HIGH));
		algoProps.setProperty("NIFTY50_PREV_DAY_LOW", Integer.toString(NIFTY50_PREV_DAY_LOW));
		algoProps.setProperty("NIFTY50_PREV_DAY_CLOSE", Integer.toString(NIFTY50_PREV_DAY_CLOSE));
		algoProps.setProperty("NIFTY50_PREV_DAY_OPEN", Integer.toString(NIFTY50_PREV_DAY_OPEN));
		algoProps.setProperty("NIFTY50_PREV_DAY_TREND", NIFTY50_PREV_DAY_TREND.toString());						
		
		saveAlgoProps();
		
	}
	
	
	

	
    
	public void saveAlgoProps() {
		try {			
			
			algoProps.setProperty("NIFTY50_TOTAL_TRADE", Integer.toString(NIFTY50_TOTAL_TRADE));
			algoProps.setProperty("BANKNIFTY_TOTAL_TRADE", Integer.toString(BANKNIFTY_TOTAL_TRADE));
			
			FileOutputStream out = new FileOutputStream(algoPropsFile);
			algoProps.store(out,null);
			out.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			 logger.info(e.toString());	
		}
	}
	
	
	
    
	  public void onBankNiftyNewTick(Tick tk){  
		  int ltp = (int)tk.getLastTradedPrice();
		  bankNiftyStats.addValue(ltp);
		  int mean = (int)bankNiftyStats.getMean();		  
		  
	  }
	  
	  
	  public void onNifty50NewTick(Tick tk){		  
		  int ltp = (int)tk.getLastTradedPrice();
		  nifty50Stats.addValue(ltp);
		  int mean = (int)nifty50Stats.getMean();		  
		  
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
    
    
    
    public void addAlertToKite() {
    	kiteAlerts kiteAlerts = new kiteAlerts();
    	kiteAlerts.deleteAlert("tf-");
    	
    	String support[] = algoProps.getProperty("NIFTY50_SUPPORT_30MIN").split("#");
    	
    	for ( int i=0;i<5 && i <support.length ; i++) {
    		String alertPice = (Integer.parseInt(support[i])+45)+"";
    		String name = "tf-NIFTY(30M) S"+(i+1)+"  <= ["+alertPice +" , "+support[i]+"]";
    		kiteAlerts.createAlert(name, "INDICES", "NIFTY 50", "LastTradedPrice", "<=", "constant", alertPice);		
    	}
    	support = algoProps.getProperty("BANKNIFTY_SUPPORT_30MIN").split("#");
    	for ( int i=0;i<5 && i <support.length ; i++) {
    		String alertPice = (Integer.parseInt(support[i])+100)+"";
    		String name = "tf-BANK(30M) S"+(i+1)+"  <= ["+alertPice +" , "+support[i]+"]"; 
    		kiteAlerts.createAlert(name, "INDICES", "NIFTY BANK", "LastTradedPrice", "<=", "constant", alertPice);    		
    	}
    	support = algoProps.getProperty("NIFTY50_SUPPORT_DAILY").split("#");
    	for ( int i=0;i<5 && i <support.length ; i++) {
    		String alertPice = (Integer.parseInt(support[i])+45)+"";
    		String name = "tf-NIFTY(D) S"+(i+1)+"  <= ["+alertPice +" , "+support[i]+"]";
    		kiteAlerts.createAlert(name, "INDICES", "NIFTY 50", "LastTradedPrice", "<=", "constant", alertPice);    		    		    		
    	}
    	support = algoProps.getProperty("BANKNIFTY_SUPPORT_DAILY").split("#");
    	for ( int i=0;i<5 && i <support.length ; i++) {
    		String alertPice = (Integer.parseInt(support[i])+100)+"";
    		String name = "tf-BANK(D) S"+(i+1)+"  <= ["+alertPice +" , "+support[i]+"]";
    		kiteAlerts.createAlert(name, "INDICES", "NIFTY BANK", "LastTradedPrice", "<=", "constant", alertPice);    		    		    		
    	}
    	

    	
    	
    	
    	String resistence[] = algoProps.getProperty("NIFTY50_RESISTENT_30MIN").split("#");    	
    	for ( int i=0;i<5 && i <resistence.length ; i++) {
    		String alertPice = (Integer.parseInt(resistence[i])- 45)+"";
    		String name = "tf-NIFTY(30M) R"+(i+1)+"  >= ["+alertPice +" , "+resistence[i]+"]";
    		kiteAlerts.createAlert(name, "INDICES", "NIFTY 50", "LastTradedPrice", ">=", "constant", alertPice);		
    	}
    	resistence = algoProps.getProperty("BANKNIFTY_RESISTENT_30MIN").split("#");    	
    	for ( int i=0;i<5 && i <resistence.length ; i++) {
    		String alertPice = (Integer.parseInt(resistence[i])- 45)+"";
    		String name = "tf-BANK(30M) R"+(i+1)+"  >= ["+alertPice +" , "+resistence[i]+"]";
    		kiteAlerts.createAlert(name, "INDICES", "NIFTY BANK", "LastTradedPrice", ">=", "constant", alertPice);		
    	} 	
    	resistence = algoProps.getProperty("NIFTY50_RESISTENT_DAILY").split("#");
    	for ( int i=0;i<5 && i <resistence.length ; i++) {
    		String alertPice = (Integer.parseInt(resistence[i])- 45)+"";
    		String name = "tf-NIFTY(D) R"+(i+1)+"  >= ["+alertPice +" , "+resistence[i]+"]";
    		kiteAlerts.createAlert(name, "INDICES", "NIFTY 50", "LastTradedPrice", ">=", "constant", alertPice);		
    	}
    	resistence = algoProps.getProperty("BANKNIFTY_RESISTENT_DAILY").split("#");    	
    	for ( int i=0;i<5 && i <resistence.length ; i++) {
    		String alertPice = (Integer.parseInt(resistence[i])- 45)+"";
    		String name = "tf-BANK(D) R"+(i+1)+"  >= ["+alertPice +" , "+resistence[i]+"]";
    		kiteAlerts.createAlert(name, "INDICES", "NIFTY BANK", "LastTradedPrice", ">=", "constant", alertPice);		
    	}
    	

    	for (int i=1;i<=3;i++) {
    		kiteAlerts.createAlert("tf-NIFTY(30M) SH >= "+algoProps.getProperty(String.format("NIFTY50_PREV_HIGH_%s_30MIN", i)), "INDICES", "NIFTY 50", "LastTradedPrice", ">=", "constant",  algoProps.getProperty(String.format("NIFTY50_PREV_HIGH_%s_30MIN", i)));		
    		kiteAlerts.createAlert("tf-NIFTY(30M) SH <= "+algoProps.getProperty(String.format("NIFTY50_PREV_HIGH_%s_30MIN", i)), "INDICES", "NIFTY 50", "LastTradedPrice", "<=", "constant",  algoProps.getProperty(String.format("NIFTY50_PREV_HIGH_%s_30MIN", i)));
    		
    		kiteAlerts.createAlert("tf-NIFTY(D) SL >= "+algoProps.getProperty(String.format("NIFTY50_PREV_LOW_%s_DAILY", i)), "INDICES", "NIFTY 50", "LastTradedPrice", ">=", "constant",  algoProps.getProperty(String.format("NIFTY50_PREV_LOW_%s_DAILY", i)));		
    		kiteAlerts.createAlert("tf-NIFTY(D) SL <= "+algoProps.getProperty(String.format("NIFTY50_PREV_LOW_%s_DAILY", i)), "INDICES", "NIFTY 50", "LastTradedPrice", "<=", "constant",  algoProps.getProperty(String.format("NIFTY50_PREV_LOW_%s_DAILY", i)));    
    		
    		
    		kiteAlerts.createAlert("tf-BANK(30M) SH >= "+algoProps.getProperty(String.format("BANKNIFTY_PREV_HIGH_%s_30MIN", i)), "INDICES", "NIFTY BANK", "LastTradedPrice", ">=", "constant",  algoProps.getProperty(String.format("BANKNIFTY_PREV_HIGH_%s_30MIN", i)));		
    		kiteAlerts.createAlert("tf-BANK(30M) SH <= "+algoProps.getProperty(String.format("BANKNIFTY_PREV_HIGH_%s_30MIN", i)), "INDICES", "NIFTY BANK", "LastTradedPrice", "<=", "constant",  algoProps.getProperty(String.format("BANKNIFTY_PREV_HIGH_%s_30MIN", i)));
    		
    		kiteAlerts.createAlert("tf-BANK(D) SL >= "+algoProps.getProperty(String.format("BANKNIFTY_PREV_LOW_%s_DAILY", i)), "INDICES", "NIFTY BANK", "LastTradedPrice", ">=", "constant",  algoProps.getProperty(String.format("BANKNIFTY_PREV_LOW_%s_DAILY", i)));		
    		kiteAlerts.createAlert("tf-BANK(D) SL <= "+algoProps.getProperty(String.format("BANKNIFTY_PREV_LOW_%s_DAILY", i)), "INDICES", "NIFTY BANK", "LastTradedPrice", "<=", "constant",  algoProps.getProperty(String.format("BANKNIFTY_PREV_LOW_%s_DAILY", i)));    
    		    		   		
    	}

		
		kiteAlerts.createAlert("tf-NIFTY YH >= "+algoProps.getProperty("NIFTY50_PREV_DAY_HIGH"), "INDICES", "NIFTY 50", "LastTradedPrice", ">=", "constant",  algoProps.getProperty("NIFTY50_PREV_DAY_HIGH"));
		kiteAlerts.createAlert("tf-NIFTY YH <= "+algoProps.getProperty("NIFTY50_PREV_DAY_HIGH"), "INDICES", "NIFTY 50", "LastTradedPrice", "<=", "constant",  algoProps.getProperty("NIFTY50_PREV_DAY_HIGH"));

		kiteAlerts.createAlert("tf-BANK YH >= "+algoProps.getProperty("BANKNIFTY_PREV_DAY_HIGH"), "INDICES", "NIFTY BANK", "LastTradedPrice", ">=", "constant",  algoProps.getProperty("BANKNIFTY_PREV_DAY_HIGH"));
		kiteAlerts.createAlert("tf-BANK YH <= "+algoProps.getProperty("BANKNIFTY_PREV_DAY_HIGH"), "INDICES", "NIFTY BANK", "LastTradedPrice", "<=", "constant",  algoProps.getProperty("BANKNIFTY_PREV_DAY_HIGH"));

		
		kiteAlerts.createAlert("tf-NIFTY YL >= "+algoProps.getProperty("NIFTY50_PREV_DAY_LOW"), "INDICES", "NIFTY 50", "LastTradedPrice", ">=", "constant",  algoProps.getProperty("NIFTY50_PREV_DAY_LOW"));
		kiteAlerts.createAlert("tf-NIFTY YL <= "+algoProps.getProperty("NIFTY50_PREV_DAY_LOW"), "INDICES", "NIFTY 50", "LastTradedPrice", "<=", "constant",  algoProps.getProperty("NIFTY50_PREV_DAY_LOW"));

		kiteAlerts.createAlert("tf-BANK YL >= "+algoProps.getProperty("BANKNIFTY_PREV_DAY_LOW"), "INDICES", "NIFTY BANK", "LastTradedPrice", ">=", "constant",  algoProps.getProperty("BANKNIFTY_PREV_DAY_LOW"));
		kiteAlerts.createAlert("tf-BANK YL <= "+algoProps.getProperty("BANKNIFTY_PREV_DAY_LOW"), "INDICES", "NIFTY BANK", "LastTradedPrice", "<=", "constant",  algoProps.getProperty("BANKNIFTY_PREV_DAY_LOW"));
		
		kiteAlerts.createAlert("tf-NIFTY YC >= "+algoProps.getProperty("NIFTY50_PREV_DAY_CLOSE"), "INDICES", "NIFTY 50", "LastTradedPrice", ">=", "constant",  algoProps.getProperty("NIFTY50_PREV_DAY_CLOSE"));
		kiteAlerts.createAlert("tf-NIFTY YC <= "+algoProps.getProperty("NIFTY50_PREV_DAY_CLOSE"), "INDICES", "NIFTY 50", "LastTradedPrice", "<=", "constant",  algoProps.getProperty("NIFTY50_PREV_DAY_CLOSE"));
		
		kiteAlerts.createAlert("tf-BANK YC >= "+algoProps.getProperty("BANKNIFTY_PREV_DAY_CLOSE"), "INDICES", "NIFTY BANK", "LastTradedPrice", ">=", "constant",  algoProps.getProperty("BANKNIFTY_PREV_DAY_CLOSE"));
		kiteAlerts.createAlert("tf-BANK YC <= "+algoProps.getProperty("BANKNIFTY_PREV_DAY_CLOSE"), "INDICES", "NIFTY BANK", "LastTradedPrice", "<=", "constant",  algoProps.getProperty("BANKNIFTY_PREV_DAY_CLOSE"));

		kiteAlerts.createAlert("tf-NIFTY YOPEN >= "+algoProps.getProperty("NIFTY50_PREV_DAY_OPEN"), "INDICES", "NIFTY 50", "LastTradedPrice", ">=", "constant",  algoProps.getProperty("NIFTY50_PREV_DAY_OPEN"));
		kiteAlerts.createAlert("tf-NIFTY YOPEN <= "+algoProps.getProperty("NIFTY50_PREV_DAY_OPEN"), "INDICES", "NIFTY 50", "LastTradedPrice", "<=", "constant",  algoProps.getProperty("NIFTY50_PREV_DAY_OPEN"));
		
		kiteAlerts.createAlert("tf-BANK YOPEN >= "+algoProps.getProperty("BANKNIFTY_PREV_DAY_OPEN"), "INDICES", "NIFTY BANK", "LastTradedPrice", ">=", "constant",  algoProps.getProperty("BANKNIFTY_PREV_DAY_OPEN"));
		kiteAlerts.createAlert("tf-BANK YOPEN <= "+algoProps.getProperty("BANKNIFTY_PREV_DAY_OPEN"), "INDICES", "NIFTY BANK", "LastTradedPrice", "<=", "constant",  algoProps.getProperty("BANKNIFTY_PREV_DAY_OPEN"));
		
		
    }
    
    
    
    public static void main(String[] args){
    			
    	System.setProperty("java.util.logging.SimpleFormatter.format","%1$tF %1$tT %5$s%6$s%n");    	
		Properties prop = new Properties();
		InputStream input = null;

		try {
			input = new FileInputStream("../StockInfo/config.properties");
			prop.load(input);
			String autZerodha = prop.getProperty("zerodha-key");					
			TrendFollowing instance = new TrendFollowing(autZerodha);
						
        	ArrayList<Long> tokens = instance.getTokens();     
        	
        	    		
        	
	
    	instance.getPrevDayDataNifty50();
    	instance.getPrevDayDataBankNifty();   	
       	instance.calculateSupportResistanceNifty5030Min(instance.nifty50Instrument.instrument_token,"30minute",0.0075,50);
        instance.calculateSupportResistanceBankNifty30Min(instance.bankNiftyInstrument.instrument_token,"30minute",0.008,100);        	
        instance.calculateSupportResistanceNifty50Daily(instance.nifty50Instrument.instrument_token,"day",0.0165,50);
        instance.calculateSupportResistanceBankNiftyDaily(instance.bankNiftyInstrument.instrument_token,"day",0.0165,100);        
        instance.startFeed( tokens);
 
        instance.addAlertToKite();
        							
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




enum TREND
{
    UP, DOWN, SIDEWAYS, NOTRADE;
}