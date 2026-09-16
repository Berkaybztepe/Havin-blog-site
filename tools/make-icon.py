# Uygulama ikonunu uretir: assets/img/*.png + android/res/mipmap-*/ic_launcher.png
# Yazi tipi woff2 oldugu icin once ttf'e cevriliyor (PIL woff2 okuyamiyor).
#   python3 tools/make-icon.py

import os, tempfile
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def _ttf(woff2):
    """woff2 -> ttf; PIL woff2 okuyamiyor."""
    out = os.path.join(tempfile.gettempdir(), os.path.basename(woff2).replace('.woff2', '.ttf'))
    if not os.path.exists(out):
        f = TTFont(os.path.join(HERE, woff2)); f.flavor = None; f.save(out)
    return out

DANCING_TTF = _ttf('assets/fonts/dancing-script-400-normal-latin.woff2')

# --- palet: yumusak y2k, minimal kalacak kadar az renk ---
TOP    = (255, 214, 232)   # yumusak pembe
MID    = (240, 216, 246)   # lila
BOT    = (218, 230, 255)   # bebek mavisi
INK    = (170, 58, 100)    # koyu gul — yazi
BOW    = (246, 154, 188)   # fiyonk dolgusu
BOWL   = (198, 86, 127)    # fiyonk cizgisi
FRAME  = (255, 255, 255)

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def bow(d, cx, cy, w, h, lw):
    """Minimal fiyonk: ucgen ilmekler kucuk boyutta yuvarlaklardan cok daha okunakli."""
    d.polygon([(cx - w * 0.14, cy), (cx - w, cy - h), (cx - w, cy + h)], fill=BOW, outline=BOWL)
    d.polygon([(cx + w * 0.14, cy), (cx + w, cy - h), (cx + w, cy + h)], fill=BOW, outline=BOWL)
    r = h * 0.40
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=BOWL)

def make(size, ss=4):
    S = size * ss
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # zemin gecisi: pembe -> lila -> mavi
    for y in range(S):
        t = y / (S - 1)
        c = lerp(TOP, MID, t / 0.55) if t < 0.55 else lerp(MID, BOT, (t - 0.55) / 0.45)
        d.line([(0, y), (S, y)], fill=c + (255,))

    # yuvarlak kose maskesi
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.225), fill=255)
    img.putalpha(mask)

    k = S / 512.0

    # ince ic cerceve — 2000ler sticker hissi, ama sessiz
    d.rounded_rectangle([34 * k, 34 * k, S - 34 * k, S - 34 * k],
                        radius=int(S * 0.17), outline=FRAME + (150,), width=max(1, int(3 * k)))

    # fiyonk
    bow(d, S / 2, 176 * k, 62 * k, 38 * k, max(1, int(5 * k)))

    # "my diary"
    font = ImageFont.truetype(DANCING_TTF, int(112 * k))
    text = 'my diary'
    bb = d.textbbox((0, 0), text, font=font)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    d.text(((S - tw) / 2 - bb[0], 306 * k - th / 2 - bb[1]), text, font=font, fill=INK)

    # altta ince cizgi — defter satiri
    d.line([(S / 2 - 76 * k, 388 * k), (S / 2 + 76 * k, 388 * k)],
           fill=INK + (120,), width=max(1, int(4 * k)))

    return img.resize((size, size), Image.LANCZOS)

if __name__ == '__main__':
    for sz, path in [(192, 'assets/img/icon-192.png'), (512, 'assets/img/icon-512.png'),
                     (180, 'assets/img/icon-180.png'),
                     (48, 'android/res/mipmap-mdpi/ic_launcher.png'),
                     (72, 'android/res/mipmap-hdpi/ic_launcher.png'),
                     (96, 'android/res/mipmap-xhdpi/ic_launcher.png'),
                     (144, 'android/res/mipmap-xxhdpi/ic_launcher.png')]:
        make(sz).save(path)
    print('ikonlar cizildi')
