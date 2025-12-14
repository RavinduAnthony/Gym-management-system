import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import '../styles/PaymentManagement.css';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Payment {
  _id?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  paymentDate: string;
  paymentMonth: number;
  paymentYear: number;
  paymentMethod: string;
  status: string;
  notes?: string;
  addedBy?: {
    name: string;
  };
}

export default function PaymentManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [formData, setFormData] = useState({
    userId: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMonth: new Date().getMonth() + 1,
    paymentYear: new Date().getFullYear(),
    paymentMethod: 'cash',
    status: 'paid',
    notes: ''
  });

  const paymentMethods = ['cash', 'card', 'bank_transfer'];
  const statuses = ['paid', 'pending', 'overdue'];
  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
    { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  useEffect(() => {
    fetchPayments();
    fetchUsers();
  }, [filterMonth, filterYear, filterStatus]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/payments?';
      if (filterMonth) url += `month=${filterMonth}&`;
      if (filterYear) url += `year=${filterYear}&`;
      if (filterStatus) url += `status=${filterStatus}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPayments(data.data.payments || []);
        const total = (data.data.payments || []).reduce((sum: number, pay: Payment) => sum + pay.amount, 0);
        setTotalRevenue(total);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'paymentMonth' || name === 'paymentYear' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setAlert({ type: 'error', message: 'Please login first' });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setAlert({ type: 'success', message: 'Payment recorded successfully' });
        setShowForm(false);
        resetForm();
        fetchPayments();
      } else {
        setAlert({ type: 'error', message: data.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to record payment' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/payments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setAlert({ type: 'success', message: 'Payment deleted successfully' });
        fetchPayments();
      } else {
        setAlert({ type: 'error', message: data.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to delete payment' });
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMonth: new Date().getMonth() + 1,
      paymentYear: new Date().getFullYear(),
      paymentMethod: 'cash',
      status: 'paid',
      notes: ''
    });
  };

  const getMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      cash: '#10b981',
      card: '#3b82f6',
      bank_transfer: '#8b5cf6'
    };
    return colors[method] || '#6b7280';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      paid: '#10b981',
      pending: '#f59e0b',
      overdue: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) return <Loader />;

  return (
    <div className="payment-management-container">
      <button className="home-icon-button" onClick={() => navigate('/')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="payment-header">
        <h1>Payment Management</h1>
        <p>Record and track client payments</p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="payment-summary">
        <div className="summary-card">
          <span className="summary-label">Total Revenue</span>
          <span className="summary-amount">${totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      <div className="payment-controls">
        <div className="filters">
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="">All Months</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Record Payment'}
        </button>
      </div>

      {showForm && (
        <div className="payment-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="payment-form-container" onClick={(e) => e.stopPropagation()}>
            <h2>Record New Payment</h2>
            <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-row">
              <div className="form-group">
                <label>Client *</label>
                <select name="userId" value={formData.userId} onChange={handleInputChange} required>
                  <option value="">Select Client</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount ($) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Payment Month *</label>
                <select name="paymentMonth" value={formData.paymentMonth} onChange={handleInputChange} required>
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Payment Year *</label>
                <input
                  type="number"
                  name="paymentYear"
                  value={formData.paymentYear}
                  onChange={handleInputChange}
                  min="2020"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Payment Method *</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} required>
                  {paymentMethods.map(m => (
                    <option key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select name="status" value={formData.status} onChange={handleInputChange} required>
                  {statuses.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Record Payment</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
          </div>
        </div>
      )}

      <div className="payments-table">
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Month/Year</th>
              <th>Method</th>
              <th>Status</th>
              <th>Added By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td>
                  <div className="client-info">
                    <div className="client-name">{payment.userId?.name || 'N/A'}</div>
                    <div className="client-email">{payment.userId?.email || 'N/A'}</div>
                  </div>
                </td>
                <td className="amount-cell">${payment.amount.toFixed(2)}</td>
                <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                <td>{months.find(m => m.value === payment.paymentMonth.toString())?.label} {payment.paymentYear}</td>
                <td>
                  <span className="method-badge" style={{ backgroundColor: getMethodColor(payment.paymentMethod) }}>
                    {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(payment.status) }}>
                    {payment.status.toUpperCase()}
                  </span>
                </td>
                <td>{payment.addedBy?.name || 'N/A'}</td>
                <td>
                  <button className="btn-delete-small" onClick={() => handleDelete(payment._id!)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && (
          <div className="no-payments">
            <p>No payments found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
