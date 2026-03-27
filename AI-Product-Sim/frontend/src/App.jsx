import { useState } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import { SetupPage } from './components/setup/SetupPage';
import { WarRoom } from './components/layout/WarRoom';
import './index.css';

export default function App() {
  const [page, setPage] = useState('setup');
  const [productConfig, setProductConfig] = useState(null);

  const handleLaunch = (config) => {
    setProductConfig(config);
    setPage('dashboard');
  };

  const handleExit = () => {
    setPage('setup');
    setProductConfig(null);
  };

  if (page === 'setup') {
    return <SetupPage onLaunch={handleLaunch} />;
  }

  return (
    <SimulationProvider initialConfig={productConfig}>
      <WarRoom onExit={handleExit} productConfig={productConfig} />
    </SimulationProvider>
  );
}
