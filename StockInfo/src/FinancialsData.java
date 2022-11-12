
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


public class FinancialsData {	
	
	
	private static ArrayList<String> resultList = new ArrayList<String>();		
	private static final ExecutorService executor = Executors.newFixedThreadPool(10);
	
	
	public static void main(String args[]){	
		
		UserAgent userAgent = new UserAgent();		
		userAgent.settings.autoRedirect=false;
		
		SimpleDateFormat dt1 = new SimpleDateFormat("yyyy-MM-dd");
		Calendar cal = Calendar.getInstance();
		
		
		int startDaysBefore = 15,endDaysAfter=1;
		for(int i =0 ;i<startDaysBefore;i++){
			cal.add(Calendar.DATE, -1);
		}
		
		
		for(int i=0; i< endDaysAfter+startDaysBefore ;i++){
			try{
				Date date = cal.getTime();
				//http://www.moneycontrol.com/earnings/results-calender_2016-08-13.html			
				String calUrl = "http://www.moneycontrol.com/earnings/results-calender_"+dt1.format(date)+".html";
				
				System.out.println("Processing : "+calUrl);
				String body = sendGet(calUrl);				
				userAgent.openContent(body);		
				
				Elements rows = userAgent.doc.findFirst("<table id=myTable>").findFirst("<tbody>").findEach("<a>");		
				
				Set<String> urlList = new HashSet<String>();
				
				for(Element row : rows){	
					try{
						String link = row.getAt("href");
						urlList.add("http://www.moneycontrol.com"+link);
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
					resultList.add(s);					
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
    		sb.append("<!DOCTYPE html> <html> <head>   <link type='text/css' href='./mcss/style.css?v=128' rel='stylesheet' /> <link type='text/css' href='./mcss/mc_common.css?v=128' rel='stylesheet' /> <link type='text/css' href='./mcss/mainStyle_other.css?v=128' rel='stylesheet' /> <link type='text/css' href='./mcss/style_v1.css?v=128' rel='stylesheet' /><script src='./mcss/jquery-3.1.0.min.js'></script>    <style>  .FR.gry10 { display: none; } .FL.gry10 {width: 100%;}  .sdetails { margin-top: 50px; width: 970px; margin-left: auto; margin-right: auto; background-color: white; }   div#content_full { width: 970px; margin: 0 auto; display: none !important;  }  div#mktdet_1 { width: 795px; margin: 0 auto; display: none !important; border-top: 2px solid black; margin-top: 20px; padding-top: 10px; }  div#acc_hd5 { width: 795px; margin: 0 auto; display: none !important; border-top: 2px solid black; margin-top: 20px; padding-top: 10px; }  div#acc_hd7 { width: 795px; margin: 0 auto; display: none !important; border-top: 2px solid black; margin-top: 20px; padding-top: 10px; }  .stdhead1 { display: none !important; }  .PB10 { font: bold 18px arial; border: 3px solid #CECECE; line-height: 44px; margin-top: 10px; padding-top: 0; color: #303030; background-color: #DFDFDF; border-radius: 10px; margin-bottom: 40px; }    .tooltip7,.tooltip3,.tooltip6,.tooltip2,.tooltip5{ display: none !important; }  div#Bse_Prc_tick_div,div#Nse_Prc_tick_div { margin-top: 15px; }  div#bse_upd_time ,div#nse_upd_time { padding-left: 18px; } .FR { text-align: right; }  span.stockLH { width: 44px !important; display: inline-block !important; background-color: green !important; height: 2px !important; }   div#content_bse { margin-left: 25px; border-right: 3px solid aliceblue; padding-right: 25px; }  div#content_nse { margin-right: 25px; }   td.thc01.w160.gL_10 { padding: 10px; border-bottom: 1px solid #d1d1d1; }   td.thc02.w160,td.thc04.w160 { padding: 10px; border-bottom: 1px solid #d1d1d1; }  td.thc02.gD_12,td.thc04.gD_12 { padding: 10px; border-bottom: 1px solid #d1d1d1; }  #findet_11 td.thc02.gD_12{ width: 160px; text-align: left; } #findet_11 td.thc02.gD_12.tar{ width: auto; } </style>    <script>  window.onload = function(){  var sdetails = document.querySelectorAll('.sdetails');  for(var i =0;i<sdetails.length;i++){             sdetails[i].addEventListener('click',function(event){ for(var j = 2;j<event.currentTarget.childNodes.length;j++){ event.currentTarget.childNodes[j].style='display:block !important;'; } }); } }  </script>      </head>        <body>");
    		for(String s : resultList){
    			sb.append("<div class='sdetails'>"+s+"</div>");
    		}
    		sb.append("</body></html>");
    		
    	    FileWriter writer = new FileWriter("output/Financials-data.html");	 		    
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
				
				
				String symbolString = userAgent.doc.findFirst("<div id=\"nChrtPrc\">").findFirst("<div class=\"PB10\">").outerHTML();
				String financialPattern = userAgent.doc.findFirst("<div id=\"acc_hd5\">").outerHTML();	
				String shareHoldingPattern = userAgent.doc.findFirst("<div id=\"acc_hd7\">").outerHTML();					
				String standalone = userAgent.doc.findFirst("<div id=\"mktdet_1\">").outerHTML();
				String contentBase = userAgent.doc.findFirst("<div id=\"content_full\">").outerHTML();
				
								
				add(symbolString+"\n"+contentBase+"\n"+standalone+"\n"+financialPattern+"\n"+shareHoldingPattern);
				
				
			} catch (Exception e) {
				// TODO Auto-generated catch block
				System.err.println(this.url);
			}	
	    	
	    	
			
	    }
	    
	}
    
    
    
    
  

}








