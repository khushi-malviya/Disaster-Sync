import axios from 'axios';

const API_URL = 'http://localhost:5000/api/incidents';

export const getIncidents = () => axios.get(API_URL);
export const createIncident = (data) => axios.post(API_URL, data);
