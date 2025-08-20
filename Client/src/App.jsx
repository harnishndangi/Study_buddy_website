// Main App component with routes and providers
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import  ThemeProvider  from './context/ThemeContext';
import  AppProvider from './context/AppProvider';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Clips from './pages/Clips';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Pomodoro from './pages/Pomodoro';
import Groups from './pages/Groups';
import GroupChat from './pages/GroupChat';
  
const App = () => (
  <ThemeProvider>
    <AppProvider>
      <Router > 
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/clips" element={<Clips />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupChat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AppProvider>
  </ThemeProvider>
);

export default App;
