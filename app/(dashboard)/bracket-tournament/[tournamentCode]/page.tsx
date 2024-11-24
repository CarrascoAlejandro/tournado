"use client";

import React, { useEffect, useRef } from 'react';
import { createBracket } from 'bracketry';

const BracketPage: React.FC = () => {
  const bracketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bracketRef.current) {
      const data = {
        // Estructura de datos requerida por Bracketry
        rounds: [
          { name: 'Ronda 1' },
          { name: 'Ronda 2' },
          // Agrega más rondas según sea necesario
        ],
        matches: [
          {
            roundIndex: 0,
            order: 0,
            sides: [
              { contestantId: '1', scores: [{ mainScore: '3', isWinner: true }] },
              { contestantId: '2', scores: [{ mainScore: '1' }] },
            ],
          },
          // Agrega más partidos según sea necesario
        ],
        contestants: {
          '1': { players: [{ title: 'Jugador 1' }] },
          '2': { players: [{ title: 'Jugador 2' }] },
          // Agrega más participantes según sea necesario
        },
      };

      createBracket(data, bracketRef.current);
    }
  }, []);

  return <div ref={bracketRef} style={{ height: '100vh', width: '100%' }} />;
};

export default BracketPage;
