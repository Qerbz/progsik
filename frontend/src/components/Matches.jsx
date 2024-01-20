import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import MatchesService from "../services/matches";

const Matches = () => {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [finishedMatches, setFinishedMatches] = useState([]);

  const fetchMatches = async () => {
    try {
      const matchesData = await MatchesService.GetMatches();

      const upcomingMatches = matchesData.filter(match => new Date(match.date_time) > new Date()).map(match => {
        const pending = match.consent_requests.filter(request => request.request_status === 'pending').length;
        const accepted = match.consent_requests.filter(request => request.request_status === 'accepted').length;
        const declined = match.consent_requests.filter(request => request.request_status === 'declined').length;

        return {
          id: match.id,
          teams: `${match.team1.name} vs ${match.team2.name}`,
          date: match.date_time,
          pending: pending,
          accepted: accepted,
          declined: declined,
        };
      });

      const finishedMatches = matchesData.filter(match => new Date(match.date_time) <= new Date()).map(match => {
        const pending = match.consent_requests.filter(request => request.request_status === 'pending').length;
        const accepted = match.consent_requests.filter(request => request.request_status === 'accepted').length;
        const declined = match.consent_requests.filter(request => request.request_status === 'declined').length;

        const totalRequests = match.consent_requests.length;
        const status = accepted === totalRequests ? "OK" : "Not Approved";

        return {
          id: match.id,
          teams: `${match.team1.name} vs ${match.team2.name}`,
          date: match.date_time,
          pending: pending,
          accepted: accepted,
          declined: declined,
          status: status,
        };
      });

      setUpcomingMatches(upcomingMatches);
      setFinishedMatches(finishedMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <Container maxWidth="md">
      <Typography sx={{ textAlign: "center", marginTop: 3 }} variant="h2">
        Matches Overview
      </Typography>

      <Typography variant="h5" style={{ marginTop: 20 }}>
        Upcoming Matches
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Teams Involved</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Pending</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Accepted</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Declined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {upcomingMatches.map((match) => (
              <TableRow key={match.id}>
                <TableCell>{match.teams}</TableCell>
                <TableCell>{match.date}</TableCell>
                <TableCell>{match.pending}</TableCell>
                <TableCell>{match.accepted}</TableCell>
                <TableCell>{match.declined}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" style={{ marginTop: 20 }}>
        Finished Matches
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Teams Involved</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Pending</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Accepted</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Declined</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {finishedMatches.map((match) => (
              <TableRow key={match.id}>
                <TableCell>{match.teams}</TableCell>
                <TableCell>{match.date}</TableCell>
                <TableCell>{match.pending}</TableCell>
                <TableCell>{match.accepted}</TableCell>
                <TableCell>{match.declined}</TableCell>
                <TableCell>{match.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Matches;

