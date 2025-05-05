import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import Sidebar from './sidebar';
import AdminPanel from './panels/adminpanel';
import TeacherPanel from './panels/teacherpanel';
import StudentPanel from './panels/student';
import ParentPanel from './panels/parentpanel';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setActivePage] = useState(window.location.hash.replace('#', '') || 'dashboard');

  useEffect(() => {
    // Get user role from localStorage (set during login)
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    
    if (!role || !userId) {
      // Redirect to login if not authenticated
      window.location.href = '/';
      setError('User not authenticated. Please log in again.');
      return;
    }
    
    setUserData({ role, userId });
    setLoading(false);
  }, []);

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

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 p-4 rounded text-red-700">{error}</div>
      </div>
    );
  }

  const renderPanel = () => {
    switch (userData?.role) {
      case 'Admin':
        return <AdminPanel userId={userData.userId} />;
      case 'Teacher':
        return <TeacherPanel userId={userData.userId} />;
      case 'Student':
        return <StudentPanel userId={userData.userId} />;
      case 'Parent':
        return <ParentPanel userId={userData.userId} />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ToastContainer />
      <Sidebar role={userData?.role} setActivePage={setActivePage} />
      <div className="flex-1 overflow-auto p-6">
        {renderPanel()}
      </div>
    </div>
  );
};

export default Dashboard;