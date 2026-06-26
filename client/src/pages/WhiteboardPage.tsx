import { useParams, useNavigate } from 'react-router-dom';

const WhiteboardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-2xl font-bold mb-2">Whiteboard</h1>
        <p className="text-slate-400 mb-1">Room ID: {id}</p>
        <p className="text-slate-500 text-sm mb-6">Coming in Milestone 4</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
        >
          ← Back to dashboard
        </button>
      </div>
    </div>
  );
};

export default WhiteboardPage;