// src/services/problemService.js - versiune complet corectată
import { api } from './authService';
import { v4 as uuidv4 } from 'uuid';
const API_URL = 'http://localhost:3001/api';

export const getProblems = async () => {
  try {
    console.log('Fetching problems from:', `/problems`);
    const response = await api.get('/problems');
    console.log('Problems received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching problems:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    // Returnează un array gol în caz de eroare, nu aruncă excepția mai departe
    return [];
  }
};

// Pentru createProblem, poți încerca să folosești o rută alternativă în cazul în care există probleme cu ruta principală:


export const createProblem = async (problemData, mediaFile = null) => {
  try {
    // Convertim câmpurile numerice
    if (problemData.latitude && typeof problemData.latitude === 'string') {
      problemData.latitude = parseFloat(problemData.latitude);
    }
    if (problemData.longitude && typeof problemData.longitude === 'string') {
      problemData.longitude = parseFloat(problemData.longitude);
    }
    
    // Asigură-te că reported_by este un UUID valid sau lasă serverul să se ocupe de asta
    if (problemData.reported_by && typeof problemData.reported_by === 'string' && 
        !problemData.reported_by.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.log('Converting non-UUID reported_by to valid format');
      problemData.reported_by = uuidv4();
    }
    
    console.log('Creating problem with data:', problemData);
    
    if (mediaFile) {
      const formData = new FormData();
      
      // Adaugă fișierul media
      formData.append('media', mediaFile);
      
      // Adăugăm în mod explicit categoria și descrierea pentru procesarea AI
      // Aceste câmpuri vor fi folosite de serviciul AI pentru a ghida analiza
      if (problemData.category) {
        formData.append('category', problemData.category);
      }
      
      if (problemData.description) {
        formData.append('description', problemData.description);
      }
      
      // Adăugăm restul datelor
      Object.keys(problemData).forEach(key => {
        // Nu adăuga din nou category și description (le-am adăugat deja mai sus)
        if (key !== 'category' && key !== 'description') {
          if (typeof problemData[key] === 'object' && problemData[key] !== null) {
            formData.append(key, JSON.stringify(problemData[key]));
          } else {
            formData.append(key, problemData[key]);
          }
        }
      });
      
      console.log('Sending problem with media to:', `/problems`);
      
      const response = await api.post('/problems', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return response.data;
    } else {
      console.log('Sending problem without media to:', `/problems`);
      const response = await api.post('/problems', problemData);
      return response.data;
    }
  } catch (error) {
    console.error('Error creating problem:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};
// Obține o problemă după ID
export const getProblemById = async (id) => {
  try {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching problem ${id}:`, error);
    throw error;
  }
};


// Actualizează o problemă
export const updateProblem = async (id, problemData) => {
  try {
    const response = await api.put(`/problems/${id}`, problemData);
    return response.data;
  } catch (error) {
    console.error(`Error updating problem ${id}:`, error);
    throw error;
  }
};

// Șterge o problemă
export const deleteProblem = async (id) => {
  try {
    await api.delete(`/problems/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting problem ${id}:`, error);
    throw error;
  }
};

// Asignează o problemă unui angajat
export const assignProblemToEmployee = async (problemId, userId) => {
  try {
    const response = await api.post(`/problems/${problemId}/assign`, {
      user_id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning problem:', error);
    throw error;
  }
};

// Actualizează statusul unei probleme
export const updateProblemStatus = async (problemId, status) => {
  try {
    const response = await api.put(`/problems/${problemId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating problem status:', error);
    throw error;
  }
};

// Adaugă un comentariu la o problemă
export const addProblemComment = async (problemId, comment) => {
  try {
    const response = await api.post(`/problems/${problemId}/comments`, { comment });
    return response.data;
  } catch (error) {
    console.error('Error adding problem comment:', error);
    throw error;
  }
};

// Obține toate problemele asignate unui angajat
export const getEmployeeProblems = async (userId) => {
  try {
    const response = await api.get(`/problems/assigned/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee problems:', error);
    return [];
  }
};

export default {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  assignProblemToEmployee,
  updateProblemStatus,
  addProblemComment,
  getEmployeeProblems
};