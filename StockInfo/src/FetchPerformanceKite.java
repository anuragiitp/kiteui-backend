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
import java.util.Calendar;
import java.util.Date;
import java.util.Properties;
import java.util.zip.GZIPOutputStream;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;



public class FetchPerformanceKite {
	private static String autZerodha = "enctoken RS2v1ZRy2uWYDU2bilcvP5Q4JQMuArL4K7uMMVL+PcXa5Wx970tS4D621I3Oz9joZRpQSvH3CCa0VS7FoduAWl8OjaABqg==";
	public static final String USER_AGENT = "Mozilla/5.0";


	public static String getCurrentTimeStamp(Date now) {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
	    String strDate = sdf.format(now);
	    return strDate;
	}
	
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
			JSONObject ticksHistory = new JSONObject(); 
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
	            	count++;
	            	JSONObject tick = (JSONObject)ticks.get(key);
	            	String token = tick.get("token").toString();
	            	String url = "https://api.kite.trade/instruments/historical/"+token+"/day?from="+fromDate+"&to="+toDate;
	            	String resp = sendGetZerodha(url);
	            	ticksHistory.put(key, resp);
	            	
	            	System.out.println("Request - "+count);
					try {
						Thread.sleep(500);
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
					
	            }
	            
	            
			    FileWriter writer = new FileWriter("performaneHistorykite.json");	 		    
			    writer.append(outputObject.toJSONString());
			    writer.flush();
			    writer.close();		            
			    
			    compress("performaneHistorykite.json", "performaneHistorykite.json.gz");
	            
	        }catch (Exception e) {
	            e.printStackTrace();
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
