import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
// helper function flies map to new coordinates
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 13);
  }, [coords]);
  return null;
}



const TOKEN = import.meta.env.VITE_IPINFO_TOKEN;

function Home() {
  const [ip, setIp] = useState("");
  const [geoData, setGeoData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);

  // load logged user IP on first load
  useEffect(() => {
    fetchLoggedUserIP();
    loadHistory();
  }, []);


  const loadHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };
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
      
      //save to db
      const token = localStorage.getItem("token");
      await api.post("/history", {
        ip_address: res.data.ip,
        city: res.data.city,
        region: res.data.region,
        country: res.data.country,
        location: res.data.loc
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      loadHistory();
      setIp("");
    } catch (err) {
      setError("Search failed. IP not found.");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };
  
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete("/history", {
        data: { ids: selectedIds },
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedIds([]); 
      loadHistory();     
    } catch (err) {
      alert("Delete failed.");
    }
  };

  // turning lat, lng strings into [lat, lang] numbers
  const getCoords = () => {
    if (!geoData || !geoData.loc) return [14.5995, 120.9842]; //manila coordinates
    return geoData.loc.split(',').map(Number);
  };

  const position = getCoords();

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
      <p>The IP Coordinates w/ names are clickable.</p>
      {selectedIds.length > 0 && (
        <button onClick={deleteSelected} style={{ marginBottom: "10px", color: "red" }}>
          Delete Selected ({selectedIds.length})
        </button>
      )}
      <ul>
        {history.map((item) => (
          <li key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input 
              type="checkbox" 
              checked={selectedIds.includes(item.id)}
              onChange={() => toggleSelect(item.id)} 
            />
            <span
              style={{ cursor: "pointer", color: "blue" }}
              onClick={() => handleHistoryClick(item.ip_address)}
            >
              {item.ip_address} - {item.city}
            </span>
          </li>
        ))}
      </ul>
      <button 
        onClick={handleLogout} 
        style={{ backgroundColor: "#ff4d4d", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer" }}
      >
        Logout
      </button>
      {/* THE MAP SECTION */}
      <div style={{ flex: 1, height: '500px', border: '1px solid #ccc' }}>
        {geoData && (
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
              <Popup>
                {geoData.ip} <br /> {geoData.city}, {geoData.country}
              </Popup>
            </Marker>
            <RecenterMap coords={position} />
          </MapContainer>
        )}
      </div>
    </div>    
  );
}

export default Home;
