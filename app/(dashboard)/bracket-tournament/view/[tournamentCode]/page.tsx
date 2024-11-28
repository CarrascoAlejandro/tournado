"use client";

import { Loader } from "@/components/ui/loader";
import React, { useEffect, useState } from "react";

const BracketPage = ({ params }: { params: { tournamentCode: string } }) => {
    
  const [loading, setLoading] = useState(true);
  const { tournamentCode } = params;

  const fetchAndRenderBrackets = async () => {
    try {
      // Fetch the tournament data
      const res = await fetch(`/api/dev/tournament/${tournamentCode}/brackets`);
      if (!res.ok) {
        const errorData = await res.json();
        window.location.href = "/";
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
        setLoading(false);
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

  return (
    <div
      className="brackets-viewer"
      style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      {loading ? (
        <div>
          {Loader(250, 250)} 
        </div> // Loading indicator // FIXME: make size depend on screen size
      ) : (
        <div id="brackets-container"></div> // Container for brackets
      )}
    </div>
  );
};

export default BracketPage;