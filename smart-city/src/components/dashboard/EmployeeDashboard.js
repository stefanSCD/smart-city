// src/components/dashboard/EmployeeDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProblem } from '../../services/problemService';
import { logout } from '../../services/authService';
import { 
  getUserData,  
  uploadProfileImage, 
  updateUserProfile, 
  changePassword 
} from '../../services/userService';
import { 
  User,
  Clock, 
  LogOut, 
  CheckCircle,
  AlignJustify,
  Settings,
  X,
  List,
  Calendar,
  Info,
  ChevronRight,
  Camera
} from 'lucide-react';
import * as employeeService from '../../services/employeeService';
import LocationMap from '../../components/LocationMap';
const EmployeeDashboard = () => {
  
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('tasks');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tempProblems, setTempProblems] = useState([]);
  const [tempProblemsLoading, setTempProblemsLoading] = useState(true);
  // Pentru secțiunea Account Settings
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [userData, setUserData] = useState({});
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    completedTasks: 0,
    inProgressTasks: 0
  });

  // Pentru gestionarea parolelor
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  useEffect(() => {
  // Încărcăm datele angajatului și problemele
  const fetchData = async () => {
    try {
      setLoading(true);
      setUserDataLoading(true);
      
      // 1. Încărcăm profilul angajatului
      const profileData = await getUserData();
      setUserData(profileData);
      
      // Setăm numele și prenumele pentru formular
      if (profileData.nume && profileData.prenume) {
        setFirstName(profileData.prenume);
        setLastName(profileData.nume);
      } else if (profileData.name) {
        const nameParts = profileData.name.split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
      }
      
      setEmail(profileData.email || '');
      setPhone(profileData.phone || '');
      
      // 2. Încărcăm doar problemele care ne interesează (fără statistici)
      const [tempProblemsResult, aiProblemsResult] = await Promise.all([
        employeeService.getEmployeeTempProblems(),
        employeeService.getAllTempProblemGraphs()
      ]);
      
      // 3. Setăm datele în state
      setProblems(tempProblemsResult);
      setTempProblems(aiProblemsResult);
      
      // 4. Setăm statistici default (fără a face apel API)
      setStatistics({
        resolvedProblems: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        resolutionRate: '0',
        averageResolutionTime: '0'
      });
      
      setUserDataLoading(false);
      setLoading(false);
    } catch (error) {
      console.error('Eroare la încărcarea datelor:', error);
      setUserDataLoading(false);
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
  
  // Handle logout functionality
  const handleLogout = () => {
    // Folosește funcția de logout din authService
    logout();
    // Redirect to login page
    navigate('/login');
  };
  const getSeverityLabel = (score) => {
  if (!score && score !== 0) return 'Necunoscută';
  
  if (score >= 8) return 'Ridicată';
  if (score >= 5) return 'Medie';
  return 'Scăzută';
};
  // Funcții pentru managementul profilului
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Verifică dimensiunea fișierului (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Fișierul este prea mare. Dimensiunea maximă este de 5MB.');
          return;
        }
        
        // Verifică tipul fișierului
        if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
          alert('Doar fișierele imagine (JPEG, PNG, GIF) sunt acceptate.');
          return;
        }
        
        const updatedUser = await uploadProfileImage(file);

        
        // Actualizăm userData cu noua cale către imagine
        setUserData(updatedUser);
        
        alert('Imaginea de profil a fost încărcată cu succes!');
      } catch (error) {
        console.error('Eroare la încărcarea imaginii de profil:', error);
        alert('Încărcarea imaginii de profil a eșuat. Vă rugăm să încercați din nou.');
      }
    }
  };

  // Funcții pentru afișarea categoriilor AI
  const getCategoryIcon = (category) => {
    if (!category) return '❓';
    
    switch (category.toLowerCase()) {
      case 'pothole':
        return '🕳️';
      case 'garbage':
        return '🗑️';
      case 'graffiti':
        return '🖌️';
      // Adăugați mai multe cazuri după nevoie
      default:
        return '❓';
    }
  };

  const getCategoryLabel = (category) => {
    if (!category) return 'Necunoscut';
    
    switch (category.toLowerCase()) {
      case 'pothole':
        return 'Groapă în asfalt';
      case 'garbage':
        return 'Gunoi';
      // Adăugați mai multe cazuri după nevoie
      default:
        return category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const getSeverityClass = (score) => {
    if (!score && score !== 0) return 'bg-gray-100 text-gray-600';
    
    if (score >= 8) return 'bg-red-100 text-red-800';
    if (score >= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const handleSaveProfile = async () => {
  try {
    const updatedUserData = {
      name: `${firstName} ${lastName}`,
      email: email,
      phone: phone,
    };
    
    const updatedProfile = await updateUserProfile(updatedUserData);
    setUserData(updatedProfile);
    alert('Profilul a fost actualizat cu succes!');
  } catch (error) {
    console.error('Eroare la actualizarea profilului:', error);
    alert('Actualizarea profilului a eșuat. Vă rugăm să încercați din nou.');
  }
};
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Parolele noi nu coincid');
      return;
    }
    
    try {
      await changePassword({
      oldPassword: currentPassword,
      newPassword: newPassword
    });
      
      // Resetează câmpurile
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Parola a fost schimbată cu succes!');
    } catch (error) {
      console.error('Eroare la schimbarea parolei:', error);
      alert('Schimbarea parolei a eșuat. Vă rugăm să verificați parola curentă și să încercați din nou.');
    }
  };

  const handleUpdateStatus = async (problemId, newStatus) => {
    try {
      await employeeService.updateTempProblemStatus(problemId, newStatus);
      
      // Actualizăm lista local
      setProblems(prev => 
        prev.map(p => {
          if (p.id === problemId || (p.problem && p.problem.id === problemId)) {
            // Verificăm dacă e o problemă normală sau un TempProblemGraph
            if (p.problem) {
              return {
                ...p,
                problem: {
                  ...p.problem,
                  status: newStatus
                }
              };
            } else {
              return {
                ...p,
                status: newStatus
              };
            }
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Eroare la actualizarea statusului:', error);
      alert('Eroare la actualizarea statusului. Vă rugăm să încercați din nou.');
    }
  };
  
  const handleMarkAsSolved = async (problemId) => {
  try {
    // Eliminăm dialogul prompt și folosim un text predefinit
    const resolution = "Rezolvat prin dashboard-ul angajatului";
    
    // Apelăm direct API-ul pentru a rezolva problema
    await employeeService.resolveTempProblem(problemId, { 
      resolution,
      notes: "Marcat ca rezolvat din dashboard"
    });
    
    // Actualizăm lista locală - ștergem problema din tabelul afișat
    setProblems(prev => prev.filter(p => {
      if (p.id === problemId) return false;
      if (p.problem && p.problem.id === problemId) return false;
      return true;
    }));
    
    // Ștergem și din lista de probleme temporare (tempProblems)
    setTempProblems(prev => prev.filter(p => {
      if (p.id === problemId) return false;
      if (p.problem && p.problem.id === problemId) return false;
      return true;
    }));
    
    // Reîmprospătăm statisticile
    try {
      const stats = await employeeService.getEmployeeStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Eroare la actualizarea statisticilor:', error);
    }
    
    // Închide popup-ul
    setSelectedProblem(null);
    
    // Opțional: Afișați un mesaj de succes
    // Puteți folosi o bibliotecă de notificări sau un sistem propriu
    // De exemplu: toast.success('Problema a fost marcată ca rezolvată!');
    
  } catch (error) {
    console.error('Eroare la marcarea problemei ca rezolvată:', error);
    alert('Eroare la marcarea problemei ca rezolvată. Vă rugăm să încercați din nou.');
  }
};

  const handleProblemClick = (problem) => {
    // Pentru TempProblemGraph avem problema în sub-obiectul 'problem'
    setSelectedProblem(problem.problem || problem);
  };

  const handleClosePopup = () => {
    setSelectedProblem(null);
  };

  const getProblemIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pothole':
        return '🕳️';
      case 'graffiti':
        return '🖌️';
      case 'trash':
        return '🗑️';
      case 'parking':
        return '🚗';
      default:
        return '❓';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
 const renderProblemPopup = () => {
  if (!selectedProblem) return null;

  // Construiți URL-ul corect pentru imagine
  const imageUrl = selectedProblem.media_url && selectedProblem.media_url.startsWith('/')
    ? `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${selectedProblem.media_url}`
    : selectedProblem.media_url;

  // Creați obiectul de locație pentru LocationMap
  const problemLocation = selectedProblem.latitude && selectedProblem.longitude 
    ? { lat: selectedProblem.latitude, lng: selectedProblem.longitude } 
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleClosePopup}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {selectedProblem.title || selectedProblem.type} - {selectedProblem.location}
                  </h3>
                  {selectedProblem.priority && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityClass(selectedProblem.priority)}`}>
                      {selectedProblem.priority.charAt(0).toUpperCase() + selectedProblem.priority.slice(1)} Priority
                    </span>
                  )}
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-4">{selectedProblem.description}</p>
                  
                  <div className="flex space-x-2 mb-4">
                    <div className="flex-shrink-0">
                      <span className="text-lg">{getProblemIcon(selectedProblem.type || selectedProblem.category)}</span>
                    </div>
                    <div>
                      {selectedProblem.reported_by && (
                        <p className="text-sm text-gray-500">Raportat de: {selectedProblem.reporter?.name || 'Utilizator'}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Data: {selectedProblem.createdAt ? new Date(selectedProblem.createdAt).toLocaleDateString() : 'Invalid Date'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Secțiunea pentru Hartă - ADĂUGAȚI AICI */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Locație</h4>
                    {problemLocation ? (
                      <div>
                        <div className="bg-gray-100 p-2 rounded text-sm text-gray-700 mb-2">
                          {selectedProblem.location || `${problemLocation.lat}, ${problemLocation.lng}`}
                        </div>
                        <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
                          <LocationMap 
                            location={problemLocation} 
                            onLocationUpdate={null} // Dezactivăm actualizarea locației pentru vizualizare
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-100 p-2 rounded text-sm text-gray-700">
                        {selectedProblem.location || 'Locație necunoscută'}
                      </div>
                    )}
                  </div>
                  
                  {/* Secțiunea pentru imagini - existentă */}
                  {imageUrl && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Imagini</h4>
                      <div className="border rounded overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt="Problem" 
                          className="w-full object-cover"
                          style={{ maxHeight: '300px' }}
                          onError={(e) => {
                            console.error('Error loading image:', imageUrl);
                            e.target.onerror = null;
                            e.target.src = '/api/placeholder/320/240';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => handleMarkAsSolved(selectedProblem.id)}
            >
              <CheckCircle className="mr-2" size={16} /> Marcați ca rezolvat
            </button>
            <button 
              type="button" 
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleClosePopup}
            >
              Închide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

 const renderTaskList = () => {
  console.log("tempProblems:", tempProblems);
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex justify-center items-center">
        <p className="text-lg text-gray-600">Se încarcă sarcinile...</p>
      </div>
    );
  }
  
  if (!tempProblems || tempProblems.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Probleme detectate cu AI</h2>
        <p className="text-gray-600">Nu există probleme detectate cu AI în acest moment.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Probleme detectate cu AI
        </h2>
        
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6">Problemă</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locație</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severitate</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timp estimat</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Acțiuni</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {tempProblems.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{getCategoryIcon(item.detected_category)}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {getCategoryLabel(item.detected_category)}
                        </div>
                        <div className="text-gray-500">
                          {item.problem?.title || 'Fără titlu'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {item.problem?.location || `${item.latitude}, ${item.longitude}`}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityClass(item.severity_score)}`}>
                      {getSeverityLabel(item.severity_score)} ({item.severity_score || 'N/A'})
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1 text-gray-400" />
                      {item.estimated_fix_time || 'Necunoscut'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${item.problem?.status === 'assigned' || item.problem?.status === 'reported' ? 'bg-blue-100 text-blue-800' : 
                        item.problem?.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                        item.problem?.status === 'completed' || item.problem?.status === 'solved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'}`}
                    >
                      {item.problem?.status === 'assigned' || item.problem?.status === 'reported' ? 'Neasignat' : 
                       item.problem?.status === 'in_progress' ? 'În lucru' : 
                       item.problem?.status === 'completed' || item.problem?.status === 'solved' ? 'Rezolvat' :
                       'În așteptare'}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => handleProblemClick(item)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Vezi<span className="sr-only">, {item.problem?.title}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
  
  const renderStatistics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Statistici Performanță</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Probleme Rezolvate</p>
                <p className="text-2xl font-bold text-blue-800">
                  {statistics.resolvedProblems || statistics.completedTasks || 0}
                </p>
              </div>
              <CheckCircle size={32} className="text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Rată de rezolvare</p>
                <p className="text-2xl font-bold text-green-800">
                  {statistics.resolutionRate ? `${statistics.resolutionRate}%` : '0%'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-600">
                <span className="text-lg font-medium">A+</span>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Timp mediu rezolvare</p>
                <p className="text-2xl font-bold text-purple-800">
                  {statistics.averageResolutionTime ? `${statistics.averageResolutionTime}h` : 'N/A'}
                </p>
              </div>
              <Calendar size={32} className="text-purple-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Activitate Recentă</h3>
          {loading ? (
            <p className="text-gray-500">Se încarcă activitatea recentă...</p>
          ) : !problems || problems.length === 0 ? (
            <p className="text-gray-500">Nu există activitate recentă.</p>
          ) : (
            <div className="space-y-3">
              {problems.slice(0, 3).map((item) => {
                const problem = item.problem || item;
                return (
                  <div key={item.id} className="flex">
                    <div className={`flex-shrink-0 w-2 rounded-full ${problem.status === 'completed' || problem.status === 'solved' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-700">
                        {new Date(problem.createdAt || problem.reportDate).toLocaleDateString()} - {problem.title || problem.type} la {problem.location}
                      </p>
                      <p className="text-xs text-gray-500">
                        {problem.status === 'completed' || problem.status === 'solved' ? 'Rezolvat' : 'În așteptare'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Distribuție Probleme</h3>
          <div className="h-48 bg-white p-2 rounded-lg flex items-center justify-center">
            {loading ? (
              <p className="text-gray-500">Se încarcă statisticile...</p>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <p className="text-xl font-bold text-gray-700">
                  {statistics.resolvedProblems || statistics.completedTasks || 0} probleme rezolvate
                </p>
                <p className="text-lg text-gray-600">
                  {statistics.problemsInProgress || statistics.inProgressTasks || 0} probleme în lucru
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderSettings = () => (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Setări</h2>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Secțiunea pentru profil și imagine */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center">
          <div className="relative mb-4 sm:mb-0 sm:mr-6">
            <img 
              src={userData.avatar || "/api/placeholder/200/200"} 
              alt={userData.nume || "Profile"} 
              className="w-24 h-24 rounded-full object-cover"
            />
            <label 
              htmlFor="profile-image-upload" 
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-50"
            >
              <Camera size={16} className="text-gray-600" />
            </label>
            <input 
              type="file"
              id="profile-image-upload" 
              className="hidden"
              accept="image/*"
              onChange={handleProfileImageUpload} 
            />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-medium text-gray-900">
              {userData.nume && userData.prenume ? `${userData.prenume} ${userData.nume}` : userData.name}
            </h3>
            <p className="text-gray-600">{userData.email}</p>
            <p className="text-sm text-gray-500">
              {userData.departmentDetails?.name || userData.department}
            </p>
          </div>
        </div>
        
        {/* Informații personale */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informații Personale</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prenume</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prenume"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nume</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nume"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresă de email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplu.com"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Număr de telefon</label>
              <input 
                type="tel" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678"
              />
            </div>
          </div>
          
          {/* Butoane pentru salvarea profilului */}
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={handleSaveProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Salvează Modificările
            </button>
          </div>
        </div>
        
        {/* Secțiunea pentru schimbarea parolei */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Schimbare Parolă</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parola curentă</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parolă nouă</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmă parola nouă</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Schimbă Parola
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600">Smart City - Angajat</h1>
              </div>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={userData.avatar || "/api/placeholder/200/200"}
                    alt=""
                  />
                  <span className="ml-2 text-gray-700">
                    {userData.nume && userData.prenume 
                      ? `${userData.prenume} ${userData.nume}` 
                      : userData.name || 'Angajat'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Deschide meniul</span>
                <AlignJustify size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Render problem popup if one is selected */}
      {renderProblemPopup()}
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('tasks')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeSection === 'tasks' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="mr-3" size={20} />
                Lista Sarcini
              </button>
              <button
                onClick={() => setActiveSection('stats')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeSection === 'stats' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Info className="mr-3" size={20} />
                Statistici
              </button>
              <button
                onClick={() => setActiveSection('settings')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeSection === 'settings' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="mr-3" size={20} />
                Setări
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="mr-3" size={20} />
                Deconectare
              </button>
            </nav>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-25">
              <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white shadow-lg">
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                  <h1 className="text-xl font-bold text-blue-600">Smart City - Angajat</h1>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Închide meniul</span>
                    <X size={24} />
                  </button>
                </div>
                <div className="px-2 pt-2 pb-3">
                  <button
                    onClick={() => {
                      setActiveSection('tasks');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Lista Sarcini
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('stats');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Statistici
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('settings');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Setări
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Deconectare
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Main content */}
          <main className="lg:col-span-9">
            {activeSection === 'tasks' && renderTaskList()}
            {activeSection === 'stats' && renderStatistics()}
            {activeSection === 'settings' && renderSettings()}
          </main>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>Smart City &copy; 2025. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EmployeeDashboard;