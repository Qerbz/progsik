import api from "./api";

const AddNewObjection = (objectionData) => {
  const request = api.post('objections/create_objection/', objectionData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
  );
  return request.then((response) => response.data)
    .catch((error) => {
      console.error("Error adding new objection:", error);
      throw error;
    });
};

const ObjectionsService = {
  AddNewObjection,
};

export default ObjectionsService;

