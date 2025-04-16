import { Route, Routes } from 'react-router-dom';
import OnBoarding from './pages/OnBoarding';
import Privacy from './pages/Privacy';
import Home from './pages/Home';
import Download from './pages/Download';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/onboarding" element={<OnBoarding />}></Route>
        <Route path="/privacy" element={<Privacy />}></Route>
        <Route path="/download" element={<Download />}></Route>
      </Routes>
    </>
  );
}

export default App;
