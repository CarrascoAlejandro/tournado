'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const JoinTournamentPage: React.FC = () => {
  const [tournamentId, setTournamentId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('1');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!tournamentId || !participantName || !selectedImage) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/dev/join-tournament', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tournamentId,
          participantName,
          selectedImage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('You have successfully joined the tournament!');
        setError('');
        router.push(`/view-tournament/${tournamentId}`);
      } else {
        setError(data.error || 'An error occurred while joining the tournament.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-purple-200 via-blue-300 to-white p-6">
      <Card className="w-full max-w-xl p-6 shadow-2xl bg-white rounded-xl">
        <CardHeader className="text-center mb-4">
          <CardTitle className="text-3xl font-extrabold text-purple-700">
            Join a Tournament
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}
            <div>
              <label htmlFor="tournamentId" className="block text-md font-semibold text-gray-800">
                Tournament CODE
              </label>
              <Input
                type="text"
                id="tournamentId"
                placeholder="Enter the tournament CODE"
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value)}
                required
                className="mt-2 block w-full"
              />
            </div>
            <div>
              <label htmlFor="participantName" className="block text-md font-semibold text-gray-800">
                Participant Name
              </label>
              <Input
                type="text"
                id="participantName"
                placeholder="Enter your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                required
                className="mt-2 block w-full"
              />
            </div>
            <div>
              <label className="block text-md font-semibold text-gray-800 mb-2">
                Select Profile Image
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[...Array(32)].map((_, index) => {
                  const imageNumber = index + 1;
                  return (
                    <div key={imageNumber} className="relative">
                      <input
                        type="radio"
                        id={`image-${imageNumber}`}
                        name="profileImage"
                        value={imageNumber.toString()}
                        checked={selectedImage === imageNumber.toString()}
                        onChange={() => setSelectedImage(imageNumber.toString())}
                        className="hidden"
                      />
                      <label
                        htmlFor={`image-${imageNumber}`}
                        className={`cursor-pointer block w-16 h-16 rounded-full border-2 ${
                          selectedImage === imageNumber.toString()
                            ? 'border-purple-500'
                            : 'border-transparent'
                        } transition-all`}
                      >
                        <img
                          src={`/static/profile/${imageNumber}.png`}
                          alt={`Profile ${imageNumber}`}
                          className="w-full h-full rounded-full"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            <Button
              type="submit"
              className={`w-full py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 transform hover:scale-105 transition duration-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? <span className="animate-spin">🔄</span> : 'Join'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinTournamentPage;
