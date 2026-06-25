import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome, {user?.name}
        </h1>
        <p className="text-slate-400 mb-6">Dashboard — coming in Milestone 3</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;