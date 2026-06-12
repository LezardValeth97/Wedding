/**
 * Petals3D Component (NEW)
 * Real-3D falling petals over the hero, rendered with Three.js.
 *
 * Highlights worth teaching:
 *  - Procedural geometry: each petal is a small plane "bent" by
 *    moving its vertices, so no image assets are needed.
 *  - One geometry + a few materials shared by ~60 meshes = cheap.
 *  - The render loop pauses when the tab is hidden OR the hero is
 *    scrolled out of view (IntersectionObserver), saving battery.
 *  - Degrades gracefully: no Three.js / no WebGL / reduced motion
 *    → the function simply returns and the site works as before.
 */
const Petals3D = (function() {
    let renderer = null;
    let scene = null;
    let camera = null;
    let petals = [];
    let clock = null;
    let running = false;     // is the animation loop active?
    let heroVisible = true;  // is the hero section on screen?
    let initialized = false;

    // Soft wedding palette: blush pinks, ivory, a rare champagne gold
    const PETAL_COLORS = [0xf6dde0, 0xf0c9cf, 0xe8c4c4, 0xfdf0e7, 0xead9c0];

    function init() {
        if (initialized) return;

        const container = document.getElementById('hero-petals');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Graceful exits — the site must never depend on this effect
        if (!container || reducedMotion) return;
        if (typeof THREE === 'undefined') {
            console.warn('Petals3D: Three.js not loaded, skipping petals');
            return;
        }
        if (!isWebGLAvailable()) {
            console.warn('Petals3D: WebGL not available, skipping petals');
            return;
        }

        initialized = true;

        // ----- Scene & camera -----
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            100
        );
        camera.position.z = 30;

        // ----- Renderer (transparent, sits over the hero photo) -----
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // ----- Lights -----
        scene.add(new THREE.AmbientLight(0xffffff, 0.75));
        const sun = new THREE.DirectionalLight(0xfff2dd, 0.7);
        sun.position.set(4, 8, 6);
        scene.add(sun);

        // ----- Petals -----
        const isMobile = container.clientWidth < 768;
        const count = isMobile ? 32 : 60;
        const geometry = createPetalGeometry();

        // One material per colour, shared between meshes
        const materials = PETAL_COLORS.map(function(color) {
            return new THREE.MeshLambertMaterial({
                color: color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.92
            });
        });

        const bounds = getViewBounds();
        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(
                geometry,
                materials[i % materials.length]
            );
            mesh.userData = randomPetalState(bounds, true);
            applyState(mesh);
            scene.add(mesh);
            petals.push(mesh);
        }

        clock = new THREE.Clock();

        // ----- Only animate when it can actually be seen -----
        document.addEventListener('visibilitychange', function() {
            document.hidden ? stop() : maybeStart();
        });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function(entries) {
                heroVisible = entries[0].isIntersecting;
                heroVisible ? maybeStart() : stop();
            }, { threshold: 0.05 }).observe(container);
        }

        window.addEventListener('resize', onResize);

        maybeStart();
        console.log('Petals3D: initialized with', count, 'petals');
    }

    /**
     * A petal = a small plane whose vertices are pushed along Z
     * following a curve → a gently cupped leaf shape.
     */
    function createPetalGeometry() {
        const geo = new THREE.PlaneGeometry(0.9, 1.35, 4, 6);
        const pos = geo.attributes.position;

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            // Cup across the width + slight curl along the length
            const bend = Math.cos(x * 2.4) * 0.16 + Math.sin(y * 1.4) * 0.1;
            pos.setZ(i, bend);
        }

        geo.computeVertexNormals();
        return geo;
    }

    /** How much world space is visible at z = 0 with this camera */
    function getViewBounds() {
        const vFov = (camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(vFov / 2) * camera.position.z;
        const width = height * camera.aspect;
        return { width: width, height: height };
    }

    /** Fresh fall parameters; spawnAnywhere=true fills the first frame */
    function randomPetalState(bounds, spawnAnywhere) {
        const halfW = bounds.width / 2;
        const halfH = bounds.height / 2;
        return {
            x: (Math.random() * 2 - 1) * (halfW + 2),
            y: spawnAnywhere
                ? (Math.random() * 2 - 1) * halfH
                : halfH + 2 + Math.random() * 4,
            z: (Math.random() * 2 - 1) * 8,
            fallSpeed: 1.6 + Math.random() * 1.8,        // units / second
            swayAmp: 0.6 + Math.random() * 1.4,          // horizontal drift
            swayFreq: 0.5 + Math.random() * 0.9,
            swayPhase: Math.random() * Math.PI * 2,
            rotX: Math.random() * Math.PI * 2,
            rotY: Math.random() * Math.PI * 2,
            rotZ: Math.random() * Math.PI * 2,
            rotSpeedX: (Math.random() - 0.5) * 2.2,      // tumble
            rotSpeedY: (Math.random() - 0.5) * 2.2,
            rotSpeedZ: (Math.random() - 0.5) * 1.4,
            scale: 0.55 + Math.random() * 0.7
        };
    }

    function applyState(mesh) {
        const s = mesh.userData;
        mesh.position.set(s.x, s.y, s.z);
        mesh.rotation.set(s.rotX, s.rotY, s.rotZ);
        mesh.scale.setScalar(s.scale);
    }

    function animate() {
        if (!running) return;
        requestAnimationFrame(animate);

        const dt = Math.min(clock.getDelta(), 0.05); // clamp big gaps
        const t = clock.elapsedTime;
        const bounds = getViewBounds();
        const halfH = bounds.height / 2;

        petals.forEach(function(mesh) {
            const s = mesh.userData;

            // Fall + sideways sway (a sine wave makes it feel windy)
            s.y -= s.fallSpeed * dt;
            const swayX = Math.sin(t * s.swayFreq + s.swayPhase) * s.swayAmp;

            // Tumble in all three axes — this is what makes it "3D"
            s.rotX += s.rotSpeedX * dt;
            s.rotY += s.rotSpeedY * dt;
            s.rotZ += s.rotSpeedZ * dt;

            mesh.position.set(s.x + swayX, s.y, s.z);
            mesh.rotation.set(s.rotX, s.rotY, s.rotZ);

            // Below the bottom edge → respawn above the top
            if (s.y < -halfH - 3) {
                mesh.userData = randomPetalState(bounds, false);
                mesh.userData.scale = s.scale; // keep its size
                applyState(mesh);
            }
        });

        renderer.render(scene, camera);
    }

    function maybeStart() {
        if (running || !heroVisible || document.hidden || !renderer) return;
        running = true;
        clock.getDelta(); // reset delta so petals don't jump
        animate();
    }

    function stop() {
        running = false;
    }

    function onResize() {
        const container = document.getElementById('hero-petals');
        if (!container || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    return {
        init: init
    };
})();
