# backend/app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import func, text

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow CORS for cross-origin requests from React frontend

# Configure SQLAlchemy to connect to MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:snig23@localhost/payroll_management_system'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db = SQLAlchemy(app)

# Define the User model corresponding to the Users table
class User(db.Model):
    __tablename__ = 'Users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    employee_id = db.Column(db.Integer)
    role = db.Column(db.String(20), nullable=False)
    
# Define the Employee model corresponding to the Employee table
class Employee(db.Model):
    __tablename__ = 'Employee'
    employee_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone_number = db.Column(db.String(15))
    address = db.Column(db.Text)
    department = db.Column(db.String(50))
    role = db.Column(db.String(50))
    status = db.Column(db.String(20))
    salary = db.Column(db.Numeric(15, 2), nullable=False)
    hire_date = db.Column(db.Date, nullable=False)
    tax_bracket_id = db.Column(db.Integer, db.ForeignKey('Tax_Bracket.tax_bracket_id'), nullable=True)

    # Relationship to Payroll (one-to-many relationship)
    payrolls = db.relationship('Payroll', backref='employee', lazy=True)

    def __repr__(self):
        return f"<Employee {self.first_name} {self.last_name}>"

# Define the Payroll model corresponding to the Payroll table
class Payroll(db.Model):
    __tablename__ = 'Payroll'
    payroll_id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('Employee.employee_id'), nullable=False)
    basic_salary = db.Column(db.Numeric(15, 2), nullable=False)
    bonus = db.Column(db.Numeric(15, 2), default=0)
    deductions = db.Column(db.Numeric(15, 2), default=0)
    net_salary = db.Column(db.Numeric(15, 2), nullable=False)
    pay_date = db.Column(db.Date, nullable=False)
    payslip_generated = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<Payroll for Employee {self.employee_id} on {self.pay_date}>"
    
