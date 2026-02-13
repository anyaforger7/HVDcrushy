const canvas = document.getElementById('carnationCanvas');
const ctx = canvas.getContext('2d');

let dpr = window.devicePixelRatio || 1;
let width, height;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resize);
resize();

let globalProgress = 0;
const animationSpeed = 0.0015;
const totalLayers = 15; // Perfect balance for fluffiness and mobile performance

const flowers = [
    { x: 0, y: -0.15, scale: 0.85, startDelay: 0 },       
    { x: -0.12, y: -0.06, scale: 0.8, startDelay: 0.05 }, 
    { x: 0.12, y: -0.06, scale: 0.8, startDelay: 0.1 },   
    { x: -0.18, y: 0.04, scale: 0.75, startDelay: 0.15 }, 
    { x: 0.18, y: 0.04, scale: 0.75, startDelay: 0.2 },   
    { x: -0.08, y: 0.12, scale: 0.75, startDelay: 0.25 }, 
    { x: 0.08, y: 0.12, scale: 0.75, startDelay: 0.3 }    
];

function drawStem(startX, startY, handleX, handleTopY, stemBottomY, scaleMultiplier) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    const cpX = startX;
    const cpY = handleTopY - (handleTopY - startY) * 0.2;
    ctx.quadraticCurveTo(cpX, cpY, handleX, handleTopY);
    ctx.lineTo(handleX, stemBottomY);
    
    ctx.strokeStyle = '#5a7d4a';
    ctx.lineWidth = 6 * scaleMultiplier; 
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
}

