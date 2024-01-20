import api from "./api";

const GetMatches = () => {
  const request = api.get("/matches/");
  return request.then((response) => response.data);
};

const CreateMatch = (matchData) => {
  const request = api.post("matches/create_match/", matchData);
  return request.then((response) => response.data);
};

const MatchesService = {
  GetMatches,
  AddMatch: CreateMatch,
};

export default MatchesService;

