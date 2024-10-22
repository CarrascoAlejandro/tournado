"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import TournamentModal from '@/components/ui/tournament-modal';

// Define the type for the tournament
type Tournament = {
  tournamentId: number;
  tournamentCode: string;
  tournamentName: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  nMaxParticipants: number;
  tags: string;
  userId: number;
};

const TournamentsPage: React.FC = () => {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch('/api/dev/tournament');
        const data = await response.json();
        setTournaments(data.tournaments);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      }
    };

    fetchTournaments();
  }, []);

  const openModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTournament(null);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>My Tournaments</CardTitle>
          <CardDescription>View all ongoing and completed tournaments you created.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-start items-center mb-4">
            <Button>Create Tournament</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Participants</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments.map((tournament) => (
                <TableRow
                  key={tournament.tournamentId}
                  onClick={() => openModal(tournament)}
                  className="cursor-pointer"
                >
                  <TableCell>{tournament.tournamentName}</TableCell>
                  <TableCell>{tournament.status}</TableCell>
                  <TableCell>{tournament.startDate}</TableCell>
                  <TableCell>{tournament.endDate}</TableCell>
                  <TableCell>{tournament.nMaxParticipants}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Use the TournamentModal component */}
      <TournamentModal
        tournament={selectedTournament}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default TournamentsPage;