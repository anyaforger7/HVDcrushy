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

// --- Configuration ---
let globalProgress = 0;
const animationSpeed = 0.0015;
const totalLayers = 5;

// Define positions for 7 flowers grouped tightly into a bouquet dome
const flowers = [
    { x: 0, y: -0.15, scale: 0.85, startDelay: 0 },       // Top center
    { x: -0.12, y: -0.06, scale: 0.8, startDelay: 0.05 }, // Top left
    { x: 0.12, y: -0.06, scale: 0.8, startDelay: 0.1 },   // Top right
    { x: -0.18, y: 0.04, scale: 0.75, startDelay: 0.15 }, // Mid left
    { x: 0.18, y: 0.04, scale: 0.75, startDelay: 0.2 },   // Mid right
    { x: -0.08, y: 0.12, scale: 0.75, startDelay: 0.25 }, // Bottom left
    { x: 0.08, y: 0.12, scale: 0.75, startDelay: 0.3 }    // Bottom right
];

// Draws the stems curving into the central wrapper
function drawStem(startX, startY, handleX, handleTopY, stemBottomY) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    // Curve from the flower down to the handle
    const cpX = startX;
    const cpY = handleTopY - (handleTopY - startY) * 0.2;
    ctx.quadraticCurveTo(cpX, cpY, handleX, handleTopY);
    
    // Straight down through the handle to the bottom
    ctx.lineTo(handleX, stemBottomY);
    
    ctx.strokeStyle = '#5a7d4a';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
}

