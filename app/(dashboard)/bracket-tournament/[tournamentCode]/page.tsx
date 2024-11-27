"use client";

import { participants } from "@/lib/db";
import React, { useEffect } from "react";
import { transformDataForBracketsViewer } from "utils/create-tournament";

const BracketPage = ({ params }: { params: { tournamentCode: string } }) => {
  const { tournamentCode } = params;

  const fetchAndRenderBrackets = async () => {
    try {
      // Fetch the tournament data
      const res = await fetch(`/api/dev/tournament/${tournamentCode}/brackets`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error fetching tournament data.");
      }

      const tournamentData = await res.json();
      console.log("Fetched tournament data:", tournamentData);

      // Transform data for brackets-viewer
      const transformedData = transformDataForBracketsViewer(tournamentData);

      console.log("Transformed data for brackets-viewer:", transformedData);

      if (window.bracketsViewer) {
        const transformedData = transformDataForBracketsViewer(tournamentData);
      
        window.bracketsViewer.render({
          stages: transformedData.stage,
          matches: transformedData.match,
          matchGames: transformedData.match_game,
          participants: transformedData.participant,
        });
      }
      
    } catch (error) {
      console.error("Error fetching or rendering brackets:", error);
    }
  };

  useEffect(() => {
    fetchAndRenderBrackets();
  }, [tournamentCode]);

  return <div className="brackets-viewer" />;
};

export default BracketPage;
