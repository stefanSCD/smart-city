// src/services/problemService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Get all problems
export const getProblems = async () => {
  try {
    const response = await axios.get(`${API_URL}/problems`);
    return response.data;
  } catch (error) {
    console.error('Error fetching problems:', error);
    throw error;
  }
};

// Get problem by ID
export const getProblemById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/problems/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching problem ${id}:`, error);
    throw error;
  }
};

// Create a new problem
export const createProblem = async (problemData, mediaFile = null) => {
  try {
    // If we have a media file, we need to use FormData
    if (mediaFile) {
      const formData = new FormData();
      formData.append('image', mediaFile);
      
      // Add all problem data as JSON string
      formData.append('problemData', JSON.stringify(problemData));
      
      const response = await axios.post(`${API_URL}/problems/with-media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return response.data;
    } else {
      // Regular JSON request without media
      const response = await axios.post(`${API_URL}/problems`, problemData);
      return response.data;
    }
  } catch (error) {
    console.error('Error creating problem:', error);
    throw error;
  }
};

// Update a problem
export const updateProblem = async (id, problemData) => {
  try {
    const response = await axios.put(`${API_URL}/problems/${id}`, problemData);
    return response.data;
  } catch (error) {
    console.error(`Error updating problem ${id}:`, error);
    throw error;
  }
};

// Delete a problem
export const deleteProblem = async (id) => {
  try {
    await axios.delete(`${API_URL}/problems/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting problem ${id}:`, error);
    throw error;
  }
};

// Assign problem to employee
export const assignProblemToEmployee = async (problemId, employeeId, gravitate) => {
  try {
    const response = await axios.post(`${API_URL}/problems/assign`, {
      problem_id: problemId,
      employee_id: employeeId,
      gravitate
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning problem:', error);
    throw error;
  }
};