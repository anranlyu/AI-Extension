import React, { useState } from 'react';

const LLMSelector: React.FC = () => {
  const [selectedLLM, setSelectedLLM] = useState<string>('deepseek'); // Default to DeepSeek
  const [apiKey, setApiKey] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    chrome.storage.local.set({ llm: selectedLLM, apiKey }, () => {
      console.log('LLM and API key saved to local storage');
    });
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md w-xs">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropdown for LLM selection */}
        <div>
          <label
            htmlFor="llm-select"
            className="block text-sm font-medium text-gray-700"
          >
            Choose LLM
          </label>
          <select
            id="llm-select"
            value={selectedLLM}
            onChange={(e) => setSelectedLLM(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="deepseek">DeepSeek</option>
            <option value="chatgpt">ChatGPT</option>
          </select>
        </div>

        {/* Input for API key */}
        <div>
          <label
            htmlFor="api-key"
            className="block text-sm font-medium text-gray-700"
          >
            API Key
          </label>
          <input
            id="api-key"
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your API key"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default LLMSelector;
