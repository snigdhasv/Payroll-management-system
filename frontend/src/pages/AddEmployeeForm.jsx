// src/pages/AddEmployeeForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import styles from '../styles/EmployeeList.module.css';

const AddEmployeeForm = ({ onEmployeeAdded }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    department: '',
    role: '',
    status: '',
    salary: '',
    hire_date: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/employees', formData);
      console.log(response.data);
      onEmployeeAdded(); // Call parent component callback to refresh employee list
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        address: '',
        department: '',
        role: '',
        status: '',
        salary: '',
        hire_date: '',
      });
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Add New Employee</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>First Name</label>
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label>Last Name</label>
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label>Phone Number</label>
          <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label>Address</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label>Department</label>
          <input type="text" name="department" value={formData.department} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label>Role</label>
          <input type="text" name="role" value={formData.role} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Salary</label>
          <input type="number" name="salary" value={formData.salary} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label>Hire Date</label>
          <input type="date" name="hire_date" value={formData.hire_date} onChange={handleChange} required />
        </div>
        <div className={styles.formButtonContainer}>
          <button type="submit" className={styles.submitButton}>Add Employee</button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeeForm;