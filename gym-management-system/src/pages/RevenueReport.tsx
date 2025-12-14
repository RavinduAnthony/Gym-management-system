import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import '../styles/RevenueReport.css';

interface RevenueData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueBreakdown: {
    _id: string;
    totalAmount: number;
  }[];
  expenseBreakdown: {
    _id: string;
    totalAmount: number;
  }[];
}

export default function RevenueReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);

  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
    { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  useEffect(() => {
    fetchRevenueData();
  }, [selectedMonth, selectedYear]);

  const fetchRevenueData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/payments/revenue?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        setRevenueData(data.data);
      } else {
        setAlert({ type: 'error', message: data.message });
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setAlert({ type: 'error', message: 'Failed to fetch revenue data' });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      equipment: '#3b82f6',
      maintenance: '#f59e0b',
      utilities: '#10b981',
      salaries: '#8b5cf6',
      rent: '#ef4444',
      supplies: '#06b6d4',
      other: '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      cash: '#10b981',
      card: '#3b82f6',
      bank_transfer: '#8b5cf6'
    };
    return colors[method] || '#6b7280';
  };

  if (loading) return <Loader />;

  return (
    <div className="revenue-report-container">
      <button className="home-icon-button" onClick={() => navigate('/')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="revenue-header">
        <h1>Revenue Report</h1>
        <p>Financial overview and analytics</p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="period-selector">
        <div className="selector-group">
          <label>Month</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div className="selector-group">
          <label>Year</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {revenueData && (
        <>
          <div className="financial-summary">
            <div className="summary-card revenue-card">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <span className="card-label">Total Revenue</span>
                <span className="card-amount revenue-amount">${revenueData.totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-card expense-card">
              <div className="card-icon">💸</div>
              <div className="card-content">
                <span className="card-label">Total Expenses</span>
                <span className="card-amount expense-amount">${revenueData.totalExpenses.toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-card profit-card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <span className="card-label">Net Profit</span>
                <span className={`card-amount ${revenueData.netProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                  ${revenueData.netProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="breakdown-section">
            <div className="breakdown-card">
              <h2>💳 Revenue Breakdown by Payment Method</h2>
              <div className="breakdown-items">
                {revenueData.revenueBreakdown.length > 0 ? (
                  revenueData.revenueBreakdown.map((item) => (
                    <div key={item._id} className="breakdown-item">
                      <div className="item-info">
                        <span 
                          className="item-badge" 
                          style={{ backgroundColor: getPaymentMethodColor(item._id) }}
                        >
                          {item._id.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="item-amount">${item.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="item-bar">
                        <div 
                          className="item-bar-fill" 
                          style={{ 
                            width: `${(item.totalAmount / revenueData.totalRevenue) * 100}%`,
                            backgroundColor: getPaymentMethodColor(item._id)
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No revenue data for this period</p>
                )}
              </div>
            </div>

            <div className="breakdown-card">
              <h2>🏷️ Expense Breakdown by Category</h2>
              <div className="breakdown-items">
                {revenueData.expenseBreakdown.length > 0 ? (
                  revenueData.expenseBreakdown.map((item) => (
                    <div key={item._id} className="breakdown-item">
                      <div className="item-info">
                        <span 
                          className="item-badge" 
                          style={{ backgroundColor: getCategoryColor(item._id) }}
                        >
                          {item._id.toUpperCase()}
                        </span>
                        <span className="item-amount">${item.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="item-bar">
                        <div 
                          className="item-bar-fill" 
                          style={{ 
                            width: `${(item.totalAmount / revenueData.totalExpenses) * 100}%`,
                            backgroundColor: getCategoryColor(item._id)
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No expense data for this period</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {!revenueData && (
        <div className="no-data-message">
          <p>Loading revenue data...</p>
        </div>
      )}
    </div>
  );
}
