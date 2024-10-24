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
import Modal from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import TournamentModal from '@/components/ui/tournament-modal';
import { Tournament } from '@/components/ui/tournament-modal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const TournamentsPage: React.FC = () => {
  const { data: session, status } = useSession(); // Obtén la sesión y su estado
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
  const [formData, setFormData] = useState({
    tournamentCode:'',
    tournamentName: '',
    status: '',
    startDate: '',
    endDate: '',
    nMaxParticipants: 0,
    tags: ''
  });
  const fetchTournaments = async () => {
    if (session?.user?.id) { // Comprueba si hay una sesión válida
      try {
        const response = await fetch(`/api/dev/tournament?userEmail=${session.user.email}`);
        const text = await response.text(); // Obtén la respuesta como texto
        console.log('Response:', text); // Verifica la respuesta en la consola

        const data = JSON.parse(text);
        console.log('Tournaments:', data);
        setTournaments(data);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      }
    }
  };

  useEffect(() => {

    fetchTournaments();
  }, [session]); // Dependencia de la sesión

  const handleSubmitTournament = async () => {
    try {
      const response = await fetch('/api/dev/tournament', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Enviamos los datos del formulario
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Torneo creado exitosamente:', data);
        // Aquí puedes manejar el cierre del modal o mostrar un mensaje de éxito
        await fetchTournaments();
        setIsCreateModalOpen(false);
      } else {
        console.error('Error al crear el torneo');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  };

  const openModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTournament(null);
  };

  if (status === 'loading') return <div>Loading...</div>;

  const openCreateModal = () => {
    console.log('Opening create modal');
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({
      tournamentCode: '',
      tournamentName: '',
      status: '',
      startDate: '',
      endDate: '',
      nMaxParticipants: 0,
      tags: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status: string) => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating tournament:', formData);
    closeCreateModal();
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
            {session ? (
              <Button onClick={openCreateModal}>Create Tournament</Button>
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
                  <TableCell>Code</TableCell>
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
                      <TableCell>{tournament.tournamentCode}</TableCell>
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

      {/* Nuevo Modal para crear un torneo */}
      <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Create Tournament" maxSize="max-w-2xl">
        <form onSubmit={handleCreateSubmit}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="tournamentName" className="block text-sm font-medium text-gray-700">
                Tournament name:
              </label>
              <Input
                type="text"
                id="tournamentName"
                name="tournamentName"
                placeholder="Tournament name"
                value={formData.tournamentName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Tournament status:
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full text-left bg-white text-gray-400 border border-gray-300 hover:bg-gray-100">{formData.status || "Select status"}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {["en curso", "proximamente", "finalizado"].map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onSelect={() => handleStatusChange(status)}
                    >
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date:
              </label>
              <Input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date:
              </label>
              <Input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="nMaxParticipants" className="block text-sm font-medium text-gray-700">
                Max Participants:
              </label>
              <Input
                type="number"
                id="nMaxParticipants"
                name="nMaxParticipants"
                placeholder="Max participants"
                value={String(formData.nMaxParticipants)}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags:
              </label>
              <Input
                type="text"
                id="tags"
                name="tags"
                placeholder="Tags"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button type="submit" onClick={handleSubmitTournament}>Create Tournament</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TournamentsPage;
