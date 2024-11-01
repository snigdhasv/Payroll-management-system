-- Table: Tax_Bracket
CREATE TABLE Tax_Bracket (
    tax_bracket_id INT AUTO_INCREMENT PRIMARY KEY,
    min_salary DECIMAL(15, 2) NOT NULL,
    max_salary DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL,
    UNIQUE (min_salary, max_salary)
);

-- Table: Employee
CREATE TABLE Employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(15),
    address TEXT,
    department VARCHAR(50),
    role VARCHAR(50),
    status VARCHAR(20),
    salary DECIMAL(15, 2) NOT NULL,
    hire_date DATE NOT NULL,
    tax_bracket_id INT,
    FOREIGN KEY (tax_bracket_id) REFERENCES Tax_Bracket(tax_bracket_id) ON DELETE SET NULL
);

-- Table: Users
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    employee_id INT,
    role VARCHAR(20) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
);


-- Table: Payroll
CREATE TABLE Payroll (
    payroll_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    basic_salary DECIMAL(15, 2) NOT NULL,
    bonus DECIMAL(15, 2) DEFAULT 0,
    tax_deduction DECIMAL(15, 2),
    deductions DECIMAL(15, 2) DEFAULT 0,
    net_salary DECIMAL(15, 2),
    pay_date DATE NOT NULL,
    payslip_generated BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
);

DELIMITER //

CREATE TRIGGER calculate_tax_deduction
BEFORE INSERT ON Payroll
FOR EACH ROW
BEGIN
    DECLARE tax_rate DECIMAL(5, 2);
    
    -- Retrieve the tax rate based on the employee's tax bracket
    SELECT tb.tax_rate INTO tax_rate
    FROM Tax_Bracket tb
    JOIN Employee e ON e.tax_bracket_id = tb.tax_bracket_id
    WHERE e.employee_id = NEW.employee_id;
    
    -- Calculate tax deduction and assign it to the new row
    SET NEW.tax_deduction = NEW.basic_salary * (tax_rate/100);
    -- Optionally calculate net_salary if you want to store it instead of using a generated column
    SET NEW.net_salary = NEW.basic_salary + NEW.bonus - NEW.deductions - NEW.tax_deduction;
END //

DELIMITER ;

-- Table: Payslips
CREATE TABLE Payslips (
    payslip_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    payroll_id INT NOT NULL,
    payslip_pdf BLOB,
    generated_date DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (payroll_id) REFERENCES Payroll(payroll_id) ON DELETE CASCADE
);

-- Table: Leaves
CREATE TABLE Leaves (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_leave_days INT GENERATED ALWAYS AS (DATEDIFF(end_date, start_date) + 1) STORED,
    reason TEXT,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE CASCADE
);

show tables;
drop table Tax_Bracket, Employee, Users, Payroll, Payslips, Leaves;

