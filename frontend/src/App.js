import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://100.55.171.79:3001';

function App() {
  const [destinations, setDestinations] = useState([]);
  const [country, setCountry] = useState('');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/destinations`);
      setDestinations(response.data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting country:", country);

    try {
      const res = await axios.post(`${API_URL}/api/destinations`, { country });
      console.log("Response:", res.data);

      setCountry('');
      fetchDestinations();
    } catch (error) {
      console.error('FULL ERROR:', error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to add destination");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/destinations/${id}`);
      fetchDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
    }
  };

  return (
    <div className="App">
      <h1>Dream Vacation Destinations</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Enter a country"
          required
        />
        <button type="submit">Add Destination</button>
      </form>

      <ul>
        {destinations.map((dest) => (
          <li key={dest.id}>
            <h3>{dest.country}</h3>
            <p>Capital: {dest.capital}</p>
            <p>Population: {dest.population.toLocaleString()}</p>
            <p>Region: {dest.region}</p>
            <button onClick={() => handleDelete(dest.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
