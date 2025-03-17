import { Link } from 'react-router-dom';

function App() {
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
          <div className="w-full text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to LumiRead!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              You have successfully signed up.
            </p>
          </div>
        </main>
        {/* Footer */}
        <footer className="bg-white py-4 shadow-inner w-full">
          <div className="max-w-9/10 mx-auto  text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} LumiRead. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
