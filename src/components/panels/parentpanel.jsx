import React, { useState, useEffect } from 'react';
import { getChildData } from '../../services/log';

const ParentPanel = () => {
  const [setActivePage] = useState(window.location.hash.replace('#', '') || 'resultcards');
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setActivePage(window.location.hash.replace('#', '') || 'resultcards');
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Fetch children data on component mount
  useEffect(() => {
    fetchChildrenData();
  }, []);

  const fetchChildrenData = async () => {
    setLoading(true);
    try {
      // Use the imported service function instead of direct API call
      const data = await getChildData();
      
      // Handle multiple children or single child format
      const childData = Array.isArray(data) ? data : [data];
      setChildrenData(childData);
      
      // Set first child as selected by default
      if (childData.length > 0 && !selectedChild) {
        setSelectedChild(childData[0].userId);
      }
    } catch (err) {
      setError('Failed to load children data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Get the selected child's data
  const getSelectedChildData = () => {
    return childrenData.find(child => child.userId === selectedChild) || childrenData[0];
  };
  // Render result card content
  const renderResultCard = () => {
    const childData = getSelectedChildData();
    
    if (!childData) return (
      <div className="bg-yellow-50 p-6 rounded border border-yellow-200 text-yellow-800">
        No child data available. Please ensure your account is linked to your child's student account.
      </div>
    );
    
    return (
      <div className="space-y-6 text-black">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-blue-800">STUDENT RESULT CARD</h3>
            <p className="text-gray-500">Academic Year 2024-2025</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <p><span className="font-semibold">Student Name:</span> {childData.fullName}</p>
              <p><span className="font-semibold">Student ID:</span> {childData.userId}</p>
            </div>
            <div>
              <p><span className="font-semibold">Class:</span> {childData.class}</p>    
            </div>
          </div>
          
          {childData.courses && childData.courses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left border-b">Course Code</th>
                    <th className="py-3 px-4 text-left border-b">Course Name</th>
                    <th className="py-3 px-4 text-left border-b">Teacher</th>
                    <th className="py-3 px-4 text-left border-b">Grade</th>
                    <th className="py-3 px-4 text-left border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {childData.courses.map((course, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-3 px-4 border-b">{course.courseCode}</td>
                      <td className="py-3 px-4 border-b">{course.courseName}</td>
                      <td className="py-3 px-4 border-b">{course.teacher}</td>
                      <td className="py-3 px-4 border-b">
                        <span className={`font-semibold ${
                          course.grade === 'A' ? 'text-green-600' : 
                          course.grade === 'B' ? 'text-blue-600' : 
                          course.grade === 'C' ? 'text-yellow-600' : 
                          course.grade === 'D' ? 'text-orange-600' : 
                          course.grade === 'F' ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {course.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          course.grade === 'F' ? 'bg-red-100 text-red-800' : 
                          course.grade === 'Not graded yet' ? 'bg-gray-100 text-gray-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {course.grade === 'F' ? 'FAILED' : 
                           course.grade === 'Not graded' ? 'PENDING' : 
                           'PASSED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded">
              <p className="text-gray-500">No courses or grades available for this student.</p>
            </div>
          )}
          
          <div className="mt-8 text-right">
            <p className="font-semibold text-xs text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>{error}</p>
        </div>
      ) : (
        <>
        
          {childrenData.length > 1 && (
            <div className="flex justify-between items-center bg-white p-4 rounded shadow">
              <h2 className="text-lg font-bold">Select Child</h2>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {childrenData.map(child => (
                  <option key={child.userId} value={child.userId}>
                    {child.fullName} ({child.class})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Result card display */}
          {renderResultCard()}
        </>
      )}
    </div>
  );
};

export default ParentPanel;