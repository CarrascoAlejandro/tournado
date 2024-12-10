import React from 'react';
import { Button } from '@/components/ui/button';
import PeopleIcon from '@material-ui/icons/People';

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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-lg transition-transform transform scale-100 hover:scale-105">
        {/* Header */}
        <div className="text-center text-gray-800 mb-4">
          <h2 className="text-xl font-semibold tracking-tight">{tournament.tournamentName}</h2>
          <p className="text-sm text-gray-500">{tournament.status}</p>
        </div>

        {/* Tournament Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Start Date */}
          <div className="flex flex-col items-center bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm text-gray-600">Start Date</h3>
            <p className="text-sm text-gray-700">{tournament.startDate}</p>
          </div>

          {/* End Date */}
          <div className="flex flex-col items-center bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm text-gray-600">End Date</h3>
            <p className="text-sm text-gray-700">{tournament.endDate}</p>
          </div>

          {/* Participants */}
          <div className="flex flex-col items-center bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm text-gray-600">Participants</h3>
            <p className="text-sm text-gray-700"><PeopleIcon className="mr-2" />{tournament.nMaxParticipants}</p>
          </div>

          {/* Register Code */}
          <div className="flex flex-col items-center bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm text-gray-600">Register Code</h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">{tournament.tournamentCode}</p>
              <Button
                className="bg-gray-600 text-white hover:bg-gray-700 rounded-sm text-xs px-3 py-1"
                onClick={() => navigator.clipboard.writeText(tournament.tournamentCode)}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between space-x-2 mt-4">
          <Button 
            className="bg-gray-700 text-white text-xs px-4 py-2 rounded-lg hover:bg-gray-800"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TournamentModal;
