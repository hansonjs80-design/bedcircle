import React from 'react';
import { TreatmentProvider } from './contexts/TreatmentContext';
import { MainLayout } from './components/MainLayout';

const App: React.FC = () => {
  return (
    <TreatmentProvider>
      <MainLayout />
    </TreatmentProvider>
  );
};

export default App;