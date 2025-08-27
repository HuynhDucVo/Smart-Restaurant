import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate();
  const [logPassword, setLogPassword] = useState('')
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const passwordList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    
  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password : logPassword })
      });

      if (!res.ok) {
        setErrorMsg('Login failed. Please check your password.');
        setMsg('');
        setLogPassword('');
        return;
      }

      const data = await res.json();
      setMsg(data.msg);
      setErrorMsg('');
      
      // Store user info in localStorage for tracking
      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify({
          id: data.user._id,
          username: data.user.username,
          role: data.user.role
        }));
      }
      
      setTimeout(() => navigate('/dashboard'), 1500); 
      setLogPassword(''); 
      console.log('Login successful:', data);

    }
    catch (error) {
      console.error('Login failed:', error);
      alert('Server error. Please try again later.');
    }
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <input
        type="password"
        value={logPassword}
        placeholder="Enter your unique code"
        className="mb-6 px-4 py-2 border rounded text-lg"
        readOnly
      />
      {msg && <div className="text-green-500 mb-4">{msg}</div>}
      {errorMsg && <div className="text-red-500 mb-4">{errorMsg}</div>}
      <button className='bg-gray-500 text-white px-4 py-2 rounded mb-4 hover:bg-gray-600' onClick={handleLogin}>
        Submit
      </button>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {passwordList.slice(0, 9).map((num) => (
          <button
            key={num}
            type="button"
            className="bg-gray-100 p-4 rounded text-xl hover:bg-gray-200"
            onClick={() => setLogPassword(prev => prev + num)}
          >
            {num}
          </button>
        ))}

        <button
          type="button"
          className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
          onClick={() => setLogPassword('')}
        >
          Clear
        </button>
        <button
          key={passwordList[9]}
          type="button"
          className="bg-gray-100 p-4 rounded text-xl hover:bg-gray-200"
          onClick={() => setLogPassword(prev => prev + passwordList[9])}
        >
          {passwordList[9]}
        </button>

        <button
          type="button"
          className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200"
          onClick={() => setLogPassword(prev => prev.slice(0, -1))}
        >
          Delete
        </button>

      </div>
      <button
        type="button"
        className="bg-gray-50 px-5 py-2 mt-4 rounded-2xl hover:bg-gray-200"
        onClick={() => navigate('/register')}
      >
        Register New User
      </button>
    </div>
  );
}

export default Login
