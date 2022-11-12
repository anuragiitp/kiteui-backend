import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
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

public class FetchDataFromTradingview {

		private static String cookieTradingview;
	
		public static void main(String args[]) {
			
			Properties prop = new Properties();
			InputStream input = null;
			
			try {
				input = new FileInputStream("config.properties");
				prop.load(input);
				cookieTradingview = prop.getProperty("tradingview_session");	
				
				//[\"average_volume_10d_calc\",\"price_52_week_high\",\"price_52_week_low\",\"High.All\",\"Low.All\",\"Value.Traded\"]
				sendPost("tradingviewdataRaw.json","https://scanner.tradingview.com/india/scan","{\"filter\":[{\"left\":\"exchange\",\"operation\":\"equal\",\"right\":\"NSE\"}],\"options\":{\"active_symbols_only\":true,\"lang\":\"en\"},\"symbols\":{\"query\":{\"types\":[]},\"tickers\":[]},\"columns\":[\"average_volume_10d_calc\",\"price_52_week_high\",\"price_52_week_low\",\"High.All\",\"Low.All\",\"Value.Traded\"],\"sort\":{\"sortBy\":\"change\",\"sortOrder\":\"desc\"},\"range\":[0,2000]}");
				compress("tradingviewdataRaw.json", "tradingviewdata.json.gz");
				
				dumpFilterdata();
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
		
		
		
		public static void dumpFilterdata() {
			JSONObject outputJson = new JSONObject();
			JSONParser jsonParser = new JSONParser();
	        try (FileReader reader = new FileReader("./tradingviewdataRaw.json"))
	        {
	            //Read JSON file
	            Object obj = jsonParser.parse(reader);
	 
	            JSONObject jObj = (JSONObject) obj;		          
	            
	            JSONArray data = (JSONArray)jObj.get("data");
	            
	            for(int i=0;i<data.size();i++) {
	            	
	            	JSONObject jo1 = (JSONObject)data.get(i);
	            	
	            	String symbol = ((String)jo1.get("s")).split(":")[1];
	            	JSONArray dataD = (JSONArray)jo1.get("d");
	            	
	            	JSONObject out1 = new JSONObject();
	            	out1.put("average_volume_10d_calc", dataD.get(0));	            	
	            	out1.put("price_52_week_high", dataD.get(1));
	            	out1.put("price_52_week_low", dataD.get(2));
	            	out1.put("HighAll", dataD.get(3));
	            	out1.put("LowAll", dataD.get(4));
	            	out1.put("ValueTraded", dataD.get(5));
	            		            		            	
	            	outputJson.put(symbol, out1);
	            }
	            
	            
			    FileWriter writer = new FileWriter("tradingviewdata.json");	 		    
			    writer.append(outputJson.toJSONString());
			    writer.flush();
			    writer.close();	
			    
			    compress("tradingviewdata.json", "tradingviewdata.json.gz");
	            
	        }catch(Exception e) {
	        	e.printStackTrace();
	        }
			
		}
		
		
		
		public static final String USER_AGENT = "Mozilla/5.0";

		// HTTP GET request
		public static ArrayList<String> sendPost(String fileName,String url,String postData) throws Exception {
			System.out.println("POST -- "+url);
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





