'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importar useRouter para manejar navegación

export default function HelpPage() {
  const router = useRouter(); // Inicializar el hook de navegación

  useEffect(() => {
    // Agregar el script de Google Translate al cargar el componente
    const script = document.createElement('script');
    script.src =
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.type = 'text/javascript';
    script.async = true;
    document.body.appendChild(script);

    // Definir la función global de inicialización
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en' },
        'google_translate_element'
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const changeLanguage = (languageCode: string) => {
    const lang = languageCode;

    // Establecer la cookie 'googtrans' con el idioma seleccionado
    document.cookie = `googtrans=/en/${lang}; path=/;`;

    // Recargar la página para aplicar la traducción
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Card principal */}
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Help Center</h1>
        <p className="text-lg mb-6 text-center">
          Use the language selector below to change the language of the
          application.
        </p>

        {/* Selector de idiomas personalizado */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => changeLanguage('en')}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 w-full rounded"
          >
            English
          </button>
          <button
            onClick={() => changeLanguage('es')}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 w-full rounded"
          >
            Español
          </button>
          <button
            onClick={() => changeLanguage('fr')}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 w-full rounded"
          >
            Français
          </button>
          <button
            onClick={() => changeLanguage('de')}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 w-full rounded"
          >
            Deutsch
          </button>
        </div>

        {/* Espaciado */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()} // Función para ir a la página anterior
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
