'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importing useRouter for redirection
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const JoinTournamentPage: React.FC = () => {
  const [tournamentId, setTournamentId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter(); // Using the useRouter hook for redirection

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!tournamentId || !participantName) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/dev/join-tournament', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tournamentId,
          participantName
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('You have successfully joined the tournament!');
        setError('');
        setTournamentId('');
        setParticipantName('');
        router.push(`/view-tournament/${tournamentId}`);
      } else {
        // More detailed error message
        setError(
          data.error || 'An error occurred while joining the tournament.'
        );
      }
    } catch (error) {
      console.error('Error in request:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-200 via-blue-300 to-white">
      <div id="google_translate_element"></div>
      <Card className="w-full max-w-md p-6 shadow-2xl bg-white rounded-xl">
        <CardHeader className="text-center mb-4">
          <CardTitle className="text-3xl font-extrabold text-purple-700">
            Join a Tournament
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {successMessage && (
              <p className="text-green-600 text-sm">{successMessage}</p>
            )}
            <div>
              <label
                htmlFor="tournamentId"
                className="block text-md font-semibold text-gray-800"
              >
                Tournament CODE
              </label>
              <Input
                type="text"
                id="tournamentId"
                name="tournamentId"
                placeholder="Enter the tournament CODE"
                className="mt-2 block w-full border-gray-300 rounded-lg shadow-md focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="participantName"
                className="block text-md font-semibold text-gray-800"
              >
                Participant Name
              </label>
              <Input
                type="text"
                id="participantName"
                name="participantName"
                placeholder="Enter your name"
                className="mt-2 block w-full border-gray-300 rounded-lg shadow-md focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                required
              />
            </div>
            <div className="mt-8 flex justify-center">
              <Button
                type="submit"
                className={`px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 transform hover:scale-105 transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-spin">🔄</span> // Spinner or loading icon
                ) : (
                  'Join'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinTournamentPage;
