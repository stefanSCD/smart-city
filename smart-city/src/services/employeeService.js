// src/services/employeeService.js
import { api } from './authService';

// Obține profilul angajatului autentificat
export const getEmployeeProfile = async () => {
  try {
    const response = await api.get('/employees/profile/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    throw error;
  }
};

// Actualizează profilul angajatului
export const updateEmployeeProfile = async (profileData) => {
  try {
    const response = await api.put('/employees/profile/update', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating employee profile:', error);
    throw error;
  }
};

export const getAllTempProblemGraphs = async () => {
  try {
    const response = await api.get('/temp-problem-graphs');
    return response.data;
  } catch (error) {
    console.error('Eroare la încărcarea problemelor AI:', error);
    throw error;
  }
};

// Încarcă o imagine de profil
export const uploadEmployeeAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/employees/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading employee avatar:', error);
    throw error;
  }
};

// Schimbă parola angajatului
export const changeEmployeePassword = async (passwordData) => {
  try {
    const response = await api.post('/employees/profile/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing employee password:', error);
    throw error;
  }
};



// Obține problemele temporare pentru departamentul angajatului
export const getEmployeeTempProblems = async () => {
  try {
    const response = await api.get('/employees/problems/temp');
    return response.data;
  } catch (error) {
    console.error('Error fetching temporary problems:', error);
    return [];
  }
};

// Actualizează statusul unei probleme temporare
export const updateTempProblemStatus = async (problemId, status) => {
  try {
    const response = await api.put(`/employees/problems/temp/${problemId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating temporary problem status:', error);
    throw error;
  }
};

export const resolveTempProblem = async (problemId, resolutionData) => {
  try {
    const response = await api.post(`/temp-problem-graphs/${problemId}/resolve`, resolutionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obține statisticile angajatului
export const getEmployeeStatistics = async () => {
  try {
    const response = await api.get('/employees/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching employee statistics:', error);
    return {
      resolvedProblems: 0,
      problemsInProgress: 0,
      completedTasks: 0,
      inProgressTasks: 0
    };
  }
};

export default {
  getEmployeeProfile,
  updateEmployeeProfile,
  uploadEmployeeAvatar,
  changeEmployeePassword,
  getEmployeeTempProblems,
  updateTempProblemStatus,
  resolveTempProblem,
  getEmployeeStatistics
};