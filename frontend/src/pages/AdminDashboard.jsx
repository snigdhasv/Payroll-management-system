// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar,Doughnut, Line } from 'react-chartjs-2';
import axios from 'axios';
import styles from '../styles/AdminDashboard.module.css';


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement);

const AdminDashboard = () => {
  const [data, setData] = useState({
    totalEmployees: 0,
    avgSalary: 0,
    payrollExpenses: [],
    departmentData: {},
    turnoverRate: 0,
    employeeGrowth: [],
    departmentPayrollData: {},
    highestSalaryEmployees: [],
    bonusesIncentivesPaid: 0,
    pendingLeaves: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/dashboard');
        setData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const payrollData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Payroll Expenses',
        data: data.payrollExpenses,
        backgroundColor: '#4A90E2'
      }
    ]
  };

  const departmentPayrollData = {
    labels: Object.keys(data.departmentPayrollData),
    datasets: [
      {
        label: 'Payroll by Department',
        data: Object.values(data.departmentPayrollData),
        backgroundColor: ['#FFC107', '#4CAF50', '#FF5722', '#4A90E2', '#8E44AD']
      }
    ]
  };

  const employeeGrowthData = {
    labels: data.employeeGrowth.map(item => `${item.year}-${item.month}`),
    datasets: [
      {
        label: 'New Hires per Month',
        data: data.employeeGrowth.map(item => item.count),
        backgroundColor: '#FF9F40'
      }
    ]
  };

  return (
    <div className={styles.adminDashboard}>
      <aside className={styles.sidebar}>
        <h2>Earnest</h2>
        <nav>
          <ul>
            <li><Link to="/admin_dashboard">Dashboard</Link></li>
            <li><Link to="/employees">Employees</Link></li>
            <li><Link to="/payroll">Payroll</Link></li>
            <li><Link to="/leaves">Leaves</Link></li>
          </ul>
        </nav>
      </aside>

      <main className={styles.dashboardContent}>
        <h1>Admin Dashboard</h1>
        
        <div className={styles.gridLayout}>
          {/* Top Row Cards */}
          <div className={styles.metricsContainer}>
            <div className={styles.metricCard}>
                <div className={styles.metricNumber}>{data.totalEmployees}</div>
                <div className={styles.metricLabel}>Total Employees</div>
            </div>
          </div>
          <div className={styles.metricsContainer}>
            <div className={styles.metricCard}>
                <div className={styles.metricNumber}>{data.pendingLeaves}</div>
                <div className={styles.metricLabel}>Pending Leave Requests</div>
            </div>
          </div>
          <div className={styles.metricsContainer}>
            <div className={styles.metricCard}>
                <div className={styles.metricNumber}>{data.avgSalary}</div>
                <div className={styles.metricLabel}>Average Salary</div>
            </div>
          </div>
          <div className={styles.metricsContainer}>
            <div className={styles.metricCard}>
                <div className={styles.metricNumber}>{data.bonusesIncentivesPaid}</div>
                <div className={styles.metricLabel}>Bonuses & Incentives Paid</div>
            </div>
          </div>

          <div className={styles.deptPayrollChart}>
            <h3>Employees by Department Payroll</h3>
            <Doughnut key="departmentPayroll" data={departmentPayrollData} />
          </div>

          {/* Payroll Expenses Chart */}
          <div className={styles.payrollChart}>
            <h3>Payroll Expenses</h3>
            <Bar data={payrollData} />
          </div>

          {/* Employee Growth Chart */}
          <div className={styles.employeeGrowthChart}>
            <h3>Employee Growth (Monthly)</h3>
            <Line data={employeeGrowthData} />
          </div>

          {/* Highest Salary Employees */}
          <div className={styles.highestSalarySection}>
            <h3>Top 5 Highest Salary Employees</h3>
            <ul>
              {data.highestSalaryEmployees.map((emp, index) => (
                <li key={index}>{emp.name}: ${emp.salary}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
