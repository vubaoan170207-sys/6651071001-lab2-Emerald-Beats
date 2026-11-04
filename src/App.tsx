import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ListPage } from './pages/ListPage';
import { DetailPage } from './pages/DetailPage';
import { PlaylistProvider } from './context/PlaylistContext';
import { AudioPlayer } from './components/AudioPlayer';

export const App: React.FC = () => {
  return (
    <PlaylistProvider>
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/item/:id" element={<DetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AudioPlayer />
    </PlaylistProvider>
  );
};

export default App;
