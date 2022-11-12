import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.text.DecimalFormat;
import java.util.concurrent.ConcurrentHashMap;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;


//Add alerts for lower circuit 

public class StockAlerts {

	public static ConcurrentHashMap<String, Long> alerts = new ConcurrentHashMap<String,Long>();
	public static DecimalFormat df2 = new DecimalFormat("#.##");
	  	
	
	 public static void main(String[] args) throws IOException, InterruptedException {		 
		 //
//		ShowToast("'Professional Content', 'And gr8 spelling'");
		
		Thread alertThread = new Thread(new Runnable() {
			
			@Override
			public void run() {
				
				JSONObject oldTicks=null;
				
				
				while(true){
					
					 //JSON parser object to parse read file
			        JSONParser jsonParser = new JSONParser();
			         
			        try (FileReader reader = new FileReader("./kiteticks.json"))
			        {
			            //Read JSON file
			            Object obj = jsonParser.parse(reader);
			 
			            JSONObject kiteData = (JSONObject) obj;		            
			            JSONObject ticks = (JSONObject) kiteData.get("ticks");
			            
			            System.out.println(ticks.size());
			            
			            if(oldTicks == null){
			            	oldTicks = ticks;
			            }
			            
			            String alertMsg = "";
			            
			            int newAlerts =0;
			            for(Object key : ticks.keySet()){
			            	JSONObject tick = (JSONObject)ticks.get(key);
			            	
			            	
			            	try{
			            		 String symbol = (String)key;
				            	 double change = Double.parseDouble(String.valueOf(tick.get("change")));
				            	 double ltp =  Double.parseDouble(String.valueOf(tick.get("lastTradedPrice")));
				            	 double oldChange =  Double.parseDouble(String.valueOf(((JSONObject)oldTicks.get(key)).get("change"))); 
				            	
				            	 boolean isShowNotif = false;
				            	
				            	 
				            	 if(oldChange < 1.5 && change > 1.5 
				            	  ||oldChange < 3 && change > 3
				            	  ||oldChange < 5 && change > 5
				            	  ||oldChange < 8 && change > 8
				            	  ||oldChange < 9 && change > 9
				            	  ||oldChange < 13 && change > 13
				            	  ||oldChange < 15 && change > 15
				            			 ){						            		 				            	
				            		 isShowNotif=true;
				            	 }else if(oldChange > -1.5 && change < -1.5
				            			 ||oldChange > -3 && change < -3
				            			 ||oldChange > -5 && change < -5
				            			 ||oldChange > -8 && change < -8
				            			 ||oldChange > -9.5 && change < -9.5
				            			 ||oldChange > -13 && change < -13
				            			 ||oldChange > -15 && change < -15
				            			 ){
				            		 isShowNotif=true;
				            	 }
				            		 
				            	 
				            	 
				            	 
			            		 if(isShowNotif && isShowInToast(symbol)){
			            			 
			            			 if(symbol.length() <= 7){
			            				 symbol = symbol+" ----- ";
			            			 }
			            			 
			            			 String newMsg = (symbol + "  ->  " + df2.format(ltp)  + "  ->  " + df2.format(change)+"%   ");
			            			 
			            			 alertMsg += newMsg;
			            			 newAlerts++;
			            		 }
				            		 		            		 
				            	

			            	}catch(Exception e){
			            		e.printStackTrace();
			            	}
			            	 			            	 
			            			 
			            }
			             
			            
			            oldTicks = ticks;
			            
			            if(alertMsg.trim().length() > 0){
			            	ShowToast(newAlerts +",'"+ alertMsg+"'");
			            }
			            			            
			        } catch (Exception e) {
			            e.printStackTrace();
			        }						
					
					
					
			        
			        
					try {
						Thread.sleep(1000);
					} catch (InterruptedException e) {
						e.printStackTrace();
					}	
					
					
				}
			}
		});
		
		
		
		alertThread.setDaemon(true);				 
		alertThread.start();
		alertThread.join();
	
		
/*		
		
		ShowToast("5, 'Rupa --> 134.5 --> 5%  Rupaddddddhhh --> 134.5 --> 5%  Rupa44444444 --> 134.5 --> 5% '");		
		
		String row = "Rupa -> 134.5789009 -> 5% ";
		int linelength = "-----------------------------------------".length();
		
		row = row+addPadding( linelength - row.length() -4);
	//	ShowToast("5,'"+row+"'");
		
	ShowToast("5, 'XXXXXXXXXXXXXXXXXXXXXXXXXXXX'");		
*/			
		
		
		
	 }
	
	 
	 
	 public static String addPadding(int Pchar){
		 String pading = "";
		 for(int i=0;i<Pchar;i++){
			 pading+="-";
		 }
		 return pading;
	 }	 
	 
	 
	 public static boolean isShowInToast(String key){
		 if(alerts.containsKey(key) && ((System.currentTimeMillis() - alerts.get(key)) < 1*60*1000)){
			return false; 
		 }			 
		 alerts.put(key, System.currentTimeMillis());	
		 return true;
	 }
	 
	 
	 
	 public static void ShowToast(String msg){
		 try {
			 			 
		 
			  //String command = "powershell.exe  your command";
			  //Getting the version

			  String command = "powershell.exe  New-BurntToastNotification -Silent -Text "+msg;
			  // Executing the command
			  Process powerShellProcess = Runtime.getRuntime().exec(command);
			  // Getting the results
			  powerShellProcess.getOutputStream().close();
			  String line;
			  System.out.println("Standard Output:");
			  BufferedReader stdout = new BufferedReader(new InputStreamReader(
			    powerShellProcess.getInputStream()));
			  while ((line = stdout.readLine()) != null) {
			   System.out.println(line);
			  }
			  stdout.close();
			  System.out.println("Standard Error:");
			  BufferedReader stderr = new BufferedReader(new InputStreamReader(
			    powerShellProcess.getErrorStream()));
			  while ((line = stderr.readLine()) != null) {
			   System.out.println(line);
			  }
			  stderr.close();
			  System.out.println("Done");		
		} catch (Exception e) {
			e.printStackTrace();
		}

		 
	 }
	 
	 
}
