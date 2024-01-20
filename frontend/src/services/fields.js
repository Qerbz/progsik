import api from "./api";

const FetchAvailableTimeSlots = (fieldId, date, timezone) => {
  const formattedDate = JSON.stringify(date).replace(/"/g, '');
  const requestData = {
    field_id: fieldId,
    date: formattedDate,
    timezone: timezone,
  };
  const request = api.post('field-bookings/', requestData);
  return request.then((response) => response.data);
};

const FetchFieldsInUse = () => {
  return api.get('current-use/')
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching fields in use:", error);
      throw error;
    });
};

const FetchAllFields = () => {
  return api.get('fields/')
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching all fields:", error);
      throw error;
    });
};

const FieldsService = {
  FetchAvailableTimeSlots,
  FetchFieldsInUse,
  FetchAllFields,
};

export default FieldsService;
