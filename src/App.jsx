import React, { useState, useEffect } from 'react';
import './App.css';
import QRScanner from './components/qr';
import { login, loginWithQR } from './services/log';
import Dashboard from './components/dashboard';
import { toast } from 'react-toastify';
const App = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const images = ['/main.jpg', '/main1.jpg', '/main2.jpg'];
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Generate random captcha 
  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let captchaText = '';
    for (let i = 0; i < 6; i++) {
      captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(captchaText);
    setUserCaptcha(''); 
    setCaptchaError(false);
  };
  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // First validate the captcha
    if (userCaptcha !== captcha) {
      setCaptchaError(true);
      toast.error('Incorrect CAPTCHA. Please try again.');
      return;
    }
    
    setLoading(true);
    setError('');
    setCaptchaError(false);
    
    try {
      const data = await login(email, password);
      
      // Save token and user data to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userId', data.userId);
      setIsLoggedIn(true);
      toast.success('Login successful!');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.error || 'Login failed. Please try again.');
      toast.error(err.error || 'Login failed. Please try again.');
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleQRScanSuccess = async (qrData) => {

    setLoading(true);
    setError('');
    
    try {
      const data = await loginWithQR(qrData);
      
      // Save token and user data to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userId', data.userId);
      setIsLoggedIn(true);
    } catch (err) {
      console.error('QR login error:', err);
      setError(err.error || 'QR login failed. Please try again.');
      toast.error(err.error || 'QR login failed. Please try again.');
      setShowScanner(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleQRScanError = (error) => {
    console.error('QR scan error:', error);
    setError('QR scan error. Please try again.');
    // Only set error for real failures, not normal camera operation messages
    if (error.includes('Failed')) {
      setError('Could not access camera. Please ensure you have granted permission.');
    }
  };

  const toggleScanner = () => {
    setShowScanner(!showScanner);
    setError(''); // Clear any previous errors
    if (!showScanner) {
      generateCaptcha();
    }
  };

  useEffect(() => {
    // Create a promise to change the image every 3 seconds
    const changeBackgroundImage = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
          resolve();
        }, 3000);
      });
    };

    // Start the image rotation
    const rotateImages = async () => {
      while (true) {
        await changeBackgroundImage();
      }
    };

    rotateImages();
    // Clean up on unmount
    return () => {};
  }, [images.length]);

  // If user is logged in, show the dashboard
  if (isLoggedIn) {
    return <Dashboard />;
  }

  // Otherwise show the login screen
  return (
    
    <div className="w-full h-screen flex">
      {/* Image Section */}
      <div
        className="w-3/5 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url('${images[currentImageIndex]}')` }}
      ></div>
      
      {/* Login Form Section */}
      <div className="w-2/5 bg-white flex flex-col justify-center items-center p-4 shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-blue-500">Student Data Vault</h1>
        <h1 className="text-2xl font-bold mb-6 text-blue-500">{showScanner ? 'Scan QR' : 'Login Form'}</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
            {error}
          </div>
        )}
        
        {!showScanner ? (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-black">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 border border-gray-300 rounded"
              disabled={loading}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 border border-gray-300 rounded text-black"
              disabled={loading}
              required
            />
            
            {/* CAPTCHA Section */}
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter the characters shown below:
              </label>
              <div className="flex items-center mb-2">
                <div 
                  className="bg-blue-100 px-4 py-2 rounded font-mono text-xl tracking-wider mr-2"
                  style={{ 
                    fontFamily: 'monospace', 
                    letterSpacing: '0.5em',
                    textDecoration: 'line-through',
                    background: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cline x1=\'0\' y1=\'100%25\' x2=\'100%25\' y2=\'0\' stroke=\'%23ff000050\' stroke-width=\'1\'/%3E%3C/svg%3E")'
                  }}
                >
                  {captcha}
                </div>
                <button 
                  type="button" 
                  onClick={generateCaptcha}
                  className="bg-gray-200 p-2 rounded hover:bg-gray-300"
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter CAPTCHA"
                value={userCaptcha}
                onChange={(e) => setUserCaptcha(e.target.value)}
                className={`p-2 border rounded w-full ${captchaError ? 'border-red-500' : 'border-gray-300'}`}
                disabled={loading}
                required
              />
              {captchaError && (
                <p className="text-red-500 text-sm mt-1">Incorrect CAPTCHA. Please try again.</p>
              )}
            </div>
            
            <button 
              type="submit" 
              className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <div className="w-[50%] h-[70%] bg-gray-100 rounded-lg flex items-center justify-center">
            <QRScanner className="w-full h-full"
              onScanSuccess={handleQRScanSuccess} 
              onScanError={handleQRScanError} 
            />
          </div>
        )}
        
        <div className="mt-4 text-black ">
          <button
            onClick={toggleScanner}
            className="bg-gray-200 py-2 px-4 rounded hover:bg-gray-300 text-blue-500"
            disabled={loading}
          >
            {showScanner ? 'Show Login Form' : 'QR Scanner'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default App;