import { useState } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import { LandingPage } from './components/landing/LandingPage';
import { SetupPage } from './components/setup/SetupPage';
import { WarRoom } from './components/layout/WarRoom';
import { AnalystReport } from './components/reports/AnalystReport';
import './index.css';

export default function App() {
  const [page, setPage] = useState('landing');
  const [productConfig, setProductConfig] = useState(null);

  const handleStart = () => setPage('setup');

  const handleLaunch = (config) => {
    setProductConfig(config);
    setPage('dashboard');
  };

  const handleExit = () => {
    setPage('setup');
    setProductConfig(null);
  };

  const handleViewReport = () => setPage('report');
  const handleBackToDashboard = () => setPage('dashboard');

  if (page === 'landing') {
    return <LandingPage onStart={handleStart} />;
  }

  if (page === 'setup') {
    return <SetupPage onLaunch={handleLaunch} />;
  }

  if (page === 'report') {
    return (
      <SimulationProvider initialConfig={productConfig}>
        <AnalystReport onBack={handleBackToDashboard} />
      </SimulationProvider>
    );
  }

  return (
    <SimulationProvider initialConfig={productConfig}>
      <WarRoom onExit={handleExit} productConfig={productConfig} onViewReport={handleViewReport} />
    </SimulationProvider>
  );
}
