// js/script.js (production-ready client helpers)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[id^="year"]').forEach(el => el.textContent = new Date().getFullYear());

  try {
    if (window.lottie) {
      const el = document.getElementById('lottieOrn');
      if (el) {
        lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: true, path: 'assets/animations/gold-flecks.json' });
      }
    }
  } catch (e) { console.warn('Lottie init failed', e); }

  if (window.gsap) {
    gsap.from('.hero-content', { y: 40, autoAlpha:0, duration:1.1, ease: 'power3.out' });
    gsap.utils.toArray('.offer-card, .product-card, .offer-large').forEach((el, i) => {
      gsap.from(el, { y: 20, autoAlpha:0, duration: 0.8, delay: i*0.06, ease:'power3.out', scrollTrigger: { trigger: el, start: 'top 80%' }});
    });
  }

  (function testimonialRotate(){
    const slides = document.querySelectorAll('#testSlider .slide');
    if (!slides.length) return;
    let i = 0;
    slides[i].classList.add('active');
    setInterval(() => {
      slides[i].classList.remove('active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('active');
    }, 7000);
  })();

  const counters = document.querySelectorAll('.stat-value');
  counters.forEach(el => {
    let fired = false;
    const obs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !fired) {
          fired = true;
          animateCount(el, parseInt(el.dataset.target || el.textContent, 10) || 0);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    obs.observe(el);
  });

  function animateCount(el, target) {
    const duration = 1200;
    let start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / duration);
      el.textContent = Math.floor(p * target).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('.mc-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const action = form.getAttribute('action');
      const fd = new FormData(form);
      const payload = {};
      fd.forEach((v,k) => payload[k]=v);

      try {
        const res = await fetch('/api/subscribe', {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ email: payload.EMAIL || payload.email || '', fname: payload.FNAME || payload.fname || '' })
        });
        if (res.ok) {
          alert('Welcome to the Circle — check your email for confirmation.');
          form.reset();
          return;
        } else {
          console.warn('Proxy failed', await res.text());
        }
      } catch(err) {
        console.warn('Proxy error', err);
      }

      if (action) {
        const params = new URLSearchParams();
        fd.forEach((v,k) => params.append(k, v));
        window.open(action + '&' + params.toString(), '_blank');
      } else {
        alert('Form action missing — contact the site admin.');
      }
    });
  });

  if (document.getElementById('productContent')) {
    loadProduct();
  }

  async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('pid') || 'mentor-playbook';
    const catalog = {
      'mentor-playbook': { title: "The Mentor's Playbook", price: 1999, image:'assets/images/book-1.jpg', description:'A practical manual.' },
      'rituals-wealth': { title:'Rituals of Wealth', price: 2999, image:'assets/images/book-2.jpg', description:'Systems for money.' },
      'fatherhood-leadership': { title:'Fatherhood & Leadership', price: 2499, image:'assets/images/book-3.jpg', description:'Lead your family.' }
    };
    const p = catalog[pid];
    const container = document.getElementById('productContent');
    if (!p) {
      container.innerHTML = '<h1>Product not found</h1>';
      return;
    }
    container.innerHTML = `
      <div class="product-detail">
        <img src="${p.image}" alt="${p.title}" />
        <div>
          <h1>${p.title}</h1>
          <p>${p.description}</p>
          <p class="price">USD ${(p.price/100).toFixed(2)}</p>
          <button id="buyBtn" class="btn btn-primary">Buy Now</button>
        </div>
      </div>
    `;
    document.getElementById('buyBtn').addEventListener('click', createCheckout.bind(null, pid));
  }

  async function createCheckout(pid) {
    try {
      const res = await fetch('/api/create-checkout-session', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ pid })
      });
      const data = await res.json();
      if (data.url) {
        window.location = data.url;
      } else {
        alert('Checkout creation failed.');
      }
    } catch(err) {
      console.error(err);
      alert('Payment initiation failed.');
    }
  }

  const mForm = document.getElementById('mentorshipForm');
  if (mForm) {
    mForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thanks — your mentorship application is received. We will contact you soon.');
      mForm.reset();
    });
  }
});
// main.js
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
  });

  // Smooth scroll for nav links
  document.querySelectorAll(".nav a").forEach(link => {
    link.addEventListener("click", e => {
      if (link.getAttribute("href").startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
          nav.classList.remove("active");
        }
      }
    });
  });

  // Simple fade-in animation
  const cards = document.querySelectorAll(".card");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(card => observer.observe(card));
});
// hamburger.js — include at end of body or in your main bundle
(function () {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (!toggle || !nav) return;

  // create overlay element (optional but recommended)
  let overlay = document.querySelector('.mobile-nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';
    document.body.appendChild(overlay);
  }

  const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  function getFocusable() { return Array.from(nav.querySelectorAll(focusableSelectors)).filter(el => !el.hasAttribute('disabled')); }

  function openMenu() {
    nav.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    nav.setAttribute('aria-hidden', 'false');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // prevent background scroll

    // focus management: focus first focusable element inside nav
    const focusables = getFocusable();
    if (focusables.length) focusables[0].focus();

    // add keydown listener for focus trap
    document.addEventListener('keydown', trapTab);
  }

  function closeMenu() {
    nav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    toggle.focus();
    document.removeEventListener('keydown', trapTab);
  }

  function trapTab(e) {
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key !== 'Tab') return;

    const focusables = getFocusable();
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) { // tabbing backwards on first -> move to last
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) { // tabbing forward on last -> move to first
      e.preventDefault();
      first.focus();
    }
  }

  // toggle click
  toggle.addEventListener('click', function (e) {
    const isOpen = nav.classList.contains('open');
    if (isOpen) closeMenu(); else openMenu();
  });

  // overlay click closes menu
  overlay.addEventListener('click', function () {
    if (nav.classList.contains('open')) closeMenu();
  });

  // close on outside click (for robustness)
  document.addEventListener('click', function (e) {
    if (!nav.classList.contains('open')) return;
    if (nav.contains(e.target) || toggle.contains(e.target) || overlay.contains(e.target)) return;
    closeMenu();
  });

  // ensure menu closes on window resize to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && nav.classList.contains('open')) {
      closeMenu();
    }
  });
})();
  // Toggle sidebar
    document.getElementById("hamburger").onclick = function () {
      document.getElementById("sidebar").classList.toggle("active");
    };
    
    
        document.addEventListener('DOMContentLoaded', () => {
            const productList = document.getElementById('product-list');
            const cartButton = document.getElementById('cart-button');
            const cartModal = document.getElementById('cart-modal');
            const closeCartBtn = document.getElementById('close-cart-btn');
            const cartItemsContainer = document.getElementById('cart-items');
            const cartCount = document.getElementById('cart-count');
            const cartSubtotal = document.getElementById('cart-subtotal');
            const checkoutBtn = document.getElementById('checkout-btn');

            // --- State Management ---
            let cart = [];

            // --- Sample Product Data ---
            const products = [
                { id: 1, name: 'Vintage Leather Jacket', price: 149.99, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1935&auto=format&fit=crop', priceId: 'price_1...' }, // Replace with actual Stripe Price ID
                { id: 2, name: 'Mechanical Keyboard', price: 89.50, image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=2070&auto=format&fit=crop', priceId: 'price_1...' },
                { id: 3, name: 'Audiophile Headphones', price: 299.00, image: 'https://images.unsplash.com/photo-1585298723682-711556143f77?q=80&w=1974&auto=format&fit=crop', priceId: 'price_1...' },
                { id: 4, name: 'Designer Sunglasses', price: 120.00, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1780&auto=format&fit=crop', priceId: 'price_1...' },
                { id: 5, name: 'Automatic Wrist Watch', price: 450.00, image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=1964&auto=format&fit=crop', priceId: 'price_1...' },
                { id: 6, name: 'Handcrafted Mug', price: 25.00, image: 'https://images.unsplash.com/photo-1554522430-85f269a21234?q=80&w=1974&auto=format&fit=crop', priceId: 'price_1...' },
                { id: 7, name: 'Minimalist Backpack', price: 75.00, image: 'https://images.unsplash.com/photo-1553062407-98eeb6e0e5c8?q=80&w=1964&auto=format&fit=crop', priceId: 'price_1...' },
                { id: 8, name: 'Smart Home Hub', price: 99.99, image: 'https://images.unsplash.com/photo-1565932599605-85c0733c7b80?q=80&w=2070&auto=format&fit=crop', priceId: 'price_1...' },
            ];

            // --- Rendering ---
            function renderProducts() {
                productList.innerHTML = products.map(product => `
                    <div class="product-card bg-black-alpha backdrop-blur-md rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover">
                        <div class="p-6 relative">
                            <h4 class="text-xl font-semibold mb-2">${product.name}</h4>
                            <p class="text-lg font-bold text-blue-400">$${product.price.toFixed(2)}</p>
                            <button class="add-to-cart-btn absolute bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all" data-id="${product.id}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                `).join('');
            }

            function renderCart() {
                if (cart.length === 0) {
                    cartItemsContainer.innerHTML = '<p class="text-gray-400">Your cart is empty.</p>';
                    checkoutBtn.disabled = true;
                } else {
                    cartItemsContainer.innerHTML = cart.map(item => `
                        <div class="flex justify-between items-center mb-4 p-2 rounded-lg bg-gray-800">
                            <div class="flex items-center">
                                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md mr-4">
                                <div>
                                    <h5 class="font-semibold">${item.name}</h5>
                                    <p class="text-sm text-gray-400">$${item.price.toFixed(2)} x ${item.quantity}</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <span class="font-bold text-blue-400 mr-4">$${(item.price * item.quantity).toFixed(2)}</span>
                                <button class="text-red-500 hover:text-red-400 remove-from-cart" data-id="${item.id}">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    `).join('');
                     checkoutBtn.disabled = false;
                }

                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                cartCount.textContent = totalItems;

                const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
            }

            // --- Event Handlers ---
            function handleAddToCart(e) {
                if (!e.target.classList.contains('add-to-cart-btn')) return;
                
                const productId = parseInt(e.target.dataset.id);
                const product = products.find(p => p.id === productId);
                const cartItem = cart.find(item => item.id === productId);

                if (cartItem) {
                    cartItem.quantity++;
                } else {
                    cart.push({ ...product, quantity: 1 });
                }

                renderCart();
                showNotification(`${product.name} added to cart!`);
            }

            function handleRemoveFromCart(e) {
                if (!e.target.closest('.remove-from-cart')) return;

                const productId = parseInt(e.target.closest('.remove-from-cart').dataset.id);
                cart = cart.filter(item => item.id !== productId);
                
                renderCart();
            }

            function openCart() {
                cartModal.classList.remove('hidden');
            }

            function closeCart() {
                cartModal.classList.add('hidden');
            }
            
            function showNotification(message) {
                const notification = document.createElement('div');
                notification.className = 'fixed bottom-5 right-5 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-lg animate-bounce';
                notification.textContent = message;
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }

            // --- Stripe Checkout ---
            // Replace with your actual Stripe publishable key.
            const stripe = Stripe('pk_test_YOUR_STRIPE_PUBLIC_KEY'); 

            async function handleCheckout() {
                checkoutBtn.disabled = true;
                checkoutBtn.textContent = 'Processing...';

                try {
                    const response = await fetch('http://localhost:3000/create-checkout-session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items: cart })
                    });
                    
                    if (!response.ok) {
                        throw new Error('Something went wrong with the server.');
                    }

                    const session = await response.json();
                    
                    const result = await stripe.redirectToCheckout({ sessionId: session.id });

                    if (result.error) {
                        showNotification(result.error.message);
                    }
                } catch (error) {
                    showNotification(error.message);
                } finally {
                    checkoutBtn.disabled = false;
                    checkoutBtn.textContent = 'Proceed to Checkout';
                }
            }


            // --- Event Listeners ---
            productList.addEventListener('click', handleAddToCart);
            cartItemsContainer.addEventListener('click', handleRemoveFromCart);
            cartButton.addEventListener('click', openCart);
            closeCartBtn.addEventListener('click', closeCart);
            checkoutBtn.addEventListener('click', handleCheckout);
            
            // Close cart if clicked outside
            cartModal.addEventListener('click', (e) => {
                if(e.target === cartModal){
                    closeCart();
                }
            });

            // --- Initial Load ---
            renderProducts();
            renderCart();
        });
        // Handle contact form
    document.getElementById('contactForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fname = document.getElementById('fname').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      document.getElementById('formResponse').innerText = "Sending...";

      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, fname, message })
        });
        const data = await res.json();
        if (res.ok) {
          document.getElementById('formResponse').innerText = "Message sent successfully!";
        } else {
          document.getElementById('formResponse').innerText = data.error || "Error sending message.";
        }
      } catch (err) {
        document.getElementById('formResponse').innerText = "Server error. Please try again.";
      }
    });

    // Handle newsletter
    document.getElementById('newsletterForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletterEmail').value;

      document.getElementById('newsletterResponse').innerText = "Subscribing...";

      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          document.getElementById('newsletterResponse').innerText = "Subscribed successfully!";
        } else {
          document.getElementById('newsletterResponse').innerText = data.error || "Error subscribing.";
        }
      } catch (err) {
        document.getElementById('newsletterResponse').innerText = "Server error. Please try again.";
      }
    });
     let currentCategory = "all";

    function filterEvents(category, e) {
      currentCategory = category;
      let cards = document.querySelectorAll(".event-card");
      let buttons = document.querySelectorAll(".filter-btn");

      // Highlight active button
      buttons.forEach(btn => btn.classList.remove("active"));
      e.target.classList.add("active");

      applyFilters();
    }

    function applyFilters() {
      let searchText = document.getElementById("search").value.toLowerCase();
      let cards = document.querySelectorAll(".event-card");

      cards.forEach(card => {
        let text = card.innerText.toLowerCase();
        let matchesCategory = currentCategory === "all" || card.classList.contains(currentCategory);
        let matchesSearch = text.includes(searchText);

        if (matchesCategory && matchesSearch) {
          card.classList.add("show");
        } else {
          card.classList.remove("show");
        }
      });
    }

    // Search event listener
    document.getElementById("search").addEventListener("input", applyFilters);
document.addEventListener('DOMContentLoaded', function() {

    // --- Sticky Header on Scroll ---
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Hamburger Menu ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));

    // --- Fade-in Animation on Scroll ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => observer.observe(el));

});
