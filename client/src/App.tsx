import { BrowserRouter, Routes, Route } from 'react-router-dom';

function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">SyncBoard</h1>
        <p className="text-slate-400">Real-time collaborative whiteboard</p>
        <div className="mt-4 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm inline-block">
          Milestone 1 complete ✓
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;