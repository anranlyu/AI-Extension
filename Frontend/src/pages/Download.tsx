import { Link } from 'react-router-dom';

function Download() {
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
          <div className="w-full max-w-4xl mx-auto text-center mt-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Download LumiRead
            </h1>
            <p className="text-gray-700 mx-auto mb-8">
              Get the LumiRead Chrome extension and start enjoying a more
              accessible browsing experience today!
            </p>

            {/* Download Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Chrome Extension
              </h2>
              <p className="text-gray-700 mb-6">
                LumiRead is currently available as a developer version while we
                await approval from the Chrome Web Store.
              </p>
              <a
                href="https://chromewebstore.google.com/detail/lumiread/efaokfmfhikkofofjdcplbnolpgklcic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md shadow-md transition duration-200 ease-in-out mb-6"
              >
                Install from Chrome Web Store
              </a>
            </div>

            {/* Installation Instructions */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Installation Instructions
              </h2>
              <div className="text-left">
                <ol className="list-decimal pl-6 space-y-4 text-gray-700">
                  <li>
                    <span className="font-medium">
                      Extract the downloaded ZIP file
                    </span>{' '}
                    to a folder on your computer.
                  </li>
                  <li>
                    <span className="font-medium">Open Chrome</span> and
                    navigate to{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      chrome://extensions
                    </code>
                    .
                  </li>
                  <li>
                    <span className="font-medium">Enable "Developer mode"</span>{' '}
                    by toggling the switch in the top-right corner.
                  </li>
                  <li>
                    <span className="font-medium">Click "Load unpacked"</span>{' '}
                    and select the folder where you extracted the ZIP file.
                  </li>
                  <li>
                    <span className="font-medium">That's it!</span> The LumiRead
                    extension should now appear in your extensions list and be
                    ready to use.
                  </li>
                </ol>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Troubleshooting
              </h2>
              <p className="text-gray-700 mb-4">
                Having issues with the installation? Here are some common
                solutions:
              </p>
              <ul className="text-left list-disc pl-6 space-y-2 text-gray-700">
                <li>Make sure you've enabled Developer mode in Chrome.</li>
                <li>Try restarting Chrome after installation.</li>
                <li>
                  If the extension doesn't appear, try extracting the ZIP file
                  again and loading it as an unpacked extension.
                </li>
                <li>
                  Check that you selected the correct folder containing the
                  manifest.json file when loading the extension.
                </li>
              </ul>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white py-4 shadow-inner w-full mt-16">
          <div className="max-w-9/10 mx-auto text-gray-500 text-sm flex justify-between px-4">
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

export default Download;
