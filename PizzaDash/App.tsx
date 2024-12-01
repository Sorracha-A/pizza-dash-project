import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import BackgroundMusic from './src/components/BackgroundMusic';

const App = () => {
  return (
    <>
      <BackgroundMusic />
      <AppNavigator />
    </>
  );
};

export default App;
