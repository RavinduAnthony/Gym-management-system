import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import '../styles/CoachManagement.css';

interface Coach {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  specialization: string;
  experience: string;
  role: string;
  assignedClients?: any[];
}

export default function CoachManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const [formData, setFormData] = useState<Coach>({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    experience: '',
    role: 'coach'
  });

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/coaches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCoaches(data.data.coaches || []);
      }
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const url = editingCoach 
        ? `http://localhost:5000/api/users/${editingCoach._id}`
        : 'http://localhost:5000/api/auth/register';

      const payload = editingCoach 
        ? { ...formData, password: undefined } // Don't send password on update
        : formData;

      const response = await fetch(url, {
        method: editingCoach ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setAlert({ type: 'success', message: data.message });
        setShowForm(false);
        setEditingCoach(null);
        resetForm();
        fetchCoaches();
      } else {
        setAlert({ type: 'error', message: data.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to save coach' });
    }
  };

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach);
    setFormData({ ...coach, password: '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coach?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setAlert({ type: 'success', message: 'Coach deleted successfully' });
        fetchCoaches();
      } else {
        setAlert({ type: 'error', message: data.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to delete coach' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      experience: '',
      role: 'coach'
    });
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingCoach(null);
    resetForm();
  };

  if (loading) return <Loader />;

  return (
    <div className="coach-management-container">
      <button className="home-icon-button" onClick={() => navigate('/')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="coach-header">
        <h1>Coach Management</h1>
        <p>Manage gym coaches and trainers</p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="coach-actions">
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Coach'}
        </button>
      </div>

      {showForm && (
        <div className="coach-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="coach-form-container" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCoach ? 'Edit Coach' : 'Add New Coach'}</h2>
            <form onSubmit={handleSubmit} className="coach-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Coach name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="coach@example.com"
                  required
                />
              </div>

              {!editingCoach && (
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    required={!editingCoach}
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Specialization *</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., Strength Training, Yoga"
                  required
                />
              </div>

              <div className="form-group">
                <label>Experience *</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g., 5 years"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingCoach ? 'Update Coach' : 'Add Coach'}
              </button>
              <button type="button" className="btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      <div className="coaches-grid">
        {coaches.map((coach) => (
          <div key={coach._id} className="coach-card">
            <div className="coach-avatar">
              <span>{coach.name.charAt(0).toUpperCase()}</span>
            </div>

            <div className="coach-info">
              <h3>{coach.name}</h3>
              <p className="coach-email">{coach.email}</p>
              <p className="coach-phone">📞 {coach.phone}</p>
              
              <div className="coach-details">
                <div className="detail-item">
                  <span className="detail-label">Specialization:</span>
                  <span className="detail-value">{coach.specialization}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Experience:</span>
                  <span className="detail-value">{coach.experience}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Assigned Clients:</span>
                  <span className="detail-value client-count">
                    {coach.assignedClients?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="coach-actions-buttons">
              <button className="btn-edit" onClick={() => handleEdit(coach)}>
                ✏️ Edit
              </button>
              <button className="btn-delete" onClick={() => handleDelete(coach._id!)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {coaches.length === 0 && !showForm && (
        <div className="no-coaches">
          <p>No coaches registered yet. Add your first coach to get started!</p>
        </div>
      )}
    </div>
  );
}
