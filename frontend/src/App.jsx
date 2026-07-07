import { useState } from 'react';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  // Added Validation logic
  const isValid = () => {
    if (!email.includes('@') || password.length < 4) {
      setMessage('Validation error: Invalid email or password too short.');
      return false;
    }
    return true;
  };

  const register = async (e) => {
    e.preventDefault();
    if (!isValid()) return; // Stop if invalid
    try {
      const res = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (err) {
      setMessage('Fetch error: Backend not running?');
    }
  };

  const login = async (e) => {
    e.preventDefault();
    if (!isValid()) return; // Stop if invalid
    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setMessage('Logged in successfully!');
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (err) {
      setMessage('Fetch error: Backend not running?');
    }
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/protected', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMessage(data.message || data.error);
    } catch (err) {
      setMessage('Fetch error');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Minimal Auth Test</h2>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
        <input 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
        <input 
          placeholder="Password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
        <button onClick={register}>Register New User</button>
        <button onClick={login}>Login</button>
      </form>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#eee' }}>
        <strong>Message:</strong> {message}
      </div>

      {token && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={checkAuth}>Test Protected Route</button>
          <p style={{ wordBreak: 'break-all', fontSize: '12px' }}>Token: {token}</p>
        </div>
      )}
    </div>
  );
}