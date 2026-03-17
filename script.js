const canvas = document.getElementById('colorCanvas');
const ctx = canvas.getContext('2d');
const satSlider = document.getElementById('sat-slider');

const psicologia = {
    "Rojo": { emo: "Pasión, Energía, Peligro", pers: "Audaz" },
    "Naranja": { emo: "Creatividad, Éxito", pers: "Aventurero" },
    "Amarillo": { emo: "Felicidad, Inteligencia", pers: "Optimista" },
    "Verde": { emo: "Naturaleza, Frescura", pers: "Equilibrado" },
    "Azul": { emo: "Confianza, Libertad", pers: "Leal" },
    "Morado": { emo: "Lujo, Misterio", pers: "Espiritual" }
};

function dibujar() {
    const c = canvas.width / 2;
    const s = satSlider.value;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let i = 0; i < 360; i++) {
        ctx.beginPath(); ctx.moveTo(c, c);
        ctx.arc(c, c, c, (i * Math.PI)/180, ((i+2)*Math.PI)/180);
        ctx.fillStyle = `hsl(${i}, ${s}%, 50%)`; ctx.fill();
    }
}
satSlider.oninput = dibujar;

function handle(e) {
    const rect = canvas.getBoundingClientRect();
    const cX = e.touches ? e.touches[0].clientX : e.clientX;
    const cY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = ((cX - rect.left) / rect.width) * canvas.width;
    const y = ((cY - rect.top) / rect.height) * canvas.height;
    const p = ctx.getImageData(x, y, 1, 1).data;
    if (p[3] > 0) {
        const hsl = rgbToHsl(p[0], p[1], p[2]);
        actualizar(hsl.h, hsl.s * 100, hsl.l * 100, `rgb(${p[0]},${p[1]},${p[2]})`);
    }
}

function actualizar(h, s, l, rgbText) {
    document.getElementById('preview-main').style.backgroundColor = rgbText;
    document.getElementById('color-val').innerText = rgbText;
    
    // Psicología
    const nombre = getNombre(h);
    const card = document.getElementById('psychology-card');
    if(psicologia[nombre]) {
        card.classList.remove('hidden');
        document.getElementById('psy-emotions').innerText = psicologia[nombre].emo;
        document.getElementById('psy-personality').innerText = psicologia[nombre].pers;
    }

    // Escala de Brillo
    const bar = document.getElementById('shades-bar');
    bar.innerHTML = "";
    for (let i = 0; i <= 10; i++) {
        const div = document.createElement('div');
        div.className = 'shade-step';
        div.style.backgroundColor = `hsl(${h}, ${satSlider.value}%, ${100-(i*10)}%)`;
        bar.appendChild(div);
    }

    // Armonías
    const curSat = satSlider.value;
    renderH('mono-row', 'monoCanvas', [h], [20, 50, 80], curSat);
    renderH('comp-row', 'compCanvas', [h, (h+180)%360], [50, 50], curSat);
    renderH('split-row', 'splitCanvas', [h, (h+150)%360, (h+210)%360], [50, 50, 50], curSat);
    renderH('triad-row', 'triadCanvas', [h, (h+120)%360, (h+240)%360], [50, 50, 50], curSat);
    renderH('analog-row', 'analogCanvas', [(h+330)%360, h, (h+30)%360], [50, 50, 50], curSat);
    renderH('tetra-row', 'tetraCanvas', [h, (h+90)%360, (h+180)%360, (h+270)%360], [50, 50, 50, 50], curSat);
}

function renderH(rowId, canvasId, hues, lights, s) {
    const row = document.getElementById(rowId); row.innerHTML = "";
    hues.forEach((hu, i) => {
        const color = `hsl(${hu}, ${s}%, ${lights[i]}%)`;
        row.innerHTML += `<div class="shade-item" style="background:${color}"></div>`;
    });
    const cV = document.getElementById(canvasId); const cT = cV.getContext('2d');
    const c = cV.width / 2; cT.clearRect(0,0,cV.width,cV.height);
    for(let i=0; i<360; i++) {
        cT.beginPath(); cT.moveTo(c,c); cT.arc(c,c,c,(i*Math.PI)/180,((i+2)*Math.PI)/180);
        cT.fillStyle = `hsla(${i}, 10%, 15%, 0.8)`; cT.fill();
    }
    hues.forEach(a => {
        cT.beginPath(); cT.moveTo(c,c); cT.arc(c,c,c,((a-10)*Math.PI)/180,((a+10)*Math.PI)/180);
        cT.fillStyle = `hsl(${a}, 100%, 50%)`; cT.fill();
    });
}

function getNombre(h) {
    if (h < 20 || h > 340) return "Rojo"; if (h < 50) return "Naranja";
    if (h < 85) return "Amarillo"; if (h < 170) return "Verde";
    if (h < 260) return "Azul"; return "Morado";
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h, s, l = (max + min) / 2;
    if (d === 0) h = s = 0;
    else {
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h /= 6;
    }
    return { h: Math.round(h * 360), s, l };
}

// Menú
function openModal(id) { document.getElementById(id).style.display = "block"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }
document.getElementById('openMenu').onclick = () => document.getElementById('sidebar').classList.add('active');
document.getElementById('closeMenu').onclick = () => document.getElementById('sidebar').classList.remove('active');

canvas.addEventListener('mousedown', handle);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handle(e); });
dibujar();
