import { useState } from "react";
import viteLogo from "/vite.svg";
import reactLogo from "./assets/react.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center min-w-screen">
      <div className="text-center">
        <div className="flex justify-center space-x-8 mb-8">
          <a
            href="https://vite.dev"
            target="_blank"
            className="transition-transform hover:scale-110"
            rel="noopener"
          >
            <img src={viteLogo} className="h-24 w-24" alt="Vite logo" />
          </a>
          <a
            href="https://react.dev"
            target="_blank"
            className="transition-transform hover:scale-110"
            rel="noopener"
          >
            <img
              src={reactLogo}
              className="h-24 w-24 animate-spin-slow"
              alt="React logo"
            />
          </a>
        </div>
        <h1 className="text-5xl font-bold mb-8">Vite + React</h1>
        <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setCount((count) => count + 1)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 mb-4 cursor-pointer"
          >
            count is {count}
          </button>
          <p className="text-gray-300">
            Edit{" "}
            <code className="bg-gray-700 px-2 py-1 rounded text-sm">
              src/App.tsx
            </code>{" "}
            and save to test HMR
          </p>
        </div>
        <p className="mt-8 text-gray-400">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  );
}

export default App;
