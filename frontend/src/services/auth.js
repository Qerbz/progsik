import api from "./api";
import TokenService from "./token";

const createUser = (credentials) => {
  return api.post(`/register/`, credentials).then((response) => {
    if (response.data.access) {
      TokenService.setUser(response.data.user);
      TokenService.updateLocalAccessToken(response.data.access);
      TokenService.setLocalRefreshToken(response.data.refresh);
    }

    return response.data;
  });
};

const createTeam = (request) => {
  return api.post(`/teams/`, { name: request.name, description: request.description }).then((response) => {
    return response.data;
  });
};

const fetchTeams = () => {
  return api.get(`/teams/`).then((response) => {
    return response.data;
  });
};

const login = (credentials) => {
  return api.post("/login/", credentials).then((response) => {
    if (response.data.access) {
      TokenService.setUser(response.data.user);
      TokenService.updateLocalAccessToken(response.data.access);
      TokenService.setLocalRefreshToken(response.data.refresh);
    }

    return response.data;
  });
};

const forgotPassword = (credentials) => {
  const request = api.post("/request-reset-password/", credentials);

  return request.then((response) => response.data);
};

const newPassword = (data) => {
  const request = api.post(`/reset-password-validate/`, data);

  return request.then((response) => response.data);
};

const logout = () => {
  TokenService.removeUser();
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const sendNewEmail = (credentials) => {
  const request = api.post("/request-new-activation-link/", credentials);

  return request.then((response) => response.data);
};

const setTeamForCurrentUser = (teamId) => {
  return api.post(`/users/set_team/`, { team_id: teamId }).then((response) => {
    return response.data;
  });
};


const AuthService = {
  createUser,
  login,
  forgotPassword,
  newPassword,
  logout,
  getCurrentUser,
  sendNewEmail,
  createTeam,
  fetchTeams,
  setTeamForCurrentUser,
};

export default AuthService;
