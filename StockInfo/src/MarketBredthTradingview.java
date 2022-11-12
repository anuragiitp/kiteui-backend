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
import java.util.ArrayList;
import java.util.Properties;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class MarketBredthTradingview {

		private static String cookieTradingview;
	
		public static void main(String args[]) {
			
			Properties prop = new Properties();
			InputStream input = null;
			
			try {
				input = new FileInputStream("config.properties");
				prop.load(input);
				cookieTradingview = prop.getProperty("tradingview_session");	
				
				//[\"change\"]
				sendPost("marketBredthTradingviewdataRaw.json","https://scanner.tradingview.com/india/scan","{\"filter\":[{\"left\":\"exchange\",\"operation\":\"equal\",\"right\":\"NSE\"}],\"options\":{\"active_symbols_only\":true,\"lang\":\"en\"},\"symbols\":{\"query\":{\"types\":[]},\"tickers\":[]},\"columns\":[\"change\"],\"sort\":{\"sortBy\":\"change\",\"sortOrder\":\"desc\"},\"range\":[0,2000]}");				
				dumpADRData();
				

				sendPost("marketBredthTradingviewdataRaw.json","https://scanner.tradingview.com/india/scan","{\"filter\":[{\"left\":\"exchange\",\"operation\":\"equal\",\"right\":\"NSE\"},{\"left\":\"market_cap_basic\",\"operation\":\"nempty\"},{\"left\":\"type\",\"operation\":\"in_range\",\"right\":[\"stock\",\"dr\",\"fund\"]},{\"left\":\"subtype\",\"operation\":\"in_range\",\"right\":[\"common\",\"\",\"etf\",\"unit\",\"mutual\",\"money\",\"reit\",\"trust\"]},{\"left\":\"exchange\",\"operation\":\"equal\",\"right\":\"NSE\"},{\"left\":\"High.All\",\"operation\":\"eless\",\"right\":\"high\"}],\"options\":{\"active_symbols_only\":true,\"lang\":\"en\"},\"symbols\":{\"query\":{\"types\":[]},\"tickers\":[]},\"columns\":[\"logoid\",\"name\",\"close\",\"change\",\"Recommend.All\",\"volume\",\"average_volume_10d_calc\",\"price_earnings_ttm\",\"sector\",\"Perf.W\",\"Perf.1M\",\"Perf.3M\",\"Perf.6M\",\"Perf.YTD\",\"Perf.Y\",\"price_52_week_high\",\"price_52_week_low\",\"High.All\",\"market_cap_basic\",\"description\",\"name\",\"type\",\"subtype\",\"update_mode\",\"pricescale\",\"minmov\",\"fractional\",\"minmove2\"],\"sort\":{\"sortBy\":\"market_cap_basic\",\"sortOrder\":\"desc\"},\"range\":[0,150]}");				
				int ATH = getRows();
				System.out.println("ATH "+ATH);

				sendPost("marketBredthTradingviewdataRaw.json","https://scanner.tradingview.com/india/scan","{\"filter\":[{\"left\":\"name\",\"operation\":\"nempty\"},{\"left\":\"type\",\"operation\":\"in_range\",\"right\":[\"stock\",\"dr\",\"fund\"]},{\"left\":\"subtype\",\"operation\":\"in_range\",\"right\":[\"common\",\"\",\"etf\",\"unit\",\"mutual\",\"money\",\"reit\",\"trust\"]},{\"left\":\"Low.All\",\"operation\":\"egreater\",\"right\":\"low\"}],\"options\":{\"active_symbols_only\":true,\"lang\":\"en\"},\"symbols\":{\"query\":{\"types\":[]},\"tickers\":[]},\"columns\":[\"logoid\",\"name\",\"close\",\"change\",\"Recommend.All\",\"volume\",\"average_volume_10d_calc\",\"price_earnings_ttm\",\"sector\",\"Perf.W\",\"Perf.1M\",\"Perf.3M\",\"Perf.6M\",\"Perf.YTD\",\"Perf.Y\",\"price_52_week_high\",\"price_52_week_low\",\"High.All\",\"market_cap_basic\",\"description\",\"name\",\"type\",\"subtype\",\"update_mode\",\"pricescale\",\"minmov\",\"fractional\",\"minmove2\"],\"sort\":{\"sortBy\":\"name\",\"sortOrder\":\"asc\"},\"range\":[0,150]}");				
				int ATL = getRows();
				System.out.println("ATL "+ATL);
				
				sendPost("marketBredthTradingviewdataRaw.json","https://scanner.tradingview.com/india/scan","{\"filter\":[{\"left\":\"market_cap_basic\",\"operation\":\"nempty\"},{\"left\":\"exchange\",\"operation\":\"equal\",\"right\":\"NSE\"},{\"left\":\"price_52_week_high\",\"operation\":\"eless\",\"right\":\"high\"}],\"options\":{\"active_symbols_only\":true,\"lang\":\"en\"},\"symbols\":{\"query\":{\"types\":[]},\"tickers\":[]},\"columns\":[\"logoid\",\"name\",\"close\",\"change\",\"Recommend.All\",\"volume\",\"average_volume_10d_calc\",\"price_earnings_ttm\",\"sector\",\"Perf.W\",\"Perf.1M\",\"Perf.3M\",\"Perf.6M\",\"Perf.YTD\",\"Perf.Y\",\"price_52_week_high\",\"price_52_week_low\",\"High.All\",\"market_cap_basic\",\"description\",\"name\",\"type\",\"subtype\",\"update_mode\",\"pricescale\",\"minmov\",\"fractional\",\"minmove2\"],\"sort\":{\"sortBy\":\"market_cap_basic\",\"sortOrder\":\"desc\"},\"range\":[0,150]}");				
				int WH52 = getRows();
				System.out.println("52WH "+WH52);
				
				sendPost("marketBredthTradingviewdataRaw.json","https://scanner.tradingview.com/india/scan","{\"filter\":[{\"left\":\"name\",\"operation\":\"nempty\"},{\"left\":\"exchange\",\"operation\":\"equal\",\"right\":\"NSE\"},{\"left\":\"price_52_week_low\",\"operation\":\"egreater\",\"right\":\"low\"}],\"options\":{\"active_symbols_only\":true,\"lang\":\"en\"},\"symbols\":{\"query\":{\"types\":[]},\"tickers\":[]},\"columns\":[\"logoid\",\"name\",\"close\",\"change\",\"Recommend.All\",\"volume\",\"average_volume_10d_calc\",\"price_earnings_ttm\",\"sector\",\"Perf.W\",\"Perf.1M\",\"Perf.3M\",\"Perf.6M\",\"Perf.YTD\",\"Perf.Y\",\"price_52_week_high\",\"price_52_week_low\",\"High.All\",\"market_cap_basic\",\"description\",\"name\",\"type\",\"subtype\",\"update_mode\",\"pricescale\",\"minmov\",\"fractional\",\"minmove2\"],\"sort\":{\"sortBy\":\"name\",\"sortOrder\":\"asc\"},\"range\":[0,150]}");				
				int WL52 = getRows();
				System.out.println("52WL "+WL52);
				
				
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
		
		

		public static int getRows() {
			JSONParser jsonParser = new JSONParser();
	        try (FileReader reader = new FileReader("./marketBredthTradingviewdataRaw.json"))
	        {
	            //Read JSON file
	            Object obj = jsonParser.parse(reader);
	 
	            JSONObject jObj = (JSONObject) obj;		          
	            
	            JSONArray data = (JSONArray)jObj.get("data");
	            
	            return data.size();
	            	
	       } catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
	       } 
	        return 0;
		}
		
		
		public static void dumpADRData() {
			
			int plus=0,neg=0,unchanged=0;
			
			
			int p0t2=0,p2t5=0,p5t10=0,p10t15=0,p15t=0;
			int n0t2=0,n2t5=0,n5t10=0,n10t15=0,n15t=0;
			
			
			
			JSONObject outputJson = new JSONObject();
			JSONParser jsonParser = new JSONParser();
	        try (FileReader reader = new FileReader("./marketBredthTradingviewdataRaw.json"))
	        {
	            //Read JSON file
	            Object obj = jsonParser.parse(reader);
	 
	            JSONObject jObj = (JSONObject) obj;		          
	            
	            JSONArray data = (JSONArray)jObj.get("data");
	            
	            for(int i=0;i<data.size();i++) {
	            	
	            	JSONObject jo1 = (JSONObject)data.get(i);
	            	
	            	String symbol = ((String)jo1.get("s")).split(":")[1];
	            	JSONArray dataD = (JSONArray)jo1.get("d");
	            	
	            	double change = Double.parseDouble(dataD.get(0).toString());
	            	
	            	if(change > 0) {
	            		plus++;
	            		
	            		if(change > 0 && change < 2) {
	            			p0t2++;
	            		}else if(change > 2 && change < 5) {
	            			p2t5++;
	            		}else if(change > 5 && change < 10) {
	            			p5t10++;
	            		}else if(change > 10 && change < 15) {
	            			p10t15++;
	            		}else if(change > 15) {
	            			p15t++;
	            		}
	            		
	            	}else if(change < 0) {
	            		neg++;
	            		
	            		if(change < 0 && change > -2) {
	            			n0t2++;
	            		}else if(change < -2 && change > -5) {
	            			n2t5++;
	            		}else if(change < -5 && change > -10) {
	            			n5t10++;
	            		}else if(change < -10 && change > -15) {
	            			n10t15++;
	            		}else if(change < -15) {
	            			n15t++;
	            		}

	            		
	            	}else {
	            		unchanged++;
	            	}
	            }
	            
	            System.out.println("NSE Advance/Decline " + plus+"/"+neg  +"   ( unchanged "+unchanged +")");
            	System.out.println("<-15%,"+n15t +"\n -(10-15)%,"+n10t15 +"\n -(5-10)%,"+n5t10 +"\n -(2-5)%,"+n2t5  +"\n -(0-2)%,"+n0t2   +"\n 0%,"+unchanged   +"\n +(0-2)%,"+p0t2 +"\n +(2-5)%,"+p2t5 +"\n +(5-10)%,"+p5t10 +"\n +(10-15)%,"+p10t15 + "\n> +15%,"+p15t );
            		            
                   

            	
            	
            	
            	
	        }catch(Exception e) {
	        	e.printStackTrace();
	        }
			
		}
		
		
		
		public static final String USER_AGENT = "Mozilla/5.0";

		// HTTP GET request
		public static ArrayList<String> sendPost(String fileName,String url,String postData) throws Exception {
		//	System.out.println("POST -- "+url);
			URL obj = new URL(url);
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();

			// optional default is GET
			con.setRequestMethod("POST");

			// add request header
			con.setRequestProperty("User-Agent", USER_AGENT);

			con.setRequestProperty("Cookie", cookieTradingview);

			
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





