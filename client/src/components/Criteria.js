import React, { useState, useEffect } from 'react';
import api from '../config/api';
import './Criteria.css';

function Criteria({ user }) {
  const [criteria, setCriteria] = useState({
    keywords: [],
    countries: [],
    cpvCodes: [],
    valueRange: { min: '', max: '' }
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [cpvInput, setCpvInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCriteria();
  }, []);

  const fetchCriteria = async () => {
    try {
      const token = localStorage.getItem('auth.token');
      const response = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.criteria) {
        setCriteria(response.data.criteria);
      }
    } catch (error) {
      console.error('Error fetching criteria:', error);
    }
  };

  const addKeyword = () => {
    if (keywordInput && !criteria.keywords.includes(keywordInput)) {
      setCriteria({ ...criteria, keywords: [...criteria.keywords, keywordInput] });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setCriteria({ ...criteria, keywords: criteria.keywords.filter(k => k !== keyword) });
  };

  const addCountry = () => {
    if (countryInput && !criteria.countries.includes(countryInput)) {
      setCriteria({ ...criteria, countries: [...criteria.countries, countryInput] });
      setCountryInput('');
    }
  };

  const removeCountry = (country) => {
    setCriteria({ ...criteria, countries: criteria.countries.filter(c => c !== country) });
  };

  const addCpv = () => {
    if (cpvInput && !criteria.cpvCodes.includes(cpvInput)) {
      setCriteria({ ...criteria, cpvCodes: [...criteria.cpvCodes, cpvInput] });
      setCpvInput('');
    }
  };

  const removeCpv = (cpv) => {
    setCriteria({ ...criteria, cpvCodes: criteria.cpvCodes.filter(c => c !== cpv) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('auth.token');
      await api.post('/users/criteria', { criteria }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Criteria saved successfully!');
    } catch (error) {
      setMessage('Error saving criteria: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="criteria-page">
      <h1>Filter Criteria</h1>
      
      {message && <div className={message.includes('Error') ? 'error' : 'success'}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="criteria-section">
          <h3>Keywords</h3>
          <div className="input-group">
            <input
              type="text"
              placeholder="Add keyword (e.g., construction, hospital)"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            />
            <button type="button" onClick={addKeyword}>Add</button>
          </div>
          <div className="tags">
            {criteria.keywords.map(keyword => (
              <span key={keyword} className="tag">
                {keyword}
                <button type="button" onClick={() => removeKeyword(keyword)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="criteria-section">
          <h3>Countries</h3>
          <div className="input-group">
            <select
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
            >
              <option value="">Select a country...</option>
              <option value="AUT">Austria (AUT)</option>
              <option value="BEL">Belgium (BEL)</option>
              <option value="BGR">Bulgaria (BGR)</option>
              <option value="HRV">Croatia (HRV)</option>
              <option value="CYP">Cyprus (CYP)</option>
              <option value="CZE">Czechia (CZE)</option>
              <option value="DNK">Denmark (DNK)</option>
              <option value="EST">Estonia (EST)</option>
              <option value="FIN">Finland (FIN)</option>
              <option value="FRA">France (FRA)</option>
              <option value="DEU">Germany (DEU)</option>
              <option value="GRC">Greece (GRC)</option>
              <option value="HUN">Hungary (HUN)</option>
              <option value="IRL">Ireland (IRL)</option>
              <option value="ITA">Italy (ITA)</option>
              <option value="LVA">Latvia (LVA)</option>
              <option value="LTU">Lithuania (LTU)</option>
              <option value="LUX">Luxembourg (LUX)</option>
              <option value="MLT">Malta (MLT)</option>
              <option value="NLD">Netherlands (NLD)</option>
              <option value="POL">Poland (POL)</option>
              <option value="PRT">Portugal (PRT)</option>
              <option value="ROU">Romania (ROU)</option>
              <option value="SVK">Slovakia (SVK)</option>
              <option value="SVN">Slovenia (SVN)</option>
              <option value="ESP">Spain (ESP)</option>
              <option value="SWE">Sweden (SWE)</option>
              <option value="NOR">Norway (NOR)</option>
              <option value="ISL">Iceland (ISL)</option>
              <option value="LIE">Liechtenstein (LIE)</option>
              <option value="CHE">Switzerland (CHE)</option>
              <option value="GBR">United Kingdom (GBR)</option>
            </select>
            <button type="button" onClick={addCountry}>Add</button>
          </div>
          <div className="tags">
            {criteria.countries.map(country => (
              <span key={country} className="tag">
                {country}
                <button type="button" onClick={() => removeCountry(country)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="criteria-section">
          <h3>CPV Codes</h3>
          <p className="help-text">Common Procurement Vocabulary codes classify the type of contract. You can use partial codes (e.g., "45" for all construction, "72" for all IT services)</p>
          <div className="input-group">
            <select
              value={cpvInput}
              onChange={(e) => setCpvInput(e.target.value)}
            >
              <option value="">Select a category or enter custom code...</option>
              <optgroup label="Construction">
                <option value="45000000">Construction work (45000000)</option>
                <option value="45200000">Works for complete construction (45200000)</option>
                <option value="45300000">Building installation work (45300000)</option>
              </optgroup>
              <optgroup label="IT & Telecommunications">
                <option value="72000000">IT services (72000000)</option>
                <option value="48000000">Software package (48000000)</option>
                <option value="32000000">IT equipment (32000000)</option>
              </optgroup>
              <optgroup label="Services">
                <option value="79000000">Business services (79000000)</option>
                <option value="80000000">Education services (80000000)</option>
                <option value="85000000">Health services (85000000)</option>
                <option value="90000000">Sewage, refuse, cleaning services (90000000)</option>
              </optgroup>
              <optgroup label="Supplies">
                <option value="33000000">Medical equipment (33000000)</option>
                <option value="34000000">Transport equipment (34000000)</option>
                <option value="15000000">Food, beverages (15000000)</option>
                <option value="39000000">Furniture (39000000)</option>
              </optgroup>
              <optgroup label="Works">
                <option value="45200000">Building construction (45200000)</option>
                <option value="45230000">Pipeline construction (45230000)</option>
                <option value="45240000">Water and sewage work (45240000)</option>
              </optgroup>
            </select>
            <button type="button" onClick={addCpv}>Add</button>
          </div>
          <div className="input-group" style={{marginTop: '8px'}}>
            <input
              type="text"
              placeholder="Or enter custom CPV code (e.g., 45000000)"
              value={cpvInput}
              onChange={(e) => setCpvInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCpv())}
            />
            <button type="button" onClick={addCpv}>Add</button>
          </div>
          <div className="tags">
            {criteria.cpvCodes.map(cpv => (
              <span key={cpv} className="tag">
                {cpv}
                <button type="button" onClick={() => removeCpv(cpv)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="criteria-section">
          <h3>Value Range (EUR)</h3>
          <div className="value-range">
            <input
              type="number"
              placeholder="Min value"
              value={criteria.valueRange.min}
              onChange={(e) => setCriteria({ ...criteria, valueRange: { ...criteria.valueRange, min: e.target.value } })}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max value"
              value={criteria.valueRange.max}
              onChange={(e) => setCriteria({ ...criteria, valueRange: { ...criteria.valueRange, max: e.target.value } })}
            />
          </div>
        </div>

        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Criteria'}
        </button>
      </form>
    </div>
  );
}

export default Criteria;
