import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Properties;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class AddPortfolioToTradingview {

		private static String cookieTradingview;
	
		public static void main(String args[]) {
			
			Properties prop = new Properties();
			InputStream input = null;
			
			try {
				input = new FileInputStream("config.properties");
				prop.load(input);
				cookieTradingview = prop.getProperty("tradingview_session");	
							
				sendPost("https://in.tradingview.com/api/v1/symbols_list/custom/43617203/append/","[\"NSE:SKFINDIA\",\"NSE:BAJAJELEC\",\"NSE:VRLLOG\",\"NSE:IGPL\",\"NSE:SUPRAJIT\",\"NSE:TEAMLEASE\",\"NSE:ALEMBICLTD\",\"NSE:DELTACORP\",\"NSE:MINDAIND\",\"NSE:AEGISCHEM\",\"NSE:RAMCOCEM\",\"NSE:SOLARA\",\"NSE:CARBORUNIV\",\"NSE:TATAMOTORS\",\"NSE:DIXON\",\"NSE:RAIN\",\"NSE:VSTTILLERS\",\"NSE:SHRIRAMCIT\",\"NSE:TIINDIA\",\"NSE:EXIDEIND\",\"NSE:IOLCP\",\"NSE:AUBANK\",\"NSE:JUBILANT\",\"NSE:NAUKRI\",\"NSE:TIMKEN\",\"NSE:SHREECEM\",\"NSE:SUNFLAG\",\"NSE:BALAMINES\",\"NSE:ADFFOODS\",\"NSE:MMFL\",\"NSE:MOTHERSUMI\",\"NSE:IRCTC\",\"NSE:BHARATFORG\",\"NSE:HDFCAMC\",\"NSE:KRBL\",\"NSE:AMARAJABAT\",\"NSE:VOLTAS\",\"NSE:JSWSTEEL\",\"NSE:APLAPOLLO\",\"NSE:SUNDARMFIN\",\"NSE:GALAXYSURF\",\"NSE:MPHASIS\",\"NSE:KEC\",\"NSE:JMFINANCIL\",\"NSE:AAVAS\",\"NSE:LINDEINDIA\",\"NSE:POLYPLEX\",\"NSE:RUPA\",\"NSE:ASTRAL\",\"NSE:CUPID\",\"NSE:MINDTREE\",\"NSE:PEL\",\"NSE:BURGERKING\",\"NSE:ASHOKLEY\",\"NSE:MAITHANALL\",\"NSE:JKCEMENT\",\"NSE:DCMSHRIRAM\",\"NSE:BOSCHLTD\",\"NSE:BAJAJFINSV\",\"NSE:SIS\",\"NSE:APOLLOTYRE\",\"NSE:HIL\",\"NSE:KEI\",\"NSE:BERGEPAINT\",\"NSE:CENTURYTEX\",\"NSE:NOCIL\",\"NSE:SHARDACROP\",\"NSE:BATAINDIA\",\"NSE:INDHOTEL\",\"NSE:PGHH\",\"NSE:BHARTIARTL\",\"NSE:SONATSOFTW\",\"NSE:GULFOILLUB\",\"NSE:3MINDIA\",\"NSE:KALPATPOWR\",\"NSE:HESTERBIO\",\"NSE:AFFLE\",\"NSE:JINDALSTEL\",\"NSE:CCL\",\"NSE:POWERGRID\",\"NSE:TATASTEEL\",\"NSE:CREDITACC\",\"NSE:MGL\",\"NSE:DLF\",\"NSE:SRTRANSFIN\",\"NSE:ICICIBANK\",\"NSE:INOXLEISUR\",\"NSE:GAIL\",\"NSE:INFY\",\"NSE:POLYCAB\",\"NSE:TECHM\",\"NSE:ACC\",\"NSE:LT\",\"NSE:CANFINHOME\",\"NSE:ESCORTS\",\"NSE:MIDHANI\",\"NSE:AXISBANK\",\"NSE:COROMANDEL\",\"NSE:JUBLFOOD\",\"NSE:SIEMENS\",\"NSE:TITAN\",\"NSE:CHOLAFIN\",\"NSE:GLAXO\",\"NSE:ZEEL\",\"NSE:ONGC\",\"NSE:TATACHEM\",\"NSE:VEDL\",\"NSE:HINDPETRO\",\"NSE:SASKEN\",\"NSE:WSTCSTPAPR\",\"NSE:TVSMOTOR\",\"NSE:BAJAJCON\",\"NSE:GODREJPROP\",\"NSE:ALKYLAMINE\",\"NSE:HEROMOTOCO\",\"NSE:SUDARSCHEM\",\"NSE:ROSSARI\",\"NSE:MFSL\",\"NSE:TV18BRDCST\",\"NSE:HONAUT\",\"NSE:TCS\",\"NSE:BAJAJHLDNG\",\"NSE:ASIANPAINT\",\"NSE:IOC\",\"NSE:ZYDUSWELL\",\"NSE:IBULHSGFIN\",\"NSE:DEEPAKNTR\",\"NSE:PFC\",\"NSE:AUROPHARMA\",\"NSE:NMDC\",\"NSE:HAVELLS\",\"NSE:RELIANCE\",\"NSE:NESCO\",\"NSE:THYROCARE\",\"NSE:RADICO\",\"NSE:HINDZINC\",\"NSE:MAHSCOOTER\",\"NSE:PVR\",\"NSE:DMART\",\"NSE:EICHERMOT\",\"NSE:TORNTPOWER\",\"NSE:CRISIL\",\"NSE:IGL\",\"NSE:LUMAXTECH\",\"NSE:DRREDDY\",\"NSE:BPCL\",\"NSE:SRF\",\"NSE:KPRMILL\",\"NSE:BDL\",\"NSE:AMBUJACEM\",\"NSE:SHILPAMED\",\"NSE:LUXIND\",\"NSE:RAYMOND\",\"NSE:MARUTI\",\"NSE:MUTHOOTFIN\",\"NSE:TATAMETALI\",\"NSE:SBIN\",\"NSE:HEIDELBERG\",\"NSE:INDUSINDBK\",\"NSE:LICHSGFIN\",\"NSE:VINATIORGA\",\"NSE:INDIANB\",\"NSE:ICICIPRULI\",\"NSE:CYIENT\",\"NSE:INDIGO\",\"NSE:DAAWAT\",\"NSE:TATAELXSI\",\"NSE:OIL\",\"NSE:HNDFDS\",\"NSE:BASF\",\"NSE:NTPC\",\"NSE:AVANTIFEED\",\"NSE:APLLTD\",\"NSE:TATACONSUM\",\"NSE:SYMPHONY\",\"NSE:BAYERCROP\",\"NSE:MARICO\",\"NSE:INDRAMEDCO\",\"NSE:LYKALABS\",\"NSE:OBEROIRLTY\",\"NSE:HATSUN\",\"NSE:GARFIBRES\",\"NSE:WABCOINDIA\",\"NSE:SOLARINDS\",\"NSE:MHRIL\",\"NSE:NESTLEIND\",\"BSE:CHEVIOT\",\"NSE:SANOFI\",\"NSE:LALPATHLAB\",\"NSE:SYNGENE\",\"NSE:SOBHA\",\"NSE:NEOGEN\",\"NSE:PHILIPCARB\",\"NSE:IPCALAB\",\"NSE:VSTIND\",\"NSE:COALINDIA\",\"NSE:TRENT\",\"NSE:FORCEMOT\",\"NSE:HDFCBANK\",\"NSE:MINDACORP\",\"NSE:CUB\",\"NSE:BOMDYEING\",\"NSE:HDFC\",\"NSE:BIOCON\",\"NSE:METROPOLIS\",\"NSE:CERA\",\"NSE:EVERESTIND\",\"NSE:JKTYRE\",\"NSE:TAJGVK\",\"NSE:KANSAINER\",\"NSE:HDFCLIFE\",\"NSE:ICICIGI\",\"NSE:KSCL\",\"NSE:UPL\",\"NSE:BANDHANBNK\",\"NSE:MAHSEAMLES\",\"NSE:PIDILITIND\",\"NSE:FOSECOIND\",\"NSE:LUPIN\",\"BSE:APOLLOTRI\",\"NSE:STARCEMENT\",\"BSE:TRANSPEK\",\"NSE:PGHL\",\"NSE:NAM_INDIA\",\"NSE:SBICARD\",\"NSE:TORNTPHARM\",\"NSE:MRF\",\"NSE:ABBOTINDIA\",\"NSE:GMMPFAUDLR\",\"NSE:BAJAJ_AUTO\",\"NSE:GODFRYPHLP\",\"NSE:JCHAC\",\"NSE:ENDURANCE\",\"NSE:ASALCBR\",\"NSE:AARTIIND\",\"NSE:SHOPERSTOP\",\"NSE:ORIENTELEC\",\"NSE:JKPAPER\",\"NSE:RITES\",\"NSE:TANLA\",\"NSE:SUNPHARMA\",\"NSE:GLENMARK\",\"NSE:RALLIS\",\"NSE:RAMCOIND\",\"NSE:CIPLA\",\"NSE:SUPREMEIND\",\"NSE:MCDOWELL_N\",\"BSE:HAWKINCOOK\",\"NSE:RAJESHEXPO\",\"NSE:INDIACEM\",\"NSE:TASTYBITE\",\"NSE:APEX\",\"NSE:SPICEJET\",\"NSE:AJANTPHARM\",\"NSE:ATUL\",\"NSE:NIACL\",\"NSE:WELCORP\",\"NSE:ASTRAZEN\",\"NSE:WOCKPHARMA\",\"NSE:CGCL\",\"NSE:AUTOAXLES\",\"NSE:ISEC\",\"NSE:PHOENIXLTD\",\"NSE:INFIBEAM\",\"NSE:APOLLOHOSP\",\"NSE:BHARATRAS\",\"NSE:CADILAHC\",\"NSE:MOIL\",\"NSE:TATAINVEST\",\"NSE:VIPIND\",\"NSE:PFIZER\",\"NSE:PIIND\",\"NSE:VMART\",\"NSE:SUVENPHAR\",\"NSE:KENNAMET\",\"NSE:TATACOFFEE\",\"NSE:STARPAPER\",\"NSE:ITC\",\"NSE:LTI\",\"NSE:ITI\",\"NSE:LUMAXIND\",\"NSE:SBILIFE\",\"NSE:NAVINFLUOR\",\"NSE:AARTIDRUGS\",\"NSE:DABUR\",\"NSE:GILLETTE\",\"NSE:PAGEIND\",\"NSE:JBCHEPHARM\",\"NSE:PETRONET\",\"NSE:UBL\",\"NSE:BAJFINANCE\",\"NSE:SFL\",\"NSE:NHPC\",\"NSE:MASFIN\",\"NSE:HERITGFOOD\",\"NSE:VENKEYS\",\"NSE:FINCABLES\",\"NSE:RELAXO\",\"NSE:TTKPRESTIG\",\"NSE:SUBROS\",\"NSE:LTTS\",\"NSE:PRINCEPIPE\",\"NSE:SUNDRMFAST\",\"NSE:MUTHOOTCAP\",\"NSE:AIAENG\",\"NSE:DIVISLAB\",\"NSE:CHOLAHLDNG\",\"NSE:KAMATHOTEL\",\"NSE:GODREJIND\",\"NSE:FRETAIL\",\"NSE:CAPLIPOINT\",\"BSE:CAPPL\",\"NSE:APOLLOPIPE\",\"NSE:WATERBASE\",\"NSE:APCOTEXIND\",\"NSE:KOTAKBANK\",\"NSE:TCIEXP\",\"NSE:IEX\",\"NSE:SRIPIPES\",\"NSE:ABFRL\",\"NSE:ALKEM\",\"NSE:HINDUNILVR\",\"NSE:RBLBANK\",\"NSE:ECLERX\",\"NSE:FINEORG\",\"NSE:EXCELINDUS\",\"NSE:GODREJAGRO\",\"NSE:VBL\",\"NSE:GRANULES\",\"NSE:VAIBHAVGBL\",\"NSE:OFSS\",\"NSE:KIRIINDUS\",\"NSE:GODREJCP\",\"NSE:MANAPPURAM\",\"NSE:BRITANNIA\",\"NSE:MCX\",\"NSE:WHIRLPOOL\",\"NSE:UNIVCABLES\",\"NSE:MEGH\",\"NSE:CEATLTD\",\"NSE:GNFC\",\"NSE:ASTEC\",\"NSE:OCCL\",\"NSE:SURYAROSNI\",\"NSE:DEEPAKFERT\",\"NSE:VGUARD\",\"BSE:ORIENTCQ\",\"NSE:UFLEX\",\"BSE:DIAMINESQ\",\"NSE:DIAMONDYD\",\"NSE:NELCO\",\"NSE:NUCLEUS\",\"NSE:GNA\",\"NSE:FINPIPE\",\"NSE:MASTEK\",\"NSE:CHAMBLFERT\",\"NSE:SUMICHEM\",\"NSE:PNB\",\"BSE:ALUFLUOR\",\"NSE:INDIAMART\"]");
				
			} catch (IOException ex) {
				ex.printStackTrace();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} finally {
				if (input != null) {
					try {
						input.close();
					} catch (IOException e) {
						e.printStackTrace();
					}
				}
			}
		}
		
		
		
		
		public static final String USER_AGENT = "Mozilla/5.0";

		// HTTP GET request
		public static void sendPost(String url,String postData) throws Exception {
			System.out.println("POST -- "+url);
			URL obj = new URL(url);
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();

			// optional default is GET
			con.setRequestMethod("POST");

			// add request header
			con.setRequestProperty("User-Agent", USER_AGENT);

			con.setRequestProperty("Cookie", cookieTradingview);

			
			byte[] postDataBytes = postData.toString().getBytes("UTF-8");
			con.setDoOutput(true);
			con.setRequestProperty("Content-Length", String.valueOf(postDataBytes.length));
			con.getOutputStream().write(postDataBytes);
			
			int responseCode = con.getResponseCode();

			if (responseCode == 200) {
				System.out.println("POST successfull");
			    
			}
		}
		
		
		
}





