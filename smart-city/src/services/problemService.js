// src/services/problemService.js
import { api } from './authService';

export const getProblems = async () => {
  try {
    const response = await api.get('/problems');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProblem = async (problemData) => {
  try {
    const response = await api.post('/problems', problemData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProblemById = async (id) => {
  try {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProblem = async (id, updateData) => {
  try {
    const response = await api.put(`/problems/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
};