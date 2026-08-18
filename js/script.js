/* ==========================================================================
   Akeel - 3D Futuristic Portfolio Interactive Script
   Three.js 3D Canvas, GSAP, Tilt Effects, Lightbox & Interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initThreeHero();
  initSkillBars();
  initTiltCards();
  initGalleryLightbox();
  initContactForm();
});

/* --- Navbar Scrolling & Mobile Menu --- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  // Sticky Navbar Blur on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Hamburger Toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      hamburger.querySelector('i').classList.toggle('fa-bars');
      hamburger.querySelector('i').classList.toggle('fa-xmark');
    });

    // Close mobile menu when clicking link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        if (hamburger.querySelector('i')) {
          hamburger.querySelector('i').classList.add('fa-bars');
          hamburger.querySelector('i').classList.remove('fa-xmark');
        }
      });
    });
  }

  // Highlight Current Page Nav Link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* --- Three.js 3D Hero Scene --- */
function initThreeHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Central 3D Futuristic Core Object (Wireframe Polyhedron + Inner Glowing Core)
  const coreGroup = new THREE.Group();

  // Outer Polyhedron
  const outerGeo = new THREE.IcosahedronGeometry(2, 1);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  coreGroup.add(outerMesh);

  // Inner Glowing Torus Knot
  const innerGeo = new THREE.TorusKnotGeometry(0.9, 0.25, 100, 16);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    wireframe: true,
    transparent: true,
    opacity: 0.65
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  coreGroup.add(innerMesh);

  scene.add(coreGroup);

  // Floating Particle Field
  const particleCount = 120;
  const particlesGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 15;
    positions[i + 1] = (Math.random() - 0.5) * 15;
    positions[i + 2] = (Math.random() - 0.5) * 15;
  }

  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particlesMat = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.05,
    transparent: true,
    opacity: 0.8
  });
  const particleSystem = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particleSystem);

  // Mouse Parallax Effect
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
  });

  // Render Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Rotate core meshes
    outerMesh.rotation.x = elapsedTime * 0.15;
    outerMesh.rotation.y = elapsedTime * 0.2;
    innerMesh.rotation.x = -elapsedTime * 0.3;
    innerMesh.rotation.z = elapsedTime * 0.25;

    // Orbit particles
    particleSystem.rotation.y = elapsedTime * 0.05;

    // Smooth Mouse Parallax lerp
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;
    coreGroup.rotation.y = targetX * 2;
    coreGroup.rotation.x = targetY * 2;

    renderer.render(scene, camera);
  }

  animate();

  // Responsive Resize
  window.addEventListener('resize', () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

/* --- Animated Skill Progress Bars --- */
function initSkillBars() {
  const skillBars = document.querySelectorAll('.skill-progress');
  if (skillBars.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const progress = entry.target.getAttribute('data-progress');
        entry.target.style.width = progress + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillBars.forEach(bar => observer.observe(bar));
}

/* --- 3D Parallax Tilt Effect on Cards --- */
function initTiltCards() {
  const tiltCards = document.querySelectorAll('.glass-card, .project-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-6px)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

/* --- Gallery Filter & Lightbox --- */
function initGalleryLightbox() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.querySelector('.lightbox-modal');

  // Category Filtering
  if (filterBtns.length > 0 && galleryItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        galleryItems.forEach(item => {
          if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // Lightbox Modal Logic
  if (!modal) return;

  const modalImg = modal.querySelector('.lightbox-img');
  const modalCaption = modal.querySelector('.lightbox-caption');
  const closeBtn = modal.querySelector('.lightbox-close');
  const prevBtn = modal.querySelector('.lightbox-prev');
  const nextBtn = modal.querySelector('.lightbox-next');

  let currentIndex = 0;
  const visibleItems = () => Array.from(document.querySelectorAll('.gallery-item')).filter(item => item.style.display !== 'none');

  function openLightbox(index) {
    const items = visibleItems();
    if (items.length === 0 || index < 0 || index >= items.length) return;

    currentIndex = index;
    const item = items[currentIndex];
    const imgSrc = item.querySelector('img').src;
    const title = item.querySelector('h4') ? item.querySelector('h4').textContent : '';

    modalImg.src = imgSrc;
    modalCaption.textContent = title;
    modal.classList.add('active');
  }

  galleryItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      const items = visibleItems();
      const visibleIndex = items.indexOf(item);
      openLightbox(visibleIndex >= 0 ? visibleIndex : 0);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (prevBtn) prevBtn.addEventListener('click', () => openLightbox(currentIndex - 1 < 0 ? visibleItems().length - 1 : currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => openLightbox(currentIndex + 1 >= visibleItems().length ? 0 : currentIndex + 1));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') modal.classList.remove('active');
    if (e.key === 'ArrowLeft') prevBtn && prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn && nextBtn.click();
  });
}

/* --- Contact Form Validation & Mailto Fallback --- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusMsg = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const subject = form.querySelector('#subject').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name || !email || !subject || !message) {
      showStatus('Please fill in all required fields.', 'error');
      return;
    }

    const emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
    if (!emailRegex.test(email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Since this is frontend-only, open mailto link
    showStatus('Opening mail client... (Frontend direct message placeholder)', 'success');
    
    setTimeout(() => {
      const mailtoUrl = 'mailto:akeel.cse.student@example.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message);
      window.location.href = mailtoUrl;
      form.reset();
    }, 1000);
  });

  function showStatus(msg, type) {
    if (!statusMsg) return;
    statusMsg.textContent = msg;
    statusMsg.className = 'form-status ' + type;
  }
}
