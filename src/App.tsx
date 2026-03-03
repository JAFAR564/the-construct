import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { MainLayout } from '@/components/layout/MainLayout';
import { BootGuard } from '@/components/layout/BootGuard';
import { BootSequence } from '@/pages/BootSequence';
import { Login } from '@/pages/Login';
import { Terminal } from '@/pages/Terminal';
import { Profile } from '@/pages/Profile';
import { Quests } from '@/pages/Quests';
import { WorldMap } from '@/pages/WorldMap';
import { Leaderboard } from '@/pages/Leaderboard';
import { Settings } from '@/pages/Settings';
import { FactionHub } from '@/pages/FactionHub';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Full-screen routes — no MainLayout */}
          <Route path="/" element={<BootSequence />} />
          <Route path="/login" element={<Login />} />

          {/* HUD-wrapped routes */}
          <Route element={<BootGuard />}>
            <Route element={<MainLayout />}>
              <Route path="/terminal" element={
                <ErrorBoundary>
                  <Terminal />
                </ErrorBoundary>
              } />
              <Route path="/profile" element={
                <ErrorBoundary>
                  <Profile />
                </ErrorBoundary>
              } />
              <Route path="/quests" element={
                <ErrorBoundary>
                  <Quests />
                </ErrorBoundary>
              } />
              <Route path="/world" element={
                <ErrorBoundary>
                  <WorldMap />
                </ErrorBoundary>
              } />
              <Route path="/faction" element={
                <ErrorBoundary>
                  <FactionHub />
                </ErrorBoundary>
              } />
              <Route path="/ranks" element={
                <ErrorBoundary>
                  <Leaderboard />
                </ErrorBoundary>
              } />
              <Route path="/config" element={
                <ErrorBoundary>
                  <Settings />
                </ErrorBoundary>
              } />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
