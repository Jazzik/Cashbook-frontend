import axios from 'axios';
import { ShiftData } from '../types';

// Use a fixed internal URL that will be intercepted by Nginx
const API_URL = '/internal-api';

// Create an axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API functions
export const api = {
    // Submit shift data to the server
    submitShiftData: async (shiftData: ShiftData) => {
        try {
            console.log('Sending shift data to server:', {
                terminal: shiftData.terminal,
                terminalReturns: shiftData.terminalReturns,
                terminalTransfer: shiftData.terminalTransfer
            });
            const response = await apiClient.post('/shift-data', shiftData);
            console.log('Server response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error submitting shift data:', error);
            throw error;
        }
    },

    // Check server health
    checkHealth: async () => {
        try {
            const response = await apiClient.get('/health');
            return response.data;
        } catch (error) {
            console.error('Error checking server health:', error);
            throw error;
        }
    },
}; 