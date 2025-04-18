// src/components/dashboard/AdminDashboard.js
import React, { useState } from 'react';
import { 
  Home, 
  Video, 
  User, 
  LogOut, 
  Plus, 
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  AlignJustify,
  Bell,
  Settings,
  X,
  Grid,
  ChevronRight,
  Play,
  Pause,
  Users,
  UserPlus,
  Search,
  Lock,
  Mail,
  Briefcase
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoSources, setVideoSources] = useState([
    { 
      id: 1, 
      name: 'Piața Centrală', 
      location: 'Strada Victoriei, Nr. 10', 
      status: 'active', 
      type: 'Traffic', 
      dateAdded: '2025-04-01',
      thumbnail: '/api/placeholder/320/180',
      aiEnabled: true,
      detections: 142
    },
    { 
      id: 2, 
      name: 'Parcul Municipal', 
      location: 'Strada Parcului, Nr. 5', 
      status: 'active', 
      type: 'Public Safety', 
      dateAdded: '2025-04-03',
      thumbnail: '/api/placeholder/320/180',
      aiEnabled: true,
      detections: 87
    },
    { 
      id: 3, 
      name: 'Intersecție Bd. Principal', 
      location: 'Bd. Principal / Str. Secundară', 
      status: 'maintenance', 
      type: 'Traffic', 
      dateAdded: '2025-03-20',
      thumbnail: '/api/placeholder/320/180',
      aiEnabled: false,
      detections: 203
    },
    { 
      id: 4, 
      name: 'Stația de autobuz', 
      location: 'Bd. Republicii, Nr. 15', 
      status: 'inactive', 
      type: 'Public Transport', 
      dateAdded: '2025-03-15',
      thumbnail: '/api/placeholder/320/180',
      aiEnabled: false,
      detections: 56
    }
  ]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [addCameraForm, setAddCameraForm] = useState({
    name: '',
    location: '',
    type: 'Traffic',
    streamUrl: '',
    aiEnabled: false
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [previewStreams, setPreviewStreams] = useState({});

  // Employee Management State
  const [employees, setEmployees] = useState([
    {
      id: 1,
      firstName: "Andrei",
      lastName: "Popescu",
      email: "andrei.popescu@primarie.ro",
      department: "Primărie",
      role: "Administrator IT",
      dateAdded: "2025-01-15",
      status: "active"
    },
    {
      id: 2,
      firstName: "Maria",
      lastName: "Ionescu",
      email: "maria.ionescu@politialocala.ro",
      department: "Poliția Locală",
      role: "Ofițer",
      dateAdded: "2025-02-10",
      status: "active"
    },
    {
      id: 3,
      firstName: "Vasile",
      lastName: "Dumitru",
      email: "vasile.dumitru@salubritate.ro",
      department: "Salubritate",
      role: "Coordonator",
      dateAdded: "2025-03-05",
      status: "inactive"
    }
  ]);
  
  const [addEmployeeForm, setAddEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: '',
    status: 'active'
  });
  
  const [departmentOptions, setDepartmentOptions] = useState([
    'Primărie',
    'Poliția Locală',
    'Salubritate',
    'Transport Public',
    'Spații Verzi',
    'Infrastructură',
    'Asistență Socială'
  ]);
  
  const [newDepartment, setNewDepartment] = useState('');
  const [showNewDepartmentInput, setShowNewDepartmentInput] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeesViewMode, setEmployeesViewMode] = useState('grid');

  // Mock user data
  const admin = {
    name: "Admin User",
    email: "admin@smartcity.com",
    avatar: "/api/placeholder/200/200",
    notifications: [
      { id: 1, message: 'Camera "Piața Centrală" a detectat un accident de mașină', isRead: false, date: '2025-04-10 14:23' },
      { id: 2, message: 'Camera "Parcul Municipal" necesită întreținere', isRead: false, date: '2025-04-09 09:45' },
      { id: 3, message: 'Alertă de trafic intens pe Bd. Principal', isRead: true, date: '2025-04-08 18:12' }
    ]
  };

  const cameraTypes = [
    'Traffic',
    'Public Safety',
    'Public Transport',
    'Environmental',
    'Building Security',
    'Other'
  ];

  const toggleStreamPreview = (id) => {
    setPreviewStreams(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddCamera = () => {
    const newCamera = {
      id: videoSources.length + 1,
      ...addCameraForm,
      status: 'active',
      dateAdded: new Date().toISOString().split('T')[0],
      thumbnail: '/api/placeholder/320/180',
      detections: 0
    };
    
    setVideoSources([...videoSources, newCamera]);
    setAddCameraForm({
      name: '',
      location: '',
      type: 'Traffic',
      streamUrl: '',
      aiEnabled: false
    });
    setActiveSection('cameras');
  };

  const handleDeleteCamera = (id) => {
    const updatedSources = videoSources.filter(source => source.id !== id);
    setVideoSources(updatedSources);
    if (selectedCamera && selectedCamera.id === id) {
      setSelectedCamera(null);
    }
  };

  const handleEditCamera = (camera) => {
    setSelectedCamera(camera);
    setActiveSection('editCamera');
  };

  const handleUpdateCamera = () => {
    const updatedSources = videoSources.map(source => 
      source.id === selectedCamera.id ? selectedCamera : source
    );
    setVideoSources(updatedSources);
    setSelectedCamera(null);
    setActiveSection('cameras');
  };

  const toggleAI = (id) => {
    const updatedSources = videoSources.map(source => 
      source.id === id ? {...source, aiEnabled: !source.aiEnabled} : source
    );
    setVideoSources(updatedSources);
  };

  // Employee Management Functions
  const handleAddEmployee = () => {
    if (addEmployeeForm.password !== addEmployeeForm.confirmPassword) {
      alert("Parolele nu corespund!");
      return;
    }

    const newEmployee = {
      id: employees.length + 1,
      firstName: addEmployeeForm.firstName,
      lastName: addEmployeeForm.lastName,
      email: addEmployeeForm.email,
      department: addEmployeeForm.department,
      role: addEmployeeForm.role,
      dateAdded: new Date().toISOString().split('T')[0],
      status: addEmployeeForm.status
    };
    
    setEmployees([...employees, newEmployee]);
    setAddEmployeeForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: '',
      role: '',
      status: 'active'
    });
    setActiveSection('employees');
  };

  const handleDeleteEmployee = (id) => {
    const updatedEmployees = employees.filter(employee => employee.id !== id);
    setEmployees(updatedEmployees);
    if (selectedEmployee && selectedEmployee.id === id) {
      setSelectedEmployee(null);
    }
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setActiveSection('editEmployee');
  };

  const handleUpdateEmployee = () => {
    const updatedEmployees = employees.map(employee => 
      employee.id === selectedEmployee.id ? selectedEmployee : employee
    );
    setEmployees(updatedEmployees);
    setSelectedEmployee(null);
    setActiveSection('employees');
  };

  const handleAddNewDepartment = () => {
    if (newDepartment && !departmentOptions.includes(newDepartment)) {
      setDepartmentOptions([...departmentOptions, newDepartment]);
      setAddEmployeeForm({...addEmployeeForm, department: newDepartment});
      setNewDepartment('');
      setShowNewDepartmentInput(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Bun venit, {admin.name}</h2>
        <p className="text-gray-600">Panou de administrare surse video pentru AI</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button 
            onClick={() => setActiveSection('addCamera')}
            className="flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <div className="flex items-center">
              <Plus className="mr-3" size={24} />
              <span className="text-lg font-medium">Adaugă Sursă Video</span>
            </div>
            <ChevronRight size={20} />
          </button>
          
          <button 
            onClick={() => setActiveSection('cameras')}
            className="flex items-center justify-between p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            <div className="flex items-center">
              <Video className="mr-3" size={24} />
              <span className="text-lg font-medium">Gestionează Camere</span>
            </div>
            <ChevronRight size={20} />
          </button>

          <button 
            onClick={() => setActiveSection('addEmployee')}
            className="flex items-center justify-between p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            <div className="flex items-center">
              <UserPlus className="mr-3" size={24} />
              <span className="text-lg font-medium">Adaugă Angajați</span>
            </div>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Video size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-800">Total Camere</h3>
              <p className="text-2xl font-semibold">{videoSources.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Play size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-800">Camere Active</h3>
              <p className="text-2xl font-semibold">{videoSources.filter(s => s.status === 'active').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <AlertTriangle size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-800">Detecții AI (24h)</h3>
              <p className="text-2xl font-semibold">{videoSources.reduce((sum, source) => sum + (source.aiEnabled ? source.detections : 0), 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-800">Total Angajați</h3>
              <p className="text-2xl font-semibold">{employees.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Alerte Recente</h2>
          <span className="text-sm text-blue-600 cursor-pointer hover:underline">Vezi toate</span>
        </div>
        
        {admin.notifications.length > 0 ? (
          <div className="space-y-4">
            {admin.notifications.map((notification) => (
              <div key={notification.id} className={`p-3 border-l-4 ${notification.isRead ? 'border-gray-300 bg-gray-50' : 'border-red-500 bg-red-50'} rounded`}>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700">{notification.message}</p>
                  <span className="text-xs text-gray-500">{notification.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nu există notificări.</p>
        )}
      </div>
    </div>
  );

  const renderCameras = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Surse Video Disponibile</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              <Grid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              <AlignJustify size={20} />
            </button>
            <button 
              onClick={() => setActiveSection('addCamera')} 
              className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoSources.map((source) => (
              <div key={source.id} className="border rounded-lg overflow-hidden">
                <div className="relative">
                  {previewStreams[source.id] ? (
                    <div className="bg-black h-48 flex items-center justify-center">
                      <p className="text-white">Streaming live...</p>
                    </div>
                  ) : (
                    <img src={source.thumbnail} alt={source.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button 
                      onClick={() => toggleStreamPreview(source.id)} 
                      className="p-1 bg-gray-800 bg-opacity-70 text-white rounded"
                    >
                      {previewStreams[source.id] ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white
                      ${source.status === 'active' ? 'bg-green-500' : 
                        source.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'}`}
                    >
                      {source.status === 'active' ? 'Activ' : 
                       source.status === 'maintenance' ? 'Mentenanță' : 'Inactiv'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800">{source.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{source.location}</p>
                  <div className="flex justify-between items-center mt-3">
                    <div>
                      <span className="text-xs text-gray-500">Tip: {source.type}</span>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 mr-2">AI:</span>
                        <button 
                          onClick={() => toggleAI(source.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full ${source.aiEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${source.aiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleEditCamera(source)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCamera(source.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cameră</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locație</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {videoSources.map((source) => (
                  <tr key={source.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-full" src={source.thumbnail} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{source.name}</div>
                          <div className="text-sm text-gray-500">Adăugat: {source.dateAdded}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{source.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{source.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${source.status === 'active' ? 'bg-green-100 text-green-800' : 
                        source.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}
                      >
                        {source.status === 'active' ? 'Activ' : 
                         source.status === 'maintenance' ? 'Mentenanță' : 'Inactiv'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleAI(source.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${source.aiEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${source.aiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => toggleStreamPreview(source.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          {previewStreams[source.id] ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button 
                          onClick={() => handleEditCamera(source)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCamera(source.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderAddCamera = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Adaugă Sursă Video Nouă</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Nume Cameră</label>
            <input 
              type="text" 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              placeholder="ex: Piața Centrală"
              value={addCameraForm.name}
              onChange={(e) => setAddCameraForm({...addCameraForm, name: e.target.value})}
            />
          </div>
          
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Tip Cameră</label>
            <select 
              className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={addCameraForm.type}
              onChange={(e) => setAddCameraForm({...addCameraForm, type: e.target.value})}
            >
              {cameraTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Locație</label>
            <input 
              type="text" 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              placeholder="ex: Strada Victoriei, Nr. 10"
              value={addCameraForm.location}
              onChange={(e) => setAddCameraForm({...addCameraForm, location: e.target.value})}
            />
          </div>
          
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">URL Stream</label>
            <input 
              type="text" 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              placeholder="ex: rtsp://camera.example.com/stream1"
              value={addCameraForm.streamUrl}
              onChange={(e) => setAddCameraForm({...addCameraForm, streamUrl: e.target.value})}
            />
          </div>
          
          <div className="sm:col-span-6">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={addCameraForm.aiEnabled}
                onChange={(e) => setAddCameraForm({...addCameraForm, aiEnabled: e.target.checked})}
              />
              <label className="ml-2 block text-sm text-gray-700">Activează procesare AI</label>
            </div>
            <p className="mt-1 text-sm text-gray-500">Camerele cu procesare AI activată vor detecta automat incidente precum accidente, aglomerări, etc.</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Instrucțiuni pentru adăugarea unei camere</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>Asigurați-vă că sursa video suportă streaming în format RTSP sau HLS</li>
            <li>Pentru performanță optimă, utilizați camere cu rezoluție de cel puțin 720p</li>
            <li>Verificați că adresa URL a stream-ului este accesibilă din rețeaua locală</li>
            <li>Procesarea AI necesită resurse suplimentare și poate fi activată/dezactivată oricând</li>
          </ul>
        </div>
      </div>
      
      <div className="flex justify-between mt-8 pt-5 border-t border-gray-200">
        <button
          onClick={() => setActiveSection('cameras')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
        >
          Anulează
        </button>
        
        <button
          onClick={handleAddCamera}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          disabled={!addCameraForm.name || !addCameraForm.location || !addCameraForm.streamUrl}
        >
          Adaugă Cameră
        </button>
      </div>
    </div>
  );

  const renderEditCamera = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Editează Cameră</h2>
      
      {selectedCamera && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Nume Cameră</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                value={selectedCamera.name}
                onChange={(e) => setSelectedCamera({...selectedCamera, name: e.target.value})}
              />
            </div>
            
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Tip Cameră</label>
              <select 
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedCamera.type}
                onChange={(e) => setSelectedCamera({...selectedCamera, type: e.target.value})}
              >
                {cameraTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Locație</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                value={selectedCamera.location}
                onChange={(e) => setSelectedCamera({...selectedCamera, location: e.target.value})}
              />
            </div>
            
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select 
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedCamera.status}
                onChange={(e) => setSelectedCamera({...selectedCamera, status: e.target.value})}
              >
                <option value="active">Activ</option>
                <option value="maintenance">Mentenanță</option>
                <option value="inactive">Inactiv</option>
              </select>
            </div>
            
            <div className="sm:col-span-6">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={selectedCamera.aiEnabled}
                  onChange={(e) => setSelectedCamera({...selectedCamera, aiEnabled: e.target.checked})}
                />
                <label className="ml-2 block text-sm text-gray-700">Activează procesare AI</label>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-medium text-gray-800">Previzualizare</h3>
            </div>
            <div className="p-4">
              <div className="h-48 bg-gray-200 flex items-center justify-center mb-4">
                <img src={selectedCamera.thumbnail} alt={selectedCamera.name} className="max-h-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID: {selectedCamera.id}</p>
                  <p className="text-sm text-gray-500">Adăugat: {selectedCamera.dateAdded}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Detecții: {selectedCamera.detections}</p>
                  <p className="text-sm text-gray-500">
                    Status: 
                    <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${selectedCamera.status === 'active' ? 'bg-green-100 text-green-800' : 
                      selectedCamera.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}
                    >
                      {selectedCamera.status === 'active' ? 'Activ' : 
                       selectedCamera.status === 'maintenance' ? 'Mentenanță' : 'Inactiv'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-8 pt-5 border-t border-gray-200">
        <button
          onClick={() => {
            setSelectedCamera(null);
            setActiveSection('cameras');
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
        >
          Anulează
        </button>
        
        <button
          onClick={handleUpdateCamera}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Salvează Modificări
        </button>
      </div>
    </div>
  );

  // Employee management components
  const renderEmployees = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Angajați Înregistrați</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setEmployeesViewMode('grid')} 
              className={`p-2 rounded ${employeesViewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              <Grid size={20} />
            </button>
            <button 
              onClick={() => setEmployeesViewMode('list')} 
              className={`p-2 rounded ${employeesViewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              <AlignJustify size={20} />
            </button>
            <button 
              onClick={() => setActiveSection('addEmployee')} 
              className="p-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              <UserPlus size={20} />
            </button>
          </div>
        </div>
        
        {employeesViewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <div key={employee.id} className="border rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-800">{employee.firstName} {employee.lastName}</h3>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Departament:</span>
                      <span className="text-sm font-medium text-gray-700">{employee.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Rol:</span>
                      <span className="text-sm font-medium text-gray-700">{employee.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Data Adăugării:</span>
                      <span className="text-sm font-medium text-gray-700">{employee.dateAdded}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {employee.status === 'active' ? 'Activ' : 'Inactiv'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 space-x-2">
                    <button 
                      onClick={() => handleEditEmployee(employee)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nume & Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departament</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Adăugării</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.firstName} {employee.lastName}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.dateAdded}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {employee.status === 'active' ? 'Activ' : 'Inactiv'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditEmployee(employee)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderAddEmployee = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Adaugă Angajat Nou</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Prenume</label>
            <input 
              type="text" 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              placeholder="ex: Ion"
              value={addEmployeeForm.firstName}
              onChange={(e) => setAddEmployeeForm({...addEmployeeForm, firstName: e.target.value})}
            />
          </div>
          
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Nume</label>
            <input 
              type="text" 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              placeholder="ex: Popescu"
              value={addEmployeeForm.lastName}
              onChange={(e) => setAddEmployeeForm({...addEmployeeForm, lastName: e.target.value})}
            />
          </div>
          
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="relative flex items-stretch flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="nume.prenume@departament.ro"
                  value={addEmployeeForm.email}
                  onChange={(e) => setAddEmployeeForm({...addEmployeeForm, email: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Parolă</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="relative flex items-stretch flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Parolă"
                  value={addEmployeeForm.password}
                  onChange={(e) => setAddEmployeeForm({...addEmployeeForm, password: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Confirmă Parola</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="relative flex items-stretch flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Confirmă parola"
                  value={addEmployeeForm.confirmPassword}
                  onChange={(e) => setAddEmployeeForm({...addEmployeeForm, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Departament</label>
            {showNewDepartmentInput ? (
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Nume departament nou"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddNewDepartment}
                  className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Adaugă
                </button>
              </div>
            ) : (
              <div className="mt-1 flex rounded-md shadow-sm">
                <select 
                  className="block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={addEmployeeForm.department}
                  onChange={(e) => setAddEmployeeForm({...addEmployeeForm, department: e.target.value})}
                >
                  <option value="">Selectează departament</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewDepartmentInput(true)}
                  className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus size={16} className="mr-1" />
                  Nou
                </button>
              </div>
            )}
          </div>
          
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-gray-700">Rol / Poziție</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="relative flex items-stretch flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="ex: Administrator, Ofițer, etc."
                  value={addEmployeeForm.role}
                  onChange={(e) => setAddEmployeeForm({...addEmployeeForm, role: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <div className="sm:col-span-6">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={addEmployeeForm.status === 'active'}
                onChange={(e) => setAddEmployeeForm({...addEmployeeForm, status: e.target.checked ? 'active' : 'inactive'})}
              />
              <label className="ml-2 block text-sm text-gray-700">Cont activ</label>
            </div>
            <p className="mt-1 text-sm text-gray-500">Conturile active permit angajaților să se autentifice și să utilizeze sistemul.</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Instrucțiuni pentru adăugarea unui angajat</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>Asigurați-vă că adresa de email este corectă și validă</li>
            <li>Parola trebuie să conțină minim 8 caractere, incluzând litere mari, litere mici și cifre</li>
            <li>După adăugare, angajatul va primi un email de confirmare cu datele de autentificare</li>
            <li>Pentru departamente care nu există în listă, folosiți opțiunea "Nou" pentru a adăuga unul nou</li>
          </ul>
        </div>
      </div>
      
      <div className="flex justify-between mt-8 pt-5 border-t border-gray-200">
        <button
          onClick={() => setActiveSection('employees')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
        >
          Anulează
        </button>
        
        <button
          onClick={handleAddEmployee}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          disabled={!addEmployeeForm.firstName || !addEmployeeForm.lastName || !addEmployeeForm.email || 
                   !addEmployeeForm.password || !addEmployeeForm.confirmPassword || !addEmployeeForm.department || 
                   !addEmployeeForm.role || addEmployeeForm.password !== addEmployeeForm.confirmPassword}
        >
          Adaugă Angajat
        </button>
      </div>
    </div>
  );

  const renderEditEmployee = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Editează Angajat</h2>
      
      {selectedEmployee && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Prenume</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                value={selectedEmployee.firstName}
                onChange={(e) => setSelectedEmployee({...selectedEmployee, firstName: e.target.value})}
              />
            </div>
            
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Nume</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                value={selectedEmployee.lastName}
                onChange={(e) => setSelectedEmployee({...selectedEmployee, lastName: e.target.value})}
              />
            </div>
            
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    value={selectedEmployee.email}
                    onChange={(e) => setSelectedEmployee({...selectedEmployee, email: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Departament</label>
              <select 
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedEmployee.department}
                onChange={(e) => setSelectedEmployee({...selectedEmployee, department: e.target.value})}
              >
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Rol / Poziție</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                value={selectedEmployee.role}
                onChange={(e) => setSelectedEmployee({...selectedEmployee, role: e.target.value})}
              />
            </div>
            
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select 
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedEmployee.status}
                onChange={(e) => setSelectedEmployee({...selectedEmployee, status: e.target.value})}
              >
                <option value="active">Activ</option>
                <option value="inactive">Inactiv</option>
              </select>
            </div>
            
            <div className="sm:col-span-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Resetează Parola
              </button>
              <p className="mt-1 text-sm text-gray-500">Resetarea parolei va trimite un email angajatului cu instrucțiuni pentru setarea unei noi parole.</p>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-medium text-gray-800">Informații cont</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID: {selectedEmployee.id}</p>
                  <p className="text-sm text-gray-500">Adăugat: {selectedEmployee.dateAdded}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Status: 
                    <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${selectedEmployee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {selectedEmployee.status === 'active' ? 'Activ' : 'Inactiv'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-8 pt-5 border-t border-gray-200">
        <button
          onClick={() => {
            setSelectedEmployee(null);
            setActiveSection('employees');
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
        >
          Anulează
        </button>
        
        <button
          onClick={handleUpdateEmployee}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
        >
          Salvează Modificări
        </button>
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
                <h1 className="text-xl font-bold text-blue-600">Smart City - Admin</h1>
              </div>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="sr-only">Vezi notificări</span>
                <div className="relative">
                  <Bell size={24} />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                </div>
              </button>
              
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={admin.avatar}
                    alt=""
                  />
                  <span className="ml-2 text-gray-700">{admin.name}</span>
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
                onClick={() => setActiveSection('cameras')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeSection === 'cameras' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Video className="mr-3" size={20} />
                Surse Video
              </button>
              <button
                onClick={() => setActiveSection('addCamera')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeSection === 'addCamera' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Plus className="mr-3" size={20} />
                Adaugă Sursă Video
              </button>
              <button
                onClick={() => setActiveSection('employees')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeSection === 'employees' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="mr-3" size={20} />
                Angajați
              </button>
              <button
                onClick={() => setActiveSection('addEmployee')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeSection === 'addEmployee' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UserPlus className="mr-3" size={20} />
                Adaugă Angajați
              </button>
              <button
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <Settings className="mr-3" size={20} />
                Setări
              </button>
              <button
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
                  <h1 className="text-xl font-bold text-blue-600">Smart City - Admin</h1>
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
                      setActiveSection('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('cameras');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Surse Video
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('addCamera');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Adaugă Sursă Video
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('employees');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Angajați
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('addEmployee');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Adaugă Angajați
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Setări
                  </button>
                  <button
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
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'cameras' && renderCameras()}
            {activeSection === 'addCamera' && renderAddCamera()}
            {activeSection === 'editCamera' && renderEditCamera()}
            {activeSection === 'employees' && renderEmployees()}
            {activeSection === 'addEmployee' && renderAddEmployee()}
            {activeSection === 'editEmployee' && renderEditEmployee()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;