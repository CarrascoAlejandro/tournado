  // app/(dashboard)/home/page.tsx
  "use client";
  import { useEffect, useState, useRef } from 'react';
  import { Info, PlayCircle, CheckCircle, Target } from 'lucide-react';
  import Link from 'next/link';

  export default function HomePage() {
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activeSection, setActiveSection] = useState(0);
    const [showContent, setShowContent] = useState([false]);
    const [showContent2, setShowContent2] = useState([false]);
    const [activeStep, setActiveStep] = useState(0); // Para controlar el paso activo
    const [isOpen, setIsOpen] = useState(false);
  const [tournamentCode, setTournamentCode] = useState("");


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

              // Mostrar la animación de los elementos en la sección de bienvenida
              if (index === 0) {
                setShowContent((prev) => {
                  const newShowContent = [...prev];
                  newShowContent[0] = true;
                  return newShowContent;
                });
              }
              if(index === 1) {
                setShowContent2((prev) => {
                  const newShowContent2 = [...prev];
                  newShowContent2[1] = true;
                  return newShowContent2;
                });
              }
            } else {
              entry.target.classList.add('opacity-0', 'translate-y-10');
              entry.target.classList.remove('opacity-100', 'translate-y-0');

              // Ocultar la animación de la sección de bienvenida al salir del viewport
              if (index === 0) {
                setShowContent((prev) => {
                  const newShowContent = [...prev];
                  newShowContent[0] = false;
                  return newShowContent;
                });
              }
            }
          });
        },
        { threshold: 0.5 }
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

    // Desplazar la primera sección a la parte superior al cargar
    useEffect(() => {
      sectionRefs.current[0]?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const setSectionRef = (index: number) => (el: HTMLDivElement | null) => {
      sectionRefs.current[index] = el;
    };

    const steps = [
      {
        title: 'Registro de Participantes',
        description: 'Permite registrar a los jugadores o equipos participantes en el torneo de manera rápida y sencilla.',
      },
      {
        title: 'Creación de Torneos',
        description: 'Configura los detalles del torneo, como el tipo de eliminación, las rondas y los horarios de cada partido.',
      },
      {
        title: 'Seguimiento en Tiempo Real',
        description: 'Visualiza el progreso del torneo con actualizaciones en tiempo real de los resultados de cada enfrentamiento.',
      },
      {
        title: 'Resultados y Clasificaciones',
        description: 'Accede a los resultados finales y clasificaciones, asegurando transparencia y una experiencia profesional.',
      },
    ];

    const images = ['img-sec3-p1.png', 'img-sec3-p2.png', 'img-sec3-p3.png', 'img-sec3-p4.png'];

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleSubmit = () => {
      if (tournamentCode.trim() !== "") {
        window.location.href = `/bracket-tournament/view/${tournamentCode}`;
      } else {
        alert("Por favor, ingresa un código de torneo válido.");
      }
      handleClose();
    };

    return (
      <div>
        {/* Barra de navegación de secciones */}
        <nav className="fixed top-8 left-4 w-full bg-transparent z-50">
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

        {/* Sección: Bienvenido a Tournado con fondo degradado */}
        <section
          ref={setSectionRef(0)}
          className="full-width-content relative min-h-screen flex items-center justify-center p-6 top-4 transition-all duration-1000 ease-in-out opacity-0 translate-y-10"
          style={{
            background: "linear-gradient(135deg, #097597, #A29BFE)",
            width: '100%',
            scrollMarginTop: '2.5rem',
          }}
        >
          <div className="relative z-10 text-center max-w-none px-0">
            <h1
              className={`text-5xl font-extrabold text-white mb-4 transition-all duration-1000 ease-in-out ${
                showContent[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              Bienvenido a <span className="text-[#8dcfd1]">Tournado</span>
            </h1>
            <p
              className={`text-lg text-white mb-6 transition-all duration-1000 ease-in-out delay-200 ${
                showContent[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              Tournado es un sistema web diseñado para la gestión eficiente de torneos deportivos de eliminación simple. 
              Permite a los administradores crear eventos, registrar competidores y seguir el avance de cada etapa hasta obtener un ganador final.
            </p>
            <div
              className={`flex justify-center gap-4 transition-all duration-1000 ease-in-out delay-400 ${
                showContent[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <button
                onClick={() => sectionRefs.current[2]?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 bg-[#FFFFFF] text-[#1D3557] rounded-lg shadow-lg transition-transform transform hover:-translate-y-1"
              >
                Aprende Más
              </button>
              <Link
                href="/my-tournaments"
                className="px-6 py-3 border border-white text-white rounded-lg shadow-lg transition-transform transform hover:-translate-y-1"
              >
                My Tournaments
              </Link>

              <Link
                href="/join-tournament"
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white border border-red-600 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-105 hover:shadow-xl hover:from-red-600 hover:to-red-800"
              >
                Unirme a un torneo
              </Link>

              <button
                onClick={handleOpen}
                className="px-6 py-3 bg-[#FFFFFF] text-[#1D3557] rounded-lg shadow-lg transition-transform transform hover:-translate-y-1"
              >
                Ver un torneo
                </button>
            </div>
          </div>
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/equipo-de-juegos-practicando-5004698-4206791.png?f=webp"
            alt="Equipo de juegos practicando"
            className="absolute bottom-0 left-0 w-full h-auto opacity-25"
          />
        </section>
              {/* Pop-Up */}
          {isOpen && (
            <div className="popup-overlay">
              <div className="popup-content">
                <h2>Ingresar Código de Torneo</h2>
                <input
                  type="text"
                  value={tournamentCode}
                  onChange={(e) => setTournamentCode(e.target.value)}
                  placeholder="Introduce el código aquí"
                  className="input-field"
                />
                <div className="popup-actions">
                  <button onClick={handleSubmit} className="btn-submit">
                    Aceptar
                  </button>
                  <button onClick={handleClose} className="btn-cancel">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        {/* Sección: ¿Por qué elegir Tournado? */}
        <section
          ref={setSectionRef(1)}
          className="min-h-screen flex items-center justify-center bg-transparent p-6 transition-all duration-1000 ease-in-out translate-y-10"
          style={{ scrollMarginTop: '2.5rem' }}
        >
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className={`ml-4 md:w-1/2 transition-all duration-1000 ease-in-out 
              ${showContent2[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-4xl font-bold text-[#1D3557]">¿Por qué elegir Tournado?</h2>
              <p className="mt-4 text-lg text-[#457B9D]">
                Organiza torneos y competiciones de forma eficiente, con total transparencia en los resultados y seguimiento en tiempo real.
              </p>
              <ul className="mt-4 list-disc list-inside text-lg text-[#457B9D]">
                <li>Organización eficiente de torneos y competiciones.</li>
                <li>Transparencia en clasificaciones y resultados.</li>
                <li>Seguimiento en tiempo real de enfrentamientos y avances.</li>
                <li>Ideal para torneos de eliminación directa.</li>
              </ul>
              <button className="inline-block mt-4 text-[#1D3557] font-semibold hover:underline"
                onClick={() => sectionRefs.current[2]?.scrollIntoView({ behavior: 'smooth' })}>
                Aprende más →
              </button>
            </div>
            <div className={`md:w-1/2`}>
              {/* <img src="https://cdni.iconscout.com/illustration/premium/thumb/equipo-de-juegos-practicando-5004698-4206791.png?f=webp" alt="Organización de torneos" className="w-full h-auto" /> */}
              <img src="static/img-sec2.png" alt="Organización de torneos" className="ml-12 w-5/6 h-4/6"/>
            </div>
          </div>
        </section>  

        {/* Sección: ¿Cómo Funciona Tournado? */}
        <section
          ref={setSectionRef(2)}
          className="min-h-screen flex items-center justify-center bg-transparent p-6 transition-all duration-1000 ease-in-out opacity-0 translate-y-10"
          style={{ scrollMarginTop: '2.5rem' }}
        >
          <div className="container mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="md:w-1/2 mr-12">
            {/* from-[#097597] to-[#A29BFE] */}
              <h2 className="text-4xl font-bold text-[#097597] mb-4">¿Cómo Funciona Tournado?</h2>
              <div className="relative">
                <div className="absolute left-6 top-0 h-full border-l-2 border-gray-300" />
                <div className="space-y-6 pl-10">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer p-4 transition-all duration-500 ease-out ${
                        activeStep === index ? 'text-[#1D3557]' : 'text-gray-400'
                      }`}
                      onClick={() => setActiveStep(index)}
                    >
                      <div className="absolute -left-6 top-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition-colors duration-500 ${
                            activeStep === index ? 'bg-[#21BDDA] border-[#21BDDA]' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <h3
                        className={`text-lg font-semibold transition-colors duration-300 ${
                          activeStep === index ? 'text-[#1D3557]' : 'hover:text-[#21BDDA]'
                        }`}
                      >
                        {step.title}
                      </h3>
                      {activeStep === index && (
                        <p className="mt-2 text-sm text-gray-600 transition-all duration-500 ease-in-out opacity-100 transform translate-y-0">
                          {step.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* <div className="md:w-1/2 transition-all duration-1000 ease-in-out">
              <img
                src={`static/${images[activeStep]}`}
                alt="Tournado Ilustración"
                className="mt-10 w-auto h-4/6"
              />
            </div> */}

            <div className="md:w-1/2 transition-all duration-1000 ease-in-out">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={`static/${image}`}
                    alt={`Tournado Ilustración ${index + 1}`}
                    className={`absolute mt-10 w-2/5 h-auto object-cover transition-opacity duration-1000 ease-in-out ${
                      activeStep === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
              </div>
          </div>
        </section>

        {/* Sección: Nuestra Misión */}
        <section
          ref={setSectionRef(3)}
          className="min-h-screen flex items-center justify-center bg-transparent p-6 transition-all duration-1000 ease-in-out opacity-0 translate-y-10"
          style={{ scrollMarginTop: '2.5rem' }}
        >
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Imagen a la izquierda */}
            <div className={`md:w-1/2 transition-all duration-1000 ease-in-out`}>
              <img src="static/img-sec4.png" alt="Visión de Tournado" className="ml-12 w-9/12 h-auto" />
            </div>
            
            {/* Contenido de texto a la derecha */}
            <div className={`ml-4 md:w-1/2 transition-all duration-1000 ease-in-out ${showContent2[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-4xl font-bold text-[#1D3557]">Nuestra Visión</h2>
              <p className="mt-4 text-lg text-[#457B9D]">
                En Tournado, imaginamos un mundo donde la gestión de torneos sea simple, accesible y transparente para todos. Nuestro objetivo es proporcionar una plataforma intuitiva que permita a los organizadores de eventos deportivos concentrarse en lo que más importa: el juego.
              </p>
              <ul className="mt-4 list-disc list-inside text-lg text-[#457B9D]">
                <li>Facilitamos la conexión entre jugadores y organizadores.</li>
                <li>Mejoramos la transparencia en los resultados y clasificaciones.</li>
                <li>Promovemos la equidad y el deporte justo en cada torneo.</li>
                <li>Creemos en la innovación constante para mejorar la experiencia de los usuarios.</li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* Pie de Página */}
        <footer className="bg-transparent py-6 text-center text-black">
          <p className="text-lg">
            &copy; {new Date().getFullYear()} Tournado. Todos los derechos reservados.
          </p>
          <p className="mt-2 text-sm">
            <a href="#" className="text-[#097597] hover:underline">Política de Privacidad</a> | 
            <a href="#" className="text-[#097597] hover:underline ml-2">Términos de Servicio</a> | 
            <a href="#" className="text-[#097597] hover:underline ml-2">Contacto</a>
          </p>
        </footer>
           {/* Estilos */}
      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .popup-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          text-align: center;
          max-width: 400px;
          width: 100%;
        }
        .input-field {
          width: 90%;
          padding: 8px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .popup-actions {
          display: flex;
          justify-content: space-around;
        }
        .btn-submit,
        .btn-cancel {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-submit {
          background-color: #5086c1;
          color: white;
        }
        .btn-cancel {
          background-color: #666f88;
          color: white;
        }
        .btn-open-popup {
          padding: 10px 20px;
          background-color: #008cba;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>     
      </div>
      
    );
    
  }