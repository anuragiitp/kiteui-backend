
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
import java.util.Arrays;
import java.util.Calendar;
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



public class ChartScanner {	
	
	
	
	
	public static void main(String args[]){	
		Map<String,String> scriptTokenMap= new HashMap<String,String>();
		Set<String> chartSet= new HashSet<String>();
		
		
		try{
			String file = "inputs/CHART_SYMBOLS";
			BufferedReader br = null;
			String line = "";
		 
			try {	 
				br = new BufferedReader(new FileReader(file));
				while ((line = br.readLine()) != null) {
					line=line.trim();
					if(line.endsWith("-EQ")){
						line = line.replace("-EQ","");
					}
					chartSet.add(line);															
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
		
		
		
		
		try{
			String file = "inputs/NSE";
			BufferedReader br = null;
			String line = "";
		 
			try {	 
				br = new BufferedReader(new FileReader(file));
				while ((line = br.readLine()) != null) {
					line=line.trim();
					String splits[] =  line.split(",");
					
					String symbol = splits[2];
					if(!scriptTokenMap.containsKey(symbol)){
						scriptTokenMap.put(symbol, splits[0]);
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
		
		
		try{
			String file = "inputs/BSE";
			BufferedReader br = null;
			String line = "";
		 
			try {	 
				br = new BufferedReader(new FileReader(file));
				while ((line = br.readLine()) != null) {
					line=line.trim();
					String splits[] =  line.split(",");
					
					String symbol = splits[2];
					if(!scriptTokenMap.containsKey(symbol)){
						scriptTokenMap.put(symbol, splits[0]);
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
				
		
		
		

    		
    		String cArray[]= new String[chartSet.size()]; 
    		int i=0;
    		for(String s: chartSet){
    			String elemnt = "['"+scriptTokenMap.get(s)+"','"+s+"']";
    			cArray[i++] = elemnt;
    		}
    		
    		System.out.println(Arrays.toString(cArray));
    		    		

    	
    	
				
	}
	

	

	
	
    
    
    
    
  

}








