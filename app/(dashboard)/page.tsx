// app/(dashboard)/home/page.tsx
"use client";

import { useEffect, useState, useRef } from 'react';
import { Info, PlayCircle, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  interface Tournament {
    name: string;
    description: string;
    startDate: string;
    participantsCount: number;
  }

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const sectionRefs = useRef<HTMLDivElement[]>([]);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    // Simulación de la carga de torneos públicos desde una API
    const fetchTournaments = async () => {
      const response = await fetch('/api/public-tournaments');
      const data = await response.json();
      setTournaments(data);
    };
    fetchTournaments();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = sectionRefs.current.indexOf(entry.target as HTMLDivElement);
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

  return (
    <div>
      {/* Barra de navegación de secciones */}
      <nav className="fixed top-12 w-full bg-transparent shadow-lg z-50">
        <div className="container mx-auto p-4 flex justify-center space-x-8">
          {['Introducción', '¿Cómo Funciona?', 'Torneos Públicos'].map((label, index) => (
            <button
              key={index}
              className={`text-sm font-semibold transition-colors duration-300 ${
                activeSection === index ? 'text-[#1D3557]' : 'text-gray-400'
              }`}
              onClick={() => {
                sectionRefs.current[index]?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
            >
              {index + 1}. {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Secciones */}
      <section
        ref={(el) => el && (sectionRefs.current[0] = el)}
        className="min-h-screen flex items-center justify-center bg-[#F1FAEE] p-6 transition-all duration-1000 ease-in-out opacity-0 translate-y-10"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl">
          <div className="flex items-center mb-4">
            <Info className="mr-2 h-6 w-6 text-[#1D3557]" />
            <h2 className="text-3xl font-bold text-[#1D3557]">Bienvenido a Tournado</h2>
          </div>
          <p className="mt-4 text-[#457B9D]">
            Tournado es un sistema web diseñado para la gestión eficiente de torneos deportivos de eliminación simple.
            Permite a los administradores crear eventos, registrar competidores y seguir el avance de cada etapa hasta obtener un ganador final.
          </p>
        </div>
      </section>

      <section
        ref={(el) => el && (sectionRefs.current[1] = el)}
        className="min-h-screen flex items-center justify-center bg-[#A8DADC] p-6 transition-all duration-1000 ease-in-out opacity-0 translate-y-10"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl">
          <div className="flex items-center mb-4">
            <PlayCircle className="mr-2 h-6 w-6 text-[#1D3557]" />
            <h2 className="text-3xl font-bold text-[#1D3557]">¿Cómo Funciona Tournado?</h2>
          </div>
          <p className="mt-4 text-[#457B9D]">
            Crea un torneo, registra a los participantes, y visualiza los resultados a medida que avanzan las rondas.
            El sistema es ideal para competiciones de eliminación directa, brindando una experiencia intuitiva para administradores y participantes.
          </p>
        </div>
      </section>

      <section
        ref={(el) => el && (sectionRefs.current[2] = el)}
        className="min-h-screen flex items-center justify-center bg-[#457B9D] p-6 transition-all duration-1000 ease-in-out opacity-0 translate-y-10"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
          <div className="flex items-center mb-4">
            <List className="mr-2 h-6 w-6 text-[#1D3557]" />
            <h2 className="text-3xl font-bold text-[#1D3557]">Torneos Públicos</h2>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.length > 0 ? (
              tournaments.map((tournament, index) => (
                <div
                  key={index}
                  className="bg-[#A8DADC] p-4 rounded-lg shadow-lg transition-transform transform duration-300 hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold text-[#1D3557] mb-2">
                    {tournament.name}
                  </h3>
                  <p className="text-md text-[#457B9D]">
                    {tournament.description}
                  </p>
                  <p className="text-sm text-[#1D3557] mt-2">
                    Fecha de Inicio: {tournament.startDate}
                  </p>
                  <p className="text-sm text-[#1D3557]">
                    Participantes: {tournament.participantsCount}
                  </p>
                  <Button className="mt-4 bg-[#457B9D] text-white w-full hover:bg-[#1D3557]">
                    Ver Detalles
                  </Button>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-lg text-[#457B9D]">
                No hay torneos públicos disponibles en este momento.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}