import React, { useEffect, useRef } from 'react';

const GoogleAuth = ({ onSuccess, onError, text = 'Continue with Google' }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    // Load Google API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      document.body.appendChild(script);
    } else {
      initializeGoogleAuth();
    }
  }, []);

  const initializeGoogleAuth = () => {
    if (!window.google) {
      console.error('Google API not loaded');
      onError?.(new Error('Google API not loaded'));
      return;
    }

    window.google.accounts.id.initialize({
      client_id: '452323229339-vjn0t394l0g5idpvf69sa96eeh02s6rf.apps.googleusercontent.com',
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });

    // Render the Google Sign-In button
    if (buttonRef.current) {
      window.google.accounts.id.renderButton(
        buttonRef.current,
        {
          theme: 'outline',
          size: 'large',
          text: text,
          width: '100%',
          height: '48px',
          logo_alignment: 'left'
        }
      );
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      const token = response.credential;
      
      // Send token to backend
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await res.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        onSuccess?.(data);
      } else {
        onError?.(new Error(data.message || 'Authentication failed'));
      }
    } catch (error) {
      console.error('Backend auth error:', error);
      onError?.(error);
    }
  };

  return (
    <div 
      ref={buttonRef}
      className="w-full flex items-center justify-center"
      style={{ minHeight: '48px' }}
    />
  );
};

export default GoogleAuth;
