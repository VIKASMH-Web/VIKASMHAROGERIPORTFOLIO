document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    const canvas = document.getElementById("hero-canvas");
    const ctx = canvas.getContext("2d");

    // Canvas Sizing
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', () => {
        resizeCanvas();
        render(); // Re-render current frame on resize
    });
    resizeCanvas();

    // Image Sequence Loader
    const frameCount = 120; // Based on your files
    const images = [];
    const imageState = {
        frame: 0
    };

    let loadedCount = 0;
    const loaderEl = document.getElementById('loader');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    const updateLoader = () => {
        const percent = Math.round((loadedCount / frameCount) * 100);
        progressBar.style.width = `${percent}%`;
        progressText.innerText = `${percent}%`;

        if (loadedCount === frameCount) {
            setupAnimation();
            
            // Fade out loader
            setTimeout(() => {
                loaderEl.style.opacity = '0';
                setTimeout(() => {
                    loaderEl.style.display = 'none';
                }, 500);
            }, 500);
        }
    };

    // Load Images
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        // Construct filename matching the standardized format I created earlier
        // frame_000.png, frame_001.png etc.
        const indexStr = i.toString().padStart(3, "0");
        img.src = `sequence/frame_${indexStr}.png`;
        
        img.onload = () => {
            loadedCount++;
            updateLoader();
        };
        img.onerror = () => {
            console.error(`Failed to load frame ${i}`);
            loadedCount++; // Count error as load so we don't hang
            updateLoader();
        };
        images.push(img);
    }

    // Render Logic
    function render() {
        const img = images[imageState.frame];
        if (!img) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate 'contain' or 'cover' logic manually
        // We want 'cover'
        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.width;
        const ih = img.height;

        const scale = Math.max(cw / iw, ch / ih);
        const nw = iw * scale;
        const nh = ih * scale;
        const cx = (cw - nw) / 2;
        const cy = (ch - nh) / 2;

        ctx.drawImage(img, cx, cy, nw, nh);
    }

    // Setup GSAP Animations
    function setupAnimation() {
        // Initial render
        render();

        // 1. Canvas Scrubbing
        // We pin the canvas container effectively by using the scroll-container length
        // But actually the canvas is fixed position, so we just trigger based on scroll
        
        gsap.to(imageState, {
            frame: frameCount - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                trigger: ".scroll-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 0, // Instant scrubbing for video feel, or 0.5 for smoothing
                onUpdate: () => render() // Render on every GSAP tick
            }
        });

        // 2. Text Overlays
        // Text 1: Name (0% - 20%)
        const t1 = document.getElementById('text-1');
        gsap.timeline({
            scrollTrigger: {
                trigger: ".scroll-container",
                start: "top top",
                end: "15% top",
                scrub: true
            }
        })
        .to(t1, { opacity: 1, y: 0, duration: 1 }) // Fade In
        .to(t1, { opacity: 0, y: -50, duration: 1 }, "+=0.5"); // Fade Out

        // Text 2: "I build..." (25% - 45%)
        const t2 = document.getElementById('text-2');
        gsap.timeline({
            scrollTrigger: {
                trigger: ".scroll-container",
                start: "20% top",
                end: "45% top",
                scrub: true
            }
        })
        .to(t2, { opacity: 1, y: 0, duration: 1 })
        .to(t2, { opacity: 0, y: -50, duration: 1 }, "+=0.5");

        // Text 3: "Bridging..." (55% - 75%)
        const t3 = document.getElementById('text-3');
        gsap.timeline({
            scrollTrigger: {
                trigger: ".scroll-container",
                start: "50% top",
                end: "75% top",
                scrub: true
            }
        })
        .to(t3, { opacity: 1, y: 0, duration: 1 })
        .to(t3, { opacity: 0, y: -50, duration: 1 }, "+=0.5");

        // 3. Canvas Opacity Fade Out at the end
        // So it transitions smoothly to the projects section
        gsap.to(canvas, {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
                trigger: ".projects-section",
                start: "top bottom", // Start fading when projects section hits bottom of viewport? 
                // actually we want it to fade out as projects section enters
                start: "top 100%",
                end: "top 20%",
                scrub: true
            }
        });
    }
});
