import React, { useState, useEffect } from 'react';
import { 
  getAvailableCourses, 
  getStudentGrades, 
  registerCourses,
  requestAccountDeletion 
} from '../../services/log';
import {toast} from 'react-toastify';
const StudentPanel = () => {
  const [activePage, setActivePage] = useState(window.location.hash.replace('#', '') || 'dashboard');
  const [profile, setProfile] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [grades, setGrades] = useState(null);

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
    if (activePage === 'courses') {
      fetchAvailableCourses();
    } else if (activePage === 'grades') {
      fetchGrades();
    } else if (activePage === 'dashboard') {
      fetchGrades();
    }
  }, [activePage]);

const fetchAvailableCourses = async () => {
  setLoading(true);
  try {
    // First fetch grades/profile to know which courses student is already taking
    if (!profile) {
      await fetchGrades();
    }
    
    const coursesData = await getAvailableCourses();
    
    // Filter out courses that the student is already registered for
    const filteredCourses = coursesData.filter(availableCourse => {
      // Only show courses the student isn't already taking
      return !profile?.courses?.some(
        registeredCourse => registeredCourse.courseCode === availableCourse.courseCode
      );
    });
    
    setAvailableCourses(filteredCourses);
    setError(null);
  } catch (err) {
    console.error('Error fetching courses:', err);
    setError('Failed to load available courses: ' + (err.message || 'Unknown error'));
  } finally {
    setLoading(false);
  }
};
  const fetchGrades = async () => {
    setLoading(true);
    try {
      const data = await getStudentGrades();
      setGrades(data);
      setProfile({
        fullName: data.studentName,
        userId: data.studentId,
        class: data.class,
        courses: data.courses
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError('Failed to load grades: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelection = (course) => {
    setSelectedCourses(prev => {
      const courseExists = prev.some(c => c.courseCode === course.courseCode);
      
      if (courseExists) {
        return prev.filter(c => c.courseCode !== course.courseCode);
      } else {
        return [...prev, course];
      }
    });
  };

  const handleRegisterCourses = async () => {
    if (!selectedCourses.length) {
      setError('Please select at least one course to register');
      return;
    }
  
    setLoading(true);
    try {
      await registerCourses(selectedCourses);
      setSuccessMessage('Courses registered successfully');
      setSelectedCourses([]);
      // Refresh both grades and available courses lists
      await fetchGrades();
      await fetchAvailableCourses();
    } catch (err) {
      console.error('Error registering courses:', err);
      setError('Failed to register courses: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  const handleRequestDeletion = async () => {
    setLoading(true);
    try {
      await requestAccountDeletion();
      toast.success('Deletion request submitted successfully. Please check your email for confirmation.');
    } catch (err) {
      console.error('Error requesting deletion:', err);
      setError('Failed to submit deletion request: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Render dashboard content
  const renderDashboard = () => {
    return (
      <div className="space-y-6 text-black">
        <h2 className="text-2xl font-bold">Student Dashboard</h2>
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5">
            <p>{error}</p>
          </div>
        ) : successMessage ? (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-5">
            <p>{successMessage}</p>
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-bold">Welcome</h3>
              <p className="mt-2 text-xl">{profile.fullName}</p>
              <p className="text-gray-500">Student ID: {profile.userId}</p>
              <p className="text-gray-500">Class: {profile.class}</p>
            </div>
            
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-bold">My Courses</h3>
              <p className="text-3xl mt-2">{profile.courses?.length || 0}</p>
              <button 
                onClick={() => window.location.hash = '#courses'} 
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              >
                View Courses
              </button>
            </div>
            
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-bold">Quick Actions</h3>
              <div className="mt-2 space-y-2">
                <button 
                  onClick={() => window.location.hash = '#grades'} 
                  className="bg-blue-500 text-white py-2 px-4 rounded w-full"
                >
                  View Grades
                </button>
                <button 
                  onClick={() => window.location.hash = '#profile'} 
                  className="bg-red-600  text-white py-2 px-4 rounded w-full"
                >
                  GDPR Compliance
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-100 p-6 rounded">
            <p className="text-yellow-800">No profile data available</p>
          </div>
        )}

        {/* Recent grades preview */}
        {profile?.courses?.length > 0 && (
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold mb-4">Recent Grades</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.courses.slice(0, 3).map((course, index) => (
                <div key={index} className="border p-4 rounded">
                  <h4 className="font-medium">{course.courseCode}</h4>
                  <p className="text-gray-600 text-sm">{course.courseName}</p>
                  <div className="flex justify-between mt-2">
                    <span>Grade:</span>
                    <span className={`font-bold ${getGradeColor(course.grade)}`}>
                      {course.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {profile.courses.length > 3 && (
              <div className="mt-4 text-right">
                <button 
                  onClick={() => window.location.hash = '#grades'}
                  className="text-blue-500 hover:underline"
                >
                  View all grades →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Helper function to determine grade color
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'F': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Render courses content
  const renderCourses = () => {
    return (
      <div className='text-black'>
        <h2 className="text-2xl font-bold mb-4 ">Course Registration</h2>
        
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-5">
            <p>{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="mt-2 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded shadow mb-6">
              <h3 className="text-lg font-bold mb-4">My Current Courses</h3>
              {profile?.courses?.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {profile.courses.map((course, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{course.courseCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{course.courseName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{course.teacher}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              course.grade === 'A' ? 'bg-green-100 text-green-800' : 
                              course.grade === 'B' ? 'bg-blue-100 text-blue-800' : 
                              course.grade === 'C' ? 'bg-yellow-100 text-yellow-800' : 
                              course.grade === 'D' ? 'bg-orange-100 text-orange-800' : 
                              course.grade === 'F' ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {course.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">You have not registered for any courses yet.</p>
              )}
            </div>
            
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-bold mb-4">Available Courses</h3>
              
              {availableCourses.length === 0 ? (
                <p className="text-gray-500">No courses are available for registration at this time.</p>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Select the courses you wish to register for:</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {availableCourses.map((course, index) => {
                      const isSelected = selectedCourses.some(c => c.courseCode === course.courseCode);
                      
                      return (
                        <div 
                          key={index}
                          className={`border p-4 rounded cursor-pointer transition-colors ${
                            isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleCourseSelection(course)}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <h4 className="font-medium">{course.courseCode}</h4>
                              <p className="text-gray-600 text-sm">{course.courseName}</p>
                              <p className="text-gray-500 text-xs mt-1">Teacher: {course.teacherName}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleRegisterCourses}
                      disabled={selectedCourses.length === 0 || loading}
                      className={`px-4 py-2 rounded font-medium ${
                        selectedCourses.length === 0
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {loading ? 'Registering...' : 'Register Selected Courses'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // Render grades content
  const renderGrades = () => {
    return (
      <div className=" text-black">
        <h2 className="text-2xl font-bold mb-4">My Grades</h2>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5">
            <p>{error}</p>
          </div>
        ) : grades ? (
          <div className="bg-white p-6 rounded shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-xl font-bold">{grades.studentName}</h3>
                <p className="text-gray-600">Student ID: {grades.studentId}</p>
                <p className="text-gray-600">Class: {grades.class}</p>
              </div>
              
              {grades.courses.length > 0 && (
                <div className="mt-4 md:mt-0 bg-gray-100 px-4 py-2 rounded">
                  <p className="text-sm">Total Courses: <span className="font-bold">{grades.courses.length}</span></p>
                </div>
              )}
            </div>
            
            {grades.courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {grades.courses.map((course, index) => (
                  <div key={index} className="bg-white border rounded-lg shadow overflow-hidden">
                    <div className="p-5 border-b bg-gray-50">
                      <h3 className="text-lg font-bold">{course.courseCode}</h3>
                      <p className="text-gray-600">{course.courseName}</p>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Teacher:</span>
                        <span>{course.teacher}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">Grade:</span>
                        <span className={`text-xl font-bold ${getGradeColor(course.grade)}`}>
                          {course.grade}
                        </span>
                      </div>
                      <div className={`mt-4 h-2 bg-gray-200 rounded-full overflow-hidden ${
                        course.grade === 'Not graded yet' ? 'opacity-30' : ''
                      }`}>
                        <div 
                          className={`h-full ${getGradeProgressColor(course.grade)}`} 
                          style={{width: getGradePercentage(course.grade)}}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded border">
                <p className="text-gray-500">You haven't registered for any courses yet.</p>
                <button 
                  onClick={() => window.location.hash = '#courses'} 
                  className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                  Register for Courses
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-100 p-6 rounded">
            <p className="text-yellow-800">No grade information available</p>
          </div>
        )}
      </div>
    );
  };

  // Helper function for grade progress bar percentage
  const getGradePercentage = (grade) => {
    switch (grade) {
      case 'A': return '100%';
      case 'B': return '80%';
      case 'C': return '60%';
      case 'D': return '40%';
      case 'F': return '20%';
      default: return '0%';
    }
  };

  // Helper function for grade progress bar color
  const getGradeProgressColor = (grade) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'F': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  // Render profile content
  const renderProfile = () => {
    return (
      <div className="text-black">
        <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Account Management</h3>
          <div className="border-t pt-4 mt-4">
            <h4 className="text-red-600 font-medium mb-2">GDPR Compliance</h4>
            <p className="text-gray-600 mb-4 text-sm">
              If you want to view, delete and edit your data</p>
            <button
              onClick={handleRequestDeletion}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
            >
              {loading ? 'Processing...' : 'Request'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render different content based on active page
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return renderDashboard();
      case 'courses':
        return renderCourses();
      case 'grades':
        return renderGrades();
      case 'profile':
        return renderProfile();
      default:
        return (
          <div className="bg-yellow-100 p-6 rounded">
            <p className="text-yellow-800">Unknown page: {activePage}. Redirecting to dashboard...</p>
            <script>{setTimeout(() => { window.location.hash = 'dashboard'; }, 2000)}</script>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default StudentPanel;