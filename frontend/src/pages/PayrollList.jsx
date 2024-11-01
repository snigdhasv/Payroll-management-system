// src/pages/PayrollList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/PayrollList.module.css';

const PayrollList = () => {
  const [payrollData, setPayrollData] = useState([]);

  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/payroll');
        setPayrollData(response.data);
      } catch (error) {
        console.error("Error fetching payroll data:", error);
      }
    };
    fetchPayrollData();
  }, []);

  return (
    <div className={styles.payrollList}>
      <h2>Payroll List</h2>
      <table className={styles.payrollTable}>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Employee Name</th>
            <th>Role</th>
            <th>Department</th>
            <th>Net Salary</th>
            <th>Pay Date</th>
            <th>Payslip</th>
          </tr>
        </thead>
        <tbody>
          {payrollData.map((item, index) => (
            <tr key={index}>
              <td>{item.employee_id}</td>
              <td>{item.employee_name}</td>
              <td>{item.role}</td>
              <td>{item.department}</td>
              <td>${item.net_salary}</td>
              <td>{item.pay_date}</td>
              <td>
                {item.payslip_pdf ? (
                  <a href={item.payslip_pdf} download>Download</a>
                ) : (
                  "Not Generated"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PayrollList;
