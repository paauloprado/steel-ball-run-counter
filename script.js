// Steel Ball Run Countdown Timer
class CountdownTimer {
    constructor() {
        this.targetDate = new Date('2025-09-23T00:00:00-03:00').getTime(); // Horário do Brasil
        this.timer = null;
        this.mounted = false;
        this.elements = {
            loading: document.getElementById('loading'),
            mainContent: document.getElementById('main-content'),
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),
            eventPopup: document.getElementById('event-popup')
        };
        
        this.init();
    }

    init() {
        // Simular loading inicial
        setTimeout(() => {
            this.mounted = true;
            this.showMainContent();
            this.startCountdown();
        }, 1000);

        // Event listeners
        this.setupEventListeners();
    }

    showMainContent() {
        this.elements.loading.style.display = 'none';
        this.elements.mainContent.style.display = 'block';
    }

    setupEventListeners() {
        // Fechar popup ao clicar no overlay
        this.elements.eventPopup.addEventListener('click', (e) => {
            if (e.target === this.elements.eventPopup) {
                this.closeEventPopup();
            }
        });

        // Fechar popup com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.eventPopup.style.display !== 'none') {
                this.closeEventPopup();
            }
        });
    }

    startCountdown() {
        this.updateCountdown(); // Atualizar imediatamente
        
        this.timer = setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }

    updateCountdown() {
        const now = new Date().getTime();
        const difference = this.targetDate - now;

        if (difference > 0) {
            const timeLeft = this.calculateTimeLeft(difference);
            this.updateDisplay(timeLeft);
        } else {
            this.handleEventStart();
        }
    }

    calculateTimeLeft(difference) {
        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }

    updateDisplay(timeLeft) {
        const elements = ['days', 'hours', 'minutes', 'seconds'];
        
        elements.forEach(element => {
            const value = timeLeft[element].toString().padStart(2, '0');
            const currentElement = this.elements[element];
            
            if (currentElement.textContent !== value) {
                // Adicionar animação de atualização
                currentElement.classList.add('updating');
                currentElement.textContent = value;
                
                setTimeout(() => {
                    currentElement.classList.remove('updating');
                }, 300);
            }
        });
    }

    handleEventStart() {
        // Parar o timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Zerar o display
        this.updateDisplay({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        
        // Mostrar popup do evento
        this.showEventPopup();
    }

    showEventPopup() {
        this.elements.eventPopup.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    }

    closeEventPopup() {
        this.elements.eventPopup.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar scroll
    }

    destroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}

// Utility Functions
function closeEventPopup() {
    if (window.countdownTimer) {
        window.countdownTimer.closeEventPopup();
    }
}

// Smooth scroll para links internos (se houver)
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Animações de entrada para elementos
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observar elementos que devem animar
    const animatedElements = document.querySelectorAll('.countdown-item, .social-link');
    animatedElements.forEach(el => observer.observe(el));
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Resize handler para responsividade
const handleResize = debounce(() => {
    // Ajustar elementos se necessário
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    // Aplicar ajustes específicos para diferentes tamanhos de tela
    if (viewport.width < 480) {
        document.body.classList.add('mobile-small');
    } else {
        document.body.classList.remove('mobile-small');
    }
}, 250);

// Error handling
function handleError(error, context = 'Unknown') {
    console.error(`Error in ${context}:`, error);
    
    // Mostrar mensagem de erro amigável se necessário
    if (context === 'countdown') {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Erro ao carregar o contador. Recarregue a página.';
        document.body.appendChild(errorMessage);
    }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Inicializar o contador
        window.countdownTimer = new CountdownTimer();
        
        // Configurar outros recursos
        animateOnScroll();
        window.addEventListener('resize', handleResize);
        
        // Executar resize inicial
        handleResize();
        
        console.log('Steel Ball Run Countdown initialized successfully!');
    } catch (error) {
        handleError(error, 'initialization');
    }
});

// Cleanup quando a página for descarregada
window.addEventListener('beforeunload', () => {
    if (window.countdownTimer) {
        window.countdownTimer.destroy();
    }
});

// Service Worker registration (opcional, para PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Exportar para uso global se necessário
window.SteelBallRunCountdown = {
    CountdownTimer,
    closeEventPopup,
    smoothScroll
};
