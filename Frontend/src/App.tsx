import { Route, Routes } from 'react-router-dom';
import OnBoarding from './pages/onBoarding';
import Privacy from './pages/Privacy';
import Home from './pages/Home';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/onboarding" element={<OnBoarding />}></Route>
        <Route path="/privacy" element={<Privacy />}></Route>
      </Routes>
    </>
  );
}

export default App;
