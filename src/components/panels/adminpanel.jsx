import React, { useState, useEffect } from 'react';
import EditProfile from '../editform';
import UserRegistrationModal from '../registerform';
import {toast} from 'react-toastify';
import { getAllUsers, getLogs, generateQRCode, generateIDCard, verifyLogs, deleteUser } from '../../services/log';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(window.location.hash.replace('#', '') || 'dashboard');
  const [editingUser, setEditingUser] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  // Log filtering state
  const [filters, setFilters] = useState({
    userId: '',
    role: '',
    action: '',
    from: '',
    to: '',
  });
  
  // Intrusion detection state
  const [scanningLogs, setScanningLogs] = useState(false);
  const [logVerification, setLogVerification] = useState(null);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setActivePage(window.location.hash.replace('#', '') || 'dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Fetch data based on active page
  useEffect(() => {
    if (activePage === 'users') {
      fetchUsers();
    } else if (activePage === 'logs') {
      fetchLogs();
    } else if (activePage === 'dashboard') {
      // For dashboard, we need both users and logs count
      fetchUsers();
      fetchLogs();
    } else if (activePage === 'intrusion-detection') {
      fetchLogs();
      if (!logVerification) {
        handleVerifyLogs();
      }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      if (Array.isArray(data)) {
        // Make sure to safely handle nested objects
        const processedUsers = data.map(user => ({
          ...user,
          // Ensure email is safely handled (might be an object or string)
          email: typeof user.email === 'object' && user.email ? 
            '[Encrypted]' : (user.email || user.decryptedEmail || 'N/A'),
          // Add safe defaults for all properties used in rendering
          userId: user.userId || 'unknown',
          fullName: user.fullName || 'Unnamed User',
          role: user.role || 'Unknown Role'
        }));
        setUsers(processedUsers);
        setError(null);
      } else {
        console.error('Expected array of users but got:', data);
        setUsers([]);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users: ' + (err.message || 'Unknown error'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Apply filters to the logs request
      const data = await getLogs(filters);
      if (Array.isArray(data)) {
        // Process the logs to ensure all required fields exist
        const processedLogs = data.map((log, index) => ({
          ...log,
          // Ensure each log has an ID for React's key prop
          id: log._id || log.id || `log-${index}`,
          // Add safe defaults for all properties used in rendering
          timestamp: log.timestamp || new Date().toISOString(),
          userId: log.userId || 'N/A',
          role: log.role || 'N/A',
          action: log.action || 'Unknown Action'
        }));
        setLogs(processedLogs);
        setError(null);
      } else {
        console.error('Expected array of logs but got:', data);
        setLogs([]);
        setError('Invalid logs data format received from server');
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load logs: ' + (err.message || 'Unknown error'));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    window.location.hash = '#edit-profile';
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(`Are you sure you want to delete user ${userId}?`)) {
      try {
        // Now using the actual deleteUser API
        await deleteUser(userId);
        toast.success(`User ${userId} deleted successfully`);
        fetchUsers(); // Refresh user list
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleGenerateQRCode = async (userId) => {
    if (!userId) {
      setError("Invalid user ID");
      return;
    }
    
    try {
      const result = await generateQRCode(userId);
      console.log('QR Code generated:', result);
     toast.success('QR Code generated successfully');
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code: ' + (err.message || 'Unknown error'));
    }
  };

  const handleGenerateIDCard = async (userId) => {
    if (!userId) {
      setError("Invalid user ID");
      return;
    }
    
    try {
      const result = await generateIDCard(userId);
      if (result && result.html) {
        // Open ID card in a new window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(result.html);
          newWindow.document.close();
        } else {
          throw new Error('Unable to open new window. Please check your popup blocker settings.');
        }
      } else {
        throw new Error('Invalid ID card data received');
      }
    } catch (err) {
      console.error('Error generating ID card:', err);
      setError('Failed to generate ID card: ' + (err.message || 'Unknown error'));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleVerifyLogs = async () => {
    setScanningLogs(true);
    setLogVerification(null);
    try {
      const result = await verifyLogs();
      setLogVerification(result);
    } catch (err) {
      console.error('Error verifying logs:', err);
      setError('Failed to verify logs: ' + (err.message || 'Unknown error'));
    } finally {
      setScanningLogs(false);
    }
  };

  // Prepare dashboard charts data
  const prepareDashboardData = () => {
    // User roles distribution
    const roleDistribution = {};
    users.forEach(user => {
      if (user.role) {
        if (!roleDistribution[user.role]) {
          roleDistribution[user.role] = 0;
        }
        roleDistribution[user.role]++;
      }
    });

    const roleChartData = {
      labels: Object.keys(roleDistribution),
      datasets: [
        {
          label: 'User Roles',
          data: Object.values(roleDistribution),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    // Recent log activities
    const actionCounts = {};
    const recentLogs = logs.slice(0, 50); // Get only recent logs
    
    recentLogs.forEach(log => {
      if (log.action) {
        if (!actionCounts[log.action]) {
          actionCounts[log.action] = 0;
        }
        actionCounts[log.action]++;
      }
    });

    const activityChartData = {
      labels: Object.keys(actionCounts),
      datasets: [
        {
          label: 'Recent Activities',
          data: Object.values(actionCounts),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };

    // System security status
    let securityStatus = { valid: 100, invalid: 0 };
    
    if (logVerification && logVerification.validLogs !== undefined && logVerification.invalidLogs !== undefined) {
      securityStatus.valid = logVerification.validLogs || 0;
      securityStatus.invalid = logVerification.invalidLogs || 0;
    }

    const securityChartData = {
      labels: ['Valid Logs', 'Invalid Logs'],
      datasets: [
        {
          label: 'System Security',
          data: [securityStatus.valid, securityStatus.invalid],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    return {
      roleChartData,
      activityChartData,
      securityChartData,
      securityStatus
    };
  };

  // User Registration component
 
  // Render users table safely
  const renderUsersTable = () => {
    if (!Array.isArray(users) || users.length === 0) {
      return (
        <div className="bg-gray-100 p-6 rounded text-center">
          <p className="mb-4">No users found</p>
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Register New User
          </button>
        </div>
      );
    }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button 
          onClick={() => setShowRegisterModal(true)}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          + Add User
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border py-2 px-4 font-medium">ID</th>
              <th className="border py-2 px-4 font-medium">Name</th>
              <th className="border py-2 px-4 font-medium">Email</th>
              <th className="border py-2 px-4 font-medium">Role</th>
              <th className="border py-2 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              // Safely skip invalid users
              if (!user || typeof user !== 'object') {
                return null;
              }
              
              // Determine what to display as email
              const displayEmail = user.decryptedEmail || 
                (typeof user.email === 'string' ? user.email : 'Encrypted');
              
              return (
                <tr 
                  key={user.userId || `user-${index}`} 
                  className={`${index % 2 ? 'bg-gray-50' : ''} hover:bg-blue-50 cursor-pointer`}
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="border py-2 px-4">{user.userId || 'N/A'}</td>
                  <td className="border py-2 px-4">{user.fullName || 'N/A'}</td>
                  <td className="border py-2 px-4">{displayEmail}</td>
                  <td className="border py-2 px-4">{user.role || 'N/A'}</td>
                  <td 
                    className="border py-2 px-4"
                    onClick={(e) => e.stopPropagation()} // Prevent row click when clicking buttons
                  >
                    <div className="flex flex-wrap gap-1">
                      <button 
                        onClick={() => handleEditUser(user)} 
                        className="bg-yellow-500 text-white py-1 px-2 rounded text-sm hover:bg-yellow-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.userId)} 
                        className="bg-red-500 text-white py-1 px-2 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => handleGenerateQRCode(user.userId)} 
                        className="bg-green-500 text-white py-1 px-2 rounded text-sm hover:bg-green-600 transition-colors"
                        disabled={!user.userId}
                      >
                        QR Code
                      </button>
                      <button 
                        onClick={() => handleGenerateIDCard(user.userId)} 
                        className="bg-blue-500 text-white py-1 px-2 rounded text-sm hover:bg-blue-600 transition-colors"
                        disabled={!user.userId}
                      >
                        ID Card
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

  // Render log filters
  const renderLogFilters = () => {
    return (
      <form onSubmit={handleFilterSubmit} className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-3">Filter Logs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="e.g. admin-123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
              <option value="Parent">Parent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <input
              type="text"
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="e.g. login"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setFilters({ userId: '', role: '', action: '', from: '', to: '' })}
            className="mr-2 px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </form>
    );
  };

  const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;
    
    // Format date for display
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString();
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 text-black">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">User Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
           
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                  <p className="font-medium">{user.userId || 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                  <p className="font-medium">{user.fullName || 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="font-medium">{user.decryptedEmail || (typeof user.email === 'string' ? user.email : 'Encrypted')}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Role</h3>
                  <p className="font-medium">{user.role || 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Login</h3>
                  <p className="font-medium">{formatDate(user.lastLogin)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="font-medium">{formatDate(user.updatedAt)}</p>
                </div>
                
                {user.role === 'Student' && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Class</h3>
                    <p className="font-medium">{user.class || 'N/A'}</p>
                  </div>
                )}
                
                {user.role === 'Teacher' && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Courses Teaching</h3>
                    {user.coursesTeaching && user.coursesTeaching.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.coursesTeaching.map((course, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {course}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No courses assigned</p>
                    )}
                  </div>
                )}
                
                {user.role === 'Student' && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Registered Courses</h3>
                    {user.courses && user.courses.length > 0 ? (
                      <div className="overflow-x-auto mt-2">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {user.courses.map((course, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{course.courseCode}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{course.courseName}</td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    course.grade === 'A' ? 'bg-green-100 text-green-800' :
                                    course.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                    course.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                    course.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                    course.grade === 'F' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {course.grade || 'Not graded'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No courses registered</p>
                    )}
                  </div>
                )}
                
                {user.role === 'Parent' && user.linkedStudentData && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Linked Student</h3>
                    <p className="font-medium">
                      {user.linkedStudentData.userId ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {user.linkedStudentData.userId} 
                          {user.linkedStudentData.name && ` (${user.linkedStudentData.name})`}
                        </span>
                      ) : 'No linked student'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // Render logs table safely
  const renderLogsTable = () => {
    if (!Array.isArray(logs) || logs.length === 0) {
      return (
        <div className="bg-gray-100 p-6 rounded text-center">
          <p>No logs found</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border py-2 px-4 font-medium">Timestamp</th>
              <th className="border py-2 px-4 font-medium">User ID</th>
              <th className="border py-2 px-4 font-medium">Role</th>
              <th className="border py-2 px-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => {
              if (!log || typeof log !== 'object') {
                return null; // Skip invalid log entries
              }
              
              let timestamp;
              try {
                timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A';
              }
              catch (error) {
                console.error('Error parsing timestamp:', error);
                timestamp = 'Invalid Date';
              }
              
              return (
                <tr key={log._id || log.id || `log-${index}`} className={index % 2 ? 'bg-gray-50' : ''}>
                  <td className="border py-2 px-4">{timestamp}</td>
                  <td className="border py-2 px-4">{log.userId || 'N/A'}</td>
                  <td className="border py-2 px-4">{log.role || 'N/A'}</td>
                  <td className="border py-2 px-4">{log.action || 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Render intrusion detection content
  const renderIntrusionDetection = () => {
    return (
      <div className="space-y-6 text-gray-800">
        <h2 className="text-2xl font-bold mb-4">Intrusion Detection System</h2>
        
        <div className="bg-white p-6 rounded shadow">
          <p className="mb-4">
            Verify the integrity of system logs to detect any unauthorized modifications or tampering.
            The system will check if the stored cryptographic hashes match the expected values.
          </p>
          
          <button
            onClick={handleVerifyLogs}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            disabled={scanningLogs}
          >
            {scanningLogs ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scanning Logs...
              </span>
            ) : "Scan for Intrusions"}
          </button>
          
          {logVerification && (
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded border">
                  <h4 className="font-medium text-gray-700">Total Logs</h4>
                  <p className="text-2xl font-bold">{logVerification.totalLogs}</p>
                </div>
                <div className="bg-green-50 p-4 rounded border border-green-100">
                  <h4 className="font-medium text-green-700">Valid Logs</h4>
                  <p className="text-2xl font-bold text-green-600">{logVerification.validLogs}</p>
                </div>
                <div className={`p-4 rounded border ${logVerification.invalidLogs > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium ${logVerification.invalidLogs > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                    Invalid Logs
                  </h4>
                  <p className={`text-2xl font-bold ${logVerification.invalidLogs > 0 ? 'text-red-600' : ''}`}>
                    {logVerification.invalidLogs}
                  </p>
                </div>
              </div>
              
              {logVerification.invalidLogs > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Potential System Intrusion Detected
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          The system has detected {logVerification.invalidLogs} log entries with invalid hashes. 
                          This could indicate unauthorized modification of system logs. Please investigate immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-6 mt-4">
                <h3 className="text-lg font-medium mb-3">Log Integrity Visualization</h3>
                <div className="bg-white p-4 rounded-lg shadow" style={{ height: '300px' }}>
                  <Pie 
                    data={{
                      labels: ['Valid Logs', 'Invalid Logs'],
                      datasets: [
                        {
                          label: 'System Security',
                          data: [logVerification.validLogs, logVerification.invalidLogs],
                          backgroundColor: [
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                          ],
                          borderColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 99, 132, 1)',
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }} 
                    options={{ maintainAspectRatio: false }}
                  />
                </div>
              </div>
              
              {logVerification.results && (
                <>
                  <h3 className="text-lg font-medium mb-3">Verification Results</h3>
                  <div className="overflow-x-auto bg-white rounded-lg border">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hash Info</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {logVerification.results.map((result) => (
                          <tr key={result.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{result.id}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'N/A'}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{result.userId || 'N/A'}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{result.action || 'N/A'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {result.isValid ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Valid
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Invalid
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-xs font-mono">
                              {result.isValid ? (
                                <span className="text-green-600">{result.storedHash}</span>
                              ) : (
                                <div>
                                  <div className="text-red-600">Stored: {result.storedHash || 'Missing'}</div>
                                  <div className="text-blue-600">Expected: {result.expectedHash || 'Unknown'}</div>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render different content based on active page
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        { const { roleChartData, activityChartData, securityChartData, securityStatus } = prepareDashboardData();
        
        return (
          <div className="space-y-6 text-gray-800">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Users</h3>
                  <span className="text-2xl font-bold">{Array.isArray(users) ? users.length : '0'}</span>
                </div>
                <div className="h-48">
                  <Pie data={roleChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Recent Activity</h3>
                  <span className="text-2xl font-bold">{Array.isArray(logs) ? logs.length : '0'}</span>
                </div>
                <div className="h-48">
                  <Bar 
                    data={activityChartData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">System Security</h3>
                  <span className={`text-lg font-bold px-2 py-1 rounded ${
                    securityStatus.invalid > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {securityStatus.invalid > 0 ? 'Issues Detected' : 'Secure'}
                  </span>
                </div>
                <div className="h-48">
                  <Pie data={securityChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
            
            <div className="w-full bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Recent User Activity</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="pb-2 border-b text-left font-medium text-gray-500">User</th>
                      <th className="pb-2 border-b text-left font-medium text-gray-500">Action</th>
                      <th className="pb-2 border-b text-left font-medium text-gray-500">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.slice(0, 5).map((log, index) => (
                      <tr key={log.id || `recent-log-${index}`}>
                        <td className="py-2 text-sm">{log.userId}</td>
                        <td className="py-2 text-sm">{log.action}</td>
                        <td className="py-2 text-sm">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ); }
      
      case 'users':
        return (
          <div className="text-gray-800">
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            {loading ? (
              <div className="flex justify-center my-8">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 p-4 bg-red-100 rounded">{error}</div>
            ) : (
              renderUsersTable()
            )}
          </div>
        );
      
      case 'logs':
        return (
          <div className="text-gray-800">
            <h2 className="text-2xl font-bold mb-4">System Logs</h2>
            
            {renderLogFilters()}
            
            {loading ? (
              <div className="flex justify-center my-8">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 p-4 bg-red-100 rounded">{error}</div>
            ) : (
              renderLogsTable()
            )}
          </div>
        );
      
      case 'id-cards':
        return (
          <div className='text-gray-800'>
            <h2 className="text-2xl font-bold mb-4">Generate ID Cards</h2>
            <div className="bg-white p-6 rounded shadow">
              <p className="mb-4">Select a user from the list below to generate their ID card.</p>
              {loading ? (
                <div className="flex justify-center my-8">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      window.location.hash = '#users';
                    }} 
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                  >
                    View All Users
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'intrusion-detection':
        return renderIntrusionDetection();
        case 'edit-profile':
          return <EditProfile 
            editingUser={editingUser} 
            fetchUsers={fetchUsers} 
            setError={setError} 
          />;
      default:
        return (
          <div className="bg-yellow-100 p-6 rounded">
            <p className="text-yellow-800">Unknown page: {activePage}. Redirecting to dashboard...</p>
          </div>
        );
    }
  };
  return (
    <div>
      {renderContent()}
      {showRegisterModal && 
        <UserRegistrationModal 
          setShowRegisterModal={setShowRegisterModal} 
          fetchUsers={fetchUsers} 
        />
      }
      {selectedUser && 
      <UserDetailsModal 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)}
      />
    }
    </div>
  );
};

export default AdminPanel;