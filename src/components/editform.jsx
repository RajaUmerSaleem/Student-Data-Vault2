import React, { useState, useEffect } from 'react';
import { updateUser } from '../services/log';

const EditProfile = ({ editingUser, fetchUsers, setError }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    studentClass: '',
    coursesTeaching: [],
    password: ''
  });

  // Update form when editingUser changes
  useEffect(() => {
    if (editingUser) {
      setFormData({
        fullName: editingUser.fullName || '',
        email: editingUser.decryptedEmail || editingUser.email || '',
        role: editingUser.role || '',
        studentClass: editingUser.class || '',
        coursesTeaching: editingUser.coursesTeaching || [],
        password: ''  // Don't populate password from API
      });
    }
  }, [editingUser]);

  const handleFullNameChange = (e) => {
    setFormData(prev => ({ ...prev, fullName: e.target.value }));
  };
  
  const handlePasswordChange = (e) => {
    setFormData(prev => ({ ...prev, password: e.target.value }));
  };
  
  const handleEmailChange = (e) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
  };
  
  const handleRoleChange = (e) => {
    setFormData(prev => ({ ...prev, role: e.target.value }));
  };
  
  const handleStudentClassChange = (e) => {
    setFormData(prev => ({ ...prev, studentClass: e.target.value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitBtn = e.target.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
      }
      
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role  // Fix: was sending the entire formData object
      };
      
      // Only include password if provided
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }
      console.log(formData.password.trim());
      
      
      if (formData.role === 'Student') {
        updateData.class = formData.studentClass;
      } else if (formData.role === 'Teacher') {
        updateData.coursesTeaching = formData.coursesTeaching;
      }

      await updateUser(editingUser.userId, updateData);
      alert('User updated successfully');
      window.location.hash = '#users';
      fetchUsers(); 
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user: ' + (err.message || 'Unknown error'));
    } finally {
      const submitBtn = e.target.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
      }
    }
  };

  return (
    <div className="text-gray-800">
      <h2 className="text-2xl font-bold mb-4">Edit User Profile</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={editingUser?.userId || ''}
              className="w-full rounded border-gray-300 bg-gray-100"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">User ID cannot be changed</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleFullNameChange}
              className="w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleEmailChange}
              className="w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role*</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleRoleChange}
              className="w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-blue-500"
              required
            >
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
              <option value="Parent">Parent</option>
            </select>
          </div>
          
          {formData.role === 'Student' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Class*</label>
              <input
                type="text"
                name="studentClass"
                value={formData.studentClass}
                onChange={handleStudentClassChange}
                className="w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-blue-500"
                placeholder="e.g. 10-A"
                required
              />
            </div>
          )}
          
{formData.role === 'Teacher' && (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Courses Teaching* (comma separated)
    </label>
    <input
      type="text"
      defaultValue={Array.isArray(formData.coursesTeaching) ? formData.coursesTeaching.join(', ') : ''}
      onBlur={(e) => {
        const coursesString = e.target.value;
        const coursesArray = coursesString.split(',').map(course => course.trim()).filter(Boolean);
        setFormData(prev => ({ ...prev, coursesTeaching: coursesArray }));
      }}
      className="w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-blue-500"
      placeholder="e.g. Math101, CS101, DB202"
      required
    />
    <p className="text-xs text-gray-500 mt-1">Separate multiple courses with commas</p>
  </div>
)}
          
          {formData.role === 'Parent' && (
            <div className="mb-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded">
                <p className="text-amber-800 text-sm">
                  <strong>Note:</strong> Parent-student relationships cannot change
                </p>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-xs font-normal text-gray-500">(Leave blank to keep unchanged)</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handlePasswordChange}
              className="w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => window.location.hash = '#users'}
              className="px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;