import React, { useState, useEffect } from 'react';
import { getTeachingCourses, getCourseStudents, updateStudentGrade } from '../../services/log';
import { toast } from 'react-toastify';

const TeacherPanel = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activePage, setActivePage] = useState(window.location.hash.replace('#', '') || 'dashboard');

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
    if (activePage === 'courses' || activePage === 'dashboard') {
      fetchCourses();
    }
  }, [activePage]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await getTeachingCourses();
      if (Array.isArray(data)) {
        setCourses(data);
      } else {
        setCourses([]);
        console.error('Expected array of courses but got:', data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses: ' + (err.message || 'Unknown error'));
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForCourse = async (courseCode) => {
    setLoading(true);
    try {
      const data = await getCourseStudents(courseCode);
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        setStudents([]);
        console.error('Expected array of students but got:', data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students: ' + (err.message || 'Unknown error'));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (courseCode) => {
    setSelectedCourse(courseCode);
    fetchStudentsForCourse(courseCode);
    window.location.hash = '#students';
  };

  const handleUpdateGrade = async (studentId, courseCode, grade) => {
    try {
      await updateStudentGrade(studentId, courseCode, grade);
      
      // Update local state to reflect the change
      setStudents(students.map(student => 
        student.userId === studentId ? { ...student, grade } : student
      ));
      
      // Show success message
      toast.success(`Grade updated successfully for ${studentId}`);
    } catch (err) {
      console.error('Error updating grade:', err);
      alert('Failed to update grade: ' + (err.message || 'Unknown error'));
    }
  };

  // Render dashboard content
  const renderDashboard = () => {
    return (
      <div  className="text-black mt-auto ">
        <h2 className="text-2xl font-bold mb-4">Teacher Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">My Courses</h3>
              <span className="text-2xl font-bold">{courses.length}</span>
            </div>
            <p className="text-gray-600 mt-2">Courses you are currently teaching</p>
            <button 
              onClick={() => { window.location.hash = '#courses'; }}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              View All Courses
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-2">Quick Access</h3>
            <div className="space-y-2">
              {courses.slice(0, 3).map((course, index) => (
                <button
                  key={index}
                  onClick={() => handleCourseSelect(course.courseCode || course)}
                  className="block w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                >
                  {course.courseCode || course}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mt-8">
          <h3 className="text-lg font-medium mb-3">Recent Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course, index) => (
              <div key={index} className="border rounded p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium">{course.courseCode || course}</h4>
                <button
                  onClick={() => handleCourseSelect(course.courseCode || course)}
                  className="mt-2 text-blue-500 hover:underline"
                >
                  View Students
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render courses content
  const renderCourses = () => {
    return (
      <div  className="text-black">
        <h2 className="text-2xl font-bold mb-4">My Courses</h2>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5">
            <p>{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-gray-100 p-6 rounded text-center">
            <p className="mb-4">No courses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold mb-2">{course.courseCode || course}</h3>
                {course.courseName && <p className="text-gray-600 mb-4">{course.courseName}</p>}
                <button 
                  onClick={() => handleCourseSelect(course.courseCode || course)}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                  View Students
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render students content
  const renderStudents = () => {
    if (!selectedCourse) {
      return (
        <div className="bg-yellow-100 p-6 rounded">
          <p className="text-yellow-800">Please select a course first</p>
          <button 
            onClick={() => { window.location.hash = '#courses'; }}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          >
            Back to Courses
          </button>
        </div>
      );
    }

    return (
      <div  className="text-black">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Students in {selectedCourse}
        </h2>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5">
            <p>{error}</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-gray-100 p-6 rounded text-center">
            <p className="mb-4">No students found in this course</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.userId || student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{student.userId || student.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.fullName || student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{student.class || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded ${getGradeBadgeColor(student.grade)}`}>
                        {student.grade || 'Not graded'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const grade = e.target.value;
                          if (grade) {
                            handleUpdateGrade(student.userId || student.id, selectedCourse, grade);
                          }
                        }}
                        className="border rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="" disabled>Select grade</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="F">F</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-6">
          <button 
            onClick={() => { window.location.hash = '#courses'; }}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded transition-colors"
          >
            ← Back to Courses
          </button>
        </div>
      </div>
    );
  };

  // Render grades content
  const renderGrades = () => {
    return (
      <div className="text-black">
        <h2 className="text-2xl font-bold mb-4">Grade Management</h2>
        <p className="mb-4">Select a course to manage grades:</p>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5">
            <p>{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-gray-100 p-6 rounded text-center">
            <p className="mb-4">No courses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((course, index) => (
              <button 
                key={index}
                onClick={() => handleCourseSelect(course.courseCode || course)}
                className="bg-white p-6 rounded-lg shadow text-left hover:bg-gray-50 hover:shadow-md transition-all"
              >
                <h3 className="font-medium text-lg">{course.courseCode || course}</h3>
                {course.courseName && <p className="text-gray-600 mt-1">{course.courseName}</p>}
                <p className="text-blue-500 mt-2">Manage student grades →</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Helper function for grade badge colors
  const getGradeBadgeColor = (grade) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-orange-100 text-orange-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render different content based on active page
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return renderDashboard();
      case 'courses':
        return renderCourses();
      case 'students':
        return renderStudents();
      case 'grades':
        return renderGrades();
      default:
        return (
          <div className="bg-yellow-100 p-6 rounded">
            <p className="text-yellow-800">Unknown page: {activePage}. Redirecting to dashboard...</p>
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

export default TeacherPanel;