// --- NEW FUNCTION: Draws the two-tone paper wrapping ---
function drawPaperWrapping(handleX, handleTopY, handleBottomY, progress) {
    ctx.save();
    // Fade in the wrapper
    const wrapAlpha = Math.min(1, (progress - 0.15) * 3);
    if (wrapAlpha <= 0) { ctx.restore(); return; }
    ctx.globalAlpha = wrapAlpha;

    const paperTopY = handleTopY - 100; // Top of the paper cone
    const paperBottomY = handleBottomY + 20; // Bottom of the paper cone
    const paperTopWidth = 280;
    const paperBottomWidth = 80;

    // 1. Draw Pink Inner Paper
    ctx.fillStyle = '#eab6c0'; // Soft Pink
    ctx.beginPath();
    ctx.moveTo(handleX - paperTopWidth/2 + 20, paperTopY + 30); // Top-left
    ctx.lineTo(handleX + paperTopWidth/2 - 20, paperTopY + 10); // Top-right (slightly angled)
    ctx.lineTo(handleX + paperBottomWidth/2 - 10, paperBottomY); // Bottom-right
    ctx.lineTo(handleX - paperBottomWidth/2 + 10, paperBottomY); // Bottom-left
    ctx.closePath();
    ctx.fill();

    // 2. Draw White Outer Paper with "folds"
    const whiteGrad = ctx.createLinearGradient(handleX - paperTopWidth/2, paperTopY, handleX + paperTopWidth/2, paperBottomY);
    whiteGrad.addColorStop(0, '#fdfdfd');
    whiteGrad.addColorStop(0.4, '#f0f0f0'); // Subtle shadow for a fold
    whiteGrad.addColorStop(0.6, '#ffffff');
    whiteGrad.addColorStop(1, '#ececec'); // Shaded edge

    ctx.fillStyle = whiteGrad;
    ctx.beginPath();
    ctx.moveTo(handleX - paperTopWidth/2, paperTopY); // Top-left
    ctx.lineTo(handleX + paperTopWidth/2, paperTopY + 40); // Top-right (angled down)
    ctx.lineTo(handleX + paperBottomWidth/2, paperBottomY); // Bottom-right
    ctx.lineTo(handleX - paperBottomWidth/2, paperBottomY); // Bottom-left
    ctx.closePath();
    ctx.fill();

    // Add a simple crease line for effect
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(handleX - paperTopWidth/2 + 30, paperTopY + 15);
    ctx.lineTo(handleX, paperBottomY - 30);
    ctx.stroke();

    // 3. Draw Pink Ribbon
    const ribbonY = handleBottomY - 40;
    const ribbonWidth = paperBottomWidth + 10;
    const ribbonHeight = 25;

    ctx.fillStyle = '#e9a8b5'; // Pink ribbon color
    ctx.fillRect(handleX - ribbonWidth/2, ribbonY - ribbonHeight/2, ribbonWidth, ribbonHeight);

    // Ribbon Bow
    ctx.beginPath();
    ctx.moveTo(handleX, ribbonY);
    ctx.quadraticCurveTo(handleX - 40, ribbonY - 30, handleX - 50, ribbonY + 10); // Left loop
    ctx.quadraticCurveTo(handleX - 10, ribbonY + 5, handleX, ribbonY);
    ctx.quadraticCurveTo(handleX + 40, ribbonY - 30, handleX + 50, ribbonY + 10); // Right loop
    ctx.quadraticCurveTo(handleX + 10, ribbonY + 5, handleX, ribbonY);
    ctx.fill();
    
    // Bow knot center
    ctx.fillStyle = '#d897a4'; 
    ctx.beginPath();
    ctx.arc(handleX, ribbonY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}


// Draws the individual flower heads
function drawFlower(centerX, centerY, flower, progress) {
    ctx.save();
    ctx.translate(centerX, centerY);

    const maxFlowerSize = Math.min(width, height) * 0.22 * flower.scale;

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

// Master animation loop
function animate() {
    ctx.clearRect(0, 0, width, height);

    globalProgress += animationSpeed;
    if (globalProgress > 1.5) globalProgress = 1.5; 

    const handleX = width / 2;
    const handleTopY = height * 0.58;
    const handleBottomY = height * 0.85;
    const stemBottomY = height * 0.95;

    let allFinished = true;

    // 1. Draw Stems first (background layer)
    flowers.forEach((flower, index) => {
        let flowerProgress = (globalProgress - flower.startDelay) * 1.2;
        if (flowerProgress > 0.05) {
            const centerX = width / 2 + flower.x * Math.min(width, height);
            const centerY = height / 2 + flower.y * Math.min(width, height) - height * 0.15;
            const stemOffsetX = handleX + (index - 3) * 5; 
            drawStem(centerX, centerY, stemOffsetX, handleTopY, stemBottomY);
        }
    });

    // 2. Draw the Paper Wrapping (middle layer)
    drawPaperWrapping(handleX, handleTopY, handleBottomY, globalProgress);

    // 3. Draw the Flowers (top layer)
    flowers.forEach((flower) => {
        let flowerProgress = (globalProgress - flower.startDelay) * 1.2;
        if (flowerProgress < 0) flowerProgress = 0;
        if (flowerProgress > 1) flowerProgress = 1;
        
        if (flowerProgress > 0) {
            const centerX = width / 2 + flower.x * Math.min(width, height);
            const centerY = height / 2 + flower.y * Math.min(width, height) - height * 0.15;
            drawFlower(centerX, centerY, flower, flowerProgress);
        }

        if (flowerProgress < 1) allFinished = false;
    });

    // Text Reveal Logic
    if (!allFinished) {
        requestAnimationFrame(animate);
    } else {
        setTimeout(() => {
             document.getElementById('valentineText').classList.add('show-message');
        }, 300);
    }
}

// Start animation
//setTimeout(animate, 100);

// --- MUSIC AND START LOGIC ---
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const bgMusic = document.getElementById('bgMusic');

startBtn.addEventListener('click', () => {
    // 1. Play the music
    bgMusic.play().catch(error => {
        console.log("Audio playback failed. The browser might still be blocking it.", error);
    });

    // 2. Fade out the start screen
    startScreen.style.opacity = '0';
    
    // 3. Wait for the fade out to finish, then hide it completely and start the bloom
    setTimeout(() => {
        startScreen.style.display = 'none';
        animate(); // Start the beautiful bouquet animation!
    }, 1000); 
});