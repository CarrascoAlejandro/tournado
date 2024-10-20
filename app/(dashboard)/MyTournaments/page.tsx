import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
  } from '@/components/ui/card';
  import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
  import { Button } from '@/components/ui/button';
  
  export default function TournamentsPage() {
    const tournaments = [
      { name: "The International", status: "Completed", startDate: "11 Oct 2023", endDate: "15 Oct 2023", participants: "20 teams" },
      { name: "Esports - Dota 2", status: "Ongoing", startDate: "3 Jul 2023", endDate: "16 Jul 2023", participants: "128 players" },
      { name: "Wimbledon", status: "Completed", startDate: "1 Jul 2023", endDate: "23 Jul 2023", participants: "176 players" },
      { name: "Tour de France", status: "Ongoing", startDate: "4 Aug 2023", endDate: "26 Aug 2023", participants: "176 riders" },
      { name: "Cycling", status: "Completed", startDate: "1 Nov 2023", endDate: "30 Nov 2023", participants: "60 players" },
      { name: "World Chess Championship", status: "Upcoming", startDate: "12 Nov 2023", endDate: "30 Nov 2023", participants: "2 players" },
      { name: "EVO Championship", status: "Completed", startDate: "4 Aug 2023", endDate: "6 Aug 2023", participants: "5000+ players" },
      { name: "Golf", status: "Completed", startDate: "6 Apr 2023", endDate: "9 Apr 2023", participants: "88 players" },
      { name: "League of Legends Worlds", status: "Ongoing", startDate: "10 Oct 2023", endDate: "19 Nov 2023", participants: "24 teams" }
    ];
  
    return (
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
              {tournaments.map((tournament, index) => (
                <TableRow key={index}>
                  <TableCell>{tournament.name}</TableCell>
                  <TableCell>{tournament.status}</TableCell>
                  <TableCell>{tournament.startDate}</TableCell>
                  <TableCell>{tournament.endDate}</TableCell>
                  <TableCell>{tournament.participants}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
  