function drawPaperWrapping(handleX, handleTopY, handleBottomY, progress, scaleMultiplier) {
    ctx.save();
    const wrapAlpha = Math.min(1, (progress - 0.15) * 3);
    if (wrapAlpha <= 0) { ctx.restore(); return; }
    ctx.globalAlpha = wrapAlpha;

    const paperTopY = handleTopY - 100 * scaleMultiplier; 
    const paperBottomY = handleBottomY + 20 * scaleMultiplier; 
    const paperTopWidth = 280 * scaleMultiplier;
    const paperBottomWidth = 80 * scaleMultiplier;

    // Pink Inner Paper
    ctx.fillStyle = '#eab6c0'; 
    ctx.beginPath();
    ctx.moveTo(handleX - paperTopWidth/2 + 20*scaleMultiplier, paperTopY + 30*scaleMultiplier); 
    ctx.lineTo(handleX + paperTopWidth/2 - 20*scaleMultiplier, paperTopY + 10*scaleMultiplier); 
    ctx.lineTo(handleX + paperBottomWidth/2 - 10*scaleMultiplier, paperBottomY); 
    ctx.lineTo(handleX - paperBottomWidth/2 + 10*scaleMultiplier, paperBottomY); 
    ctx.closePath();
    ctx.fill();

    // White Outer Paper
    const whiteGrad = ctx.createLinearGradient(handleX - paperTopWidth/2, paperTopY, handleX + paperTopWidth/2, paperBottomY);
    whiteGrad.addColorStop(0, '#fdfdfd');
    whiteGrad.addColorStop(0.4, '#f0f0f0'); 
    whiteGrad.addColorStop(0.6, '#ffffff');
    whiteGrad.addColorStop(1, '#ececec'); 

    ctx.fillStyle = whiteGrad;
    ctx.beginPath();
    ctx.moveTo(handleX - paperTopWidth/2, paperTopY); 
    ctx.lineTo(handleX + paperTopWidth/2, paperTopY + 40*scaleMultiplier); 
    ctx.lineTo(handleX + paperBottomWidth/2, paperBottomY); 
    ctx.lineTo(handleX - paperBottomWidth/2, paperBottomY); 
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1.5 * scaleMultiplier;
    ctx.beginPath();
    ctx.moveTo(handleX - paperTopWidth/2 + 30*scaleMultiplier, paperTopY + 15*scaleMultiplier);
    ctx.lineTo(handleX, paperBottomY - 30*scaleMultiplier);
    ctx.stroke();

    // Pink Ribbon
    const ribbonY = handleBottomY - 40 * scaleMultiplier;
    const ribbonWidth = paperBottomWidth + 10 * scaleMultiplier;
    const ribbonHeight = 25 * scaleMultiplier;

    ctx.fillStyle = '#e9a8b5'; 
    ctx.fillRect(handleX - ribbonWidth/2, ribbonY - ribbonHeight/2, ribbonWidth, ribbonHeight);

    // Bow
    ctx.beginPath();
    ctx.moveTo(handleX, ribbonY);
    ctx.quadraticCurveTo(handleX - 40*scaleMultiplier, ribbonY - 30*scaleMultiplier, handleX - 50*scaleMultiplier, ribbonY + 10*scaleMultiplier); 
    ctx.quadraticCurveTo(handleX - 10*scaleMultiplier, ribbonY + 5*scaleMultiplier, handleX, ribbonY);
    ctx.quadraticCurveTo(handleX + 40*scaleMultiplier, ribbonY - 30*scaleMultiplier, handleX + 50*scaleMultiplier, ribbonY + 10*scaleMultiplier); 
    ctx.quadraticCurveTo(handleX + 10*scaleMultiplier, ribbonY + 5*scaleMultiplier, handleX, ribbonY);
    ctx.fill();
    
    ctx.fillStyle = '#d897a4'; 
    ctx.beginPath();
    ctx.arc(handleX, ribbonY, 8 * scaleMultiplier, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawFlower(centerX, centerY, flower, progress, scaleMultiplier) {
    ctx.save();
    ctx.translate(centerX, centerY);

    const maxFlowerSize = Math.min(width, height) * 0.22 * flower.scale * scaleMultiplier;

    for (let i = totalLayers - 1; i >= 0; i--) {
        const inverseI = totalLayers - 1 - i;
        const delayThreshold = inverseI / totalLayers; 
        let layerProgress = (progress - delayThreshold * 0.6) * 2.5;
        
        if (layerProgress <= 0) continue;
        if (layerProgress > 1) layerProgress = 1;

        const easedProgress = 1 - Math.pow(1 - layerProgress, 3);
        const currentRadius = (maxFlowerSize * (i + 1) / totalLayers) * easedProgress;

        const hue = 340; 
        const saturation = 70 + (i / totalLayers) * 20; 
        const lightness = 60 + (i / totalLayers) * 25; 

        const petalColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.95)`;
        const strokeColor = `hsla(${hue}, ${saturation + 10}%, ${lightness - 10}%, 0.6)`;

        ctx.beginPath();
        const ruffles = 12 + Math.floor(i / 3); 
        const rotationOffset = i * 0.7 + progress * 0.5 + flowers.indexOf(flower);

        for (let a = 0; a < Math.PI * 2; a += 0.02) {
            const noise = Math.sin(a * ruffles + rotationOffset) * 0.1 + 
                          Math.cos(a * ruffles * 2.3 + rotationOffset) * 0.06;
            const r = currentRadius * (1 + noise * easedProgress);
            const x = r * Math.cos(a);
            const y = r * Math.sin(a);
            if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();

        ctx.fillStyle = petalColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 0.5;
        ctx.fill();
        ctx.stroke();
    }
    ctx.restore();
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    globalProgress += animationSpeed;
    if (globalProgress > 1.5) globalProgress = 1.5; 

    const minDimension = Math.min(width, height);
    let baseScale = minDimension / 600; 
    if (baseScale < 0.45) baseScale = 0.45; 
    if (baseScale > 1.2) baseScale = 1.2;

    const centerXGlobal = width / 2;
    const centerYGlobal = height / 2;

    const handleX = centerXGlobal;
    const handleTopY = centerYGlobal + (50 * baseScale); 
    const handleBottomY = centerYGlobal + (220 * baseScale);
    const stemBottomY = centerYGlobal + (280 * baseScale);

    let allFinished = true;

    flowers.forEach((flower, index) => {
        let flowerProgress = (globalProgress - flower.startDelay) * 1.2;
        if (flowerProgress > 0.05) {
            const centerX = centerXGlobal + flower.x * minDimension * 0.9;
            const centerY = handleTopY - (120 * baseScale) + flower.y * minDimension * 0.9;
            const stemOffsetX = handleX + (index - 3) * (5 * baseScale); 
            drawStem(centerX, centerY, stemOffsetX, handleTopY, stemBottomY, baseScale);
        }
    });

    drawPaperWrapping(handleX, handleTopY, handleBottomY, globalProgress, baseScale);

    flowers.forEach((flower) => {
        let flowerProgress = (globalProgress - flower.startDelay) * 1.2;
        if (flowerProgress < 0) flowerProgress = 0;
        if (flowerProgress > 1) flowerProgress = 1;
        
        if (flowerProgress > 0) {
            const centerX = centerXGlobal + flower.x * minDimension * 0.9;
            const centerY = handleTopY - (120 * baseScale) + flower.y * minDimension * 0.9;
            drawFlower(centerX, centerY, flower, flowerProgress, baseScale);
        }

        if (flowerProgress < 1) allFinished = false;
    });

    if (!allFinished) {
        requestAnimationFrame(animate);
    } else {
        setTimeout(() => {
             document.getElementById('valentineText').classList.add('show-message');
        }, 300);
    }
}

const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const bgMusic = document.getElementById('bgMusic');

startBtn.addEventListener('click', () => {
    bgMusic.play().catch(error => {
        console.log("Audio playback failed.", error);
    });

    startScreen.style.opacity = '0';
    
    setTimeout(() => {
        startScreen.style.display = 'none';
        animate(); 
    }, 1000); 
});
