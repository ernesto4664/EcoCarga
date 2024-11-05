package mn.ecocarga.starter;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.os.Build;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Permitir contenido mixto en WebView (Solo en desarrollo)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            WebView webView = new WebView(this);  // Crear instancia de WebView
            WebSettings webSettings = webView.getSettings();
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);  // Permitir contenido mixto
        }
    }
}