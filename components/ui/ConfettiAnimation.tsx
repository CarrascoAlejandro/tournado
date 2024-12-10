import React, { useEffect, useRef } from 'react';

interface ConfettiAnimationProps {
  show: boolean;
  colors?: string[];
  frequency?: number;
}

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ 
  show, 
  colors = ['#EF2964', '#00C09D', '#2D87B0', '#48485E', '#EFFF1D'], 
  frequency = 3 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return; // Solo se activa la animación si show es true
    
    const containerEl = containerRef.current;
    if (!containerEl) return;

    class Confettiful {
      el: HTMLElement;
      containerEl: HTMLElement | null;
      confettiFrequency: number;
      confettiColors: string[];
      confettiAnimations: string[];
      confettiInterval: number | undefined;

      constructor(el: HTMLElement) {
        this.el = el;
        this.containerEl = null;
        this.confettiFrequency = frequency;
        this.confettiColors = colors;
        this.confettiAnimations = ['slow', 'medium', 'fast'];
        
        this._setupElements();
        this._renderConfetti();
      }

      _setupElements() {
        const containerEl = document.createElement('div');
        const elPosition = getComputedStyle(this.el).position;
        
        if (elPosition !== 'relative' && elPosition !== 'absolute') {
          this.el.style.position = 'relative';
        }

        containerEl.classList.add('confetti-container');
        this.el.appendChild(containerEl);
        this.containerEl = containerEl;
      }

      _renderConfetti() {
        this.confettiInterval = window.setInterval(() => {
          // Usamos "type assertion" para añadir la propiedad removeTimeout
          const confettiEl = document.createElement('div') as HTMLDivElement & { removeTimeout: ReturnType<typeof setTimeout> };
          const confettiSize = (Math.floor(Math.random() * 3) + 7) + 'px';
          const confettiBackground = this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)];
          const confettiLeft = (Math.floor(Math.random() * this.el.offsetWidth)) + 'px';
          const confettiAnimation = this.confettiAnimations[Math.floor(Math.random() * this.confettiAnimations.length)];
          
          confettiEl.classList.add('confetti', `confetti--animation-${confettiAnimation}`);
          confettiEl.style.left = confettiLeft;
          confettiEl.style.width = confettiSize;
          confettiEl.style.height = confettiSize;
          confettiEl.style.backgroundColor = confettiBackground;
          
          confettiEl.removeTimeout = setTimeout(() => {
            confettiEl.remove();
          }, 3000);
          
          this.containerEl?.appendChild(confettiEl);
        }, 25);
      }

      destroy() {
        clearInterval(this.confettiInterval);
        this.containerEl?.remove();
      }
    }

    const confettiInstance = new Confettiful(containerEl);

    return () => {
      confettiInstance.destroy();
    };
  }, [show, colors, frequency]);

  return (
    <div ref={containerRef} style={styles.confettiWrapper}></div>
  );
};

export default ConfettiAnimation;

const styles: Record<string, React.CSSProperties> = {
  confettiWrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 999,
  },
  confettiContainer: {
    perspective: '700px',
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  confetti: {
    position: 'absolute',
    zIndex: 1,
    top: '-10px',
    borderRadius: '0%',
  }
};

// Estilos con keyframes y clases para la animación
const globalStyles = `
  .confetti-container {
    perspective: 700px;
    position: absolute;
    overflow: hidden;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .confetti {
    position: absolute;
    z-index: 1;
    top: -10px;
    border-radius: 0%;
  }

  .confetti--animation-slow {
    animation: confetti-slow 2.25s linear 1 forwards;
  }

  .confetti--animation-medium {
    animation: confetti-medium 1.75s linear 1 forwards;
  }

  .confetti--animation-fast {
    animation: confetti-fast 1.25s linear 1 forwards;
  }

  @keyframes confetti-slow {
    0% { transform: translate3d(0, 0, 0) rotateX(0) rotateY(0); }
    100% { transform: translate3d(25px, 105vh, 0) rotateX(360deg) rotateY(180deg); }
  }

  @keyframes confetti-medium {
    0% { transform: translate3d(0, 0, 0) rotateX(0) rotateY(0); }
    100% { transform: translate3d(100px, 105vh, 0) rotateX(100deg) rotateY(360deg); }
  }

  @keyframes confetti-fast {
    0% { transform: translate3d(0, 0, 0) rotateX(0) rotateY(0); }
    100% { transform: translate3d(-50px, 105vh, 0) rotateX(10deg) rotateY(250deg); }
  }
`;

// Inyectar los estilos globales
const styleElement = document.createElement('style');
styleElement.textContent = globalStyles;
document.head.appendChild(styleElement);
