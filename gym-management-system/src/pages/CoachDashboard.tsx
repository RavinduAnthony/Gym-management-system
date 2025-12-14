import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import '../styles/CoachDashboard.css';

interface Client {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  packageType: string;
}

export default function CoachDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignedClients] = useState<Client[]>([]);
  const [stats] = useState({
    totalClients: 0,
    expensesAdded: 0,
    paymentsRecorded: 0
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleAddExpense = () => {
    navigate('/expenses');
  };

  const handleRecordPayment = () => {
    navigate('/payments');
  };

  const handleViewClients = () => {
    navigate('/my-clients');
  };

  if (loading) return <Loader />;

  return (
    <div className="coach-dashboard-container">
      <div className="dashboard-header">
        <h1>Coach Dashboard</h1>
        <p>Manage your clients and track activities</p>
      </div>

      {/* Coach Stats */}
      <div className="coach-stats">
        <div className="stat-card">
          <h3>My Clients</h3>
          <p className="stat-number">{stats.totalClients}</p>
          <span className="stat-label">Assigned to You</span>
        </div>
        <div className="stat-card">
          <h3>Expenses Added</h3>
          <p className="stat-number">{stats.expensesAdded}</p>
          <span className="stat-label">This Month</span>
        </div>
        <div className="stat-card">
          <h3>Payments Recorded</h3>
          <p className="stat-number">{stats.paymentsRecorded}</p>
          <span className="stat-label">This Month</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="coach-actions">
        <div className="action-card" onClick={handleViewClients} style={{ cursor: 'pointer' }}>
          <div className="action-icon">👥</div>
          <div className="action-content">
            <h2>My Clients</h2>
            <p>View and manage your assigned clients</p>
          </div>
          <button className="action-button" onClick={(e) => { e.stopPropagation(); handleViewClients(); }}>
            View Clients
          </button>
        </div>

        <div className="action-card" onClick={handleAddExpense} style={{ cursor: 'pointer' }}>
          <div className="action-icon">💰</div>
          <div className="action-content">
            <h2>Add Expense</h2>
            <p>Record expenses related to this month</p>
          </div>
          <button className="action-button" onClick={(e) => { e.stopPropagation(); handleAddExpense(); }}>
            Add Expense
          </button>
        </div>

        <div className="action-card" onClick={handleRecordPayment} style={{ cursor: 'pointer' }}>
          <div className="action-icon">💳</div>
          <div className="action-content">
            <h2>Record Payment</h2>
            <p>Add client payment details</p>
          </div>
          <button className="action-button" onClick={(e) => { e.stopPropagation(); handleRecordPayment(); }}>
            Record Payment
          </button>
        </div>
      </div>

      {/* Recent Clients */}
      <div className="recent-clients">
        <h2>Recently Assigned Clients</h2>
        {assignedClients.length === 0 ? (
          <p className="no-clients">No clients assigned yet</p>
        ) : (
          <div className="clients-list">
            {assignedClients.slice(0, 5).map((client, index) => (
              <div key={index} className="client-item">
                <div className="client-info">
                  <h3>{client.firstName} {client.lastName}</h3>
                  <p>{client.email}</p>
                </div>
                <div className="client-package">
                  <span className={`package-badge ${client.packageType}`}>
                    {client.packageType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Home Button */}
      <button className="home-icon-button" onClick={() => navigate('/')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
