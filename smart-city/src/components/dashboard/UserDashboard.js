// src/components/dashboard/UserDashboard.js
import React, { useState, useEffect } from 'react';
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
import { 
  getUserData, 
  getUserNotifications, 
  getUserRecentReports, 
  updateUserProfile, 
  uploadProfileImage, 
  changePassword 
} from '../../services/userService';
const UserDashboard = () => {
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
  // La începutul componentei, adaugă acestea:
  const [userNotifications, setUserNotifications] = useState([]);
  const [userRecentReports, setUserRecentReports] = useState([]);
  const [userDataLoading, setUserDataLoading] = useState(true);

  // Pentru secțiunea Account Settings, adaugă acestea:
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Pentru gestionarea parolelor:
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    avatar: "",
    recentReports: [],
    notifications: []
  });
  
  useEffect(() => {
    const fetchUserData = async () => {
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
        
        // Încarcă notificările și rapoartele utilizatorului
        const notifications = await getUserNotifications();
        setUserNotifications(notifications);
        
        const recentReports = await getUserRecentReports();
        setUserRecentReports(recentReports);
        
        setUserDataLoading(false);
      } catch (error) {
        console.error('Eroare la încărcarea datelor utilizatorului:', error);
        setUserDataLoading(false);
      }
    };
  
    fetchUserData();
  }, []);

  const submitFastReport = async () => {
    try {
      const problemData = {
        title: "Fast Report",
        description: "Fast report submitted via mobile app",
        status: 'nou',
        location: location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : '',
        lat: location ? location.lat : null,
        long: location ? location.lng : null,
        // Aici poți adăuga un câmp pentru tipul de raport, dacă backend-ul tău îl suportă
        reportType: 'fast'
      };
      
      // Adăugăm media dacă există
      if (uploadedMedia) {
        const formData = new FormData();
        formData.append('image', uploadedMedia);
        formData.append('problemData', JSON.stringify(problemData));
        
        // Aici ar trebui să ai o funcție în serviciul tău care poate trimite FormData
        // De exemplu: await uploadProblemWithMedia(formData);
        
        // Alternativ, poți modifica createProblem pentru a accepta un al doilea parametru pentru media
        await createProblem(problemData, uploadedMedia);
      } else {
        await createProblem(problemData);
      }
      
      // Afișează un mesaj de succes
      alert(`Report submitted successfully!`);
      
      // Resetează formularul
      setActiveSection('dashboard');
      setUploadedMedia(null);
      setMediaPreview(null);
      setLocation(null);
      
      // Actualizează lista de probleme
      const updatedProblems = await getProblems();
      setProblems(updatedProblems);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
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

  const submitReport = async () => {
    try {
      const problemData = {
        title: problemType,
        description: description,
        status: 'nou',
        location: location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : '',
        lat: location ? location.lat : null,
        long: location ? location.lng : null,
        // Dacă ai un câmp pentru departament, ar trebui adăugat aici
      };
      
      await createProblem(problemData);
      
      // Afișează un mesaj de succes
      alert(`Report submitted successfully for ${problemType}!`);
      
      // Resetează formularul
      setActiveSection('dashboard');
      setReportStep(1);
      setProblemType('');
      setUploadedMedia(null);
      setMediaPreview(null);
      setLocation(null);
      setLocationConfirmed(false);
      setDescription('');
      
      // Actualizează lista de probleme
      const updatedProblems = await getProblems();
      setProblems(updatedProblems);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
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
      {loading ? (
        <p>Loading reports...</p>
      ) : problems.length > 0 ? (
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
              {problems.map((problem) => (
                <tr key={problem.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{problem.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{problem.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(problem.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${problem.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      problem.status === 'in progress' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'}`}
                    >
                      {problem.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  ) : (
    <p className="text-gray-500">No reports yet.</p>
  )}
</div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
          <span className="text-sm text-blue-600 cursor-pointer hover:underline">View all</span>
        </div>
        
        {userNotifications.length > 0 ? (
        <div className="space-y-4">
          {userNotifications.map((notification) => (
            <div key={notification.id} className={`p-3 border-l-4 ${notification.isRead ? 'border-gray-300 bg-gray-50' : 'border-blue-500 bg-blue-50'} rounded`}>
              <div className="flex justify-between">
                <p className="text-sm text-gray-700">{notification.message}</p>
                <span className="text-xs text-gray-500">{notification.date}</span>
              </div>
            </div>
          ))}
        </div>
        ) : (
          <p className="text-gray-500">No notifications.</p>
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
        
        {/* Secțiunea pentru alte setări - cu checkboxuri aliniate orizontal */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Application Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                  type="checkbox" 
                  id="dark-mode"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={false}
                  onChange={() => {}}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="dark-mode" className="font-medium text-gray-700">Dark Mode</label>
                <p className="text-gray-500">Use dark theme</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                  type="checkbox" 
                  id="language-setting"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={true}
                  onChange={() => {}}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="language-setting" className="font-medium text-gray-700">System Language</label>
                <p className="text-gray-500">Use system language</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Secțiunea pentru detalii aplicație */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">Smart City App v1.0.0</p>
            <p className="text-sm text-gray-600 mt-1">© 2025 Smart City Company</p>
            <div className="mt-3">
              <a href="#" className="text-sm text-blue-600 hover:underline">Terms of Service</a>
              <span className="mx-2 text-gray-400">|</span>
              <a href="#" className="text-sm text-blue-600 hover:underline">Privacy Policy</a>
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
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Latitude: {location.lat.toFixed(6)}</span>
                <span className="text-gray-700">Longitude: {location.lng.toFixed(6)}</span>
              </div>
              <p className="text-xs text-gray-500">Your current location has been captured</p>
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
                      <div className="h-48 bg-blue-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-600">Map view would be displayed here</p>
                      </div>
                      <button
                        onClick={confirmLocation}
                        className="flex items-center justify-center w-full py-3 mt-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
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
        
        {/* Preferințe Notificări */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                  type="checkbox" 
                  id="email-notifications"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="email-notifications" className="font-medium text-gray-700">Email notifications</label>
                <p className="text-gray-500">Get notified when your report status changes</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                  type="checkbox" 
                  id="push-notifications"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="push-notifications" className="font-medium text-gray-700">Push notifications</label>
                <p className="text-gray-500">Receive push notifications on your device</p>
              </div>
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
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="sr-only">View notifications</span>
                <div className="relative">
                  <Bell size={24} />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </div>
              </button>
              
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
              
              <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">
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