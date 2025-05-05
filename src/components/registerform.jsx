import React, { useState } from 'react';
import { registerUser } from '../services/log';
import { toast } from 'react-toastify';

const UserRegistrationModal = ({ setShowRegisterModal, fetchUsers }) => {
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Student',
    studentClass: '',
    coursesTeaching: [],
    linkedStudentId: ''
  });
  
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  
  // Keep all your handlers
  const handleFullNameChange = (e) => {
    setUserData(prev => ({ ...prev, fullName: e.target.value }));
  };
  
  const handleEmailChange = (e) => {
    setUserData(prev => ({ ...prev, email: e.target.value }));
  };
  
  const handlePasswordChange = (e) => {
    setUserData(prev => ({ ...prev, password: e.target.value }));
  };
  
  const handleRoleChange = (e) => {
    setUserData(prev => ({ ...prev, role: e.target.value }));
  };
  
  const handleStudentClassChange = (e) => {
    setUserData(prev => ({ ...prev, studentClass: e.target.value }));
  };
  
  const handleLinkedStudentIdChange = (e) => {
    setUserData(prev => ({ ...prev, linkedStudentId: e.target.value }));
  };
  
  const handleCoursesChange = (e) => {
    const courses = e.target.value.split(',').map(course => course.trim()).filter(Boolean);
    setUserData(prev => ({ ...prev, coursesTeaching: courses }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);
    
    try {
      await registerUser(userData);
      setRegisterSuccess(true);
      fetchUsers(); // Using the passed function
      toast.success('User registered successfully!');
      // Reset form
      setUserData({
        fullName: '',
        email: '',
        password: '',
        role: 'Student',
        studentClass: '',
        coursesTeaching: [],
        linkedStudentId: ''
      });
    } catch (err) {
      console.error('Registration error:', err);
      setRegisterError(err.error || 'Failed to register user');
    } finally {
      setRegisterLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Keep all your existing modal content */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Register New User</h2>
          <button 
            onClick={() => setShowRegisterModal(false)} 
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {registerError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {registerError}
          </div>
        )}
        
        {registerSuccess ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>User registered successfully!</p>
            <div className="mt-4 text-right">
              <button 
                onClick={() => setShowRegisterModal(false)} 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* All your form fields */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Full Name*
              </label>
              <input
                type="text"
                name="fullName"
                value={userData.fullName}
                onChange={handleFullNameChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            
            {/* ...rest of your form fields... */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email*
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleEmailChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password*
              </label>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handlePasswordChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Role*
              </label>
              <select
                name="role"
                value={userData.role}
                onChange={handleRoleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Parent">Parent</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            
            {userData.role === 'Student' && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Class*
                </label>
                <input
                  type="text"
                  name="studentClass"
                  value={userData.studentClass}
                  onChange={handleStudentClassChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  placeholder="e.g. 10-A"
                  required
                />
              </div>
            )}
            
            {userData.role === 'Teacher' && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Courses Teaching* (comma separated)
                </label>
                <input
                  type="text"
                  value={userData.coursesTeaching.join(', ')}
                  onChange={handleCoursesChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  placeholder="e.g. Math, Science, English"
                  required
                />
              </div>
            )}
            
            {userData.role === 'Parent' && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Linked Student ID*
                </label>
                <input
                  type="text"
                  name="linkedStudentId"
                  value={userData.linkedStudentId}
                  onChange={handleLinkedStudentIdChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  placeholder="e.g. student-1234"
                  required
                />
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                disabled={registerLoading}
              >
                {registerLoading ? 'Registering...' : 'Register User'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserRegistrationModal;