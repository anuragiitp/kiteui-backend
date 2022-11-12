
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;
import java.util.zip.GZIPOutputStream;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;



public class PortfolioPerformance {
	private static String autZerodha = "enctoken RS2v1ZRy2uWYDU2bilcvP5Q4JQMuArL4K7uMMVL+PcXa5Wx970tS4D621I3Oz9joZRpQSvH3CCa0VS7FoduAWl8OjaABqg==";
	public static final String USER_AGENT = "Mozilla/5.0";

	private static Set<String> portfolio = new HashSet<>(Arrays.asList("DLF","RELIANCE","HDFC","DABUR"));
				
			
	public static String getCurrentTimeStamp(Date now) {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
	    String strDate = sdf.format(now);
	    return strDate;
	}
	
	static JSONObject ticksHistory = new JSONObject(); 
	 public static void main(String[] args) throws IOException, InterruptedException {		 
		 
//		 compress("performaneHistorykite.json", "performaneHistorykite.json.gz");
		 
	 
		 
		 //JSON parser object to parse read file
	        JSONParser jsonParser = new JSONParser();
		 
			Properties prop = new Properties();
			InputStream input = null;

			try {
				input = new FileInputStream("config.properties");
				prop.load(input);
				autZerodha = prop.getProperty("zerodha-key");		
			} catch (IOException ex) {
				ex.printStackTrace();
			} finally {
				if (input != null) {
					try {
						input.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
				}
			}
			
			
			JSONObject outputObject = new JSONObject();
			outputObject.put("time", getCurrentTimeStamp(new Date()));
			
			outputObject.put("ticks", ticksHistory);

			String toDate = getCurrentTimeStamp(new Date());
			
			Calendar cal = Calendar.getInstance();
			cal.setTime(new Date());
			cal.add(Calendar.DATE, -2000);
			
			String fromDate = getCurrentTimeStamp(cal.getTime());
			
			
			int count =0;
	        try (FileReader reader = new FileReader("./kiteticks.json"))
	        {
	            //Read JSON file
	            Object obj = jsonParser.parse(reader);
	 
	            JSONObject kiteData = (JSONObject) obj;		            
	            JSONObject ticks = (JSONObject) kiteData.get("ticks");
	            
	            System.out.println(ticks.size());

	            for(Object key : ticks.keySet()){
	            	if(portfolio.contains(key)) {
		            	count++;
		            	JSONObject tick = (JSONObject)ticks.get(key);
		            	String token = tick.get("token").toString();
		            	String url = "https://api.kite.trade/instruments/historical/"+token+"/day?from="+fromDate+"&to="+toDate;
		            	String resp = sendGetZerodha(url);
		            	ticksHistory.put(key, jsonParser.parse(resp));		            	
		            	System.out.println("Request - "+count);
						try {
							Thread.sleep(500);
						} catch (InterruptedException e) {
							e.printStackTrace();
						}	            			            		
	            	}
	            }
	            
	            
	            
	            
	            
			  
			    
			    String line="";			    
			    int tickCount =0;
			    
			    for(String symbol :portfolio) {
			    	try {
				    	FileWriter writer = new FileWriter("./output/"+symbol+"_price.csv");
				    	  
				    	JSONObject jresp = (JSONObject)ticksHistory.get(symbol);
				    	JSONObject jdata = (JSONObject)jresp.get("data");
				    	JSONArray jcandles = (JSONArray)jdata.get("candles");		
				    	line="";
				    	for(int i=0 ; i< jcandles.size();i++) {
				    		JSONArray cprice = (JSONArray)jcandles.get(i);
				    		line = cprice.get(0).toString().split("T")[0] +"," +cprice.get(4)+"\n";
				    		writer.append(line);
				    	}				    						    
					    writer.flush();
					    writer.close();							
					} catch (Exception e) {
						e.printStackTrace();
					}	            			    	
			    }
			    
			    
			    
		        FileWriter writer = new FileWriter("./output/ALL_price.csv");
		        line="DAY,";
	        	for(String symbol :portfolio) {
	        		line += symbol+",";	        		
	        	}	        
	        	writer.append(line+"\n");
	        		        	
		        for(int i=0;i<1500;i++) {
		        	line=i+",";
		        	for(String symbol :portfolio) {
		        		line+= getPriceForSymbol(symbol, i)+",";		        		
		        	}
		        	writer.append(line+"\n");
		        }			    
			    writer.flush();
			    writer.close();		
			    
	        }catch (Exception e) {
	            e.printStackTrace();
	        }	
		 
	
	        
	        


		
		
	 }
	 
	 
	 public static String getPriceForSymbol(String symbol,int tick) {
		    JSONObject jresp = (JSONObject)ticksHistory.get(symbol);
	    	JSONObject jdata = (JSONObject)jresp.get("data");
	    	JSONArray jcandles = (JSONArray)jdata.get("candles");	
	    	
	    	if(tick >= jcandles.size()) {
	    		return "";
	    	}else {
	    		JSONArray cprice = (JSONArray)jcandles.get(tick);
	    		return cprice.get(4).toString();
	    	}
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
		
	 
	// HTTP GET request
		public static String sendGetZerodha(String url) throws Exception {
			System.out.println("GET -- "+url);
			URL obj = new URL(url);
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();

			// optional default is GET
			con.setRequestMethod("GET");

			// add request header
			con.setRequestProperty("User-Agent", USER_AGENT);
			con.setRequestProperty("authorization", autZerodha);
			con.setRequestProperty("X-Kite-Version", "3");

			String response = "";
			int responseCode = con.getResponseCode();
			if (responseCode == 200) {
				BufferedReader in = new BufferedReader(new InputStreamReader(
						con.getInputStream()));
				String inputLine;
				while ((inputLine = in.readLine()) != null) {
					response +=inputLine+"\n";
				}
			}
			System.out.println("RES -- "+response);
			return response;
		}	
	 
	
	 
}
