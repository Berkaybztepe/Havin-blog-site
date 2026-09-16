package com.havin.gunluk;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Gunlugu saran WebView.
 *
 * Onemli tasarim karari: sayfa file:// ile DEGIL, uydurma bir https adresinden
 * (https://havin.local/) sunuluyor. Istekleri shouldInterceptRequest ile yakalayip
 * APK'nin assets klasorunden karsiliyoruz.
 *
 * Neden: file:// kaynaklarinda WebView, IndexedDB'yi ve guvenli baglam gerektiren
 * WebCrypto'yu kisitliyor. Uygulamanin tamami sifrelemeye ve IndexedDB'ye dayandigi
 * icin gercek bir https kaynagi sart.
 */
public class MainActivity extends Activity {

    private static final String HOST = "havin.local";

    /** Gomulu oynaticinin ihtiyac duydugu alan adlari — bunlar WebView icinde kalir. */
    private static final String[] EMBED_HOSTS = {
        "youtube.com", "youtube-nocookie.com", "ytimg.com",
        "googlevideo.com", "google.com", "gstatic.com",
    };
    private static final String ORIGIN = "https://" + HOST + "/";
    private static final int REQ_FILE = 1001;
    private static final int REQ_SAVE = 1002;

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private byte[] pendingSaveBytes;

    private static final Map<String, String> MIME = new HashMap<String, String>();
    static {
        MIME.put("html", "text/html");
        MIME.put("js", "application/javascript");
        MIME.put("mjs", "application/javascript");
        MIME.put("css", "text/css");
        MIME.put("json", "application/json");
        MIME.put("webmanifest", "application/manifest+json");
        MIME.put("woff2", "font/woff2");
        MIME.put("woff", "font/woff");
        MIME.put("png", "image/png");
        MIME.put("jpg", "image/jpeg");
        MIME.put("jpeg", "image/jpeg");
        MIME.put("svg", "image/svg+xml");
        MIME.put("ico", "image/x-icon");
        MIME.put("txt", "text/plain");
    }

    private static String mimeOf(String path) {
        int dot = path.lastIndexOf('.');
        if (dot < 0) return "application/octet-stream";
        String ext = path.substring(dot + 1).toLowerCase();
        String m = MIME.get(ext);
        return m != null ? m : "application/octet-stream";
    }

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);

        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        // Varlıklara yalnizca kendi araya girme katmanimiz uzerinden erisiliyor.
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        if (Build.VERSION.SDK_INT >= 16) {
            s.setAllowFileAccessFromFileURLs(false);
            s.setAllowUniversalAccessFromFileURLs(false);
        }

        if (Build.VERSION.SDK_INT >= 19) {
            WebView.setWebContentsDebuggingEnabled(false);
        }

        web.addJavascriptInterface(new Bridge(), "AndroidBridge");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (u != null && HOST.equals(u.getHost())) {
                    return serveAsset(u.getPath());
                }
                return null;   // api.anthropic.com, youtube vb. normal aksin
            }

            @Override
            @SuppressWarnings("deprecation")
            public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
                Uri u = Uri.parse(url);
                if (HOST.equals(u.getHost())) return serveAsset(u.getPath());
                return null;
            }

            /**
             * Gomulu oynatici WebView'in ICINDE kalmali. Yaziya ilistirilen sarki
             * bir YouTube iframe'i; bunu disari atsaydik sarki uygulamada hic calmazdi.
             *
             * Not: isForMainFrame() ile ana cerceve ayrimi yapan surum API 24'te geldi,
             * biz API 23'e derliyoruz. Bu yuzden burada yalnizca gomulu oynaticiya izin
             * veriyoruz; gercek dis baglantilari JavaScript tarafi AndroidBridge.openExternal
             * ile aciyor (her Android surumunde ayni sekilde calisiyor).
             */
            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Uri u = Uri.parse(url);
                String host = u.getHost() == null ? "" : u.getHost();
                if (HOST.equals(host)) return false;
                for (String allowed : EMBED_HOSTS) {
                    if (host.equals(allowed) || host.endsWith("." + allowed)) return false;
                }
                return openExternally(u);
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            // Fotograf secme: bu olmadan <input type="file"> WebView'de hic calismaz.
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> cb,
                                             FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                String[] types = params.getAcceptTypes();
                if (types != null && types.length > 0 && types[0] != null && types[0].length() > 0) {
                    intent.setType(types[0]);
                }
                if (params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) {
                    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                }
                try {
                    startActivityForResult(Intent.createChooser(intent, "Dosya seç"), REQ_FILE);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        web.loadUrl(ORIGIN + "index.html");
    }

    private boolean openExternally(Uri u) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, u));
            return true;
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "Could not open the link", Toast.LENGTH_SHORT).show();
            return false;
        }
    }

    private WebResourceResponse serveAsset(String path) {
        if (path == null || path.equals("/")) path = "/index.html";
        String clean = path.startsWith("/") ? path.substring(1) : path;
        // Dizin disina cikma denemelerini engelle
        if (clean.contains("..")) return notFound();
        try {
            InputStream in = getAssets().open("www/" + clean);
            WebResourceResponse res = new WebResourceResponse(mimeOf(clean), "utf-8", in);
            if (Build.VERSION.SDK_INT >= 21) {
                Map<String, String> headers = new HashMap<String, String>();
                headers.put("Cache-Control", "no-cache");
                res.setResponseHeaders(headers);
            }
            return res;
        } catch (IOException e) {
            return notFound();
        }
    }

    private WebResourceResponse notFound() {
        InputStream empty = new java.io.ByteArrayInputStream(new byte[0]);
        WebResourceResponse r = new WebResourceResponse("text/plain", "utf-8", empty);
        if (Build.VERSION.SDK_INT >= 21) r.setStatusCodeAndReasonPhrase(404, "Not Found");
        return r;
    }

    /**
     * JavaScript koprusu. Tek isi var: yedek dosyasini kaydetmek.
     * WebView blob: indirmelerini desteklemedigi icin yedek alma bu yol olmadan calismaz.
     */
    private class Bridge {
        @JavascriptInterface
        public boolean isAndroidApp() { return true; }

        /** Gercek dis baglantilari sistem tarayicisinda acar. */
        @JavascriptInterface
        public void openExternal(final String url) {
            final Uri u = Uri.parse(url);
            if (!"http".equals(u.getScheme()) && !"https".equals(u.getScheme())) return;
            runOnUiThread(new Runnable() { public void run() { openExternally(u); } });
        }

        @JavascriptInterface
        public void saveFile(final String fileName, final String base64) {
            try {
                pendingSaveBytes = Base64.decode(base64, Base64.DEFAULT);
            } catch (IllegalArgumentException e) {
                runOnUiThread(new Runnable() { public void run() {
                    Toast.makeText(MainActivity.this, "Yedek hazırlanamadı", Toast.LENGTH_LONG).show();
                }});
                return;
            }
            runOnUiThread(new Runnable() {
                public void run() {
                    Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("application/json");
                    i.putExtra(Intent.EXTRA_TITLE, fileName);
                    try {
                        startActivityForResult(i, REQ_SAVE);
                    } catch (ActivityNotFoundException e) {
                        pendingSaveBytes = null;
                        Toast.makeText(MainActivity.this,
                            "Dosya kaydedici bulunamadı", Toast.LENGTH_LONG).show();
                    }
                }
            });
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_FILE) {
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null) {
                if (data.getClipData() != null) {
                    int n = data.getClipData().getItemCount();
                    results = new Uri[n];
                    for (int i = 0; i < n; i++) results[i] = data.getClipData().getItemAt(i).getUri();
                } else if (data.getData() != null) {
                    results = new Uri[] { data.getData() };
                }
            }
            if (fileCallback != null) { fileCallback.onReceiveValue(results); fileCallback = null; }
            return;
        }

        if (requestCode == REQ_SAVE) {
            byte[] bytes = pendingSaveBytes;
            pendingSaveBytes = null;
            if (resultCode == RESULT_OK && data != null && data.getData() != null && bytes != null) {
                OutputStream out = null;
                try {
                    out = getContentResolver().openOutputStream(data.getData());
                    out.write(bytes);
                    out.flush();
                    Toast.makeText(this, "Yedek kaydedildi", Toast.LENGTH_LONG).show();
                } catch (IOException e) {
                    Toast.makeText(this, "Yedek yazılamadı", Toast.LENGTH_LONG).show();
                } finally {
                    if (out != null) try { out.close(); } catch (IOException ignored) {}
                }
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }
}
