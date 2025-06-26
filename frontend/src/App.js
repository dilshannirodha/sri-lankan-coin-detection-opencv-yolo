import './App.css';
import CoinDetector from './components/CoinDetector';

function App() {
  return (
    <div
      className="App p-4 bg-cover bg-center min-h-screen"
      style={{ backgroundImage: 'url("/vecteezy.jpg")' }}
    >
      <h1 className="text-2xl font-bold text-center mb-6 bg-white bg-opacity-70 p-2 rounded">
        Automated Recognition and Classification of Sri Lankan Coins
      </h1>
      <CoinDetector />
    </div>
  );
}

export default App;
