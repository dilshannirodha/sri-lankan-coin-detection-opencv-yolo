import { useState } from "react";

const CoinDetector = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [totalValue, setTotalValue] = useState(null);
  const [coinCounts, setCoinCounts] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();

      // Merge rupee types
      const counts = {};
      for (const [key, value] of Object.entries(data.coins_detected || {})) {
        let displayKey = key;
        if (key === "1_rupee_1" || key === "1_rupee_2") {
          displayKey = "1 rupee";
        } else if (key === "2_rupee") {
          displayKey = "2 rupee";
        } else if (key.startsWith("5_rupee")) {
          displayKey = "5 rupee";
        } else if (key.startsWith("10_rupee")) {
          displayKey = "10 rupee";
        }
        counts[displayKey] = (counts[displayKey] || 0) + value;
      }

      setResultImage(data.image_path);
      setTotalValue(data.total_value);
      setCoinCounts(counts);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setResultImage(null);
    setTotalValue(null);
    setCoinCounts({});
  };

  const getTotalCoins = () => {
    return Object.values(coinCounts).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div
      className="flex flex-col min-h-screen p-6 bg-cover bg-center bg-gray-100"
      style={{ backgroundImage: 'url("/vecteezy.jpg")' }}
    >
      <div className="w-full flex flex-col md:flex-row gap-6 items-start justify-center">
        {/* Left: Upload Image Card */}
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Upload Image</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-[380px] h-auto mb-4 object-contain rounded-lg border border-gray-300 shadow-sm"
            />
          )}
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Processing..." : "Upload & Detect"}
            </button>
            <button
              onClick={handleClear}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Right: Detection Summary */}
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-bold mb-4 text-center text-gray-700">Detection Summary</h2>
          {resultImage && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Side: Image */}
                <div className="md:w-1/2">
                  <img
                    src={`http://localhost:5000/${resultImage}`}
                    alt="Detected Coins"
                    className="w-full h-auto rounded border border-gray-300 object-contain"
                  />
                </div>

                {/* Right Side: Breakdown */}
                <div className="md:w-1/2 flex flex-col justify-center">
                  <h4 className="text-lg font-semibold mb-3 text-gray-700">Detected Coins</h4>
                  <ul className="list-disc list-inside text-sm mb-4 text-gray-800">
                    {Object.entries(coinCounts).map(([coin, count]) => (
                      <li key={coin}>
                        {coin} — {count}
                      </li>
                    ))}
                  </ul>
                  <div className="text-base font-medium text-gray-700 mt-2">
                    Total Coins Detected:{" "}
                    <span className="font-bold">{getTotalCoins()}</span>
                  </div>
                  <div className="text-lg font-semibold text-green-600 mt-1">
                    Total Value: {totalValue} LKR
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoinDetector;
