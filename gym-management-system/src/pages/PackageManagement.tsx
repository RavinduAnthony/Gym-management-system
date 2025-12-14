import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import '../styles/PackageManagement.css';

interface Package {
  _id?: string;
  name: string;
  packageType: string;
  duration: number;
  price: number;
  features: string[];
  description: string;
  coachingIncluded: boolean;
  isActive: boolean;
}

export default function PackageManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<Package[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  
  const [formData, setFormData] = useState<Package>({
    name: '',
    packageType: 'basic',
    duration: 1,
    price: 0,
    features: [''],
    description: '',
    coachingIncluded: false,
    isActive: true
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/packages');
      const data = await response.json();
      if (data.success) {
        setPackages(data.data.packages || []);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      setAlert({ type: 'error', message: 'Please login first' });
      return;
    }

    const filteredFeatures = formData.features.filter(f => f.trim() !== '');
    const packageData = { ...formData, features: filteredFeatures };

    try {
      const url = editingPackage 
        ? `http://localhost:5000/api/packages/${editingPackage._id}`
        : 'http://localhost:5000/api/packages';
      
      const response = await fetch(url, {
        method: editingPackage ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(packageData)
      });

      const data = await response.json();
      
      if (data.success) {
        setAlert({ type: 'success', message: data.message });
        setShowForm(false);
        setEditingPackage(null);
        resetForm();
        fetchPackages();
      } else {
        setAlert({ type: 'error', message: data.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to save package' });
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData(pkg);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAlert({ type: 'success', message: 'Package deleted successfully' });
        fetchPackages();
      } else {
        setAlert({ type: 'error', message: data.message });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to delete package' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      packageType: 'basic',
      duration: 1,
      price: 0,
      features: [''],
      description: '',
      coachingIncluded: false,
      isActive: true
    });
  };

  const cancelEdit = () => {
    setShowForm(false);
    setEditingPackage(null);
    resetForm();
  };

  if (loading) return <Loader />;

  return (
    <div className="package-management-container">
      <button className="home-icon-button" onClick={() => navigate('/')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="package-header">
        <h1>Package Management</h1>
        <p>Create and manage membership packages</p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="package-actions">
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create New Package'}
        </button>
      </div>

      {showForm && (
        <div className="package-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="package-form-container" onClick={(e) => e.stopPropagation()}>
            <h2>{editingPackage ? 'Edit Package' : 'Create New Package'}</h2>
            <form onSubmit={handleSubmit} className="package-form">
            <div className="form-row">
              <div className="form-group">
                <label>Package Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Monthly Basic"
                  required
                />
              </div>

              <div className="form-group">
                <label>Package Type *</label>
                <select name="packageType" value={formData.packageType} onChange={handleInputChange} required>
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration (Months) *</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Package description..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Features</label>
              {formData.features.map((feature, index) => (
                <div key={index} className="feature-input-group">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="Feature description"
                  />
                  {formData.features.length > 1 && (
                    <button type="button" className="btn-remove" onClick={() => removeFeature(index)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add-feature" onClick={addFeature}>
                + Add Feature
              </button>
            </div>

            <div className="form-row checkbox-row">
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="coachingIncluded"
                  name="coachingIncluded"
                  checked={formData.coachingIncluded}
                  onChange={handleInputChange}
                />
                <label htmlFor="coachingIncluded">Coaching Included</label>
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <label htmlFor="isActive">Active Package</label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingPackage ? 'Update Package' : 'Create Package'}
              </button>
              <button type="button" className="btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      <div className="packages-grid">
        {packages.map((pkg) => (
          <div key={pkg._id} className={`package-card ${!pkg.isActive ? 'inactive' : ''}`}>
            <div className="package-header-card">
              <h3>{pkg.name}</h3>
              <span className={`package-type-badge ${pkg.packageType}`}>
                {pkg.packageType}
              </span>
            </div>
            
            <div className="package-price">
              <span className="price-amount">${pkg.price}</span>
              <span className="price-duration">/ {pkg.duration} month{pkg.duration > 1 ? 's' : ''}</span>
            </div>

            {pkg.description && (
              <p className="package-description">{pkg.description}</p>
            )}

            <div className="package-features">
              <h4>Features:</h4>
              <ul>
                {pkg.features.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
                {pkg.coachingIncluded && <li>✓ Personal Coaching</li>}
              </ul>
            </div>

            <div className="package-status">
              <span className={pkg.isActive ? 'status-active' : 'status-inactive'}>
                {pkg.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="package-actions-buttons">
              <button className="btn-edit" onClick={() => handleEdit(pkg)}>
                ✏️ Edit
              </button>
              <button className="btn-delete" onClick={() => handleDelete(pkg._id!)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && !showForm && (
        <div className="no-packages">
          <p>No packages created yet. Create your first package to get started!</p>
        </div>
      )}
    </div>
  );
}
