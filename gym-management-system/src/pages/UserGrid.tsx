import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserGrid.css';
import Loader from '../components/Loader';

export default function UserGrid() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 600);
    }, []);

    const userArr = [
        {id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', mobile: '123-456-7890', nic: '987654321V', address: '123 Main St, Cityville', membershipType: 'Premium', membershipStart: '2023-01-01'},
        {id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', mobile: '098-765-4321', nic: '123456789V', address: '456 Elm St, Townsville', membershipType: 'Basic', membershipStart: '2023-02-15'},
        {id: 3, firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', mobile: '555-123-4567', nic: '987654321X', address: '789 Oak St, Villageville', membershipType: 'Standard', membershipStart: '2023-03-10'},
        {id: 4, firstName: 'Bob', lastName: 'Brown', email: 'bob.brown@example.com', mobile: '444-555-6666', nic: '123456789X', address: '101 Pine St, Hamletville', membershipType: 'Premium', membershipStart: '2023-04-05'}
    ]

  if (loading) return <Loader />;
    
  return (
    <div className="usergrid-container">
        <button className="home-icon-button" onClick={() => navigate('/')} title="Back to Dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
        </button>

        <div className="usergrid-header">
            <h2>Member Directory</h2>
            <p>View and manage all FitZone members</p>
        </div>

        <div className="table-container">
            <table className="user-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>NIC</th>
                        <th>Address</th>
                        <th>Membership</th>
                        <th>Start Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {userArr.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.mobile}</td>
                            <td>{user.nic}</td>
                            <td>{user.address}</td>
                            <td>
                                <span className={`membership-badge ${user.membershipType.toLowerCase()}`}>
                                    {user.membershipType}
                                </span>
                            </td>
                            <td>{user.membershipStart}</td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn edit-btn" title="Edit member">
                                        ✏️
                                    </button>
                                    <button className="action-btn delete-btn" title="Delete member">
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}