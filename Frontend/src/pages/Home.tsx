import { Link } from 'react-router-dom';

function Home() {
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
            <nav>
              <a
                href="https://chromewebstore.google.com/detail/lumiread/efaokfmfhikkofofjdcplbnolpgklcic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Download
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full text-center mt-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to LumiRead!
            </h1>
            <p className="text-gray-700 max-w-4xl mx-auto mb-8">
              LumiRead is an inclusive, user-focused tool built to make the
              internet more accessible for everyone. By working closely with the
              visually impaired community, we continually refine our features to
              ensure a smoother, more intuitive reading experience. We're
              excited to share that LumiRead is available on the Chrome Web
              Store, bringing next-level accessibility to users.
            </p>

            {/* Demo Video Section (YouTube) */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="relative w-full overflow-hidden rounded-md shadow-lg pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/wYLb1vnIcyQ"
                  title="YouTube demo video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Feature Introduction Section */}
            <div className="max-w-5xl mx-auto mb-16 px-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-8">
                Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature Card 1: Smart Read Mode */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Smart Read Mode
                  </h3>
                  <p className="text-gray-700">
                    Extracts key info from any page, removing distractions for a
                    cleaner reading experience.
                  </p>
                </div>

                {/* Feature Card 2: Adaptive Reading Level */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Adaptive Reading Level
                  </h3>
                  <p className="text-gray-700">
                    Uses AI to rewrite text at your chosen difficulty, ensuring
                    content is always accessible.
                  </p>
                </div>

                {/* Feature Card 3: Dyslexia-Friendly Font */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Dyslexia-Friendly Font
                  </h3>
                  <p className="text-gray-700">
                    Switch instantly to a dyslexia-friendly typeface to improve
                    readability and reduce eye strain.
                  </p>
                </div>

                {/* Feature Card 4: Cursor Highlight */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Cursor Highlight
                  </h3>
                  <p className="text-gray-700">
                    Track your current line effortlessly with a subtle highlight
                    that follows your cursor.
                  </p>
                </div>

                {/* Feature Card 5: Human-Like Text-to-Speech */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    Human-Like Text-to-Speech
                  </h3>
                  <p className="text-gray-700">
                    Listen to text in natural, human-like voices—perfect for
                    multitasking or boosting accessibility.
                  </p>
                </div>

                {/* Feature Card 6: AI Translation */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold mb-2">AI Translation</h3>
                  <p className="text-gray-700">
                    Instantly translate webpage content with AI, maintaining
                    clarity and context across languages.
                  </p>
                </div>
              </div>
            </div>

            {/* Download CTA */}
            <div className="max-w-5xl mx-auto mb-16 px-4">
              <a
                href="https://chromewebstore.google.com/detail/lumiread/efaokfmfhikkofofjdcplbnolpgklcic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-md shadow-md transition duration-200 ease-in-out text-xl"
              >
                Download LumiRead Now
              </a>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white py-4 shadow-inner w-full">
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

export default Home;
