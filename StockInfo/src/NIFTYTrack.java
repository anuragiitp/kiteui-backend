import java.io.BufferedReader;
import java.io.Console;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.Clip;
import javax.sound.sampled.LineUnavailableException;
import javax.sound.sampled.UnsupportedAudioFileException;

import org.apache.commons.lang3.text.StrBuilder;
import org.fusesource.jansi.Ansi;
import org.fusesource.jansi.AnsiConsole;
import org.fusesource.jansi.internal.Kernel32.COORD;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import com.jaunt.Element;
import com.jaunt.Elements;
import com.jaunt.UserAgent;

import static org.fusesource.jansi.Ansi.*;
import static org.fusesource.jansi.Ansi.Color.*;

public class NIFTYTrack {
	
	private static String cookieInv = "ses_id=MnxlJGJtY2szd2FnZzY5O2U2M280OjU3PThhZmdiZnA1IWZoMmU%2FeWFuYS9gYzUpZGNkZTdiNDVlYDU9ZmZnZjI3ZTRiN2M9M2RhaWdgOT1lMDNqNGY1ZD09YWZnNWY4NTRmMzI9P2hhM2E0YDg1bWR2ZHg3czQlZTc1ZWYnZyAyPWUkYjFjbDNtYWVnYTk8ZTYzazQ7NWQ9NGE2Z2RmfjV%2B";
	
	private static String[] portfoliosID={"3136939","5328372","3993835",
		"3796935","3280397","3688904",
		"3688942","3688954","4325062",											
		"4544970","5959208","5896022",
		"5896045","5896051","5896058",
		"5896059","5896070","5896072",
		"5896074","5896077","5896079","5896106"
	};
	
	private static String URL_PRE = "https://www.investing.com/portfolio/service/Export?exptype=csv&portfolio_id=";
	
	
	
