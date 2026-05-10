const toggle = document.getElementById("menu-toggle");
const nav = document.querySelector(".nav-center");

toggle.addEventListener("click", () => {
    nav.classList.toggle("active");
});
window.addEventListener("scroll", () => {
    const scroll = window.scrollY;
    const hero = document.querySelector(".hero-content");

    if (window.innerWidth > 768) {
        hero.style.transform = `translateY(${scroll * 0.2}px)`;
        hero.style.opacity = 1 - scroll / 600;
    } else {
        hero.style.transform = "none";
        hero.style.opacity = 1;
    }

    const nav = document.querySelector(".navbar");
    if (scroll > 50) {
        nav.classList.add("scrolled");
    } else {
        nav.classList.remove("scrolled");
    }
});
const cards = document.querySelectorAll(".program-card, .trainer-card");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add("show");
            }, index * 150); // delay between cards
        }
    });
}, {
    threshold: 0.2
});

cards.forEach(card => {
    observer.observe(card);
});

document.querySelectorAll('.nav-center a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        const start = window.pageYOffset;
        const end = target.offsetTop - 80;
        const distance = end - start;
        const duration = 600; // 🔥 control speed (higher = slower)

        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;

            const run = easeInOutCubic(timeElapsed, start, distance, duration);
            window.scrollTo(0, run);

            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function easeInOutCubic(t, b, c, d) {
            t /= d/2;
            if (t < 1) return c/2*t*t*t + b;
            t -= 2;
            return c/2*(t*t*t + 2) + b;
        }

        requestAnimationFrame(animation);

        nav.classList.remove("active");
    });
});
const reveals = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");
        }
    });
}, {
    threshold: 0.2
});

reveals.forEach(el => revealObserver.observe(el));
// MODAL SYSTEM (pricing + video + trainers + program)
class ModalSystem {
    
    constructor() {
        this.modals = document.querySelectorAll('.modal');
        this.pricingPopup = document.getElementById('pricingPopup');
        this.activeModal = null;

        this.init();
    }

    init() {
        document.querySelectorAll('.stories-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.open('storiesPopup');
        });
    });
        // Close buttons for generic modal
        document.querySelectorAll('.modal-close').forEach((closeBtn) => {
            closeBtn.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-modal');
                this.close(modalId);
            });
        });

        // Overlay click (generic)
        this.modals.forEach((modal) => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close( modal.id);
                }
            });
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.close(this.activeModal.id);
            }
        });

        // Body scroll lock for ANY modal open
        // Open pricing popup
        document.querySelectorAll('.open-pricing').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open('pricingPopup');
            });
        });

        // Pricing close
        const closePricingBtn = document.getElementById('closePopup');
        if (closePricingBtn) {
            closePricingBtn.addEventListener('click', () => this.close('pricingPopup'));
        }

        // Pricing overlay click
        if (this.pricingPopup) {
            this.pricingPopup.addEventListener('click', (e) => {
                if (e.target === this.pricingPopup) this.close('pricingPopup');
            });
        }

        // Watch video
        document.querySelectorAll('.watch-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open('videoPopup');
            });
        });

        // View all trainers
        document.querySelectorAll('.view-all').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open('trainersPopup');
            });
        });

        // Program cards -> open program popup
        document.querySelectorAll('.program-card a').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const card = link.closest('.program-card');
                this.openProgramModal(card);
            });
        });
    }

   open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    this.closeAll();

    modal.classList.add('active');
    this.activeModal = modal;

    document.body.classList.add('modal-open');

    // Reset scrollable containers so the modal always starts fully visible from the top.
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) modalContent.scrollTop = 0;

    const pricingContent = modal.querySelector('.popup-content');
    if (pricingContent) pricingContent.scrollTop = 0;

    // video stuff
    if (modalId === 'videoPopup') {
        const iframe = modal.querySelector('iframe');
        if (iframe && iframe.dataset.src) iframe.src = iframe.dataset.src;
    }
}   


    close(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('active');
        if (this.activeModal && this.activeModal.id === modalId) this.activeModal = null;

        // Only unlock if no modals are active
        const anyActive = document.querySelector('.modal.active') || document.getElementById('pricingPopup')?.classList.contains('active');
        if (!anyActive) document.body.classList.remove('modal-open');

        if (modalId === 'videoPopup') {
            // Optional: stop video by removing src
            const iframe = modal.querySelector('iframe');
            if (iframe && !iframe.dataset.src) {
                iframe.dataset.src = iframe.src;
                iframe.src = '';
            }
        }
    }

    closeAll() {
        document.querySelectorAll('.modal.active').forEach((m) => m.classList.remove('active'));
        if (this.pricingPopup) this.pricingPopup.classList.remove('active');
        document.body.classList.remove('modal-open');
        this.activeModal = null;
    }

    openProgramModal(card) {
        if (!card) return;

        const titleEl = card.querySelector('h3');
        const descEl = card.querySelector('p');
        const title = titleEl ? titleEl.textContent.trim() : '';
        const desc = descEl ? descEl.textContent.trim() : '';

        const features = {
            'Strength Training': [
                'Progressive overload plans',
                'Weekly performance tracking',
                'Personal trainer guidance',
            ],
            'Fat Loss': [
                'Fat-burning workouts',
                'Nutrition strategy',
                'Habit tracking & accountability',
            ],
            'Conditioning': [
                'HIIT sessions',
                'Endurance training',
                'Performance tracking',
            ],
            'Group Training & Classes': [
                'Group workouts',
                'Motivational environment',
                'Scheduled classes',
            ],
            'Nutrition & Support': [
                'Meal planning guidance',
                'Diet tracking tips',
                'Coach support',
            ],
            'Health & Recovery': [
                'Mobility routines',
                'Injury prevention',
                'Rest & recovery plans',
            ],
        };

        const modal = document.getElementById('programPopup');
        if (!modal) return;

        modal.querySelector('.program-title').textContent = title;
        modal.querySelector('.program-desc').textContent = desc;

        const modalFeatures = modal.querySelector('.program-features');
        const programFeatures = features[title] || [];

        modalFeatures.innerHTML = '';
        programFeatures.forEach((feature) => {
            const li = document.createElement('li');
            li.textContent = feature;
            modalFeatures.appendChild(li);
        });

        this.open('programPopup');
    }
    
}

new ModalSystem();

