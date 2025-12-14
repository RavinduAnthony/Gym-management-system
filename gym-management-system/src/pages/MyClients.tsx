import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import '../styles/MyClients.css';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  membershipStartDate: string;
  membershipEndDate: string;
  membershipType: string;
}

export default function MyClients() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMyClients();
  }, []);

  const fetchMyClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`http://localhost:5000/api/users/coach/${user._id}/clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setClients(data.data.clients || []);
      } else {
        setAlert({ type: 'error', message: data.message });
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setAlert({ type: 'error', message: 'Failed to fetch clients' });
    } finally {
      setLoading(false);
    }
  };

  const getPackageBadgeClass = (packageType: string) => {
    const type = packageType?.toLowerCase() || 'basic';
    return `package-badge ${type}`;
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isActiveMembership = (endDate: string) => {
    return new Date(endDate) > new Date();
  };

  if (loading) return <Loader />;

  return (
    <div className="my-clients-container">
      <button className="home-icon-button" onClick={() => navigate('/')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="clients-header">
        <h1>My Clients</h1>
        <p>Manage your assigned clients</p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="clients-stats">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div className="stat-info">
            <span className="stat-value">{clients.length}</span>
            <span className="stat-label">Total Clients</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-value">
              {clients.filter(c => isActiveMembership(c.membershipEndDate)).length}
            </span>
            <span className="stat-label">Active Memberships</span>
          </div>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search clients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="clients-table-container">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Package</th>
              <th>Membership Start</th>
              <th>Membership End</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client._id}>
                <td className="client-name-cell">{client.name}</td>
                <td className="client-email-cell">{client.email}</td>
                <td>{client.phone}</td>
                <td>
                  <span className={getPackageBadgeClass(client.membershipType)}>
                    {client.membershipType || 'Basic'}
                  </span>
                </td>
                <td>{new Date(client.membershipStartDate).toLocaleDateString()}</td>
                <td>{new Date(client.membershipEndDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${isActiveMembership(client.membershipEndDate) ? 'active' : 'expired'}`}>
                    {isActiveMembership(client.membershipEndDate) ? 'Active' : 'Expired'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClients.length === 0 && (
          <div className="no-clients">
            <p>{searchTerm ? 'No clients match your search.' : 'No clients assigned yet.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
