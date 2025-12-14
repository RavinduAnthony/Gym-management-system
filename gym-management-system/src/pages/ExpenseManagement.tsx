import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import '../styles/ExpenseManagement.css';

interface Expense {
  _id?: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  month: number;
  year: number;
  addedBy?: {
    name: string;
  };
}

export default function ExpenseManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [totalExpenses, setTotalExpenses] = useState(0);

  const [formData, setFormData] = useState<Expense>({
    category: 'equipment',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const categories = ['equipment', 'maintenance', 'utilities', 'salaries', 'rent', 'supplies', 'other'];
  const months = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
    { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
    { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' }
  ];

  useEffect(() => {
    fetchExpenses();
  }, [filterMonth, filterYear, filterCategory]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/expenses?';
      if (filterMonth) url += `month=${filterMonth}&`;
      if (filterYear) url += `year=${filterYear}&`;
      if (filterCategory) url += `category=${filterCategory}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setExpenses(data.data.expenses || []);
        const total = (data.data.expenses || []).reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
        setTotalExpenses(total);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
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
      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setAlert({ type: 'success', message: 'Expense added successfully' });
        setShowForm(false);
        resetForm();
        fetchExpenses();
      } else {
        setAlert({ type: 'error', message: data.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to add expense' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setAlert({ type: 'success', message: 'Expense deleted successfully' });
        fetchExpenses();
      } else {
        setAlert({ type: 'error', message: data.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to delete expense' });
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'equipment',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
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

  if (loading) return <Loader />;

  return (
    <div className="expense-management-container">
      <button className="home-icon-button" onClick={() => navigate('/')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="expense-header">
        <h1>Expense Management</h1>
        <p>Track and manage gym expenses</p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="expense-summary">
        <div className="summary-card">
          <span className="summary-label">Total Expenses</span>
          <span className="summary-amount">${totalExpenses.toFixed(2)}</span>
        </div>
      </div>

      <div className="expense-controls">
        <div className="filters">
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="">All Months</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Expense'}
        </button>
      </div>

      {showForm && (
        <div className="expense-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="expense-form-container" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Expense</h2>
            <form onSubmit={handleSubmit} className="expense-form">
            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required>
                  {categories.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
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
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Expense details..."
                rows={3}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Add Expense</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
          </div>
        </div>
      )}

      <div className="expenses-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Added By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>
                  <span className="category-badge" style={{ backgroundColor: getCategoryColor(expense.category) }}>
                    {expense.category}
                  </span>
                </td>
                <td>{expense.description}</td>
                <td className="amount-cell">${expense.amount.toFixed(2)}</td>
                <td>{expense.addedBy?.name || 'N/A'}</td>
                <td>
                  <button className="btn-delete-small" onClick={() => handleDelete(expense._id!)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {expenses.length === 0 && (
          <div className="no-expenses">
            <p>No expenses found for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
