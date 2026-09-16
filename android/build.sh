#!/bin/bash
# APK uretimi — Android Studio ya da Gradle gerekmeden.
#
# Zincir:  aapt2 compile -> aapt2 link -> javac -> dx -> zip -> zipalign -> apksigner
#
# Gerekenler (Ubuntu):
#   apt-get install aapt apksigner android-sdk-build-tools android-sdk-platform-23 zipalign
#   ayrica dalvik-dx (Maven Central: com.jakewharton.android.repackaged:dalvik-dx)
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
BUILD="$HERE/build"
OUT="$HERE/out"

ANDROID_JAR="${ANDROID_JAR:-/usr/lib/android-sdk/platforms/android-23/android.jar}"
DX_JAR="${DX_JAR:-/opt/androidtools/dalvik-dx.jar}"
AAPT2="${AAPT2:-aapt2}"
KEYSTORE="$HERE/havin-release.keystore"
KS_PASS="${KS_PASS:-havingunluk}"

echo "==> temizlik"
rm -rf "$BUILD" "$OUT"
mkdir -p "$BUILD/res" "$BUILD/classes" "$BUILD/assets/www" "$OUT"

echo "==> web dosyalarini assets'e kopyala"
cd "$ROOT"
for item in index.html manifest.webmanifest css js assets; do
  cp -r "$item" "$BUILD/assets/www/"
done
# Servis calisani APK icinde kullanilmiyor
rm -f "$BUILD/assets/www/sw.js"
echo "    $(find "$BUILD/assets/www" -type f | wc -l) dosya kopyalandi"

echo "==> kaynaklari derle (aapt2 compile)"
"$AAPT2" compile --dir "$HERE/res" -o "$BUILD/res.zip"

echo "==> kaynaklari bagla (aapt2 link)"
"$AAPT2" link \
  -I "$ANDROID_JAR" \
  --manifest "$HERE/AndroidManifest.xml" \
  -A "$BUILD/assets" \
  --java "$BUILD" \
  -o "$BUILD/base.apk" \
  "$BUILD/res.zip"

echo "==> Java kaynaklarini derle"
find "$HERE/java" "$BUILD/com" -name '*.java' > "$BUILD/sources.txt" 2>/dev/null || \
  find "$HERE/java" -name '*.java' > "$BUILD/sources.txt"
javac -nowarn -source 8 -target 8 -bootclasspath "$ANDROID_JAR" \
  -classpath "$ANDROID_JAR" -d "$BUILD/classes" @"$BUILD/sources.txt" 2>&1 | grep -v "^Picked up\|bootstrap class path\|source value 8\|target value 8\|To suppress warnings" || true

echo "==> DEX uret"
java -cp "$DX_JAR" com.android.dx.command.Main --dex \
  --output="$BUILD/classes.dex" "$BUILD/classes" 2>&1 | grep -v "^Picked up" || true
[ -f "$BUILD/classes.dex" ] || { echo "HATA: classes.dex uretilemedi"; exit 1; }

echo "==> classes.dex'i APK'ye ekle"
cp "$BUILD/base.apk" "$BUILD/unsigned.apk"
( cd "$BUILD" && zip -q -u unsigned.apk classes.dex )

echo "==> hizala (zipalign)"
zipalign -f -p 4 "$BUILD/unsigned.apk" "$BUILD/aligned.apk"

echo "==> imzala"
if [ ! -f "$KEYSTORE" ]; then
  echo "    yeni anahtar deposu olusturuluyor"
  keytool -genkeypair -v -keystore "$KEYSTORE" -alias havin \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$KS_PASS" -keypass "$KS_PASS" \
    -dname "CN=Gunlugum, OU=Kisisel, O=Havin, L=-, S=-, C=TR" 2>&1 | grep -iv "^Picked up\|warning" || true
fi
apksigner sign --ks "$KEYSTORE" --ks-key-alias havin \
  --ks-pass "pass:$KS_PASS" --key-pass "pass:$KS_PASS" \
  --v1-signing-enabled true --v2-signing-enabled true \
  --out "$OUT/havins-corner.apk" "$BUILD/aligned.apk" 2>&1 | grep -v "^Picked up" || true

echo "==> dogrula"
apksigner verify --print-certs "$OUT/havins-corner.apk" 2>&1 | grep -v "^Picked up\|WARNING" | head -4 || true

SIZE=$(stat -c%s "$OUT/havins-corner.apk")
echo ""
echo "TAMAM: $OUT/havins-corner.apk  ($(( SIZE / 1024 )) KB)"
