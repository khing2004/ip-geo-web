import { useEffect, useState } from "react";
import axios from "axios";

const TOKEN = import.meta.env.VITE_IPINFO_TOKEN;

function Home() {
  const [ip, setIp] = useState("");
  const [geoData, setGeoData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  // Load logged user IP on first load
  useEffect(() => {
    fetchLoggedUserIP();
  }, []);

  const fetchLoggedUserIP = async () => {
    try {
        const res = await axios.get(`https://ipinfo.io/geo?token=${TOKEN}`);
        setGeoData(res.data);
    }  catch (err) {
      setError("Failed to load IP info.");
    }
  } 
  ;

  const handleSearch = async () => {
    setError("");

    if (!isValidIP(ip)) {
      setError("Invalid IP address format.");
      return;
    }

    try {
      const res = await axios.get(`https://ipinfo.io/${ip}?token=${TOKEN}`);

      setGeoData(res.data);

      // Add to history
      setHistory(prev => [...prev, ip]);

      setIp("");
    } catch (err) {
      setError("IP not found.");
    }
  };

  const handleClear = () => {
    setIp("");
    setError("");
    fetchLoggedUserIP();
  };

  const handleHistoryClick = async (selectedIp) => {
    const res = await axios.get(`https://ipinfo.io/${selectedIp}/geo`);
    setGeoData(res.data);
  };

  const isValidIP = (ip) => {
    const regex =
      /^(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)$/;

    return regex.test(ip);
  };

  return (
    <div>
      <h2>IP Geolocation</h2>

      <input
        value={ip}
        onChange={(e) => setIp(e.target.value)}
        placeholder="Enter IP address"
      />

      <button onClick={handleSearch}>Search</button>
      <button onClick={handleClear}>Clear</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

        {geoData && (
            <div style={{ marginTop: "20px" }}>
            <h3>Geolocation Info</h3>
            <p><strong>IP:</strong> {geoData.ip}</p>
            <p><strong>City:</strong> {geoData.city}</p>
            <p><strong>Region:</strong> {geoData.region}</p>
            <p><strong>Country:</strong> {geoData.country}</p>
            <p><strong>Location (Lat,Lng):</strong> {geoData.loc}</p>
            <p><strong>Timezone:</strong> {geoData.timezone}</p>
            <p><strong>ISP:</strong> {geoData.org}</p>
        </div>
      )}

      <h3>Search History</h3>
      <ul>
        {history.map((item, index) => (
          <li key={index}>
            <span
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => handleHistoryClick(item)}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
