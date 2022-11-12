import java.io.BufferedReader;
import java.io.Console;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
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

public class ZerodhaApi {
	
	
	private static String autZerodha = "enctoken JODP/JF8qnrkOUN6QYT+wsmVos126zjm5XCygy20h4xO97Q67HsNxxiC/yUtEbojni8pmJRK3v8rYz/NiGQ4C9jo7EqIkQ==";
	
		

	public static void main(String[] args) {
			
	
		try {
			sendGetZerodha("https://api.kite.trade/instruments");
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}	
						
	}
	
	
	
	public static final String USER_AGENT = "Mozilla/5.0";
	
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
