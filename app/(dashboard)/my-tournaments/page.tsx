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
import { TagInput } from '@/components/ui/tag-input';
import { TagList } from '@/components/ui/tag-list';
import Dialog from '@/components/ui/alert-dialog';
import { Loader } from '@/components/ui/loader';

const TournamentsPage: React.FC = () => {
  const { data: session, status } = useSession(); // Obtén la sesión y su estado
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
  const [error, setError] = useState(""); 
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showCreateSuccessDialog, setShowCreateSuccessDialog] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'Soon' | 'In Progress' | 'Finished'>('Soon'); // Default tab

  const [formData, setFormData] = useState({
    tournamentCode:'',
    tournamentName: '',
    status: 'Soon',
    startDate: '',
    endDate: '',
    nMaxParticipants: 2,
    tags: ''
  });

  const fetchData = async () => {
    if (session?.user?.id) {
      try {
        // Fetch tournaments
        const tournamentsResponse = await fetch(`/api/dev/tournament?userEmail=${session.user.email}`);
        const tournamentsText = await tournamentsResponse.text();
        console.log('Tournaments Response:', tournamentsText);
        const tournamentsData = JSON.parse(tournamentsText);
        console.log('Tournaments:', tournamentsData);
        setTournaments(tournamentsData);
  
        // Fetch suggestions
        const tagsResponse = await fetch(`/api/dev/tags/${session.user.email}`);
        if (tagsResponse.ok) {
          const { tags } = await tagsResponse.json();
          console.log('Fetched tags:', tags);
          setSuggestions(tags);
        } else {
          console.error('Failed to fetch suggestions');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };
  
  useEffect(() => {
    fetchData(); // Fetch tournaments and suggestions when the component mounts
  }, [session]);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      tags: tags.join(', '),
    }));
  }, [tags]);

  const handleSubmitTournament = async () => {
    try {
      if(formData.status === '') {
        console.error('Status is required');
        setError("Please select a status for the tournament.");
        return;
      }
      if(formData.tags === '') {
        console.error('Tags are required');
        setError("Please add at least one tag.");
        return;
      }
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
        await fetchData(); // Actualizar la lista de torneos
        setIsCreateModalOpen(false);
        setShowCreateSuccessDialog(true); // Mostrar el diálogo de éxito
        setFormData({
          tournamentCode: '',
          tournamentName: '',
          status: '',
          startDate: '',
          endDate: '',
          nMaxParticipants: 2,
          tags: ''
        });
        setTags([]); // Limpiar los tags
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

  if (status === 'loading') return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }} >
      {Loader(250, 250)} 
    </div> // Loading indicator // FIXME: make size depend on screen size;
  )

  const openCreateModal = () => {
    console.log('Opening create modal');
    setIsCreateModalOpen(true);
    setTags([]); // Limpiar los tags al abrir el modal
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
    setTags([]); // Limpiar los tags al cerrar el modal
  };

  const isValidDate = (date: string): boolean => {
    const selectedDate = new Date(date);
    const today = new Date();
  
    // Agregamos 4 horas y 1 minuto al selectedDate
    selectedDate.setHours(selectedDate.getHours() + 4);
    selectedDate.setMinutes(selectedDate.getMinutes() + 1);
  
    // Normalizamos "today" al inicio del día (00:00:00)
    today.setHours(0, 0, 0, 0);
  
    const isValid = selectedDate >= today; // Comparamos solo los días normalizados en relación con today
    console.log("Validating date:", {
      selectedDate,
      today,
      isValid,
    });
  
    return isValid;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Changing field: ${name}, Value: ${value}`);
  
    if (name === 'startDate') {
      if (!isValidDate(value)) {
        console.log("Invalid start date:", value);
        alert("Start Date cannot be in the past.");
        return;
      }
    }
  
    if (name === 'endDate') {
      if (!isValidDate(value)) {
        console.log("Invalid end date:", value);
        alert("End Date cannot be in the past.");
        return;
      }
      if (formData.startDate && new Date(value) < new Date(formData.startDate)) {
        console.log("End date earlier than start date:", {
          endDate: value,
          startDate: formData.startDate,
        });
        alert("End Date cannot be earlier than Start Date.");
        return;
      }
    }
  
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };
      console.log("Updated form data:", updatedFormData);
      return updatedFormData;
    });
  };
  
  

  
  
  




  
  
  


  const handleOpenTournamentDetails = (tournamentCode: string) => {
    if (!tournamentCode) {
      console.error('Tournament code is missing');
      return;
    }
    const tournamentUrl = `/tournament-details/${tournamentCode}`;
    window.open(tournamentUrl, '_blank');
  };  

  const handleStatusChange = (status: string) => {
    setError("");
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating tournament:', formData);
    handleSubmitTournament();
  };
  
  const renderDialog = () => {
    if (showCreateSuccessDialog) {
      return (
        <Dialog
          visible={showCreateSuccessDialog}
          onHide={() => setShowCreateSuccessDialog(false)}
          header="Tournament Created!"
          color="success"
          icon={<span>✓</span>}
        >
          <p>
            The tournament <strong>{formData.tournamentName}</strong> has been
            successfully created!
          </p>
        </Dialog>
      );
    }
  
    return null; // Si no hay diálogos activos, no renderiza nada
  };
  const filteredTournaments = tournaments.filter(
    (tournament) => tournament.status === activeTab
  );
  const renderTable = (tournaments: Tournament[], openModal: Function, handleOpenTournamentDetails: Function) => {
    if (!Array.isArray(tournaments) || tournaments.length === 0) {
      return (
        <div className="text-center text-gray-500 py-4">
          <p>You don't have any tournaments created yet.</p>
          <p>Click on "Create Tournament" to get started!</p>
        </div>
      );
    }
  
    return (
      <Table className="min-w-full border-collapse bg-white rounded-lg shadow-md">
        <TableHeader>
          <TableRow className="text-gray-700 bg-indigo-100">
            <TableCell className="font-semibold">Code</TableCell>
            <TableCell className="font-semibold">Name</TableCell>
            <TableCell className="font-semibold">Status</TableCell>
            <TableCell className="font-semibold">Participants</TableCell>
            <TableCell className="font-semibold">Tags</TableCell>
            <TableCell className="font-semibold">Manage Tournament</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tournaments.map((tournament) => (
            <TableRow
              key={tournament.tournamentId}
              onClick={() => openModal(tournament)}
              className="cursor-pointer hover:bg-indigo-50 transition duration-200"
            >
              <TableCell>{tournament.tournamentCode}</TableCell>
              <TableCell>{tournament.tournamentName}</TableCell>
              <TableCell>{tournament.status}</TableCell>
              <TableCell>{tournament.nMaxParticipants}</TableCell>
              <TableCell>
                <TagList
                  tags={
                    typeof tournament.tags === "string"
                      ? tournament.tags.split(",").map((tag) => tag.trim())
                      : tournament.tags
                  }
                />
              </TableCell>
              <TableCell>
                <Button
                  className="bg-indigo-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-indigo-700"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering row click
                    handleOpenTournamentDetails(tournament.tournamentCode);
                  }}
                >
                  Start & View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <div>
      {/* Render dynamic dialogs */}
      {renderDialog()}
  
      <Card className="shadow-lg rounded-xl bg-white p-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            My Tournaments
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            View all ongoing and completed tournaments you created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-start items-center mb-6">
            {session ? (
              <Button
                onClick={openCreateModal}
                className="bg-indigo-600 text-white hover:bg-indigo-700 transition duration-300"
              >
                Create Tournament
              </Button>
            ) : (
              <div className="text-center w-full">
                <p className="mb-4 text-gray-600">
                  You need to sign in to start creating a tournament.
                </p>
                <img
                  src="/static/Sign-up-bro.png"
                  alt="Login required"
                  className="w-1/2 mx-auto rounded-md shadow-lg"
                />
              </div>
            )}
          </div>
          {renderTable(tournaments, openModal, handleOpenTournamentDetails)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-full"
                required
              />
            </div>
  
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Tournament Status:
              </label>
              <p className="text-gray-500">Soon</p>
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
                min={new Date().toISOString().split("T")[0]} // Fecha mínima hoy
                className="rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-full"
                required
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
                min={formData.startDate || new Date().toISOString().split("T")[0]} // Mínimo es hoy o la fecha de inicio
                className="rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-full"
                required
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
                  value={formData.nMaxParticipants}
                  onChange={handleChange}
                  min="2" // Asegurar el mínimo permitido en el navegador
                  max="32" // Asegurar el máximo permitido en el navegador
                  className="rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-full"
                  required
                />
              </div>


  
            <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tag:
              </label>
              <TagInput tags={tags} setTags={setTags} suggestions={suggestions} />
              <input
                id="tags"
                style={{ opacity: 0, height: "1px", position: 'absolute' }}
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700 transition duration-300">Create Tournament</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
  
}  

export default TournamentsPage;