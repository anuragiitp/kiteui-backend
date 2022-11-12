import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.GZIPInputStream;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;


public class NSEInsiderTrading {

	
	
	public static void main(String args[]) throws Exception{
		String url = 		"https://www.nseindia.com/api/corporates-pit?index=equities&from_date=13-06-2020&to_date=13-07-2020";
		
//		saveGetRequest(url,"./output/insiderTrading.gz");	    
//	    decompressGzip(new File("./output/insiderTrading.gz"), new File("./output/insiderTrading.json"));
	    
		
	    //JSON parser object to parse read file
        JSONParser jsonParser = new JSONParser();
        
        Map<String,Long> purchasefilterMap = new HashMap<String,Long>();
        Map<String,Long> salefilterMap = new HashMap<String,Long>(); 
        
        try (FileReader reader = new FileReader("./output/insiderTrading.json"))
        {
            //Read JSON file
            JSONObject obj = (JSONObject)jsonParser.parse(reader);
            JSONArray rows = (JSONArray) obj.get("data");
            
            for(int i=0;i<rows.size();i++){
            	JSONObject o1 = (JSONObject)rows.get(i);
            	String acqMode = (String)o1.get("acqMode");
            	String symbol = (String)o1.get("symbol");
            	String secAcq = (String)o1.get("secAcq");

            	
            	if("market purchase".equalsIgnoreCase(acqMode)){
                	String afterAcqSharesPer = (String)o1.get("afterAcqSharesPer");
                	Double value = Long.parseLong(secAcq)*Double.parseDouble(afterAcqSharesPer);
            		if(!purchasefilterMap.containsKey(symbol)){
            			purchasefilterMap.put(symbol, 0L);
            		}            		
            		purchasefilterMap.put(symbol, purchasefilterMap.get(symbol)+value.longValue());
            	}else if("market sale".equalsIgnoreCase(acqMode)){
                	String afterAcqSharesPer = (String)o1.get("afterAcqSharesPer");
                	Double value = Long.parseLong(secAcq)*Double.parseDouble(afterAcqSharesPer);
            		if(!salefilterMap.containsKey(symbol)){
            			salefilterMap.put(symbol, 0L);
            		}
            		salefilterMap.put(symbol, salefilterMap.get(symbol)+value.longValue());      		
            	}            	
            }
            
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (ParseException e) {
            e.printStackTrace();
        }
        
        
	    FileWriter writer = new FileWriter("NSEInsidertrading.csv");	 		   
	    for(String key:purchasefilterMap.keySet()){
	    	writer.append(key+",BUY,"+purchasefilterMap.get(key)+"\n");
	    }
	    for(String key:salefilterMap.keySet()){
	    	writer.append(key+",SELL,"+purchasefilterMap.get(key)+"\n");
	    }
	    
	    writer.flush();
	    writer.close();		        
        

        
	}
	
	
	
	
    public static void decompressGzip(File input, File output) throws IOException {
        try (GZIPInputStream in = new GZIPInputStream(new FileInputStream(input))){
            try (FileOutputStream out = new FileOutputStream(output)){
                byte[] buffer = new byte[1024];
                int len;
                while((len = in.read(buffer)) != -1){
                    out.write(buffer, 0, len);
                }
            }
        }
    }
	
	
	
	
	
	
	
	
	public static final String USER_AGENT = "Mozilla/5.0";
	
	// HTTP GET request
	public static String saveGetRequest(String url,String output) throws Exception {
		System.out.println("GET -- "+url);
		URL obj = new URL(url);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();

		// optional default is GET
		con.setRequestMethod("GET");
		con.setRequestProperty("Accept-Encoding", "gzip");
		// add request header
		con.setRequestProperty("User-Agent", USER_AGENT);

		String response = "";
		int responseCode = con.getResponseCode();
		if (responseCode == 200) {			
            try (FileOutputStream out = new FileOutputStream(output)){
                byte[] buffer = new byte[1024];
                int len;
                while((len = con.getInputStream().read(buffer)) != -1){
                    out.write(buffer, 0, len);
                }
            }
		}
		return response;
	}	
		
}
