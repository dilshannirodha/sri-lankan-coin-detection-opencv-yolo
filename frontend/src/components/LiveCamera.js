import React, { useState, useEffect } from 'react';

const LiveCamera = () => {
  const [totalSum, setTotalSum] = useState(0);

  useEffect(() => {
    const fetchCoinSum = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/get_coin_sum");
        const data = await response.json();
        setTotalSum(data.total);
      } catch (error) {
        console.error("Error fetching coin sum:", error);
      }
    };

    const interval = setInterval(fetchCoinSum, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-3">Live Coin Scanner</h2>
      <img
        src="http://127.0.0.1:5000/video_feed"
        className="border rounded-lg shadow-lg w-full max-w-lg"
        alt="Live Coin Feed"
      />
      <div className="mt-4 text-lg font-semibold text-blue-600">
        Total Sum: {totalSum} LKR
      </div>
    </div>
  );
};

export default LiveCamera;