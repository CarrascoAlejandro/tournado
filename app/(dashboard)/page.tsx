// app/(dashboard)/home/page.tsx
"use client";

import { useEffect, useState, useRef } from 'react';
import { Info, PlayCircle, List, CheckCircle, Target } from 'lucide-react';

export default function HomePage() {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = sectionRefs.current.findIndex(
            (section) => section === entry.target
          );
          if (entry.isIntersecting) {
            setActiveSection(index);
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          } else {
            entry.target.classList.add('opacity-0', 'translate-y-10');
            entry.target.classList.remove('opacity-100', 'translate-y-0');
          }
        });
      },
      { threshold: 0.5 } // Detecta cuando un 50% de la sección es visible
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const setSectionRef = (index: number) => (el: HTMLDivElement | null) => {
    sectionRefs.current[index] = el;
  };

  return (
    <div>
      {/* Barra de navegación de secciones */}
      <nav className="fixed top-8 left-0 w-full bg-transparent z-50">
        <div className="container mx-auto flex space-x-8">
          {[
            { label: 'Bienvenido', icon: <Info className="h-5 w-5" /> },
            { label: '¿Por qué elegir Tournado?', icon: <CheckCircle className="h-5 w-5" /> },
            { label: '¿Cómo Funciona?', icon: <PlayCircle className="h-5 w-5" /> },
            { label: 'Nuestra Misión', icon: <Target className="h-5 w-5" /> }
          ].map((section, index) => (
            <button
              key={index}
              className={`flex items-center text-sm font-semibold transition-colors duration-300 ${
          activeSection === index ? 'text-[#1D3557]' : 'text-gray-400'
              }`}
              onClick={() => {
          sectionRefs.current[index]?.scrollIntoView({
            behavior: 'smooth'
          });
              }}
            >
              {section.icon}
              <span className="ml-2">{section.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {/* <div className="fixed top-0 left-0 w-full bg-white shadow-lg z-50">
      <div className="container mx-auto p-4 flex justify-center space-x-8">
        <h1 className="text-2xl font-bold text-[#1D3557]">Tournado</h1>
        </div>
        </div> */}
      {/* Sección: Bienvenido a Tournado con fondo degradado */}
      <section
        ref={setSectionRef(0)}
        className="top-5 full-width-content relative min-h-screen flex items-center justify-center p-6 transition-all duration-1000 ease-in-out opacity-0 translate-y-10"
        style={{
          background: "linear-gradient(135deg, #097597, #A29BFE)", // Celeste a morado pastel
          width: '100%',
          // padding: '0 !important',
        }}
      >
        <div className="relative z-10 text-center max-w-none px-0">
          <h1 className="text-5xl font-extrabold text-white mb-4">
            Bienvenido a <span className="text-[#A8DADC]">Tournado</span>
          </h1>
          <p className="text-lg text-white mb-6">
            Tournado es un sistema web diseñado para la gestión eficiente de torneos deportivos de eliminación simple. 
            Permite a los administradores crear eventos, registrar competidores y seguir el avance de cada etapa hasta obtener un ganador final.
          </p>
          <div className="flex justify-center gap-4">
            <a href="#how-it-works" className="px-6 py-3 bg-[#FFFFFF] text-[#1D3557] rounded-lg shadow-lg transition-transform transform hover:-translate-y-1">
              Aprende Más
            </a>
            <a href="#demo" className="px-6 py-3 border border-white text-white rounded-lg shadow-lg transition-transform transform hover:-translate-y-1">
              Ver Demo
            </a>
          </div>
          <div className="mt-4">
            <button className="flex items-center text-white hover:underline">
              <span className="mr-2">Watch video</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 3l14 9-14 9z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Sección: ¿Por qué elegir Tournado? */}
      <section
        ref={setSectionRef(1)}
        className="min-h-screen flex items-center justify-center bg-[#A8DADC] p-6 transition-all duration-1000 ease-in-out translate-y-10"
      >
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl">
          <div className="flex items-center mb-4">
            <CheckCircle className="mr-2 h-6 w-6 text-[#1D3557]" />
            <h2 className="text-4xl font-bold text-[#1D3557]">¿Por qué elegir Tournado?</h2>
          </div>
          <ul className="list-disc list-inside text-lg text-[#457B9D]">
            <li>Organización eficiente de torneos y competiciones.</li>
            <li>Transparencia en clasificaciones y resultados.</li>
            <li>Seguimiento en tiempo real de enfrentamientos y avances.</li>
            <li>Ideal para torneos de eliminación directa.</li>
          </ul>
        </div>
      </section>

      {/* Sección: ¿Cómo Funciona Tournado? */}
      <section
        ref={setSectionRef(2)}
        className="min-h-screen flex items-center justify-center bg-[#457B9D] p-6 transition-all duration-1000 ease-in-out opacity-0 translate-y-10"
      >
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl">
          <div className="flex items-center mb-4">
            <PlayCircle className="mr-2 h-6 w-6 text-[#1D3557]" />
            <h2 className="text-4xl font-bold text-[#1D3557]">¿Cómo Funciona Tournado?</h2>
          </div>
          <p className="mt-4 text-lg text-[#F1FAEE]">
            Crea un torneo, registra a los participantes y visualiza los resultados a medida que avanzan las rondas. 
            El sistema es intuitivo y está diseñado para facilitar la gestión y seguimiento de torneos deportivos.
          </p>
        </div>
      </section>

      {/* Sección: Nuestra Misión */}
      <section
        ref={setSectionRef(3)}
        className="min-h-screen flex items-center justify-center bg-[#1D3557] p-6 transition-all duration-1000 ease-in-out opacity-0 translate-y-10"
      >
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl">
          <div className="flex items-center mb-4">
            <Target className="mr-2 h-6 w-6 text-[#1D3557]" />
            <h2 className="text-4xl font-bold text-[#1D3557]">Nuestra Misión</h2>
          </div>
          <p className="mt-4 text-lg text-[#F1FAEE]">
            Desarrollar una plataforma que permita una gestión rápida, eficaz y transparente de torneos deportivos, 
            optimizando la experiencia tanto para los organizadores como para los participantes.
          </p>
        </div>
      </section>

      {/* Pie de Página */}
      <footer className="bg-[#1D3557] py-6 text-center text-white">
        <p className="text-lg">
          &copy; {new Date().getFullYear()} Tournado. Todos los derechos reservados.
        </p>
        <p className="mt-2 text-sm">
          <a href="#" className="text-[#A8DADC] hover:underline">Política de Privacidad</a> | 
          <a href="#" className="text-[#A8DADC] hover:underline ml-2">Términos de Servicio</a> | 
          <a href="#" className="text-[#A8DADC] hover:underline ml-2">Contacto</a>
        </p>
      </footer>

      <style jsx>{`
        .page-container {
          padding: 0 !important;
          margin: 0 !important;
          width: 100%;
          padding-left: -10 !important;
        }

        .full-width-content {
          margin-left: calc(-1 * var(--sidebar-width)); /* Ajusta al tamaño del sidebar */
          width: calc(100% + var(--sidebar-width));
        }
      `}</style>
    </div>
  );
}