class Leaves(db.Model):
    __tablename__ = 'Leaves'
    leave_id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('Employee.employee_id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # e.g., 'pending', 'approved', 'rejected'
    total_leave_days = db.Column(db.Integer)
    reason = db.Column(db.Text)

    

# Login route to authenticate users
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    print(f"Received login attempt for username: '{username}', password: '{password}'")

    # Query for user with the provided username
    user = User.query.filter_by(username=username).first()

    if user:
        print(f"User found: {user.username}, stored password: '{user.password}'")
        if user.password == password:  # plain-text password comparison for testing
            print("Password matches, login successful")
            if user.role == 'employee':
                dashboard_url = '/employee_dashboard'
            elif user.role in ['manager', 'admin']:
                dashboard_url = '/admin_dashboard'
            else:
                dashboard_url = '/'  # Default redirection
                
            return jsonify({"message": "Login successful", "role": user.role, "dashboard_url": dashboard_url}), 200
        else:
            print("Password does not match")
            return jsonify({"message": "Invalid username or password"}), 401
    else:
        print("User not found")
        return jsonify({"message": "Invalid username or password"}), 401
    
# API Endpoint to fetch admin dashboard data
@app.route('/api/admin/dashboard', methods=['GET'])
def get_dashboard_data():
    # Total employees
    total_employees = db.session.query(func.count(Employee.employee_id)).scalar()

    # Average salary
    avg_salary = db.session.query(func.avg(Employee.salary)).scalar()

    # Employee count per department
    departments = db.session.query(
        Employee.department, func.count(Employee.employee_id)
    ).group_by(Employee.department).all()
    department_data = {department: count for department, count in departments}

    # Payroll expenses over the last 12 months
    payroll_expenses = [record.net_salary for record in db.session.query(Payroll.net_salary).order_by(Payroll.pay_date.desc()).limit(12).all()]

    # Pending leave requests count
    pending_leaves_count = db.session.query(func.count(Leaves.leave_id)).filter(Leaves.status == 'pending').scalar()

    # Employee growth - counts new hires each month for the past year
    employee_growth = db.session.query(
        func.extract('year', Employee.hire_date).label('year'),
        func.extract('month', Employee.hire_date).label('month'),
        func.count(Employee.employee_id)
    ).filter(Employee.hire_date >= text("DATE_SUB(CURDATE(), INTERVAL 12 MONTH)")
    ).group_by('year', 'month').all()
    
    # Department-wise payroll expenses
    department_payroll = db.session.query(
        Employee.department, func.sum(Payroll.net_salary)
    ).join(Payroll, Employee.employee_id == Payroll.employee_id
    ).group_by(Employee.department).all()
    department_payroll_data = {dept: total for dept, total in department_payroll}
    
    # Highest salary employees (top 5)
    highest_salary_employees = db.session.query(
        Employee.first_name, Employee.last_name, Employee.salary
    ).order_by(Employee.salary.desc()).limit(5).all()
    highest_salary_data = [{"name": f"{emp[0]} {emp[1]}", "salary": emp[2]} for emp in highest_salary_employees]

    # Total bonuses and incentives paid in the last 12 months
    bonuses_incentives = db.session.query(
        func.sum(Payroll.bonus)
    ).filter(Payroll.pay_date >= text("DATE_SUB(CURDATE(), INTERVAL 12 MONTH)")).scalar()


    return jsonify({
        "totalEmployees": total_employees,
        "avgSalary": round(avg_salary, 2),
        "departmentData": department_data,
        "payrollExpenses": payroll_expenses[::-1],  # Reverse to show in chronological order
        "pendingLeaves" : pending_leaves_count,
        "employeeGrowth": [{"year": int(y), "month": int(m), "count": int(c)} for y, m, c in employee_growth],
        "departmentPayrollData": department_payroll_data,
        "highestSalaryEmployees": highest_salary_data,
        "bonusesIncentivesPaid": bonuses_incentives,
    }), 200
    
# API Endpoint to fetch all employees data
@app.route('/api/admin/employees', methods=['GET'])
def get_all_employees():
    employees = Employee.query.all()
    employees_data = [
        {
            "employee_id": emp.employee_id,
            "first_name": emp.first_name,
            "last_name": emp.last_name,
            "email": emp.email,
            "phone_number": emp.phone_number,
            "address": emp.address,
            "department": emp.department,
            "role": emp.role,
            "status": emp.status,
            "salary": float(emp.salary),  # Convert salary to float for JSON serialization
            "hire_date": emp.hire_date.isoformat()  # Convert date to ISO format for JSON
        }
        for emp in employees
    ]
    return jsonify(employees_data), 200



# API Endpoint to add a new employee
@app.route('/api/employees', methods=['POST'])
def add_employee():
    data = request.get_json()
    new_employee = Employee(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        phone_number=data.get('phone_number'),
        address=data.get('address'),
        department=data.get('department'),
        role=data.get('role'),
        status=data.get('status'),
        salary=data['salary'],
        hire_date=data['hire_date']
    )
    db.session.add(new_employee)
    db.session.commit()
    return jsonify({
        "employee_id": new_employee.employee_id,
        "first_name": new_employee.first_name,
        "last_name": new_employee.last_name,
        "email": new_employee.email,
        "phone_number": new_employee.phone_number,
        "address": new_employee.address,
        "department": new_employee.department,
        "role": new_employee.role,
        "status": new_employee.status,
        "salary": str(new_employee.salary),
        "hire_date": new_employee.hire_date.strftime('%Y-%m-%d')
    }), 201

# API Endpoint to delete an employee by ID
@app.route('/api/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    employee = Employee.query.get(employee_id)
    if employee:
        db.session.delete(employee)
        db.session.commit()
        return jsonify({"message": "Employee deleted successfully"}), 200
    else:
        return jsonify({"message": "Employee not found"}), 404



# Run the app
if __name__ == '__main__':
    app.run(port=5000, debug=True)