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

interface BracketsApiResponse {
  brackets: MatchBracket[];
  byes: { participantId: number }[];
}

interface BracketryRound {
  name: string;
}

interface BracketryMatch {
  roundIndex: number;
  order: number;
  sides: {
    contestantId: string;
    scores: {
      mainScore: string;
      isWinner?: boolean;
    }[];
    isWinner?: boolean;
  }[];
}

interface BracketryContestant {
  players: { title: string }[];
}

interface BracketryData {
  rounds: BracketryRound[];
  matches: BracketryMatch[];
  contestants: Record<string, BracketryContestant>;
}

const transformDataForBracketry = (rawData: any): BracketryData => {
  // Normalize the API response to always include `byes`
  const bracketsData: BracketsApiResponse = Array.isArray(rawData)
    ? { brackets: rawData, byes: [] } // If rawData is an array, assume no byes
    : {
        brackets: rawData.brackets || [],
        byes: rawData.byes || [], // Default to an empty array if byes is missing
      };

  // Validate brackets data
  if (!Array.isArray(bracketsData.brackets)) {
    console.error("Invalid brackets data format:", bracketsData);
    throw new Error("Invalid brackets data format: 'brackets' must be an array.");
  }

  // Map levels to readable round names
  const levelMapping: Record<string, string> = {
    final: "Final",
    semi: "Semifinals",
    quarter: "Quarterfinals",
  };

  // Extract unique levels (rounds)
  const levels = Array.from(new Set(bracketsData.brackets.map((bracket) => bracket.level))).sort();

  // Transform rounds
  const rounds = levels.map((level) => ({
    name: levelMapping[level] || level,
  }));

  // Transform matches
  const matches = bracketsData.brackets.map((bracket) => ({
    roundIndex: levels.indexOf(bracket.level),
    order: bracket.matchBracketId,
    sides: [
      {
        contestantId: String(bracket.participant1Id),
        scores: [
          {
            mainScore: bracket.homeResult.toString(),
            isWinner: bracket.homeResult > bracket.awayResult,
          },
        ],
        isWinner: bracket.homeResult > bracket.awayResult,
      },
      {
        contestantId: String(bracket.participant2Id),
        scores: [
          {
            mainScore: bracket.awayResult.toString(),
            isWinner: bracket.awayResult > bracket.homeResult,
          },
        ],
        isWinner: bracket.awayResult > bracket.homeResult,
      },
    ],
  }));

  // Transform contestants
  const contestants: Record<number, BracketryContestant> = bracketsData.brackets.reduce(
    (acc: Record<number, BracketryContestant>, bracket) => {
      acc[bracket.participant1Id] = {
        players: [{ title: `Participant ${bracket.participant1Id}` }],
      };
      acc[bracket.participant2Id] = {
        players: [{ title: `Participant ${bracket.participant2Id}` }],
      };
      return acc;
    },
    {}
  );

  // Add byes (participants without matches)
  bracketsData.byes.forEach((bye) => {
    contestants[bye.participantId] = {
      players: [{ title: `Participant ${bye.participantId} (Bye)` }],
    };
  });

  return {
    rounds,
    matches,
    contestants,
  };
};


const BracketPage = ({ params }: { params: { tournamentCode: string } }) => {
  const { tournamentCode } = params;
  const bracketRef = useRef<HTMLDivElement>(null);
  const [bracketsData, setBracketsData] = useState<BracketryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndTransformData = async () => {
      try {
        const storedData = localStorage.getItem("matchBrackets");
        console.log("Stored Data:", storedData);
        let fetchedData: any;
  
        if (storedData) {
          console.log("Using cached data from localStorage");
          fetchedData = JSON.parse(storedData);
        } else {
          console.log("Fetching data from the server");
          const res = await fetch(`/api/dev/tournament/${tournamentCode}/brackets`);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Error fetching brackets data.");
          }
          fetchedData = await res.json();
  
          // Cache the data in localStorage
          localStorage.setItem("matchBrackets", JSON.stringify(fetchedData));
        }
  
        console.log("Fetched Data:", fetchedData); // Debug log
  
        // Transform the data for Bracketry
        const transformedData = transformDataForBracketry(fetchedData);
        setBracketsData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error connecting to the server.");
      }
    };
  
    fetchAndTransformData();
  }, [tournamentCode]);    

  useEffect(() => {
    if (bracketRef.current && bracketsData) {
      console.log("Rendering Bracketry with data:", bracketsData);

      const options = {
        getEntryStatusHTML: (es: string) => `<div style="width: 30px; text-align: center;">${es || ""}</div>`,
      };

      createBracket(bracketsData, bracketRef.current, options);
    }
  }, [bracketsData]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>{`Tournament: ${tournamentCode}`}</h1>
      <div id="bracketry-wrapper" ref={bracketRef} style={{ height: "700px", maxHeight: "96vh" }} />
    </div>
  );
};

export default BracketPage;
