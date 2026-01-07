// Menu Meia-Lua
const menuBtn = document.getElementById('menuBtn');
const luaOverlay = document.getElementById('luaOverlay');
const luaMenu = document.getElementById('luaMenu');
const luaLinks = document.querySelectorAll('.lua-link');

function toggleMenu() {
    menuBtn.classList.toggle('active');
    luaOverlay.classList.toggle('active');
    luaMenu.classList.toggle('active');
    
    // Impedir rolagem quando o menu estiver aberto
    if (luaMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

menuBtn.addEventListener('click', toggleMenu);

// Fechar menu ao clicar no overlay
luaOverlay.addEventListener('click', toggleMenu);

// Fechar menu ao clicar em um link
luaLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Fechar menu
        menuBtn.classList.remove('active');
        luaOverlay.classList.remove('active');
        luaMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Rolar para a seção correspondente
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            setTimeout(() => {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }, 300);
        }
    });
});

// Fechar menu com tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && luaMenu.classList.contains('active')) {
        toggleMenu();
    }
});

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Animação de entrada dos elementos
const fadeElements = document.querySelectorAll('.fade-in');

const fadeInOnScroll = () => {
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
};

window.addEventListener('scroll', fadeInOnScroll);
fadeInOnScroll(); // Chamar uma vez ao carregar

// Contadores animados suaves
class SmoothCounter {
    constructor(element, target) {
        this.element = element;
        this.target = target;
        this.current = 0;
        this.duration = this.calculateDuration();
        this.startTime = null;
        this.isCounting = false;
        this.animationId = null;
        this.hasCompleted = false;
    }
    
    calculateDuration() {
        // Contadores mais longos têm durações mais longas
        if (this.target >= 1000) return 3500; // Pacientes: 3.5 segundos
        if (this.target >= 50) return 2500;   // Satisfação: 2.5 segundos
        return 2000;                          // Anos: 2 segundos
    }
    
    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
    
    start() {
        if (this.isCounting || this.hasCompleted) return;
        
        this.isCounting = true;
        this.startTime = Date.now();
        this.element.classList.add('animating');
        this.animate();
    }
    
    stop() {
        this.isCounting = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    reset() {
        this.stop();
        this.current = 0;
        this.element.textContent = '0';
        this.element.classList.remove('animating');
        this.hasCompleted = false;
    }
    
    animate() {
        if (!this.isCounting) return;
        
        const now = Date.now();
        const elapsed = now - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        const easeProgress = this.easeOutQuart(progress);
        
        this.current = Math.floor(easeProgress * this.target);
        this.element.textContent = this.current;
        
        if (progress < 1) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.isCounting = false;
            this.hasCompleted = true;
            setTimeout(() => {
                this.element.classList.remove('animating');
            }, 500);
        }
    }
}

// Gerenciador de contadores
class CounterManager {
    constructor() {
        this.counters = [];
        this.observer = null;
        this.hasStarted = false;
        this.lastScrollY = 0;
        this.init();
    }
    
    init() {
        // Criar contadores
        const counter1 = document.getElementById('counter1');
        const counter2 = document.getElementById('counter2');
        const counter3 = document.getElementById('counter3');
        
        if (counter1 && counter2 && counter3) {
            this.counters = [
                new SmoothCounter(counter1, 2500),
                new SmoothCounter(counter2, 98),
                new SmoothCounter(counter3, 15)
            ];
            
            this.setupObserver();
        }
    }
    
    setupObserver() {
        const heroSection = document.getElementById('inicio');
        if (!heroSection) return;
        
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3 // Inicia quando 30% da seção está visível
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasStarted) {
                    this.startCounters();
                    this.hasStarted = true;
                }
                
                // Reiniciar contadores se a seção ficar visível novamente
                if (entry.isIntersecting && this.hasStarted) {
                    this.checkForRestart();
                }
            });
        }, options);
        
        this.observer.observe(heroSection);
    }
    
    startCounters() {
        // Iniciar com atraso para efeito cascata
        this.counters.forEach((counter, index) => {
            setTimeout(() => {
                counter.start();
            }, index * 400); // 400ms de atraso entre cada contador
        });
    }
    
    checkForRestart() {
        // Verificar se o usuário rolou para cima (para reiniciar os contadores)
        const currentScrollY = window.scrollY;
        const scrolledUp = currentScrollY < this.lastScrollY;
        
        // Se o usuário rolou para cima e os contadores já completaram
        if (scrolledUp && this.allCountersCompleted()) {
            const heroSection = document.getElementById('inicio');
            const rect = heroSection.getBoundingClientRect();
            const isHeroVisible = rect.top >= 0 && rect.top <= window.innerHeight * 0.7;
            
            // Se a seção hero está visível na parte superior da tela
            if (isHeroVisible) {
                this.restartCounters();
            }
        }
        
        this.lastScrollY = currentScrollY;
    }
    
    allCountersCompleted() {
        return this.counters.every(counter => counter.hasCompleted);
    }
    
    restartCounters() {
        // Resetar todos os contadores
        this.counters.forEach(counter => counter.reset());
        
        // Pequeno delay antes de reiniciar
        setTimeout(() => {
            this.startCounters();
        }, 300);
    }
}

// Inicializar gerenciador de contadores
let counterManager;

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    counterManager = new CounterManager();
    
    // Verificar se a seção já está visível no carregamento
    const heroSection = document.getElementById('inicio');
    if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        
        if (isVisible && !counterManager.hasStarted) {
            setTimeout(() => counterManager.startCounters(), 800);
        }
    }
});

// Suavizar rolagem para links âncora
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});