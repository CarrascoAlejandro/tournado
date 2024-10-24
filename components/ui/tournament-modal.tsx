import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export type Tournament = {
  tournamentId: number;
  tournamentCode: string;
  tournamentName: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  nMaxParticipants: number;
  tags: string;
  userMail: string;
};

interface TournamentModalProps {
  tournament: Tournament | null;
  isOpen: boolean;
  onClose: () => void;
}

const TournamentModal: React.FC<TournamentModalProps> = ({ tournament, isOpen, onClose }) => {
  if (!tournament || !isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>{tournament.tournamentName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Status:</strong> {tournament.status}</p>
          <p><strong>Start Date:</strong> {tournament.startDate}</p>
          <p><strong>End Date:</strong> {tournament.endDate}</p>
          <p><strong>Participants:</strong> {tournament.nMaxParticipants}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TournamentModal;
