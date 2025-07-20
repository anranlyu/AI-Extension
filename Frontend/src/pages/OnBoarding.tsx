import { Link } from 'react-router-dom';
import { useState } from 'react';

function OnBoarding() {
  const [onboardingStep, setOnboardingStep] = useState(1);

  const handleNextStep = () => {
    setOnboardingStep(2);
  };

  const handleFinish = () => {
    window.close();
    // Note: This might not work in all browsers due to security restrictions
    // if the window wasn't opened by a script.
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-9/10 mx-auto py-3 px-4 flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <img src="/icon.png" alt="LumiRead Logo" className="h-10 mr-2" />
              <span className="text-2xl font-semibold text-gray-800">
                LumiRead
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          {/* Card */}
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            {onboardingStep === 1 && (
              <>
                {/* Step 1: Left Column */}
                <div className="flex flex-col justify-between">
                  <h1 className="text-3xl font-bold text-gray-800">
                    Welcome to LumiRead!
                  </h1>
                  <p className="text-gray-600">
                    1. First lets pin LumiRead so you can find it easily.
                  </p>
                  <button
                    onClick={handleNextStep}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-fit"
                  >
                    Next Step
                  </button>
                </div>
                {/* Step 1: Right Column (GIF) */}
                <div className="flex justify-center items-center">
                  <img
                    src="../pin-lumiread.gif"
                    alt="Feature demonstration GIF"
                    className="rounded-lg"
                  />
                </div>
              </>
            )}

            {onboardingStep === 2 && (
              <>
                {/* Step 2: Left Column */}
                <div className="flex flex-col justify-between">
                  <h1 className="text-3xl font-bold text-gray-800">
                    Quick tutorial on how to use LumiRead.
                  </h1>
                  <p className="text-gray-600">
                    2. Check out the video to learn how to use LumiRead.
                  </p>
                  <button
                    onClick={handleFinish}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-fit"
                  >
                    Finish
                  </button>
                </div>
                {/* Step 2: Right Column (YouTube Video) */}
                <div className="flex justify-center items-center">
                  <iframe
                    width="560"
                    height="315"
                    src="https://www.youtube.com/embed/S7PxYuhy9XE"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
              </>
            )}
          </div>
        </main>
        {/* Footer */}
        <footer className="bg-white py-4 shadow-inner w-full">
          <div className="max-w-9/10 mx-auto  text-gray-500 text-smflex flex justify-between">
            <Link to="/privacy">Privacy</Link>
            <p>
              &copy; {new Date().getFullYear()} LumiRead. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default OnBoarding;
