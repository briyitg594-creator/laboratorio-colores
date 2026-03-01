const canvas = document.getElementById('colorCanvas');
const ctx = canvas.getContext('2d');

const psicologia = {
    "Rojo": { emo: "Pasión, Energía, Peligro", pers: "Audaz, Enérgico" },
    "Naranja": { emo: "Juventud, Innovación, Vitalidad", pers: "Aventurero" },
    "Amarillo": { emo: "Calidez, Positividad, Alegría", pers: "Estratégico" },
    "Verde": { emo: "Ética, Frescura, Naturaleza", pers: "Amigable, Auténtico" },
    "Azul": { emo: "Seriedad, Calma, Profesionalidad", pers: "Leal, Respetuoso" },
    "Morado": { emo: "Lujo, Realeza, Misterio", pers: "Sensible, Comprensivo" },
    "Rosa": { emo: "Romántico, Delicadeza, Inocencia", pers: "Espiritual" }
};

// --- Modales ---
function openModal(id) {
    document.getElementById(id).style.display = "block";
    document.getElementById('sidebar').classList.remove('active');
}
function closeModal(id) { document.getElementById(id).style.display = "none"; }
document.getElementById('openMenu').onclick = () => document.getElementById('sidebar').classList.add('active');
document.getElementById('closeMenu').onclick = () => document.getElementById('sidebar').classList.remove('active');

// --- Lógica de Color ---
function getNombre(h, s, l) {
    if (l < 0.12) return "Negro Profundo";
    if (l > 0.92) return "Blanco Puro";
    if (s < 0.15) return "Gris Neutro";
    if (h >= 345 || h < 15) return "Rojo Escarlata";
    if (h < 45) return "Naranja Ámbar";
    if (h < 70) return "Amarillo Oro";
    if (h < 155) return "Verde Esmeralda";
    if (h < 205) return "Cian / Turquesa";
    if (h < 270) return "Azul Zafiro";
    if (h < 315) return "Morado / Violeta";
    return "Rosa Magenta";
}

function handle(e) {
    const rect = canvas.getBoundingClientRect();
    const cX = e.touches ? e.touches[0].clientX : e.clientX;
    const cY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = ((cX - rect.left) / rect.width) * canvas.width;
    const y = ((cY - rect.top) / rect.height) * canvas.height;
    const p = ctx.getImageData(x, y, 1, 1).data;
    if (p[3] > 0) {
        const rgb = `rgb(${p[0]}, ${p[1]}, ${p[2]})`;
        document.getElementById('preview-main').style.backgroundColor = rgb;
        const hsl = rgbToHsl(p[0], p[1], p[2]);
        const nombre = getNombre(hsl.h, hsl.s, hsl.l);
        document.getElementById('color-name').innerText = nombre;
        updatePsy(nombre);
        genMatices(p[0], p[1], p[2]); // Aquí se generan los matices claros/oscuros
        document.getElementById('comp-ideal').style.backgroundColor = `hsl(${(hsl.h + 180) % 360}, 100%, 50%)`;
    }
}

function updatePsy(nombre) {
    const match = Object.keys(psicologia).find(key => nombre.includes(key));
    const card = document.getElementById('psychology-card');
    if(match) {
        card.classList.remove('hidden');
        document.getElementById('psy-emotions').innerText = psicologia[match].emo;
        document.getElementById('psy-personality').innerText = psicologia[match].pers;
    }
}

// ESTA FUNCIÓN ES LA QUE CREA LOS MATICES CLAROS Y OSCUROS
function genMatices(r, g, b) {
    const lRow = document.getElementById('light-row'), dRow = document.getElementById('dark-row');
    lRow.innerHTML = ""; dRow.innerHTML = "";
    for(let i=1; i<=6; i++) {
        lRow.innerHTML += `<div class="shade-item" style="background:rgb(${Math.floor(r+(255-r)*(i/7))},${Math.floor(g+(255-g)*(i/7))},${Math.floor(b+(255-b)*(i/7))})"></div>`;
        dRow.innerHTML += `<div class="shade-item" style="background:rgb(${Math.floor(r*(1-i/7))},${Math.floor(g*(1-i/7))},${Math.floor(b*(1-i/7))})"></div>`;
    }
}

function mezclar() {
    const h2r = (hex) => ({ r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) });
    const c1 = h2r(document.getElementById('color1').value), c2 = h2r(document.getElementById('color2').value);
    const r = Math.floor((c1.r + c2.r) / 2), g = Math.floor((c1.g + c2.g) / 2), b = Math.floor((c1.b + c2.b) / 2);
    const hsl = rgbToHsl(r, g, b);
    document.getElementById('result-mix').style.backgroundColor = `rgb(${r},${g},${b})`;
    document.getElementById('mix-name').innerText = "Mezcla: " + getNombre(hsl.h, hsl.s, hsl.l);
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h /= 6;
    }
    return { h: Math.round(h * 360), s, l };
}

function dibujar() {
    const c = canvas.width / 2;
    for (let i = 0; i < 360; i++) {
        ctx.beginPath(); ctx.moveTo(c, c);
        ctx.arc(c, c, c, (i * Math.PI)/180, ((i+2)*Math.PI)/180);
        ctx.fillStyle = `hsl(${i}, 100%, 50%)`; ctx.fill();
    }
}
canvas.addEventListener('mousedown', handle);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handle(e); });
dibujar();