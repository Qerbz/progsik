import api from "./api";

const fetchPendingRequests = () => {
  return api.get("/consent-requests/").then((response) => response.data);
};

const fetchPastRequests = () => {
    return api.get("consent-requests/past-requests/").then((response) => response.data);
};

const approveRequest = (requestId) => {
  return api.post(`consent-requests/approve/`, requestId).then((response) => response.data);
};

const removeApproval = (requestId) => {
  return api.post(`consent-requests/remove-approval/`, requestId).then((response) => response.data);
};

const ConsentRequestsService = {
  approveRequest,
  removeApproval,
  fetchPendingRequests,
  fetchPastRequests,
};

export default ConsentRequestsService;


