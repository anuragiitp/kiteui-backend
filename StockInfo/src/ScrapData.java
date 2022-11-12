
import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;



import org.json.simple.JSONObject;

import com.jaunt.Element;
import com.jaunt.Elements;
import com.jaunt.UserAgent;



public class ScrapData {	
	
	

	public static void main(String args[]){	
		
		UserAgent userAgent = new UserAgent();		
		userAgent.settings.autoRedirect=false;
						
		Map<String,String> urlList = new HashMap<String,String>();
		for(int i=1; i<77 ;i++){
			try{				
				//https://trendlyne.com/portfolio/superstar-shareholders/individual/?page=2&querystring_key=next
				
				String calUrl = "https://www.screener.in/screen/raw/?sort=Market+Capitalization&source=&order=desc&query=Market+Capitalization+>+1&page="+i;
				
				System.out.println("Processing : "+calUrl);
				String body = sendGet(calUrl);				
				userAgent.openContent(body);		
				
				Elements rows = userAgent.doc.findFirst("<div class=responsive-holder>").findEach("<tr>");		
				
				for(Element row : rows){	
					try{
						
						if(row.getAt("data-row-company-name")!=null){
							Elements cols = row.findEach("<td>");
							String link = cols.getElement(1).findFirst("<a>").getAt("href").trim();
							String symbol = cols.getElement(1).findFirst("<a>").getTextContent().trim();
							//String link = 
							urlList.put(symbol.toLowerCase(),link);
						}
						
					}catch(Exception e){
						e.printStackTrace();
					}
				}						
			}catch(Exception e){
				e.printStackTrace();
			}

		}
		
		
		
    	try
    	{  
    		JSONObject outputJson = new JSONObject();
    		for(String  s : urlList.keySet()){
    			outputJson.put(s, urlList.get(s));
    		}
    		    		
    	    FileWriter writer = new FileWriter("output/URLMap.json");	 		    
    	    writer.append(outputJson.toJSONString());
    	    writer.flush();
    	    writer.close();
    	}
    	catch(IOException e)
    	{
    	     e.printStackTrace();
    	}
    	
    
				
	}
	

	
	public static final String USER_AGENT = "Mozilla/5.0";

	// HTTP GET request
	public static String sendGet(String url) throws Exception {

		URL obj = new URL(url);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();

		// optional default is GET
		con.setRequestMethod("GET");
		con.setRequestProperty("Cookie", "sessionid=zd1hvk2qn8riwjzwob70qghoa64jqv23");
		// add request header
		con.setRequestProperty("User-Agent", USER_AGENT);

		int responseCode = con.getResponseCode();

		StringBuffer response = new StringBuffer();
		if (responseCode == 200) {
			BufferedReader in = new BufferedReader(new InputStreamReader(
					con.getInputStream()));
			String inputLine;
			while ((inputLine = in.readLine()) != null) {
				response.append(inputLine);
			}
			in.close();
		}
		return response.toString();
	}
	
	
	
	    
	}
    
    
    
    
  









