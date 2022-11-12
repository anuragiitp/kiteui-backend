import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import java.util.Properties;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import okhttp3.FormBody;
import okhttp3.Headers;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;
import okio.GzipSource;
import okio.Okio;

public class kiteAlerts {
	private static String autZerodha;
	
	public kiteAlerts() {
		Properties prop = new Properties();
		InputStream input = null;
		
		try {
			input = new FileInputStream("../StockInfo/config.properties");
			prop.load(input);
			autZerodha = prop.getProperty("zerodha-key");		
			
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
	
	
	
	
	
	
	public  void createAlert(String name,String lhs_exchange,String lhs_tradingsymbol,String lhs_attribute,String operator,String rhs_type,String rhs_constant) {

		OkHttpClient client = new OkHttpClient();
		   RequestBody formBody =new FormBody.Builder()
			        .add("name", name)
			        .add("lhs_exchange", lhs_exchange)
			        .add("lhs_tradingsymbol", lhs_tradingsymbol)
			        .add("lhs_attribute", lhs_attribute)
			        .add("operator", operator)
			        .add("rhs_type", rhs_type)
			        .add("rhs_constant", rhs_constant)
			        .build();
		   
		    Request request = new Request.Builder()
		        .url("https://kite.zerodha.com/oms/alerts")
		        .header("authorization", autZerodha)
		        .header("Content-Type", "application/x-www-form-urlencoded")
		        .post(formBody)
		        .build();

			    try {
					Response response = client.newCall(request).execute();
					System.out.println(response.code());
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}		
				
	
	}

	
	public  void deleteAlert(String namePrefix) {
		String url="https://kite.zerodha.com/oms/alerts?";
		JsonObject jsonObject = getAllAlerts();
		JsonArray alertssArray = jsonObject.getAsJsonArray("data");
		
		for (JsonElement pa : alertssArray) {
		    JsonObject alertObj = pa.getAsJsonObject();
		    String uuid     = alertObj.get("uuid").getAsString();
		    String name = alertObj.get("name").getAsString();
		    if(name.startsWith(namePrefix)) {
		    	url += "uuid="+uuid +"&";
		    }		    
		}
		

		OkHttpClient client = new OkHttpClient();		
		Request request = new Request.Builder().url(url) .header("authorization", autZerodha).delete().build();

        try (Response response = client.newCall(request).execute()) {
            System.out.println( response.body().string());
        } catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
        
	}

	public  JsonObject getAllAlerts() {
		OkHttpClient client = new OkHttpClient();
		   RequestBody formBody =new FormBody.Builder()
			        .add("search", "Jurassic Park")
			        .build();
		   
		    Request request = new Request.Builder()
		        .url("https://kite.zerodha.com/oms/alerts")
		        .header("authorization", autZerodha)
		        .header("Content-Type", "application/x-www-form-urlencoded")
		        .get()
		        .build();
			    try {
					Response response = client.newCall(request).execute();
					if (isGzipped(response)) {
						response =  unzip(response);
			        } 					
					JsonObject jsonObject = new JsonParser().parse(response.body().string()).getAsJsonObject();					
					return jsonObject;
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					return null;
				}		
				
	}

    private static Response unzip(final Response response) throws IOException {

        if (response.body() == null) {
            return response;
        }

        GzipSource gzipSource = new GzipSource(response.body().source());
        String bodyString = Okio.buffer(gzipSource).readUtf8();

        ResponseBody responseBody = ResponseBody.create(response.body().contentType(), bodyString);

        Headers strippedHeaders = response.headers().newBuilder()
                .removeAll("Content-Encoding")
                .removeAll("Content-Length")
                .build();
        return response.newBuilder()
                .headers(strippedHeaders)
                .body(responseBody)
                .message(response.message())
                .build();

    }

    private static Boolean isGzipped(Response response) {
        return response.header("Content-Encoding") != null && response.header("Content-Encoding").equals("gzip");
    }
    
	public static void main(String args[]) {
		kiteAlerts alert = new kiteAlerts();
		//alert.getAllAlerts();
		//alert.createAlert("tf-NIFTY", "INDICES", "NIFTY 50", "LastTradedPrice", ">=", "constant", "17616.3");
		//alert.deleteAlert("tf-");
		//alert.deleteAlert("tr-");
	}
}
