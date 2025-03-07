import { useState } from 'react';
import LLMSelector from './components/LLMSelector';
import Toggles from './components/Toggles';

function App() {
  const [showLLMSelector, setShowLLMSelector] = useState(false);

  return (
    <>
      <div className="p-4 w-sm bg-white shadow-md rounded-md">
        <h1 className="text-lg font-semibold">Settings</h1>
        <Toggles />
        <button
          className="mt-4 px-3 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
          onClick={() => setShowLLMSelector(!showLLMSelector)}
        >
          {showLLMSelector ? 'Hide LLM Selector' : 'Change LLM'}
        </button>
        {showLLMSelector && (
          <LLMSelector onClose={() => setShowLLMSelector(false)} />
        )}
      </div>
    </>
  );
}

export default App;
