"use client";

import React, { useEffect, useRef, useState } from "react";
import { createBracket } from "bracketry";

interface MatchBracket {
  matchBracketId: number;
  participant1Id: number;
  participant2Id: number;
  tournamentId: number;
  homeResult: number;
  awayResult: number;
  status: string;
  level: string;
}

interface BracketData {
  message: string;
  matchBrackets: MatchBracket[];
  warnings: string[];
}

const BracketPage = ({ params }: { params: { tournamentCode: string } }) => {
  const { tournamentCode } = params;
  const bracketRef = useRef<HTMLDivElement>(null);
  const [bracketsData, setBracketsData] = useState<BracketData>({ message: '', matchBrackets: [], warnings: [] });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBracketsData = async () => {
      try {
        // Retrieve matchBrackets from localStorage
        const storedData = localStorage.getItem("matchBrackets");
        if (storedData) {
          setBracketsData(JSON.parse(storedData));
        } else {
          // Fetch match brackets from the server
          const res = await fetch(`/api/dev/tournament/${tournamentCode}/brackets`);
          const data = await res.json();

          if (res.ok) {
            setBracketsData(data);
            // Optionally, save to localStorage
            localStorage.setItem("matchBrackets", JSON.stringify(data.matchBrackets));
          } else {
            setError(data.error || "Error fetching tournament data.");
          }
        }
      } catch (err) {
        setError("Error connecting to the server.");
      }
    };

    fetchBracketsData();
  }, [tournamentCode]);

  useEffect(() => {
    if (bracketRef.current && bracketsData.matchBrackets && bracketsData.matchBrackets.length > 0) {      // Determine unique levels and sort them
      const levels = Array.from(
        new Set(bracketsData.matchBrackets.map((bracket) => bracket.level))
      ).sort();

      // Map levels to round names
      const levelMapping: { [key: string]: string } = {
        final: "Final",
        semi: "Semifinal",
        quarter: "Quarterfinal",
        // Add more mappings as needed
      };

      const data = {
        rounds: levels.map((level) => ({
          name: levelMapping[level] || level,
        })),
        matches: bracketsData.matchBrackets.map((bracket) => ({
          roundIndex: levels.indexOf(bracket.level),
          order: bracket.matchBracketId, // Ensure unique order within the round
          sides: [
            {
              contestantId: String(bracket.participant1Id),
              scores: [
                {
                  mainScore: bracket.homeResult.toString(),
                  isWinner: bracket.homeResult > bracket.awayResult,
                },
              ],
            },
            {
              contestantId: String(bracket.participant2Id),
              scores: [
                {
                  mainScore: bracket.awayResult.toString(),
                  isWinner: bracket.awayResult > bracket.homeResult,
                },
              ],
            },
          ],
        })),
        contestants: bracketsData.matchBrackets.reduce((acc, bracket) => {
          acc[bracket.participant1Id] = {
            players: [{ title: `Participant ${bracket.participant1Id}` }],
          };
          acc[bracket.participant2Id] = {
            players: [{ title: `Participant ${bracket.participant2Id}` }],
          };
          return acc;
        }, {} as { [key: string]: { players: { title: string }[] } }),
      };

      // Render the bracket using Bracketry
      createBracket(data, bracketRef.current);
    }
  }, [bracketsData]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>{`Tournament: ${tournamentCode}`}</h1>
      <div ref={bracketRef} style={{ height: "100vh", width: "100%" }} />
    </div>
  );
};

export default BracketPage;
