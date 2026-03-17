// Funciones de Modal
function openModal(id) { document.getElementById(id).style.display = "block"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

// Cerrar menú al hacer clic fuera o en botones
document.getElementById('openMenu').onclick = () => document.getElementById('sidebar').classList.add('active');
document.getElementById('closeMenu').onclick = () => document.getElementById('sidebar').classList.remove('active');

const canvas = document.getElementById('colorCanvas');
const ctx = canvas.getContext('2d');
const satSlider = document.getElementById('sat-slider');

function dibujarCirculoPrincipal() {
    const c = canvas.width / 2;
    const s = satSlider.value;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let i = 0; i < 360; i++) {
        ctx.beginPath(); ctx.moveTo(c, c);
        ctx.arc(c, c, c, (i * Math.PI)/180, ((i+2)*Math.PI)/180);
        ctx.fillStyle = `hsl(${i}, ${s}%, 50%)`; ctx.fill();
    }
}

satSlider.oninput = dibujarCirculoPrincipal;

function handleSelection(e) {
    const rect = canvas.getBoundingClientRect();
    const cX = e.touches ? e.touches[0].clientX : e.clientX;
    const cY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = ((cX - rect.left) / rect.width) * canvas.width;
    const y = ((cY - rect.top) / rect.height) * canvas.height;
    const p = ctx.getImageData(x, y, 1, 1).data;

    if (p[3] > 0) {
        const hsl = rgbToHsl(p[0], p[1], p[2]);
        const rgb = `rgb(${p[0]},${p[1]},${p[2]})`;
        actualizarInterfaz(hsl.h, hsl.s * 100, hsl.l * 100, rgb);
    }
}

function actualizarInterfaz(h, s, l, rgb) {
    document.getElementById('preview-main').style.backgroundColor = rgb;
    document.getElementById('color-val').innerText = rgb;
    
    const curSat = satSlider.value;

    // Actualizar Filas y Mini Mapas
    updateHarmonySection('mono-row', 'monoCanvas', [h], [25, 50, 75], curSat);
    updateHarmonySection('comp-row', 'compCanvas', [h, (h+180)%360], [l, l], curSat);
    updateHarmonySection('analog-row', 'analogCanvas', [(h+330)%360, h, (h+30)%360], [l, l, l], curSat);
    updateHarmonySection('triad-row', 'triadCanvas', [h, (h+120)%360, (h+240)%360], [l, l, l], curSat);
    updateHarmonySection('tetra-row', 'tetraCanvas', [h, (h+90)%360, (h+180)%360, (h+270)%360], [l, l, l, l], curSat);
}

function updateHarmonySection(rowId, canvasId, hues, lights, sat) {
    const row = document.getElementById(rowId);
    row.innerHTML = "";
    hues.forEach((hu, i) => {
        const color = `hsl(${hu}, ${sat}%, ${lights[i] || 50}%)`;
        row.innerHTML += `<div class="shade-item" style="background:${color}"></div>`;
    });
    drawMiniMap(canvasId, hues);
}

function drawMiniMap(id, angles) {
    const cV = document.getElementById(id); const cT = cV.getContext('2d');
    const c = cV.width / 2; cT.clearRect(0,0,cV.width,cV.height);
    for(let i=0; i<360; i++) {
        cT.beginPath(); cT.moveTo(c,c); cT.arc(c,c,c,(i*Math.PI)/180,((i+2)*Math.PI)/180);
        cT.fillStyle = `hsla(${i}, 15%, 10%, 0.95)`; cT.fill();
    }
    angles.forEach(a => {
        cT.beginPath(); cT.moveTo(c,c); cT.arc(c,c,c,((a-12)*Math.PI)/180,((a+12)*Math.PI)/180);
        cT.fillStyle = `hsl(${a}, 100%, 50%)`; cT.fill();
    });
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

function mezclar() {
    const h2r = (hex) => ({ r: parseInt(hex.slice(1,3),16), g: parseInt(hex.slice(3,5),16), b: parseInt(hex.slice(5,7),16) });
    const c1 = h2r(document.getElementById('color1').value);
    const c2 = h2r(document.getElementById('color2').value);
    const res = `rgb(${Math.floor((c1.r+c2.r)/2)},${Math.floor((c1.g+c2.g)/2)},${Math.floor((c1.b+c2.b)/2)})`;
    document.getElementById('result-mix').style.backgroundColor = res;
}

canvas.addEventListener('mousedown', handleSelection);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleSelection(e); });
dibujarCirculoPrincipal();
