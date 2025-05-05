import React from 'react';

// SVG Icon components for better visual appearance
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const IdCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const LogsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
    <path fill="#fff" fillOpacity="0.5" d="M6 8a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1z" />
  </svg>
);

const CoursesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
  </svg>
);

const StudentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-3a3 3 0 013.75-2.906z" />
  </svg>
);

const GradesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);


const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm9.293 5.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L13.586 12H6a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);
const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);
// EditProfileIcon component for the sidebar



const Sidebar = ({ role, setActivePage }) => {
  const logout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    
    // Redirect to login page
    window.location.href = '/';
  };

  // Define menu items based on user role with proper SVG icons
  const getMenuItems = () => {
    switch (role) {
    // Add this to your sidebar component's menu items
// Inside the getMenuItems function, for the Admin role:

case 'Admin':
  return [
    { label: 'Dashboard', icon: <DashboardIcon />, id: 'dashboard' },
    { label: 'User Management', icon: <UsersIcon />, id: 'users' },
    { label: 'System Logs', icon: <LogsIcon />, id: 'logs' },
    { label: 'Intrusion Detection', icon: <ShieldCheckIcon />, id: 'intrusion-detection' },
   
  ];
      case 'Teacher':
        return [
          { label: 'Dashboard', icon: <DashboardIcon />, id: 'dashboard' },
          { label: 'My Courses', icon: <CoursesIcon />, id: 'courses' },
          { label: 'Students', icon: <StudentsIcon />, id: 'students' },
          { label: 'Grade Management', icon: <GradesIcon />, id: 'grades' },
        ];
      case 'Student':
        return [
          { label: 'Dashboard', icon: <DashboardIcon />, id: 'dashboard' },
          { label: 'My Courses', icon: <CoursesIcon />, id: 'courses' },
          { label: 'Grades', icon: <GradesIcon />, id: 'grades' },
        ];
      case 'Parent':
        return [
          { label: 'Child\'s Results', icon: <GradesIcon />, id: 'resultcards' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();



  const handleNavigation = (pageId) => {
    window.location.hash = `#${pageId}`;
    if (setActivePage) {
      setActivePage(pageId);
    }
  };

  return (
    <div className="bg-blue-800 text-white w-64 flex flex-col h-full shadow-lg">
      {/* Logo and system name */}
      <div className="p-5 border-b border-blue-700">
        <h1 className="text-xl font-bold">Student Data Vault</h1>
        <p className="text-sm text-blue-200">{role} Dashboard</p>
      </div>
      
      {/* Menu items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button 
                onClick={() => handleNavigation(item.id)}
                className="flex items-center w-full text-left p-3 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <span className="mr-3 text-blue-200">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User info and logout */}
      <div className="p-4 border-t border-blue-700 mt-auto">
        <button 
          onClick={logout} 
          className="flex items-center w-full p-3 rounded-md hover:bg-blue-700 transition-colors duration-200 text-blue-100 group"
        >
          <span className="mr-3 group-hover:text-white">
            <LogoutIcon />
          </span>
          <span className="group-hover:text-white">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;