	private static LinkedList<Map<String,String[]>> priceHistroy = new LinkedList<Map<String,String[]>>();
	private static Map<String,String[]>lastPriceMap  = new HashMap<String,String[]>();		
	private static  LRUCache LRUCache = new LRUCache(100);	
	private static  Set<String> TOPGAINERS = new HashSet<String>();
	private static  Set<String> TOPLOSERS = new HashSet<String>();
	
		
	public static double getDouble(String value) {
		value =  value.trim().replace("+-", "+").replaceAll("^\"|\"$", "").replace("%", "");
		return ( new BigDecimal(value)).doubleValue();	
	}
	
	
	public static void main(String[] args) {
		System.setProperty("java.util.Arrays.useLegacyMergeSort", "true");
		AnsiConsole.systemInstall();
				
		Properties prop = new Properties();
		InputStream input = null;

		try {
			input = new FileInputStream("config.properties");
			prop.load(input);
			cookieInv = prop.getProperty("inv_session");
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
		
		Thread nseThread = new Thread(new Runnable() {			
				@Override
				public void run() {	
					while(true){			
						Map<String,String[]>currentPriceMap  = new HashMap<String,String[]>();	
						for(String pid:portfoliosID){
							try {
								ArrayList<String> rows = sendGet(URL_PRE+pid);
								for(String row:rows){
									String colums [] = row.split(",(?=([^\"]*\"[^\"]*\")*[^\"]*$)");
									currentPriceMap.put(colums[1], colums);
									lastPriceMap.put(colums[1], colums);
								}								
																
								checkAlert(currentPriceMap);
																
								JSONObject outputJson = new JSONObject();
								
																
								 List<String> listGain = new ArrayList<String>(TOPGAINERS); 
								 Collections.sort(listGain, new Comparator<String>() {
									  @Override
									  public int compare(String u1, String u2) {
											double oldValue = getDouble(lastPriceMap.get(u1)[13]);
											double newValue = getDouble(lastPriceMap.get(u2)[13]);	
											return -1*Double.compare(oldValue, newValue);
									  }
								 });
								JSONArray jsonGain = new JSONArray();
								for(String symbol : listGain){
									JSONArray jr = new JSONArray();
									for(String s: lastPriceMap.get(symbol)){
										jr.add(s.trim().replaceAll("^\"|\"$", ""));	
									}
									jsonGain.add(jr);
								}							 
								 
								outputJson.put("gainers", jsonGain);
								
								
								 List<String> listLoser = new ArrayList<String>(TOPLOSERS); 
								 Collections.sort(listLoser, new Comparator<String>() {
									  @Override
									  public int compare(String u1, String u2) {
											double oldValue = getDouble(lastPriceMap.get(u1)[13]);
											double newValue = getDouble(lastPriceMap.get(u2)[13]);	
											return Double.compare(oldValue, newValue);
									  }
								 });
								JSONArray jsonLoser = new JSONArray();
								for(String symbol : listLoser){
									JSONArray jr = new JSONArray();
									for(String s: lastPriceMap.get(symbol)){
										jr.add(s.trim().replaceAll("^\"|\"$", ""));	
									}
									jsonLoser.add(jr);
								}							 
								outputJson.put("losers", jsonLoser); 
								
								
								
								
								JSONArray jsonChange = new JSONArray();
								for(AlertMsg msg : LRUCache.values()){
									JSONArray jr = new JSONArray();
									for(String s: lastPriceMap.get(msg.symbol)){
										jr.add(s.trim().replaceAll("^\"|\"$", ""));	
									}
									jsonChange.add(jr);
								}
								
								outputJson.put("alerts", jsonChange); 
								
																									
								Calendar rightNow = Calendar.getInstance();
								int time = rightNow.get(Calendar.HOUR_OF_DAY)*60+rightNow.get(Calendar.MINUTE);
								
								outputJson.put("time", time);
								
							    FileWriter writer = new FileWriter("NIFTYTrack.json");	 		    
							    writer.append(outputJson.toJSONString());
							    writer.flush();
							    writer.close();								
								
							} catch (Exception e) {
								e.printStackTrace();
							}finally{
								try {
									Thread.sleep(5000);
								} catch (InterruptedException e) {
									e.printStackTrace();
								}								
							}														
						}

						if(priceHistroy.size() >= 10 ){
							priceHistroy.removeLast();
						}							
						priceHistroy.addFirst(currentPriceMap);
						
					
						try {
							Thread.sleep(5000);
						} catch (InterruptedException e) {
							e.printStackTrace();
						}				
					}				
				}
				
				
				
				public  void checkAlert(Map<String,String[]>currentPriceMap ) {
					if(priceHistroy.size() >= 2 ){
						
						// add %change alerts if change by more than 3 pec in 10min
						Map<String,String[]>oldPriceMap  = priceHistroy.getLast();
						Set<String> oldAlerts = new HashSet<String>();
						
						for(AlertMsg msg : LRUCache.values()){
							if(System.currentTimeMillis() - msg.createTime > 900*1000){
								oldAlerts.add(msg.symbol);
							}
						}						
						
						for(String s1:oldAlerts){
							LRUCache.remove(s1);
						}
												
						for(String symbol : oldPriceMap.keySet()){
							if(currentPriceMap.containsKey(symbol)){
								try{
									double oldValue = getDouble(oldPriceMap.get(symbol)[13]);
									double newValue = getDouble(currentPriceMap.get(symbol)[13]);									
									double priceChange = newValue - oldValue;
									
									
									if( newValue > 2.8 ){
										TOPGAINERS.add(symbol);
									}else {
										TOPGAINERS.remove(symbol);
									}
									
									if( newValue < -2.8 ){
										TOPLOSERS.add(symbol);
									}else {
										TOPLOSERS.remove(symbol);
									}
									
									if(Math.abs(priceChange) > 2.5){
										AlertMsg amsg =null;
										if(!LRUCache.containsKey(symbol)){
											amsg = new AlertMsg(currentPriceMap.get(symbol),symbol, priceChange);
											LRUCache.put(symbol, amsg);
										}else{
											for(AlertMsg msg : LRUCache.values()){
												if(symbol.equalsIgnoreCase(msg.symbol)){
													if(Math.abs(priceChange) > Math.abs(msg.triggOnchange)){
														LRUCache.get(symbol);
														msg.createTime=System.currentTimeMillis();
													}
													amsg = msg;
													break;
												}
											}
										}
										
										System.out.println(symbol +"   " + priceChange);
										
										if(amsg !=null && amsg.count < 3 && Math.abs(priceChange) > 3.5 ){
											amsg.count++;
										//	playSound(new File("./Door Bell-SoundBible.com-1986366504.wav"));
										}
									}
									

								}catch (Exception e) {
									e.printStackTrace();
								}	
							}
						}							 
					}		
				}
		}) ;		
		nseThread.setDaemon(false);
		nseThread.start();

		
		
			 		
		
	}
	
	
	

	
	
	
	
	
	
	
	
	
	public static final String USER_AGENT = "Mozilla/5.0";

	// HTTP GET request
	public static ArrayList<String> sendGet(String url) throws Exception {
		System.out.println("GET -- "+url);
		URL obj = new URL(url);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();

		// optional default is GET
		con.setRequestMethod("GET");

		// add request header
		con.setRequestProperty("User-Agent", USER_AGENT);

		con.setRequestProperty("Cookie", cookieInv);

		int responseCode = con.getResponseCode();
		ArrayList<String> rows = new ArrayList<String>();
		if (responseCode == 200) {
			BufferedReader in = new BufferedReader(new InputStreamReader(
					con.getInputStream()));
			String inputLine;
			inputLine = in.readLine();
			while ((inputLine = in.readLine()) != null) {
				rows.add(inputLine);
			}
			in.close();
		}
		System.out.println("RES -- "+rows.size());
		return rows;
	}

	

	
	
	
	
	
	private static void playSound(File f) {
	    Runnable r = new Runnable() {
	        private File f;

	        public void run() {
	            playSoundInternal(this.f);
	        }

	        public Runnable setFile(File f) {
	            this.f = f;
	            return this;
	        }
	    }.setFile(f);

	    new Thread(r).start();
	}

	private static void playSoundInternal(File f) {
	    try {
	        AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(f);
	        try {
	            Clip clip = AudioSystem.getClip();
	            clip.open(audioInputStream);
	            try {
	                clip.start();
	                try {
	                    Thread.sleep(100);
	                } catch (InterruptedException e) {
	                    e.printStackTrace();
	                }
	                clip.drain();
	            } finally {
	                clip.close();
	            }
	        } catch (LineUnavailableException e) {
	            e.printStackTrace();
	        } finally {
	            audioInputStream.close();
	        }
	    } catch (UnsupportedAudioFileException e) {
	        e.printStackTrace();
	    } catch (FileNotFoundException e) {
	        e.printStackTrace();
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	}
	
	
}

