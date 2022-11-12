
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import com.jaunt.Element;
import com.jaunt.Elements;
import com.jaunt.UserAgent;



public class TrendLyneSuper {	
	
	
	private static Set<String> holdingsSet = new HashSet<String>();
	private static ArrayList<String > resultList = new ArrayList<String >();
	
	
	private static final ExecutorService executor = Executors.newFixedThreadPool(100);
	
	
	public static void main(String args[]){	
		
		UserAgent userAgent = new UserAgent();		
		userAgent.settings.autoRedirect=false;
						
		Set<String> urlList = new HashSet<String>();
		for(int i=1; i<15 ;i++){
			try{				
				//https://trendlyne.com/portfolio/superstar-shareholders/individual/?page=2&querystring_key=next
				
				String calUrl = "https://trendlyne.com/portfolio/superstar-shareholders/individual/?querystring_key=next&page="+i;
				
				System.out.println("Processing : "+calUrl);
				String body = sendGet(calUrl);				
				userAgent.openContent(body);		
				
				Elements rows = userAgent.doc.findFirst("<div id=allposts>").findEach("<a>");		
				
				for(Element row : rows){	
					try{
						String link = "https://trendlyne.com"+row.getAt("href");
						urlList.add(link);
					}catch(Exception e){
						e.printStackTrace();
					}
				}
						
			}catch(Exception e){
				e.printStackTrace();
			}

		}
		
		
												
			for(String url : urlList){
				System.out.println("Processing url  : "+url);
		    	try {
					String body = sendGet(url);				
					userAgent.openContent(body);
									
					Elements rows  = userAgent.doc.findFirst("<table id=shareholdingTable>").findFirst("<tbody>").findEach("<tr>");
					
							
					for(Element row : rows){	
						try{
							
							Elements tds  = row.findEach("<td>");
							String line = tds.getElement(1).findFirst("<a>").innerText().trim()
									+","+tds.getElement(2).innerText().trim()
									+","+tds.getElement(3).innerText().trim()
									+","+tds.getElement(4).innerText().trim()
									+","+tds.getElement(5).innerText().trim()
									+","+tds.getElement(6).innerText().trim()
									+","+tds.getElement(7).innerText().trim();
							
							resultList.add(line);
						}catch(Exception e){
							e.printStackTrace();
						}
					}
				} catch (Exception e) {
					// TODO Auto-generated catch block
					System.err.println(url);
				}

			}
			
		
		
    	try
    	{  
    		StringBuilder sb = new StringBuilder();
    		for(String  s : resultList){
    				sb.append(s+"\n");	
    		}
    		    		
    	    FileWriter writer = new FileWriter("output/superstar.csv");	 		    
    	    writer.append(sb.toString());
    	    writer.flush();
    	    writer.close();
    	}
    	catch(IOException e)
    	{
    	     e.printStackTrace();
    	}
    	
    	 executor.shutdown();
				
	}
	

	
	public static final String USER_AGENT = "Mozilla/5.0";

	// HTTP GET request
	public static String sendGet(String url) throws Exception {

		URL obj = new URL(url);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();

		// optional default is GET
		con.setRequestMethod("GET");

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
	
	
	static class WorkerThread implements Runnable {
						
		private String url;
		private Set<String> cDaySymbols;

	    public WorkerThread(String url,Set<String> cDaySymbols){
	        this.url=url;
	        this.cDaySymbols=cDaySymbols;
	    }
	 
	    
	    public void add(String s) {
	    	synchronized (cDaySymbols) {
	    		cDaySymbols.add(s);
			}
	    }

		
	    @Override
	    public void run() {       
	    	UserAgent userAgent = new UserAgent();	
	    	userAgent.settings.autoRedirect=false;
	    	try {
				String body = sendGet(url);				
				userAgent.openContent(body);
								
				Elements rows  = userAgent.doc.findFirst("<table id=shareholdingTable>").findFirst("<tbody>").findEach("<tr>");
				
						
				for(Element row : rows){	
					try{
						
						Elements tds  = row.findEach("<td>");
						String line = tds.getElement(1).findFirst("<a>").getChildText()
								+","+tds.getElement(2).getChildText()
								+","+tds.getElement(3).getChildText()
								+","+tds.getElement(4).getChildText()
								+","+tds.getElement(5).getChildText()
								+","+tds.getElement(6).getChildText()
								+","+tds.getElement(7).getChildText();
						
						cDaySymbols.add(line);
					}catch(Exception e){
						e.printStackTrace();
					}
				}
				
				
				
			} catch (Exception e) {
				// TODO Auto-generated catch block
				System.err.println(this.url);
			}	
	    	
	    				
	    }
	    
	}
    
    
    
    
  

}








