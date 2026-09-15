// Cikartmalar. Hepsi satir ici SVG — dis dosya yok, cevrimdisi calisir,
// her boyutta net gorunur ve tema rengine uyum saglayabilir.

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">${body}</svg>`;

export const STICKERS = [
  { id: 'fiyonk', label: 'fiyonk', svg: svg(100, 70, `
    <g fill="#f4a6c0" stroke="#c9567f" stroke-width="2.5" stroke-linejoin="round">
      <path d="M50 35 C34 12, 6 12, 8 33 C10 52, 36 48, 50 35 Z"/>
      <path d="M50 35 C66 12, 94 12, 92 33 C90 52, 64 48, 50 35 Z"/>
      <path d="M44 34 h12 a5 5 0 0 1 0 10 h-12 a5 5 0 0 1 0 -10 Z" fill="#ec8fae"/>
      <path d="M45 44 C42 56, 36 62, 30 66" fill="none"/>
      <path d="M55 44 C58 56, 64 62, 70 66" fill="none"/>
    </g>`) },

  { id: 'kalp', label: 'kalp', svg: svg(100, 92, `
    <path d="M50 86 C10 58, 4 36, 16 22 C28 8, 45 14, 50 28 C55 14, 72 8, 84 22 C96 36, 90 58, 50 86 Z"
      fill="#ef7fa4" stroke="#c4396a" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="34" cy="34" rx="8" ry="5" fill="#fff" opacity=".55" transform="rotate(-28 34 34)"/>`) },

  { id: 'yildiz', label: 'yıldız', svg: svg(100, 96, `
    <path d="M50 4 L61 36 L95 36 L67 56 L78 90 L50 69 L22 90 L33 56 L5 36 L39 36 Z"
      fill="#ffd66b" stroke="#d99a1f" stroke-width="3" stroke-linejoin="round"/>`) },

  { id: 'parilti', label: 'parıltı', svg: svg(100, 100, `
    <g fill="#fff0a8" stroke="#e8c44a" stroke-width="2">
      <path d="M50 6 C54 34, 66 46, 94 50 C66 54, 54 66, 50 94 C46 66, 34 54, 6 50 C34 46, 46 34, 50 6 Z"/>
    </g>`) },

  { id: 'kelebek', label: 'kelebek', svg: svg(100, 84, `
    <g stroke="#7c4fa0" stroke-width="2.5" stroke-linejoin="round">
      <path d="M48 42 C30 10, 4 14, 8 34 C11 50, 32 50, 48 42 Z" fill="#c9a2e8"/>
      <path d="M52 42 C70 10, 96 14, 92 34 C89 50, 68 50, 52 42 Z" fill="#c9a2e8"/>
      <path d="M48 42 C32 62, 14 70, 18 78 C24 88, 44 68, 48 46 Z" fill="#b489dd"/>
      <path d="M52 42 C68 62, 86 70, 82 78 C76 88, 56 68, 52 46 Z" fill="#b489dd"/>
      <rect x="47" y="30" width="6" height="34" rx="3" fill="#5f3785" stroke="none"/>
      <path d="M49 30 C44 20, 38 16, 34 15" fill="none"/>
      <path d="M51 30 C56 20, 62 16, 66 15" fill="none"/>
    </g>`) },

  { id: 'kiraz', label: 'kiraz', svg: svg(100, 100, `
    <g>
      <path d="M50 14 C42 34, 30 44, 26 60" fill="none" stroke="#4f8f4a" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 14 C58 34, 70 44, 74 60" fill="none" stroke="#4f8f4a" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 14 C62 6, 78 8, 84 16 C72 22, 58 20, 50 14 Z" fill="#5ea557"/>
      <circle cx="26" cy="74" r="15" fill="#e0416a" stroke="#a81f45" stroke-width="3"/>
      <circle cx="74" cy="74" r="15" fill="#e0416a" stroke="#a81f45" stroke-width="3"/>
      <ellipse cx="21" cy="68" rx="4" ry="3" fill="#fff" opacity=".5"/>
      <ellipse cx="69" cy="68" rx="4" ry="3" fill="#fff" opacity=".5"/>
    </g>`) },

  { id: 'cicek', label: 'papatya', svg: svg(100, 100, `
    <g fill="#fff" stroke="#e6cfa0" stroke-width="2">
      <ellipse cx="50" cy="22" rx="10" ry="18"/><ellipse cx="50" cy="78" rx="10" ry="18"/>
      <ellipse cx="22" cy="50" rx="18" ry="10"/><ellipse cx="78" cy="50" rx="18" ry="10"/>
      <ellipse cx="30" cy="30" rx="9" ry="16" transform="rotate(-45 30 30)"/>
      <ellipse cx="70" cy="30" rx="9" ry="16" transform="rotate(45 70 30)"/>
      <ellipse cx="30" cy="70" rx="9" ry="16" transform="rotate(45 30 70)"/>
      <ellipse cx="70" cy="70" rx="9" ry="16" transform="rotate(-45 70 70)"/>
    </g>
    <circle cx="50" cy="50" r="14" fill="#ffd45e" stroke="#dba82c" stroke-width="2.5"/>`) },

  { id: 'gul', label: 'gül', svg: svg(100, 100, `
    <g stroke="#a82149" stroke-width="2.5" fill="#e35d86">
      <circle cx="50" cy="50" r="34" fill="#e35d86"/>
      <path d="M50 22 C64 26, 72 38, 68 52 C64 64, 50 68, 42 60 C36 54, 38 44, 46 42 C52 41, 56 46, 54 51"
        fill="none" stroke-linecap="round"/>
    </g>`) },

  { id: 'ay', label: 'ay', svg: svg(100, 100, `
    <path d="M62 8 C36 14, 18 36, 22 62 C26 86, 50 98, 72 90 C52 84, 40 66, 42 48 C44 30, 52 16, 62 8 Z"
      fill="#f6e9a8" stroke="#d3b64c" stroke-width="3" stroke-linejoin="round"/>`) },

  { id: 'bulut', label: 'bulut', svg: svg(120, 70, `
    <path d="M28 56 C12 56, 8 40, 22 34 C20 18, 42 10, 52 22 C60 8, 86 10, 88 28 C104 28, 108 52, 90 56 Z"
      fill="#dbeafe" stroke="#94b8e0" stroke-width="3" stroke-linejoin="round"/>`) },

  { id: 'disko', label: 'disko topu', svg: svg(100, 100, `
    <circle cx="50" cy="50" r="38" fill="#b9c7d6" stroke="#7d8fa3" stroke-width="3"/>
    <g stroke="#8fa0b3" stroke-width="1.6" opacity=".9">
      <path d="M12 50h76M50 12v76M22 26 C40 40 60 40 78 26M22 74 C40 60 60 60 78 74"/>
      <path d="M26 22 C40 40 40 60 26 78M74 22 C60 40 60 60 74 78"/>
    </g>
    <circle cx="36" cy="34" r="7" fill="#fff" opacity=".7"/>`) },

  { id: 'melek', label: 'melek kanadı', svg: svg(120, 80, `
    <g fill="#fdf6ff" stroke="#c9b3d6" stroke-width="2.5" stroke-linejoin="round">
      <path d="M58 44 C44 20, 20 16, 10 28 C2 38, 16 44, 10 54 C4 64, 26 68, 40 60 C50 55, 56 50, 58 44 Z"/>
      <path d="M62 44 C76 20, 100 16, 110 28 C118 38, 104 44, 110 54 C116 64, 94 68, 80 60 C70 55, 64 50, 62 44 Z"/>
    </g>`) },

  { id: 'bant', label: 'washi bant', svg: svg(140, 46, `
    <path d="M4 12 L136 6 L134 40 L6 36 Z" fill="#f7c9d9" opacity=".82" stroke="#e59fb8" stroke-width="1.5"/>
    <g stroke="#fff" stroke-width="3" opacity=".6">
      <path d="M22 8 L14 40M46 7 L38 39M70 6 L62 38M94 6 L86 38M118 5 L110 37"/>
    </g>`) },

  { id: 'bant2', label: 'bant · mavi', svg: svg(140, 46, `
    <path d="M6 8 L134 12 L132 38 L4 34 Z" fill="#cfe3f7" opacity=".82" stroke="#9cc0e3" stroke-width="1.5"/>
    <g fill="#fff" opacity=".65">
      <circle cx="26" cy="22" r="4"/><circle cx="56" cy="24" r="4"/>
      <circle cx="86" cy="22" r="4"/><circle cx="116" cy="24" r="4"/>
    </g>`) },

  { id: 'dantel', label: 'dantel şerit', svg: svg(140, 40, `
    <rect x="4" y="4" width="132" height="18" fill="#fffaf2" stroke="#e6d6c0" stroke-width="1.5"/>
    <g fill="#fffaf2" stroke="#e6d6c0" stroke-width="1.5">
      <path d="M4 22 q9 14 18 0 q9 14 18 0 q9 14 18 0 q9 14 18 0 q9 14 18 0 q9 14 18 0 q9 14 18 0"/>
    </g>
    <g fill="#e6d6c0" opacity=".7">
      <circle cx="16" cy="13" r="2"/><circle cx="40" cy="13" r="2"/><circle cx="64" cy="13" r="2"/>
      <circle cx="88" cy="13" r="2"/><circle cx="112" cy="13" r="2"/></g>`) },

  { id: 'kupa', label: 'kahve', svg: svg(100, 88, `
    <path d="M18 26 h56 v30 a24 24 0 0 1 -56 0 Z" fill="#fff" stroke="#b08968" stroke-width="3"/>
    <path d="M74 32 h8 a12 12 0 0 1 0 24 h-8" fill="none" stroke="#b08968" stroke-width="3"/>
    <path d="M18 34 h56 v22 a22 22 0 0 1 -56 0 Z" fill="#c79367" opacity=".55"/>
    <g stroke="#c9b8a8" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".9">
      <path d="M34 18 q4 -7 0 -13M48 16 q4 -7 0 -13M62 18 q4 -7 0 -13"/></g>`) },

  { id: 'kaset', label: 'kaset', svg: svg(120, 80, `
    <rect x="6" y="10" width="108" height="60" rx="7" fill="#f2b8cd" stroke="#c4708f" stroke-width="3"/>
    <rect x="20" y="24" width="80" height="26" rx="4" fill="#fff6fa" stroke="#c4708f" stroke-width="2"/>
    <circle cx="42" cy="37" r="9" fill="#e9e2da" stroke="#9a8c80" stroke-width="2.5"/>
    <circle cx="78" cy="37" r="9" fill="#e9e2da" stroke="#9a8c80" stroke-width="2.5"/>
    <rect x="30" y="58" width="60" height="6" rx="3" fill="#c4708f" opacity=".6"/>`) },

  { id: 'mektup', label: 'mektup', svg: svg(120, 84, `
    <rect x="6" y="10" width="108" height="64" rx="5" fill="#fffdf7" stroke="#d9b8a0" stroke-width="3"/>
    <path d="M6 14 L60 48 L114 14" fill="none" stroke="#d9b8a0" stroke-width="3"/>
    <path d="M50 44 C46 36, 56 30, 60 38 C64 30, 74 36, 70 44 C66 51, 60 54, 60 54 C60 54, 54 51, 50 44 Z"
      fill="#e0698c"/>`) },
];

export const stickerById = (id) => STICKERS.find((s) => s.id === id) || null;
