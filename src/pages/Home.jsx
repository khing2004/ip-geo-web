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
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* LEFT SIDEBAR: Controls & History */}
      <aside className="w-96 bg-white shadow-xl flex flex-col z-10">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white">
          <h1 className="text-xl font-bold tracking-tight">IP GEO Tracker</h1>
          <button 
            onClick={handleLogout}
            className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {/* Search Box */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search IP Address</label>
            <div className="flex gap-2">
              <input
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="e.g. 8.8.8.8"
                className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={handleSearch}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors text-sm"
              >
                Search
              </button>
              <button 
                onClick={handleClear}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Clear
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
          </section>

          {/* Result Card */}
          {geoData && (
            <section className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
              <h3 className="text-blue-800 font-bold text-sm uppercase tracking-wider mb-3">Geolocation Info</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between"><span className="text-gray-500">IP:</span> <span className="font-mono font-bold">{geoData.ip}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">City:</span> <span className="font-medium">{geoData.city}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Region:</span> <span className="font-medium">{geoData.region}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Country:</span> <span className="font-bold text-blue-600">{geoData.country}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">ISP:</span> <span className="text-xs text-right italic">{geoData.org}</span></p>
              </div>
            </section>
          )}

          {/* History List */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800">Search History</h3>
              {selectedIds.length > 0 && (
                <button 
                  onClick={deleteSelected}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Delete ({selectedIds.length})
                </button>
              )}
            </div>
            <ul className="space-y-2">
              {history.map((item) => (
                <li 
                  key={item.id} 
                  className="group flex items-center gap-3 p-3 bg-gray-50 hover:bg-white border border-transparent hover:border-blue-200 rounded-lg transition-all shadow-sm"
                >
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelect(item.id)} 
                  />
                  <div 
                    className="flex-grow cursor-pointer"
                    onClick={() => handleHistoryClick(item.ip_address)}
                  >
                    <p className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                      {item.ip_address}
                    </p>
                    <p className="text-xs text-gray-400">{item.city}, {item.country}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>

      {/* RIGHT MAIN AREA: Map */}
      <main className="flex-grow relative">
        {geoData ? (
          <div className="h-full w-full">
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={position}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold">{geoData.ip}</p>
                    <p className="text-xs">{geoData.city}, {geoData.country}</p>
                  </div>
                </Popup>
              </Marker>
              <RecenterMap coords={position} />
            </MapContainer>
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
            <p>Loading geolocation map...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
