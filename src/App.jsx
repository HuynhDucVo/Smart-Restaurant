import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Login from './pages/login'
import Register from './pages/register'
import Dashboard from './pages/dashboard'
import DineIn from './pages/dinein'
import TakeAway from './pages/takeaway.jsx'
import Order from './pages/order'
import Tips from './pages/tips'
import Report from './pages/report'
import GetOrder from './pages/getOrder.jsx'

function GlobalActions() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';
  const isLogin = location.pathname === '/';

  const buttonBase = "w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200";
  
  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  return (
    <div className="fixed bottom-8 right-8 flex items-center gap-3 z-50">
      {!isDashboard && !isLogin && (
        <button
          aria-label="Home"
          title="Home"
          onClick={() => navigate('/dashboard')}
          className={`bg-gray-700 hover:bg-gray-800 text-white ${buttonBase}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l9-7 9 7v8a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" />
          </svg>
        </button>
      )}
      { !isLogin && (
        <>
          {/* User info display */}
          {currentUser.username && (
            <div className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              {currentUser.username}
            </div>
          )}
          
          {/* Logout button */}
          <button
            aria-label="Logout"
            title="Logout"
            onClick={() => {
              localStorage.removeItem('currentUser');
              navigate('/');
            }}
            className={`bg-red-600 hover:bg-red-700 text-white ${buttonBase}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dine-in" element={<DineIn />} />
        <Route path="/take-away" element={<TakeAway />} />
        <Route path="/order" element={<Order />} />        
        <Route path="/tips" element={<Tips />} />
        <Route path="/report" element={<Report />} />
        <Route path="/getOrder" element={<GetOrder />} />
      </Routes>
      <GlobalActions />
    </>
  );
}

export default App// mongod --dbpath="C:\Users\Kenji Baby\data\db"
