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
    submitShiftData: async (shiftData: ShiftData, screenshot?: File) => {
        try {
            console.log('Sending shift data to server:', {
                terminal: shiftData.terminal,
                terminalReturns: shiftData.terminalReturns,
                terminalTransfer: shiftData.terminalTransfer
            });

            let response;

            if (screenshot) {
                // Create FormData for file upload
                const formData = new FormData();
                formData.append('screenshot', screenshot);

                // Add shift data as JSON string
                formData.append('shiftData', JSON.stringify(shiftData));

                // Send with multipart/form-data
                response = await apiClient.post('/shift-data', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Send as JSON (existing behavior)
                response = await apiClient.post('/shift-data', shiftData);
            }

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
