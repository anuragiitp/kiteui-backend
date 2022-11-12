import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class FetchChangeDataFromTV {

		private static String cookieTradingview;
		
		private static String cookieChartlink;
		private static String csrfChartlink;
		
		private static Set<String> watchSet;
		
		
		private static String  bullishMomentumStocks ="scan_clause=(+%7Bcash%7D+(+latest+close+%3E+50+and+latest+volume+%3E+latest+sma(+volume%2C20+)+and+latest+sma(+close%2C20+)+%3E+latest+sma(+close%2C50+)+and+latest+rsi(+14+)+%3E+50+and+latest+close+%3E+latest+sma(+close%2C+50+)+and+latest+close+%3E+1+day+ago+high+and+latest+sma(+volume%2C20+)+%3E+500000+)+)+";
		private static String rangeBreakoutWithVolume ="scan_clause=(+%7Bcash%7D+(+abs(+latest+high+-+latest+low+)+%3E+abs(+1+day+ago+high+-+1+day+ago+low+)+and+abs(+latest+high+-+latest+low+)+%3E+abs(+2+days+ago+high+-+2+days+ago+low+)+and+abs(+latest+high+-+latest+low+)+%3E+abs(+3+days+ago+high+-+3+days+ago+low+)+and+abs(+latest+high+-+latest+low+)+%3E+abs(+4+days+ago+high+-+4+days+ago+low+)+and+latest+close+%3E+latest+open+and+latest+close+%3E+weekly+open+and+latest+close+%3E+monthly+open+and+latest+volume+*+latest+close+%3E%3D+10000000+and+latest+low+%3E+1+day+ago+close+-+abs(+1+day+ago+close+%2F+222+)+)+)+";
		
				
		private static String  min15Changes = "{\"filter\":[{\"left\":\"market_cap_basic\",\"operation\":\"nempty\"},{\"left\":\"type\",\"operation\":\"in_range\",\"right\":[\"stock\",\"dr\",\"fund\"]},{\"left\":\"subtype\",\"operation\":\"in_range\",\"right\":[\"common\",\"\",\"fund\"]},{\"left\":\"exchange\",\"operation\":\"equal\",\"right\":\"NSE\"},{\"left\":\"market_cap_basic\",\"operation\":\"egreater\",\"right\":300000000},{\"left\":\"change|15\",\"operation\":\"not_in_range\",\"right\":[-1.4,1.4]}],\"options\":{\"lang\":\"en\"},\"symbols\":{\"query\":{\"types\":[]},\"tickers\":[]},\"columns\":[\"logoid\",\"name\",\"close\",\"change\"],\"sort\":{\"sortBy\":\"market_cap_basic\",\"sortOrder\":\"desc\"},\"range\":[0,150]}";
	
		private static String new52WHigh = "{\"filter\":[{\"left\":\"market_cap_basic\",\"operation\":\"nempty\"},{\"left\":\"type\",\"operation\":\"in_range\",\"right\":[\"stock\",\"dr\",\"fund\"]},{\"left\":\"subtype\",\"operation\":\"in_range\",\"right\":[\"common\",\"foreign-issuer\",\"\",\"fund\"]},{\"left\":\"exchange\",\"operation\":\"equal\",\"right\":\"NSE\"},{\"left\":\"price_52_week_high\",\"operation\":\"eless\",\"right\":\"high\"}],\"options\":{\"active_symbols_only\":true,\"lang\":\"en\"},\"symbols\":{\"query\":{\"types\":[]},\"tickers\":[]},\"columns\":[\"logoid\",\"name\",\"close\",\"change\",\"Perf.W\",\"Perf.1M\",\"Perf.3M\",\"Perf.6M\",\"Perf.YTD\",\"Perf.Y\",\"price_52_week_low\",\"price_52_week_high\",\"High.All\",\"Recommend.All\",\"volume\",\"average_volume_10d_calc\",\"price_earnings_ttm\",\"sector\",\"market_cap_basic\",\"description\",\"type\",\"subtype\",\"update_mode\",\"pricescale\",\"minmov\",\"fractional\",\"minmove2\"],\"sort\":{\"sortBy\":\"market_cap_basic\",\"sortOrder\":\"desc\"},\"range\":[0,150]}";

		
		//https://chartink.com/csrf-token/refresh
				
		
		public static void main(String args[]) {
			
			Properties prop = new Properties();
			InputStream input = null;
			
			try {
				input = new FileInputStream("config.properties");
				prop.load(input);
				cookieTradingview = prop.getProperty("tradingview_session");													
				cookieChartlink= prop.getProperty("chartlink_session");	
				csrfChartlink= prop.getProperty("chartlink_csrf");	
				
				
				watchSet = getWatchSet();
				
				dumpFilterdata();
				
				Thread timer = new Thread(new Runnable() {
					
					@Override
					public void run() {
						
						while(true) {													
							try {
								Thread.sleep(1000*30);
							} catch (InterruptedException e) {
								// TODO Auto-generated catch block
								e.printStackTrace();
							}
							dumpFilterdata();							
						}
					}
				});
				
				timer.setDaemon(false);
				timer.start();
				
			} catch (IOException ex) {
				ex.printStackTrace();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} finally {
				if (input != null) {
					try {
						input.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
				}
			}
		}
		
		
		
		public static  Set<String> getWatchSet(){
			Set<String> watchSet = new HashSet<String>();
			JSONParser jsonParser = new JSONParser();
									
			
	        try (FileReader reader = new FileReader("./kiteSubcribedSymbols.json"))
	        {
	            //Read JSON file
	            Object obj = jsonParser.parse(reader);
	 
	            JSONObject jObj = (JSONObject) obj;		
	            
	            JSONArray jarray = (JSONArray)jObj.get("SYMBOLS");
	            
	            
	            
	            for(int i=0;i<jarray.size();i++) {
	            	watchSet.add((String)jarray.get(i));
	            }
	            	            
	        }catch(Exception e){
	        	e.printStackTrace();
	        }
			
	        return watchSet;
		}

		
		
		
		public static JSONObject processTVDataRequest(String fileName,String payload) {
			try {
				sendPost(cookieTradingview,null,fileName+".json","https://scanner.tradingview.com/india/scan",payload);
				compress(fileName+".json", fileName+".json.gz");
			} catch (Exception e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			
			
			JSONObject outputJson = new JSONObject();
			JSONParser jsonParser = new JSONParser();
	        try (FileReader reader = new FileReader(fileName+".json"))
	        {
	            //Read JSON file
	            Object obj = jsonParser.parse(reader);
	 
	            JSONObject jObj = (JSONObject) obj;		          
	            
	            JSONArray data = (JSONArray)jObj.get("data");
	            
	            for(int i=0;i<data.size();i++) {
	            	
	            	JSONObject jo1 = (JSONObject)data.get(i);
	            	
	            	String symbol = ((String)jo1.get("s")).split(":")[1];
	            	
	            	if(watchSet.contains(symbol+"-BE")) {
	            		symbol=symbol+"-BE";
	            	}
	            	
	            	
	            	if(watchSet!=null && watchSet.contains(symbol)) {
	            		
		            	JSONArray dataD = (JSONArray)jo1.get("d");
		            	
		            	JSONObject out1 = new JSONObject();
		            		            		            	
		            	outputJson.put(symbol, out1);	            		
	            	}
	            }	            
	        }catch(Exception e) {
	        	e.printStackTrace();
	        }
	        
	        return outputJson;
	        
		}

		
		
		
		public static JSONObject processChartlinkDataRequest(String fileName,String payload) {
			try {
				sendPost(cookieChartlink,csrfChartlink,fileName+".json","https://chartink.com/screener/process",payload);
				compress(fileName+".json", fileName+".json.gz");
			} catch (Exception e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}			
			
			JSONParser jsonParser = new JSONParser();
	        JSONObject outputJson = new JSONObject();
	        try (FileReader reader = new FileReader(fileName+".json"))
	        {
	            //Read JSON file
	            Object obj = jsonParser.parse(reader);
	 
	            JSONObject jObj = (JSONObject) obj;		          
	            
	            JSONArray data = (JSONArray)jObj.get("data");
	            
	            for(int i=0;i<data.size();i++) {
	            	
	            	JSONObject jo1 = (JSONObject)data.get(i);
	            	
	            	String symbol ="";
	            	if(jo1.containsKey("nsecode")) {
	            		symbol=(String)jo1.get("nsecode");
	            	}else if(jo1.containsKey("bsecode")) {
	            		symbol=(String)jo1.get("bsecode");
	            	}
	            				            	
	            	if(watchSet.contains(symbol+"-BE")) {
	            		symbol=symbol+"-BE";
	            	}
	            	
	            	
	            	if(watchSet!=null && watchSet.contains(symbol)) {
	            		
		            	JSONObject out1 = new JSONObject();
		            		            		            	
		            	outputJson.put(symbol, out1);	            		
	            	}
	            }	            
	        }catch(Exception e) {
	        	e.printStackTrace();
	        }				
			
	        return outputJson;
			
		}

		
		public static void dumpFilterdata() {
						
			JSONObject outputJson =processTVDataRequest("TVPecChangeFilter", min15Changes);			
			

			JSONObject bullishMomentumOutputJson =processChartlinkDataRequest("bullishMomentumStocks", bullishMomentumStocks);
			
			
			JSONObject new52WHighOutputJson = processTVDataRequest("new52WHigh", new52WHigh);
			
			
			JSONObject rangeBreakoutWithVolumeOutputJson =processChartlinkDataRequest("rangeBreakoutWithVolumeStocks", rangeBreakoutWithVolume);
			
    
			
	        //add to final list	        
			JSONParser jsonParser = new JSONParser();
	        try (FileReader reader = new FileReader("./customWatchList.json"))
	        {
	            //Read JSON file
	            Object obj = jsonParser.parse(reader);
	 
	            JSONObject jObj = (JSONObject) obj;		          
	            
	            JSONObject printObj = new JSONObject();
	            
	            	            	           
	            printObj.put("15Min Change", outputJson);
	            printObj.put("New 52W High", new52WHighOutputJson);
	            printObj.put("Bullish Mometum", bullishMomentumOutputJson);
	            printObj.put("Range BO with Vol", rangeBreakoutWithVolumeOutputJson);

	            	           	            
	            for(Object key : jObj.keySet()) {	            	
	            	printObj.putIfAbsent(key, jObj.get(key));	
	            }
	            
	            
	            
			    FileWriter writer = new FileWriter("customWatchList.json");	 		    
			    writer.append(printObj.toJSONString());
			    writer.flush();
			    writer.close();	
			    
			    compress("customWatchList.json", "customWatchList.json.gz");
	            
	        }catch(Exception e) {
	        	e.printStackTrace();
	        }   
			
		}
		
		
		
		public static final String USER_AGENT = "Mozilla/5.0";

		// HTTP GET request
		public static ArrayList<String> sendPost(String cookie,String csrf,String fileName,String url,String postData) throws Exception {
			
			DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm:ss");  
			LocalDateTime now = LocalDateTime.now();  
			   
			System.out.println(dtf.format(now) +"   POST -- "+url);
			URL obj = new URL(url);
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();

			// optional default is GET
			con.setRequestMethod("POST");

			// add request header
			con.setRequestProperty("User-Agent", USER_AGENT);

			if(cookie!=null){
				con.setRequestProperty("Cookie", cookie);
			}
			if(csrf!=null){
				con.setRequestProperty("x-csrf-token",csrf);		
			}
			
			con.setConnectTimeout(5000);
			
			byte[] postDataBytes = postData.toString().getBytes("UTF-8");
			con.setDoOutput(true);
			con.setRequestProperty("Content-Length", String.valueOf(postDataBytes.length));
			con.getOutputStream().write(postDataBytes);
			
			int responseCode = con.getResponseCode();
			ArrayList<String> rows = new ArrayList<String>();
			if (responseCode == 200) {
				InputStream initialStream = con.getInputStream();
				File targetFile = new File(fileName);
			    OutputStream outStream = new FileOutputStream(targetFile);
			 
			    byte[] buffer = new byte[8 * 1024];
			    int bytesRead;
			    while ((bytesRead = initialStream.read(buffer)) != -1) {
			        outStream.write(buffer, 0, bytesRead);
			    }
			    
			    outStream.close();
			    initialStream.close();
			    
			}
			return rows;
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
		
		private static void decompressGzipFile(String gzipFile, String newFile) {
	        try {
	            FileInputStream fis = new FileInputStream(gzipFile);
	            GZIPInputStream gis = new GZIPInputStream(fis);
	            FileOutputStream fos = new FileOutputStream(newFile);
	            byte[] buffer = new byte[1024];
	            int len;
	            while((len = gis.read(buffer)) != -1){
	                fos.write(buffer, 0, len);
	            }
	            //close resources
	            fos.close();
	            gis.close();
	        } catch (IOException e) {
	            e.printStackTrace();
	        }
	        
	    }		
}





