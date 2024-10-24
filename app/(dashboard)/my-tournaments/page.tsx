"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
import { Tournament } from '@/components/ui/tournament-modal';

const TournamentsPage: React.FC = () => {
  const { data: session, status } = useSession(); // Obtén la sesión y su estado
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      if (session?.user?.id) { // Comprueba si hay una sesión válida
        try {
          const response = await fetch(`/api/dev/tournament?userEmail=${session.user.email}`);
          const text = await response.text(); // Obtén la respuesta como texto
          console.log('Response:', text); // Verifica la respuesta en la consola

          const data = JSON.parse(text);
          setTournaments(data);
        } catch (error) {
          console.error('Error fetching tournaments:', error);
        }
      }
    };

    fetchTournaments();
  }, [session]); // Dependencia de la sesión

  const openModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTournament(null);
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>My Tournaments</CardTitle>
          <CardDescription>View all ongoing and completed tournaments you created.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-start items-center mb-4">
            {session ? (
              <Button>Create Tournament</Button>
            ) : (
              <div className="text-center">
                <p className="mb-4">You need to sign in to start creating a tournament.</p>
                <img src="/static/Sign-up-bro.png" alt="Login required" className="w-1/2 mx-auto" />
              </div>
            )}
          </div>
          {session && (
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
                {Array.isArray(tournaments) ? (
                  tournaments.map((tournament) => (
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>No tournaments available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TournamentModal
        tournament={selectedTournament}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default TournamentsPage;
