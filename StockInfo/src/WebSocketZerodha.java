import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.ArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.logging.Logger;

import javax.websocket.ClientEndpoint;
import javax.websocket.CloseReason;
import javax.websocket.DeploymentException;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;

import org.glassfish.tyrus.client.ClientManager;

@ClientEndpoint
public class WebSocketZerodha {
 
    private static CountDownLatch latch;
 
    private Logger logger = Logger.getLogger(this.getClass().getName());
 
    @OnOpen
    public void onOpen(Session session) {
        // same as above
    }
 
    @OnMessage
    public String onMessage(String message, Session session) {
		return message;
        // same as above
    }
    @OnMessage
    public void onMessage(byte[] message,Session session) {
       System.out.println(message);
    }
    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        logger.info(String.format("Session %s close because of %s", session.getId(), closeReason));
        latch.countDown();
    }
 
    public static void main(String[] args) throws Exception {
//        latch = new CountDownLatch(1);
// 
//        ClientManager client = ClientManager.createClient();
//        try {
//            client.connectToServer(WordgameClientEndpoint.class, new URI("wss://ws.zerodha.com/?api_key=kitefront&user_id=DA6170&public_token=hUDVInUkNtY5em7EOAbWDg47eqZNOgEr&uid=1552862547938&user-agent=kite3-web&version=2.1.0"));
//            latch.await();
// 
//        } catch (DeploymentException | URISyntaxException | InterruptedException e) {
//            throw new RuntimeException(e);
//        }
    	
    	
    	
    	sendGet("https://kite.zerodha.com/oms/portfolio/holdings");
    }
    
    
    
	public static final String USER_AGENT = "Mozilla/5.0";
	private static String cookie = "__cfduid=dbd07d837c2174474b6f7e64eaae5787a1525092037; _ga=GA1.2.1831304341.1530605488; WZRK_G=b7285cb665544f89ab54cf9fc63ba5f8; kfsession=QNkJRoGWyHM2mwWr98oooX4Rw2TNDr2t; mp_7b1e06d0192feeac86689b5599a4b024_mixpanel=%7B%22distinct_id%22%3A%20%2259dbb97e89f14c53d646a93d%22%2C%22%24device_id%22%3A%20%22166a77277bf3ff-084f3360288504-8383268-1fa400-166a77277c0168%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22%24user_id%22%3A%20%2259dbb97e89f14c53d646a93d%22%7D; intercom-session-b6i7a6nb=alpCRTR0WVkwWHB6WW54MHJFWW9jSUkzcENpTGQ5bWVuVFpCUXJnV3F5cDN6NmFzdnh1ZU5jRUFhdVk3YzAzMC0tQ3FOUjhmeFlpT1BWZ3h2OGpvWlJjUT09--149738434fc2c7169717da22d0dbfe5691de044c; _gid=GA1.2.727719908.1552844516; kf_session=CB55bV4rcfLaC4aqBntQHLjhrSsIeX7";

	// HTTP GET request
	public static ArrayList<String> sendGet(String url) throws Exception {
		System.out.println("GET -- "+url);
		URL obj = new URL(url);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();

		// optional default is GET
		con.setRequestMethod("GET");

		// add request header
		con.setRequestProperty("User-Agent", USER_AGENT);

		//con.setRequestProperty("Cookie", cookie);
		con.setRequestProperty("authorization", "enctoken RZuM6NUgxC6hRfL8Zjm2LeSI4KeGaNbOOJG7iVqqUCqyYriptEG9LJ9dyuuVzv7m2+twlQO3k2JfhahEJpUqAkIhvx4gsw==");
		
		
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

}












