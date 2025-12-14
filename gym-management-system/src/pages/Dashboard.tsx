import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats] = useState({
    totalClients: 0,
    totalCoaches: 0,
    revenue: 0,
    expenses: 0
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleManageUsers = () => {
    navigate('/adduser');
  };

  const handleViewUsers = () => {
    navigate('/usergrid');
  };

  const handleCoachManagement = () => {
    navigate('/coaches');
  };

  const handlePackageManagement = () => {
    navigate('/packages');
  };

  const handleExpenseManagement = () => {
    navigate('/expenses');
  };

  const handlePaymentManagement = () => {
    navigate('/payments');
  };

  const handleRevenueReport = () => {
    navigate('/revenue');
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Sparta Admin Dashboard</h1>
        <p>Comprehensive gym management and analytics</p>
      </div>

      {/* Revenue Overview */}
      <div className="revenue-overview">
        <div className="revenue-card">
          <h3>Total Revenue</h3>
          <p className="revenue-amount">${stats.revenue.toLocaleString()}</p>
          <span className="revenue-label">This Month</span>
        </div>
        <div className="revenue-card">
          <h3>Total Expenses</h3>
          <p className="expense-amount">${stats.expenses.toLocaleString()}</p>
          <span className="revenue-label">This Month</span>
        </div>
        <div className="revenue-card">
          <h3>Net Profit</h3>
          <p className="profit-amount">${(stats.revenue - stats.expenses).toLocaleString()}</p>
          <span className="revenue-label">This Month</span>
        </div>
        <div className="revenue-card">
          <h3>Active Clients</h3>
          <p className="clients-count">{stats.totalClients}</p>
          <span className="revenue-label">Total Members</span>
        </div>
      </div>

      <div className="dashboard-cards">
        {/* Client Management */}
        <div className="dashboard-card" onClick={handleViewUsers} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="card-content">
            <h2>Client Management</h2>
            <p>Manage gym members and assign coaches</p>
            <div className="card-stats">
              <span className="stat-number">{stats.totalClients}</span>
              <span className="stat-label">Active Clients</span>
            </div>
          </div>
          <button className="card-button" onClick={(e) => { e.stopPropagation(); handleManageUsers(); }}>
            Add Client
          </button>
        </div>

        {/* Coach Management */}
        <div className="dashboard-card" onClick={handleCoachManagement} style={{ cursor: 'pointer' }}>
          <div className="card-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7" cy="7" r="1" fill="currentColor"/>
            </svg>
          </div>
          <div className="card-content">
            <h2>Coach Management</h2>
            <p>Register coaches and create login credentials</p>
            <div className="card-stats">
              <span className="stat-number">{stats.totalCoaches}</span>
              <span className="stat-label">Active Coaches</span>
            </div>
          </div>
          <button className="card-button" onClick={(e) => { e.stopPropagation(); handleCoachManagement(); }}>
            Manage Coaches
          </button>
        </div>

        {/* Package Management */}
        <div className="dashboard-card" onClick={handlePackageManagement} style={{ cursor: 'pointer' }}>
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h2>Package Management</h2>
            <p>Create and manage membership packages</p>
            <div className="card-stats">
              <span className="stat-label">Pricing & Features</span>
            </div>
          </div>
          <button className="card-button" onClick={(e) => { e.stopPropagation(); handlePackageManagement(); }}>
            Manage Packages
          </button>
        </div>

        {/* Expense Tracking */}
        <div className="dashboard-card" onClick={handleExpenseManagement} style={{ cursor: 'pointer' }}>
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h2>Expense Tracking</h2>
            <p>Record and monitor gym expenses</p>
            <div className="card-stats">
              <span className="stat-number">${stats.expenses.toLocaleString()}</span>
              <span className="stat-label">This Month</span>
            </div>
          </div>
          <button className="card-button" onClick={(e) => { e.stopPropagation(); handleExpenseManagement(); }}>
            Add Expense
          </button>
        </div>

        {/* Payment Management */}
        <div className="dashboard-card" onClick={handlePaymentManagement} style={{ cursor: 'pointer' }}>
          <div className="card-icon">💳</div>
          <div className="card-content">
            <h2>Payment Management</h2>
            <p>Track client payments by month</p>
            <div className="card-stats">
              <span className="stat-number">${stats.revenue.toLocaleString()}</span>
              <span className="stat-label">This Month</span>
            </div>
          </div>
          <button className="card-button" onClick={(e) => { e.stopPropagation(); handlePaymentManagement(); }}>
            Record Payment
          </button>
        </div>

        {/* Revenue Report */}
        <div className="dashboard-card" onClick={handleRevenueReport} style={{ cursor: 'pointer' }}>
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h2>Revenue Report</h2>
            <p>View detailed financial analysis</p>
            <div className="card-stats">
              <span className="stat-number">${(stats.revenue - stats.expenses).toLocaleString()}</span>
              <span className="stat-label">Net Profit</span>
            </div>
          </div>
          <button className="card-button" onClick={(e) => { e.stopPropagation(); handleRevenueReport(); }}>
            View Report
          </button>
        </div>
      </div>
    </div>
  )
}
