// PATH: app/src/main/java/com/stopaddict/debugwrapper/MainActivity.java
package com.stopaddict.debugwrapper;

import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    // URL vers ta page StopAddict (version web) définie dans strings.xml
    private String targetUrl;

    // URL du script overlay à injecter (hébergé sur ton repo debug-tool)
    private static final String DEBUG_SCRIPT_URL =
            "https://cyberzamalt.github.io/stopaddict-debug-tool/debug/debug.js";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        targetUrl = getString(R.string.web_url);
        webView = findViewById(R.id.webview);

        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setAllowFileAccess(true);
        ws.setDatabaseEnabled(true);

        webView.setWebChromeClient(new WebChromeClient());

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                injectDebugOverlay(view);
            }
        });

        webView.loadUrl(targetUrl);
    }

    private void injectDebugOverlay(WebView view) {
        // injecte un <script src="...debug.js"> dans la page ouverte
        String js =
            "(function(){try{" +
            "var d=document;" +
            "if(d.getElementById('sa-debug-injected')) return;" +
            "var s=d.createElement('script');" +
            "s.id='sa-debug-injected';" +
            "s.src='" + DEBUG_SCRIPT_URL + "';" +
            "d.head?d.head.appendChild(s):d.documentElement.appendChild(s);" +
            "}catch(e){console&&console.log('inject fail',e);}})();";
        view.evaluateJavascript(js, null);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
