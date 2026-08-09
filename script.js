document.addEventListener('DOMContentLoaded', () => {

  // ─── Elements ───────────────────────────────────────────────
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const navLinks = nav.querySelectorAll('.header__link');
  const revealElements = document.querySelectorAll('.reveal');
  const faqItems = document.querySelectorAll('.faq-item');
  const form = document.getElementById('form');
  const cursorGlow = document.getElementById('cursorGlow');
  const orbes = document.querySelectorAll('.gradient-orbe');

  // ─── Header scroll effect ──────────────────────────────────
  let lastScroll = 0;

  const updateHeader = () => {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  };

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // ─── Burger menu ────────────────────────────────────────────
  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : !nav.classList.contains('open');
    burger.classList.toggle('active', isOpen);
    nav.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  burger.addEventListener('click', () => toggleMenu());

  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) {
      toggleMenu(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      toggleMenu(false);
    }
  });

  // ─── Reveal animations (IntersectionObserver) ──────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ─── Staggered reveal for cards ─────────────────────────────
  const cardGroups = [
    { selector: '.service-card', delay: 80 },
    { selector: '.advantage-card', delay: 80 },
    { selector: '.case-card', delay: 100 },
    { selector: '.value-card', delay: 80 },
    { selector: '.contact-link', delay: 100 },
    { selector: '.stat-card', delay: 150 },
  ];

  cardGroups.forEach(({ selector, delay }) => {
    const cards = document.querySelectorAll(selector);
    cards.forEach((card, i) => {
      card.style.setProperty('--reveal-delay', `${i * delay}ms`);
      card.style.transitionDelay = `${i * delay}ms`;
    });
  });

  // ─── FAQ accordion ──────────────────────────────────────────
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-item__question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });

    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });

  // ─── Smooth scroll for anchor links ─────────────────────────
  const smoothLinks = document.querySelectorAll('a[href^="#"]');
  smoothLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });

  // ─── Form handling ──────────────────────────────────────────
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('formName').value.trim();
      const contact = document.getElementById('formContact').value.trim();
      const message = document.getElementById('formMessage').value.trim();
      const nameInput = document.getElementById('formName');
      const contactInput = document.getElementById('formContact');
      let hasError = false;

      const contactError = form.querySelector('.form__error');
      if (contactError) contactError.remove();

      [nameInput, contactInput].forEach(input => {
        input.classList.remove('error');
      });

      if (!name) {
        nameInput.classList.add('error');
        hasError = true;
      }
      if (!contact) {
        contactInput.classList.add('error');
        hasError = true;
      } else if (contact.startsWith('@')) {
        // Telegram username — пропускаем
      } else {
        const digits = contact.replace(/\D/g, '');
        if (digits.length < 10) {
          contactInput.classList.add('error');
          hasError = true;
        }
      }

      if (hasError) {
        setTimeout(() => {
          document.querySelectorAll('.form__input.error').forEach(el => {
            el.classList.remove('error');
          });
          const msg = form.querySelector('.form__error');
          if (msg) msg.remove();
        }, 4000);
        return;
      }

      if (contact && !contact.startsWith('@')) {
        const warnMsg = document.createElement('div');
        warnMsg.className = 'form__error';
        warnMsg.textContent = 'Перед отправкой формы проверьте номер телефона, иначе с вами не смогут связаться';
        contactInput.parentNode.appendChild(warnMsg);
        setTimeout(() => {
          const msg = form.querySelector('.form__error');
          if (msg) msg.remove();
        }, 3000);
      }

      const submitBtn = form.querySelector('.btn--primary');
      const originalHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Отправка...';
      submitBtn.style.pointerEvents = 'none';
      submitBtn.style.opacity = '0.7';

      const formspreeEndpoint = 'https://formspree.io/f/xykrvedb';
      if (formspreeEndpoint) {
        fetch(formspreeEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name,
            contact: contact,
            message: message || '—'
          })
        })
          .then(res => {
            if (res.ok) {
              submitBtn.innerHTML = 'Отправлено ✓';
              submitBtn.style.background = '#4CAF50';
            } else {
              submitBtn.innerHTML = 'Ошибка :(';
              submitBtn.style.background = '#e74c3c';
            }
          })
          .catch(() => {
            submitBtn.innerHTML = 'Ошибка :(';
            submitBtn.style.background = '#e74c3c';
          });
      }

      setTimeout(() => {
        submitBtn.innerHTML = originalHtml;
        submitBtn.style.background = '';
        submitBtn.style.pointerEvents = '';
        submitBtn.style.opacity = '';
        form.reset();
      }, 3000);
    });

    document.querySelectorAll('.form__input').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('error');
      });
    });

    const contactInput = document.getElementById('formContact');
    if (contactInput) {
      contactInput.addEventListener('input', function () {
        if (this.value.startsWith('@')) return;
        let digits = this.value.replace(/\D/g, '');
        if (digits.length === 0) { this.value = ''; return; }
        if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1);
        let formatted = '+7';
        if (digits.length > 0) formatted += ' (' + digits.slice(0, 3);
        if (digits.length > 3) formatted += ') ' + digits.slice(3, 6);
        if (digits.length > 6) formatted += '-' + digits.slice(6, 8);
        if (digits.length > 8) formatted += '-' + digits.slice(8, 10);
        this.value = formatted;
      });
    }
  }

  // ─── Cursor glow effect ─────────────────────────────────────
  if (cursorGlow && window.innerWidth > 1024) {
    let cursorX = 0, cursorY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursorGlow.classList.add('visible');
    });

    document.addEventListener('mouseleave', () => {
      cursorGlow.classList.remove('visible');
    });

    const animateGlow = () => {
      glowX += (cursorX - glowX) * 0.08;
      glowY += (cursorY - glowY) * 0.08;
      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top = `${glowY}px`;
      requestAnimationFrame(animateGlow);
    };
    animateGlow();
  }

  // ─── Parallax orbes ─────────────────────────────────────────
  if (orbes.length && window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      orbes.forEach((orbe) => {
        const speed = parseFloat(orbe.getAttribute('data-speed')) || 0.03;
        orbe.style.transform = `translate(${x * 100 * speed}px, ${y * 100 * speed}px)`;
      });
    });
  }

  // ─── Hero stat card parallax ────────────────────────────────
  const heroVisual = document.querySelector('.hero__visual');
  const heroCardsStack = document.querySelector('.hero__cards-stack');
  if (heroVisual && heroCardsStack && window.innerWidth > 1024) {
    document.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / rect.width;
      const deltaY = (e.clientY - centerY) / rect.height;
      heroCardsStack.style.transform = `translate(${deltaX * 6}px, ${deltaY * 6}px)`;
    });
  }

  // ─── Initial reveal for hero elements ───────────────────────
  const heroReveals = document.querySelectorAll('.hero .reveal');
  heroReveals.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('revealed');
    }, 200 + i * 120);
  });

  // ─── Scroll progress indicator ──────────────────────────────
  const scrollProgress = document.createElement('div');
  scrollProgress.className = 'scroll-progress';
  scrollProgress.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent-hover));
    z-index: 1001;
    transition: width 0.1s linear;
    width: 0;
  `;
  document.body.appendChild(scrollProgress);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    scrollProgress.style.width = `${Math.min(progress, 100)}%`;
  }, { passive: true });

});
