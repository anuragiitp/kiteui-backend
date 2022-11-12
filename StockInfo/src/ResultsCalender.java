
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



public class ResultsCalender {	
	private static int POOL_SIZE = 10; //100;
	private static int DAY_BEFORE=  2;//40;
	
	
	
	private static Set<String> holdingsSet = new HashSet<String>();
	private static ArrayList<String> resultList = new ArrayList<String>();
	
	
	private static final ExecutorService executor = Executors.newFixedThreadPool(POOL_SIZE); //100
	
	
	public static void main(String args[]){	
		readHoldins();
		
		UserAgent userAgent = new UserAgent();		
		userAgent.settings.autoRedirect=false;
		
		SimpleDateFormat dt1 = new SimpleDateFormat("yyyy-MM-dd");
		Calendar cal = Calendar.getInstance();
		cal.add(Calendar.DATE, -DAY_BEFORE);
		
		for(int i=0; i<100 ;i++){
			try{
				Date date = cal.getTime();
				//http://www.moneycontrol.com/earnings/results-calender_2016-08-13.html			
				//String calUrl = "http://www.moneycontrol.com/earnings/results-calender_"+dt1.format(date)+".html";
				
				String calUrl = "https://www.moneycontrol.com/markets/earnings/results-calendar/"+dt1.format(date)+"/";
				
				System.out.println("Processing : "+calUrl);
				String body = sendGet(calUrl);				
				userAgent.openContent(body);		
				
				Elements rows = userAgent.doc.findFirst("<table id=tbl_box1>").findFirst("<tbody>").findEach("<a>");		
				
				Set<String> urlList = new HashSet<String>();
				
				for(Element row : rows){	
					try{
						String link = row.getAt("href");
						urlList.add(link);
					}catch(Exception e){
						e.printStackTrace();
					}
				}
				
				ArrayList<Future> fTaks = new ArrayList<Future>();				
				Set<String> cDaySymbols = new HashSet<String>();				
				for(String url : urlList){
					fTaks.add(executor.submit(new WorkerThread(url, cDaySymbols)));				
				}
				
				for(Future f:fTaks ){
					f.get();
				}
				
				for(String s : cDaySymbols){
					if(holdingsSet.contains(s)){
						resultList.add(s +","+dt1.format(date));
					}
				}
				
				cal.add(Calendar.DATE, 1);
				
				System.out.println("Completed : "+calUrl);
			}catch(Exception e){
				e.printStackTrace();
			}

		}
		
		
		
		
    	try
    	{  
    		StringBuilder sb = new StringBuilder();
    		for(String s : resultList){
    			sb.append(s+"\n");
    		}
    		    		
    	    FileWriter writer = new FileWriter("output/result-calendar.csv");	 		    
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
	
	public static void readHoldins(){
		try{
			String file = "inputs/holding.list";
			BufferedReader br = null;
			String line = "";
		 
			try {	 
				br = new BufferedReader(new FileReader(file));
				while ((line = br.readLine()) != null) {
					line=line.trim();
					if(line.contains("BSE:")){
						holdingsSet.add(line.split("BSE:")[1].trim().toLowerCase());
					}else if(line.contains("NSE:")){
						holdingsSet.add(line.split("NSE:")[1].trim().toLowerCase());
					}else{
						holdingsSet.add(line.toLowerCase());	
					}																						
				}
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			} finally {
				if (br != null) {
					try {
						br.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
				}
			}			
		}catch(Exception e){
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

		// add request header
		con.setRequestProperty("User-Agent", USER_AGENT);
		con.setConnectTimeout(10000);
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
	    	System.out.println("Start : "+url);
	    	try {
	    		
				String body = sendGet(url);				
				userAgent.openContent(body);
												
				String innerHTML = userAgent.doc.innerHTML();
				//System.out.println(userAgent.doc.innerHTML());
				String nseid = innerHTML.split("var nseId = \"")[1].split("\";")[0];
				String bseid = innerHTML.split("var bseId = \"")[1].split("\";")[0];
				
				add(nseid.trim().toLowerCase());
				add(bseid.trim().toLowerCase());
								
			} catch (Exception e) {
				// TODO Auto-generated catch block
				System.err.println(this.url);
			}	
	    	
	    	System.out.println("Done : "+url);
			
	    	try {
				Thread.sleep(10000);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
	    	
	    }
	    
	}
    
    
    
    
  

}








