import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Adaugă acest import
import LocationMap from '../LocationMap';
import { getProblems, createProblem } from '../../services/problemService';
import { 
  Home, 
  AlertTriangle, 
  User, 
  LogOut, 
  Camera, 
  MapPin, 
  Check, 
  X, 
  ChevronRight,
  AlignJustify,
  Bell,
  Settings,
  Zap
} from 'lucide-react';
import { logout } from '../../services/authService';
import { 
  getUserData,  
  getUserRecentReports, 
  updateUserProfile, 
  uploadProfileImage, 
  changePassword 
} from '../../services/userService';

const UserDashboard = () => {
  const navigate = useNavigate(); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [problemType, setProblemType] = useState('');
  const [reportStep, setReportStep] = useState(1);
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [description, setDescription] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRecentReports, setUserRecentReports] = useState([]);
  const [userDataLoading, setUserDataLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");


  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    avatar: "",
    recentReports: []
  });
  
  // Funcția modificată pentru logout
  const handleSignOut = () => {
    logout(); // Apelăm funcția de logout din authService
    navigate('/login'); // Redirecționăm către pagina de login
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('ID utilizator din localStorage:', userInfo.id);
      
      // Verifică formatul UUID
      const isValidUUID = userInfo.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userInfo.id);
      console.log('Este ID-ul un UUID valid?', isValidUUID);
      try {
        setUserDataLoading(true);
        
        // Încarcă datele principale ale utilizatorului
        const userData = await getUserData();
        if (userData.name) {
          const nameParts = userData.name.split(' ');
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
        }
        
        setEmail(userData.email || '');
        setPhone(userData.phone || '');
        setUserData(userData);
        
        // Obține ID-ul utilizatorului autentificat
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = userInfo.id || userData?.id;
        
        // Verifică dacă userId este un UUID valid
        const isValidUUID = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        
        if (isValidUUID) {
          try {
            const recentReports = await getUserRecentReports(userId);
            setUserRecentReports(recentReports);
          } catch (error) {
            console.error('Eroare la încărcarea rapoartelor recente:', error);
            setUserRecentReports([]);
          }
        } else {
          console.warn('ID utilizator invalid, nu se pot încărca rapoartele recente');
          setUserRecentReports([]);
        }
        
        setUserDataLoading(false);
      } catch (error) {
        console.error('Eroare la încărcarea datelor utilizatorului:', error);
        setUserDataLoading(false);
        setUserRecentReports([]);
      }
    };
  
    fetchUserData();
    
    // Încarcă și toate problemele pentru pagină
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const problemsData = await getProblems();
        setProblems(problemsData);
        setLoading(false);
      } catch (error) {
        console.error('Eroare la încărcarea problemelor:', error);
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  // Funcția modificată pentru submitFastReport


  // Modifică funcția submitFastReport
  // Modificare în funcția submitFastReport din UserDashboard.js
const submitFastReport = async () => {
  if (isSubmitting) return; // Evită trimiteri multiple
  
  if (!location) {
    alert('Vă rugăm să permiteți accesul la locație pentru a continua.');
    return;
  }
  
  try {
    setIsSubmitting(true);
    
    // Creăm obiectul pentru problema raportată
    const problemData = {
      title: "Raport rapid",
      description: "Problemă raportată prin Fast Report", // Descriere simplă
      location: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      latitude: parseFloat(location.lat.toFixed(6)),
      longitude: parseFloat(location.lng.toFixed(6)),
      category: 'fast_report', // Categoria specifică pentru raport rapid
      status: 'reported'
    };
    
    console.log('Submitting fast report data:', problemData);
    
    // Adăugăm media dacă există
    let createdProblem;
    if (uploadedMedia) {
      createdProblem = await createProblem(problemData, uploadedMedia);
    } else {
      createdProblem = await createProblem(problemData);
    }
    
    console.log('Problem created successfully:', createdProblem);
    
    // Afișează un mesaj de succes
    alert('Raportul a fost trimis cu succes!');
    
    // Resetează formularul
    setActiveSection('dashboard');
    setUploadedMedia(null);
    setMediaPreview(null);
    setLocation(null);
    
    // Actualizează lista de probleme
    try {
      const updatedProblems = await getProblems();
      setProblems(updatedProblems);
    } catch (err) {
      console.warn('Could not refresh problems list:', err);
    }
  } catch (error) {
    console.error('Eroare la trimiterea raportului:', error);
    let errorMessage = 'Trimiterea raportului a eșuat. ';
    
    if (error.response?.data?.message) {
      errorMessage += error.response.data.message;
    } else if (error.message) {
      errorMessage += error.message;
    }
    
    alert(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};
// Modifică și funcția submitReport similar
// Modificare în funcția submitReport din UserDashboard.js
const submitReport = async () => {
  if (isSubmitting) return;
  
  try {
    setIsSubmitting(true);
    
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = userInfo.id || userData?.id;
    
    if (!problemType) {
      alert('Vă rugăm să selectați un tip de problemă.');
      setIsSubmitting(false);
      return;
    }
    
    const isValidUUID = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    
    // Convertește tipul problemei într-o categorie standard pentru AI
    let aiCategory = 'general';
    
    // Mapează tipurile de probleme la categoriile AI
    switch(problemType.toLowerCase()) {
      case 'potholes':
        aiCategory = 'primarie'; // sau 'drumuri_publice'
        break;
      case 'unauthorized graffiti':
        aiCategory = 'politie';
        break;
      case 'overflowing trash bins':
        aiCategory = 'salubrizare';
        break;
      case 'illegally parked cars':
        aiCategory = 'politie';
        break;
      case 'street light issues':
        aiCategory = 'iluminat_public';
        break;
      case 'green space issues':
        aiCategory = 'spatii_verzi';
        break;
      default:
        aiCategory = '';
    }
    
    const problemData = {
      title: problemType || 'Problemă raportată',
      description: description || `Problemă raportată: ${problemType || 'Nedefinită'}`,
      location: location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : '',
      latitude: location ? parseFloat(location.lat.toFixed(6)) : null,
      longitude: location ? parseFloat(location.lng.toFixed(6)) : null,
      category: aiCategory, // Folosim categoria potrivită pentru AI
      status: 'reported',
      reported_by: isValidUUID ? userId : null
    };
    
    console.log('Submitting detailed report:', problemData);
    
    let createdProblem;
    if (uploadedMedia) {
      createdProblem = await createProblem(problemData, uploadedMedia);
    } else {
      createdProblem = await createProblem(problemData);
    }
    
    console.log('Detailed report created successfully:', createdProblem);
    
    // Afișează un mesaj de succes
    alert('Raportul detaliat a fost trimis cu succes!');
    
    // Resetează formularul și revenim la dashboard
    resetReport();
    setActiveSection('dashboard');
    
    // Actualizează lista de probleme și rapoartele recente
    try {
      const updatedProblems = await getProblems();
      setProblems(updatedProblems);
      
      if (isValidUUID) {
        const updatedReports = await getUserRecentReports(userId);
        setUserRecentReports(updatedReports);
      }
    } catch (err) {
      console.warn('Could not refresh data:', err);
    }
  } catch (error) {
    console.error('Eroare la trimiterea raportului detaliat:', error);
    
    let errorMessage = 'Trimiterea raportului a eșuat.';
    if (error.response?.data?.message) {
      errorMessage += ' ' + error.response.data.message;
    } else if (error.message) {
      errorMessage += ' ' + error.message;
    }
    
    alert(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};
  


  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Verifică dimensiunea fișierului (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File is too large. Maximum size is 5MB.');
          return;
        }
        
        // Verifică tipul fișierului
        if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
          alert('Only image files (JPEG, PNG, GIF) are allowed.');
          return;
        }
        
        const updatedUser = await uploadProfileImage(file);
        setUserData(updatedUser);
        alert('Profile image uploaded successfully!');
      } catch (error) {
        console.error('Error uploading profile image:', error);
        alert('Failed to upload profile image. Please try again.');
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatedUserData = {
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        // alte câmpuri necesare
      };
      
      await updateUserProfile(updatedUserData);
      alert('Profile updated successfully!');
      
      // Reîncarcă datele utilizatorului pentru a reflecta modificările
      const refreshedUserData = await getUserData();
      setUserData(refreshedUserData);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleSubmitReport = async (reportData) => {
    try {
      await createProblem(reportData);
      // Reîncarcă problemele sau adaugă problema nouă la listă
      const updatedProblems = await getProblems();
      setProblems(updatedProblems);
    } catch (error) {
      console.error('Eroare la raportarea problemei:', error);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    try {
      // Trimite direct câmpurile așa cum sunt așteptate de API
      await changePassword({
        oldPassword: currentPassword,  // Numele corect pe care îl așteaptă API-ul
        newPassword: newPassword
      });
      
      // Resetează câmpurile
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please check your current password and try again.');
    }
  };

  const problemTypes = [
    { id: 'pothole', label: 'Potholes', icon: '🕳️' },
    { id: 'graffiti', label: 'Unauthorized Graffiti', icon: '🖌️' },
    { id: 'trash', label: 'Overflowing Trash Bins', icon: '🗑️' },
    { id: 'parking', label: 'Illegally Parked Cars', icon: '🚗' },
    { id: 'other', label: 'Other Issues', icon: '❓' }
  ];

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verifică dimensiunea fișierului (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Fișierul este prea mare. Dimensiunea maximă este de 10MB.');
        return;
      }
      
      // Verifică tipul fișierului
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/) && !file.type.match(/video\/(mp4|webm|ogg)/)) {
        alert('Doar fișierele imagine (JPEG, PNG, GIF) și video (MP4, WebM, OGG) sunt acceptate.');
        return;
      }
      
      console.log('Media file selected:', file.name, file.type, file.size);
      
      setUploadedMedia(file);
      const preview = URL.createObjectURL(file);
      setMediaPreview(preview);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          alert(`Error getting location: ${error.message}`);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const confirmLocation = () => {
    setLocationConfirmed(true);
    setReportStep(3);
  };



  const resetReport = () => {
    setReportStep(1);
    setProblemType('');
    setUploadedMedia(null);
    setMediaPreview(null);
    setLocation(null);
    setLocationConfirmed(false);
    setDescription('');
  };

  const handleFastReport = () => {
    setActiveSection('fastReport');
    setUploadedMedia(null);
    setMediaPreview(null);
    setLocation(null);
  };
  
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {userDataLoading ? 'Loading...' : `Welcome, ${userData.name}`}
        </h2>
        <p className="text-gray-600">What would you like to do today?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button 
            onClick={handleFastReport}
            className="flex items-center justify-between p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            <div className="flex items-center">
              <Zap className="mr-3" size={24} />
              <span className="text-lg font-medium">Fast Report</span>
            </div>
            <ChevronRight size={20} />
          </button>
          
          <button 
            onClick={() => setActiveSection('report')}
            className="flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <div className="flex items-center">
              <AlertTriangle className="mr-3" size={24} />
              <span className="text-lg font-medium">Detailed Report</span>
            </div>
            <ChevronRight size={20} />
          </button>
          
          <button 
            onClick={() => setActiveSection('account')}
            className="flex items-center justify-between p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            <div className="flex items-center">
              <User className="mr-3" size={24} />
              <span className="text-lg font-medium">Manage Account</span>
            </div>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Reports</h2>
        {userDataLoading ? (
          <p>Loading reports...</p>
        ) : userRecentReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userRecentReports.map((problem) => (
                  <tr key={problem.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {problem.title || (problem.category ? problem.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {problem.location ? problem.location.substring(0, 20) + (problem.location.length > 20 ? '...' : '') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(problem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${problem.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        problem.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}
                      >
                        {problem.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : problems && problems.length > 0 ? (
          <div>
            <p className="text-gray-500 mb-4">Iată cele mai recente rapoarte din sistem:</p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {problems.slice(0, 5).map((problem) => (
                    <tr key={problem.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {problem.title || (problem.category ? problem.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {problem.location ? problem.location.substring(0, 20) + (problem.location.length > 20 ? '...' : '') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(problem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${problem.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          problem.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}
                        >
                          {problem.status?.replace(/_/g, ' ') || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No reports yet.</p>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Secțiunea pentru schimbarea parolei */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFastReport = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Fast Report</h2>
      <p className="text-gray-600 mb-6">Quickly report an issue with just a photo and your location</p>
      
      <div className="space-y-6">
        {/* Încărcare media */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo/Video</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              {mediaPreview ? (
                <div className="w-full h-full flex items-center justify-center">
                  {uploadedMedia?.type.startsWith('image/') ? (
                    <img src={mediaPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <video src={mediaPreview} controls className="max-h-full max-w-full"></video>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera size={48} className="text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG or JPG (MAX. 5MB)</p>
                </div>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleMediaUpload} 
              />
            </label>
          </div>
        </div>
        
       {/* Locație */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          {!location ? (
            <button
              onClick={getLocation}
              className="flex items-center justify-center w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <MapPin className="mr-2" size={20} />
              Get Current Location
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Latitude: {location.lat.toFixed(6)}</span>
                  <span className="text-gray-700">Longitude: {location.lng.toFixed(6)}</span>
                </div>
                <p className="text-xs text-gray-500">Your current location has been captured</p>
              </div>
              
              {/* Harta */}
              <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                <LocationMap 
                  location={location} 
                  onLocationUpdate={(newLocation) => setLocation(newLocation)} 
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Butoane acțiuni */}
        <div className="flex justify-between pt-4">
          <button
            onClick={() => setActiveSection('dashboard')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          
          <button
            onClick={submitFastReport}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            disabled={!uploadedMedia || !location}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );

  const renderReportProblem = () => {
    switch (reportStep) {
      case 1:
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">What issue would you like to report?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {problemTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setProblemType(type.label);
                    setReportStep(2);
                  }}
                  className={`flex items-center p-4 border-2 rounded-lg transition
                    ${problemType === type.label 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                >
                  <span className="text-2xl mr-3">{type.icon}</span>
                  <span className="text-gray-800 font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
        case 2:
          return (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload Media & Location</h2>
              <p className="text-gray-600 mb-6">Reporting: {problemType}</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo/Video</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      {/* Codul pentru upload media rămâne neschimbat */}
                      {mediaPreview ? (
                        <div className="w-full h-full flex items-center justify-center">
                          {uploadedMedia?.type.startsWith('image/') ? (
                            <img src={mediaPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <video src={mediaPreview} controls className="max-h-full max-w-full"></video>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera size={48} className="text-gray-400 mb-3" />
                          <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-gray-500">PNG, JPG, or MP4 (MAX. 10MB)</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,video/*" 
                        onChange={handleMediaUpload} 
                      />
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="space-y-4">
                    {!location ? (
                      <button
                        onClick={getLocation}
                        className="flex items-center justify-center w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      >
                        <MapPin className="mr-2" size={20} />
                        Get Current Location
                      </button>
                    ) : (
                      <div>
                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">Latitude: {location.lat.toFixed(6)}</span>
                            <span className="text-gray-700">Longitude: {location.lng.toFixed(6)}</span>
                          </div>
                        </div>
                        
                        {/* Înlocuiește mockup-ul de hartă cu componenta reală */}
                        <div className="h-48 rounded-lg overflow-hidden border border-gray-300 mb-4">
                          <LocationMap 
                            location={location} 
                            onLocationUpdate={(newLocation) => setLocation(newLocation)} 
                          />
                        </div>
                        
                        <button
                          onClick={confirmLocation}
                          className="flex items-center justify-center w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                        >
                          <Check className="mr-2" size={20} />
                          Confirm Location
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={resetReport}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  Back
                </button>
              </div>
            </div>
          );
      case 3:
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Additional Details</h2>
            <p className="text-gray-600 mb-6">Reporting: {problemType}</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                <textarea
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please provide any additional details about the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Media</h3>
                  {mediaPreview ? (
                    <div className="h-32 flex items-center justify-center bg-gray-200 rounded overflow-hidden">
                      {uploadedMedia?.type.startsWith('image/') ? (
                        <img src={mediaPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <video src={mediaPreview} className="max-h-full max-w-full" />
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No media uploaded</p>
                  )}
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Location</h3>
                  {location ? (
                    <div>
                      <p className="text-gray-700 text-sm">Lat: {location.lat.toFixed(6)}</p>
                      <p className="text-gray-700 text-sm">Lng: {location.lng.toFixed(6)}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No location set</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setReportStep(2)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Back
              </button>
              
              <button
                onClick={submitReport}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Submit Report
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  const renderAccountSettings = () => (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Account Settings</h2>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Profil și Imagine */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center">
          <div className="relative mb-4 sm:mb-0 sm:mr-6">
            <img 
              src={userData.avatar || "/images/default-avatar.jpg"} 
              alt={userData.name || "Profile"} 
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
            <h3 className="text-lg font-medium text-gray-900">{userData.name || "Your Name"}</h3>
            <p className="text-gray-600">{userData.email || "your.email@example.com"}</p>
          </div>
        </div>
        
        {/* Informații Personale */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
              <input 
                type="tel" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>
        
        
        {/* Butoane Acțiuni */}
        <div className="pt-5 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => setActiveSection('dashboard')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
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
                <h1 className="text-xl font-bold text-blue-600">Smart City</h1>
              </div>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={userData.avatar || "/images/default-avatar.jpg"}
                    alt=""
                  />
                  <span className="ml-2 text-gray-700">{userData.name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                <AlignJustify size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeSection === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home className="mr-3" size={20} />
                Dashboard
              </button>
              <button
                onClick={() => setActiveSection('report')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeSection === 'report' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <AlertTriangle className="mr-3" size={20} />
                Detailed Report
              </button>
              <button
                onClick={handleFastReport}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeSection === 'fastReport' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Zap className="mr-3" size={20} />
                Fast Report
              </button>
              <button
                onClick={() => setActiveSection('account')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeSection === 'account' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="mr-3" size={20} />
                Account
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
                Settings
              </button>
              
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="mr-3" size={20} />
                Sign Out
              </button>
            </nav>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-25">
              <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white shadow-lg">
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                  <h1 className="text-xl font-bold text-blue-600">Smart City</h1>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close menu</span>
                    <X size={24} />
                  </button>
                </div>
                <div className="px-2 pt-2 pb-3">
                  <button
                    onClick={() => {
                      setActiveSection('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('report');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Detailed Report
                  </button>
                  <button
                    onClick={() => {
                      handleFastReport();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Fast Report
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('account');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Account
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Main content */}
          <main className="lg:col-span-9">
            {activeSection === 'settings' && renderSettings()}
            {activeSection === 'fastReport' && renderFastReport()}
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'report' && renderReportProblem()}
            {activeSection === 'account' && renderAccountSettings()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;