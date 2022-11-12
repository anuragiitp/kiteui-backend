
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
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import com.jaunt.Element;
import com.jaunt.Elements;
import com.jaunt.UserAgent;



public class MutualFundsHoldings {	
	
	private static int POOL_SIZE = 10; //100;
	
	private static String[] mfUrlList = {
		"https://www.moneycontrol.com/mutual-funds/performance-tracker/returns/large-cap-fund.html",
		"https://www.moneycontrol.com/mutual-funds/performance-tracker/returns/mid-cap-fund.html",
		"https://www.moneycontrol.com/mutual-funds/performance-tracker/returns/small-cap-fund.html",		
		"https://www.moneycontrol.com/mutual-funds/performance-tracker/returns/multi-cap-fund.html",
		"https://www.moneycontrol.com/mutual-funds/performance-tracker/returns/large-and-mid-cap-fund.html",
		"https://www.moneycontrol.com/mutual-funds/performance-tracker/returns/dividend-yield-fund.html",
		"https://www.moneycontrol.com/mutual-funds/performance-tracker/returns/focused-fund.html"		
	};	
	
	
	private static ArrayList<String> resultList = new ArrayList<String>();
		
	private static final ExecutorService executor = Executors.newFixedThreadPool(POOL_SIZE);
	
	
	public static void main(String args[]){	
		
		UserAgent userAgent = new UserAgent();		
		userAgent.settings.autoRedirect=false;
		
				
		for(int i=2; i<mfUrlList.length && i<3 ;i++){
			try{
				
				String calUrl = mfUrlList[i];
				
				System.out.println("Processing : "+calUrl);
				String body = sendGet(calUrl);				
				userAgent.openContent(body);		
				
				Elements rows = userAgent.doc.findFirst("<table id=dataTableId>").findFirst("<tbody>").findEach("<a>");		
				
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
				Map<String,String> stocksMfMap = new HashMap<String,String>();	
				
				Map<String,String> mfTopHoldings = new HashMap<String,String>();	
				
				for(String url : urlList){
					fTaks.add(executor.submit(new WorkerThread(url, stocksMfMap,mfTopHoldings,calUrl.substring(calUrl.lastIndexOf("/")+1,calUrl.indexOf(".html")))));				
				}
				
				for(Future f:fTaks ){
					f.get();
				}
				
				resultList.add(calUrl);
				for(String s : stocksMfMap.keySet()){
					resultList.add(s +","+stocksMfMap.get(s));
				}
				
				dumptopHoldings(mfTopHoldings);
				
				System.out.println("Completed : "+calUrl);
			}catch(Exception e){
				e.printStackTrace();
			}

		}
		
		
		try{
			
			Collections.sort(resultList,new Comparator<String>() {
				@Override
				public int compare(String arg0, String arg1) {					
					return arg1.split(",").length - arg0.split(",").length ;
				}
				
			});
		}catch(Exception e){
			e.printStackTrace();
		}
		
    	try
    	{  
    		StringBuilder sb = new StringBuilder();
    		for(String s : resultList){
    			sb.append(s+"\n");
    		}
    		    		
    	    FileWriter writer = new FileWriter("output/mutual-funds-holdings.csv");	 		    
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
	

	public static void dumptopHoldings(Map<String,String> mfTopHoldings) {
    	try
    	{  
    		StringBuilder sb = new StringBuilder();
    		for(String s : mfTopHoldings.keySet()){
    			sb.append(s +","+mfTopHoldings.get(s)+"\n");
    		}
    		    		
    	    FileWriter writer = new FileWriter("output/top-mutual-funds-holdings.csv");	 		    
    	    writer.append(sb.toString());
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
		private Map<String,String> stocksMfMap;
		private String fundCat;
		private Map<String,String> mfTopHoldings;

	    public WorkerThread(String url,Map<String,String> stocksMfMap,Map<String,String> mfTopHoldings,String fundCat){
	        this.url=url;
	        this.stocksMfMap=stocksMfMap;
	        this.mfTopHoldings=mfTopHoldings;
	        this.fundCat=fundCat;
	    }
	 
	    
	    public void add(Elements  stocks,String fundName) {
	    	synchronized (stocksMfMap) {
	    		
	    		for(Element e:stocks){
	    			try{
		    			String stock = e.getTextContent();
		    					    			
			    		if(stocksMfMap.containsKey(stock)){
			    			stocksMfMap.put(stock, stocksMfMap.get(stock)+","+fundName);
			    		}else{
			    			String href = e.getAt("href");
			    			stocksMfMap.put(stock, fundCat+","+href+","+ fundName);
			    		}		    				
			    		
	    			}catch(Exception e1){
	    				e1.printStackTrace();
	    			}		
	    		}
	    		
	    		String sList = "";
	    		int count=1;
	    		for(Element e:stocks){
	    			try{
		    			String stock = e.getTextContent();
		    			sList += stock+",";
		    			count++;
		    			if(count > 10)break;
	    			}catch(Exception e1){
	    				e1.printStackTrace();
	    			}finally {
	    				mfTopHoldings.put(fundName.split("-")[0], sList);
					}		
	    		}	    		

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
				String url  = userAgent.doc.findFirst("<div class=\"clearfix MT15 viewmore\"").findFirst("<a>").getAt("href");								    			    		
				body = sendGet(url);				
				userAgent.openContent(body);
				
				url  = userAgent.doc.findFirst("<div class=\"clearfix MT15 viewmore\"").findFirst("<a>").getAt("href");								    			    		
				body = sendGet(url);				
				userAgent.openContent(body);
								
				Elements rows = userAgent.doc.findFirst("<table id=equityCompleteHoldingTable>").findFirst("<tbody>").findEach("<a>");					
				String fundName = userAgent.doc.findFirst("<h1 class=page_heading>").getTextContent();				
				add(rows, fundName);
				
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








