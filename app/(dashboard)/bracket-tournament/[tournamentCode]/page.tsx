"use client";

import React, { useEffect } from "react";

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

      // Render the brackets using the fetched data
      if (window.bracketsViewer) {
        window.bracketsViewer.render({
          stages: tournamentData.stage,
          matches: tournamentData.match,
          matchGames: tournamentData.match_game,
          participants: tournamentData.participant,
        });
      } else {
        console.error("bracketsViewer is not defined on the window object.");
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
