// src/components/dashboard/EmployeeDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { getProblems, updateProblem } from '../../services/problemService';
import { 
  Home, 
  MapPin, 
  User, 
  LogOut, 
  CheckCircle,
  Route as RouteIcon,
  AlignJustify,
  Bell,
  Settings,
  X,
  List,
  Calendar,
  Info,
  ChevronRight
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [activeSection, setActiveSection] = useState('map');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [showRouteButton, setShowRouteButton] = useState(false);
  const [showingRoute, setShowingRoute] = useState(false);
  const [assignedProblems, setAssignedProblems] = useState([]);
  const mapRef = useRef(null);
  
  useEffect(() => {
    const fetchAssignedProblems = async () => {
      try {
        // Obține ID-ul angajatului din localStorage sau context
        const employee = JSON.parse(localStorage.getItem('user'));
        const problems = await getProblems();
        // Filtrează problemele asignate acestui angajat
        const assigned = problems.filter(p => p.assignedTo === employee.id);
        setAssignedProblems(assigned);
      } catch (error) {
        console.error('Eroare la încărcarea problemelor:', error);
      }
    };
  
    fetchAssignedProblems();
  }, []);
  
  const handleUpdateStatus = async (problemId, newStatus) => {
    try {
      await updateProblem(problemId, { status: newStatus });
      // Actualizează lista local
      setAssignedProblems(prev => 
        prev.map(p => p.id === problemId ? {...p, status: newStatus} : p)
      );
    } catch (error) {
      console.error('Eroare la actualizarea statusului:', error);
    }
  };

  // Mock employee data
  const employee = {
    name: "Mihai Popescu",
    email: "mihai.popescu@smartcity.com",
    avatar: "/api/placeholder/200/200",
    department: "Întreținere Spații Publice",
    completedTasks: 23,
    inProgressTasks: 2,
    notifications: [
      { id: 1, message: 'Ai fost alocat pentru o nouă problemă', isRead: false, date: '2025-04-12 10:15' },
      { id: 2, message: 'Problemă marcată ca rezolvată - Graffiti pe Strada Primăverii', isRead: true, date: '2025-04-10 16:30' }
    ]
  };
  
  // Mock problem data
  const problems = [
    {
      id: 1,
      type: 'Pothole',
      location: 'Strada Victoriei, Nr. 25',
      coordinates: { lat: 44.435, lng: 26.102 },
      status: 'assigned',
      reportDate: '2025-04-10',
      description: 'Groapă adâncă în asfalt care prezintă pericol pentru vehicule',
      images: ['/api/placeholder/320/240', '/api/placeholder/320/240'],
      reporter: {
        name: 'Alexandru Marin',
        avatar: '/api/placeholder/60/60'
      },
      priority: 'high'
    },
    {
      id: 2,
      type: 'Graffiti',
      location: 'Bulevardul Unirii, Nr. 10',
      coordinates: { lat: 44.428, lng: 26.107 },
      status: 'pending',
      reportDate: '2025-04-09',
      description: 'Graffiti neautorizat pe fațada clădirii publice',
      images: ['/api/placeholder/320/240'],
      reporter: {
        name: 'Maria Ionescu',
        avatar: '/api/placeholder/60/60'
      },
      priority: 'medium'
    },
    {
      id: 3,
      type: 'Trash',
      location: 'Parcul Central, zona de nord',
      coordinates: { lat: 44.432, lng: 26.095 },
      status: 'pending',
      reportDate: '2025-04-11',
      description: 'Coș de gunoi plin care se revarsă. Necesită golire imediată.',
      images: ['/api/placeholder/320/240', '/api/placeholder/320/240'],
      reporter: {
        name: 'Andreea Vasilescu',
        avatar: '/api/placeholder/60/60'
      },
      priority: 'low'
    },
    {
      id: 4,
      type: 'Parking',
      location: 'Strada Libertății, Nr. 42',
      coordinates: { lat: 44.425, lng: 26.112 },
      status: 'pending',
      reportDate: '2025-04-08',
      description: 'Mașină parcată ilegal, blocând accesul pe trotuar pentru persoanele cu handicap',
      images: ['/api/placeholder/320/240'],
      reporter: {
        name: 'Cristian Popa',
        avatar: '/api/placeholder/60/60'
      },
      priority: 'high'
    },
    {
      id: 5,
      type: 'Other',
      location: 'Strada Primăverii, Nr. 15',
      coordinates: { lat: 44.438, lng: 26.098 },
      status: 'in_progress',
      reportDate: '2025-04-07',
      description: 'Indicator rutier căzut care necesită remontare',
      images: ['/api/placeholder/320/240'],
      reporter: {
        name: 'Elena Dumitru',
        avatar: '/api/placeholder/60/60'
      },
      priority: 'medium'
    }
  ];
  useEffect(() => {
    // This would be where we'd initialize a real map service like Google Maps or Leaflet
    console.log("Map would be initialized here with problems shown as checkpoints");
    
    // Setting up event listeners for map clicks, etc. would happen here
    
    // For simplicity in this mock version, we're just logging map operations
  }, []);
  
  useEffect(() => {
    // Update the show route button visibility based on selected problems
    setShowRouteButton(selectedProblems.length > 1);
  }, [selectedProblems]);

  const handleProblemClick = (problem) => {
    setSelectedProblem(problem);
  };

  const handleClosePopup = () => {
    setSelectedProblem(null);
  };

  const handleMarkAsSolved = (problemId) => {
    // In a real app, this would make an API call to update the problem status
    console.log(`Problem ${problemId} marked as solved`);
    
    // Remove from selected problems if it was selected
    setSelectedProblems(prev => prev.filter(id => id !== problemId));
    
    // Close the popup
    setSelectedProblem(null);
  };

  const handleToggleSelection = (problemId) => {
    setSelectedProblems(prev => {
      if (prev.includes(problemId)) {
        return prev.filter(id => id !== problemId);
      } else {
        return [...prev, problemId];
      }
    });
  };

  const handleGenerateRoute = () => {
    if (selectedProblems.length > 1) {
      // In a real app, this would call a routing algorithm/service to find the optimal path
      console.log(`Generating optimal route for problems: ${selectedProblems.join(', ')}`);
      
      // Here we're just simulating showing a route
      setShowingRoute(true);
    }
  };

  const clearRoute = () => {
    setSelectedProblems([]);
    setShowingRoute(false);
  };

  const getProblemIcon = (type) => {
    switch (type) {
      case 'Pothole':
        return '🕳️';
      case 'Graffiti':
        return '🖌️';
      case 'Trash':
        return '🗑️';
      case 'Parking':
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
                      {selectedProblem.type} - {selectedProblem.location}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityClass(selectedProblem.priority)}`}>
                      {selectedProblem.priority.charAt(0).toUpperCase() + selectedProblem.priority.slice(1)} Priority
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-4">{selectedProblem.description}</p>
                    
                    <div className="flex space-x-2 mb-4">
                      <div className="flex-shrink-0">
                        <span className="text-lg">{getProblemIcon(selectedProblem.type)}</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Raportat de: {selectedProblem.reporter.name}</p>
                        <p className="text-sm text-gray-500">Data: {selectedProblem.reportDate}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Locație</h4>
                      <div className="bg-gray-100 p-2 rounded text-sm text-gray-700">
                        {selectedProblem.location}
                      </div>
                    </div>
                    
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Imagini</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProblem.images.map((img, idx) => (
                        <div key={idx} className="border rounded overflow-hidden">
                          <img src={img} alt={`Problem ${idx + 1}`} className="w-full h-28 object-cover" />
                        </div>
                      ))}
                    </div>
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
  const renderMap = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Hartă Probleme</h2>
        <div className="flex space-x-2">
          {showRouteButton && (
            <button 
              onClick={handleGenerateRoute}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${showingRoute ? 'bg-blue-100 text-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              <RouteIcon size={16} className="mr-1" /> 
              {showingRoute ? 'Rută afișată' : 'Generează rută'}
            </button>
          )}
          
          {showingRoute && (
            <button 
              onClick={clearRoute}
              className="flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X size={16} className="mr-1" /> Șterge ruta
            </button>
          )}
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-96 bg-gray-100 rounded-lg relative overflow-hidden"
        style={{ backgroundImage: 'url(/api/placeholder/1200/800)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* This would be replaced with actual map component in a real implementation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white p-4">
          <p className="mb-4 text-center">
            Aici ar fi afișată o hartă reală cu OpenStreetMap sau Google Maps API.<br/>
            Problemele ar fi afișate ca markeri pe hartă.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            {problems.map((problem) => (
              <div 
                key={problem.id} 
                className={`bg-white text-gray-800 p-3 rounded-lg cursor-pointer transform transition hover:scale-105 ${selectedProblems.includes(problem.id) ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleProblemClick(problem)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{getProblemIcon(problem.type)}</span>
                    <div>
                      <h3 className="font-medium">{problem.type}</h3>
                      <p className="text-xs text-gray-500">{problem.location}</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedProblems.includes(problem.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggleSelection(problem.id);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <Info size={20} className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Cum să utilizați harta</h4>
            <ul className="mt-1 text-sm text-blue-700 list-disc list-inside">
              <li>Faceți click pe un marker pentru a vedea detalii despre problemă</li>
              <li>Bifați mai multe probleme pentru a genera o rută între ele</li>
              <li>Utilizați butonul "Generează rută" pentru a vedea cel mai scurt traseu</li>
              <li>Marcați problemele ca rezolvate după ce le-ați remediat</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
  const renderTaskList = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Sarcini în Așteptare</h2>
        
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:pl-6">Problemă</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locație</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioritate</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Acțiuni</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {problems.map((problem) => (
                <tr key={problem.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">{getProblemIcon(problem.type)}</span>
                      <div>
                        <div className="font-medium text-gray-900">{problem.type}</div>
                        <div className="text-gray-500">{problem.reportDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{problem.location}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(problem.priority)}`}>
                      {problem.priority.charAt(0).toUpperCase() + problem.priority.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${problem.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 
                        problem.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}`}
                    >
                      {problem.status === 'assigned' ? 'Asignat' : 
                       problem.status === 'in_progress' ? 'În lucru' : 'În așteptare'}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => handleProblemClick(problem)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Vezi<span className="sr-only">, {problem.type}</span>
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
  const renderStatistics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Statistici Performanță</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Probleme Rezolvate</p>
                <p className="text-2xl font-bold text-blue-800">{employee.completedTasks}</p>
              </div>
              <CheckCircle size={32} className="text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Rată de rezolvare</p>
                <p className="text-2xl font-bold text-green-800">92%</p>
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
                <p className="text-2xl font-bold text-purple-800">4.2h</p>
              </div>
              <Calendar size={32} className="text-purple-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Activitate Recentă</h3>
          <div className="space-y-3">
            <div className="flex">
              <div className="flex-shrink-0 w-2 rounded-full bg-green-500"></div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">10 Apr - Graffiti îndepărtat de pe fațada din Str. Tudor Vladimirescu</p>
                <p className="text-xs text-gray-500">Rezolvat în 3.5 ore</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 w-2 rounded-full bg-green-500"></div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">9 Apr - Coș de gunoi înlocuit în Parcul Central</p>
                <p className="text-xs text-gray-500">Rezolvat în 1.2 ore</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 w-2 rounded-full bg-red-500"></div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">8 Apr - Groapă asfaltată pe Str. Independenței</p>
                <p className="text-xs text-gray-500">Rezolvat în 7.5 ore (peste termenul estimat)</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Distribuție Probleme Rezolvate</h3>
          <div className="h-48 bg-white p-2 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Aici ar fi afișată o diagramă cu statistici</p>
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
                    src={employee.avatar}
                    alt=""
                  />
                  <span className="ml-2 text-gray-700">{employee.name}</span>
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
                onClick={() => setActiveSection('map')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeSection === 'map' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MapPin className="mr-3" size={20} />
                Hartă Probleme
              </button>
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
            
            <div className="mt-6 bg-white shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Probleme active</h3>
              <div className="space-y-3">
                {problems.filter(p => p.status === 'in_progress' || p.status === 'assigned').map(problem => (
                  <div 
                    key={problem.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleProblemClick(problem)}
                  >
                    <span className="text-xl mr-2">{getProblemIcon(problem.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{problem.type}</p>
                      <p className="text-xs text-gray-500 truncate">{problem.location}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
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
                      setActiveSection('map');
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Hartă Probleme
                  </button>
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
            {activeSection === 'map' && renderMap()}
            {activeSection === 'tasks' && renderTaskList()}
            {activeSection === 'stats' && renderStatistics()}
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