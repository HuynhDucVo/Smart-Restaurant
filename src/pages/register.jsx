import {useState} from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [msg, setMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleRegister = async () => {
        try {
            const res = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, role }) 
            });
            
            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.errorMsg || 'Registration failed. Please try again.');
                setMsg('');
                return;
            }

            
            setMsg(data.msg);
            setErrorMsg('');
            setUsername('');
            setPassword('');
            setRole('');
            console.log('Registration successful:', data);
            setTimeout(() => navigate('/'), 1000); // Redirect to login page on success
        }
        catch (error) {
            console.error('Registration failed:', error);  
            alert('Server error. Please try again later.'); 
        }
    }
    return (
        <div className="h-screen flex flex-col items-center justify-center">
            <input
                required
                type="text"
                value={username}
                placeholder="Enter your username"
                className="mb-6 px-4 py-2 border rounded text-lg"
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                required
                type="password"
                value={password}
                placeholder="Enter your password"
                className="mb-6 px-4 py-2 border rounded text-lg"
                onChange={(e) => setPassword(e.target.value)}
            />
            <select
                required
                className="mb-6 px-4 py-2 border rounded text-lg" 
                type="string"
                onChange={(e) => setRole(e.target.value)}
            >
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>

            {msg && <div className="text-green-500 mb-4">{msg}</div>}
            {errorMsg && <div className="text-red-500 mb-4">{errorMsg}</div>}
            <button className='bg-gray-500 text-white px-4 py-2 rounded mb-4 hover:bg-gray-600' onClick={handleRegister}>
                Register
            </button>
            <button
                type="button"
                className='bg-gray-500 text-white px-4 py-2 rounded mb-4 hover:bg-gray-600'
                onClick={() => navigate('/')}  
            >
                Back to Login
            </button>
        </div>
    );
    
}

export default Register