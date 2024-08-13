/*
Citation Scope: General setup
Date: 7/29/2024
Originality: Adapted
Source: https://github.com/osu-cs340-ecampus/react-starter-app/blob/main/App/backend/database/ddl.sql
*/

-- drop all tables about to be replaced
DROP TABLE IF EXISTS EmployeePositions;
DROP TABLE IF EXISTS ProjectEmployees;
DROP TABLE IF EXISTS Resources;
DROP TABLE IF EXISTS Projects;
DROP TABLE IF EXISTS Positions;
DROP TABLE IF EXISTS Employees;

-- create the new tables in the schema
CREATE TABLE Employees (
    employeeID INT NOT NULL UNIQUE PRIMARY KEY, -- ID card numbers will likely be used here, so auto-increment isn't used here
    fullName VARCHAR(1024) NOT NULL,
    username VARCHAR(256) UNIQUE, -- this may be null if they do not have a computer account
    projectHoursTotal DECIMAL(10, 4) NOT NULL DEFAULT 0 -- a newly hired employee will have zero project hours
);

CREATE TABLE Positions (
    positionID INT NOT NULL UNIQUE AUTO_INCREMENT PRIMARY KEY,
    positionTitle VARCHAR(256) NOT NULL,
    budgetedSalary DECIMAL(10, 2)
);

CREATE TABLE EmployeePositions (
    employeePositionID INT NOT NULL UNIQUE AUTO_INCREMENT PRIMARY KEY,
    employeeID INT NOT NULL,
    positionID INT NOT NULL,
    salary DECIMAL(10, 2), -- this can be different from the budgetedSalary on the referenced Positions record
    startDate DATE NOT NULL,
    endDate DATE,
    FOREIGN KEY (employeeID) REFERENCES Employees(employeeID) ON DELETE CASCADE, -- if an Employee is deleted, delete their corresponding employeePosition records
    FOREIGN KEY (positionID) REFERENCES Positions(positionID) ON DELETE RESTRICT -- don't allow deletion of Positions that Employees have worked for
);

CREATE TABLE Projects (
    projectID INT NOT NULL UNIQUE AUTO_INCREMENT PRIMARY KEY,
    projectName VARCHAR(256) NOT NULL,
    startDate DATE,
    endDate DATE,
    projectedBudget DECIMAL(20, 2)
);

CREATE TABLE ProjectEmployees (
    projectEmployeeID INT NOT NULL UNIQUE AUTO_INCREMENT PRIMARY KEY,
    employeeID INT NOT NULL,
    projectID INT NOT NULL,
    role VARCHAR(256) NOT NULL, -- this is their role in relation to the Project, while positionTitle is in relation to the company as a whole
    hoursWorkedTotal DECIMAL(10, 4) NOT NULL DEFAULT 0, -- a newly assigned employee will have zero hours on this project
    FOREIGN KEY (employeeID) REFERENCES Employees(employeeID) ON DELETE CASCADE,
    FOREIGN KEY (projectID) REFERENCES Projects(projectID) ON DELETE CASCADE,
    CONSTRAINT employeeProject UNIQUE (employeeID, projectID) -- an employee should have at most one role in each project
);

CREATE TABLE Resources (
    resourceID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    resourceName VARCHAR(256) NOT NULL,
    resourceCost DECIMAL(20, 2),
    resourceDesc VARCHAR(1024),
    projectID INT,
    FOREIGN KEY (projectID) REFERENCES Projects(projectID) ON DELETE SET NULL -- when a Project is deleted, any associated Resources should be unassigned from it, not deleted
);

-- sample data to insert
INSERT INTO Employees (employeeID, fullName, username, projectHoursTotal) VALUES
(31415926, 'Ethan Cohen', 'ecohen', 120.5),
(27182818, 'Mia Briggs', 'mbriggs', 98.75),
(14142135, 'Olivia Davis', 'odavis', 150.25),
(17320508, 'Noah Sloan', 'nsloan', 80.5),
(16180339, 'Sophia Harris', 'sharris', 200.0),
(26457513, 'John Johnson', 'jjohnson', 0);

INSERT INTO Positions (positionTitle, budgetedSalary) VALUES
('Software Engineer', 80000),
('Senior Software Engineer', 115000),
('Project Manager', 90000),
('System Analyst', 85000),
('Database Administrator', 75000),
('Network Engineer', 70000),
('Software Engineering Intern', 45000);

-- selecting Employees by username and Positions by positionTitle
INSERT INTO EmployeePositions (employeeID, positionID, salary, startDate, endDate) VALUES
((SELECT employeeID FROM Employees WHERE username = 'ecohen'), (SELECT positionID FROM Positions WHERE positionTitle = 'Software Engineer'), 85000, '2022-01-01', '2023-01-01'),
((SELECT employeeID FROM Employees WHERE username = 'ecohen'), (SELECT positionID FROM Positions WHERE positionTitle = 'Senior Software Engineer'), 127000, '2023-01-01', NULL),
((SELECT employeeID FROM Employees WHERE username = 'mbriggs'), (SELECT positionID FROM Positions WHERE positionTitle = 'Project Manager'), 95000, '2021-06-01', '2023-01-01'),
((SELECT employeeID FROM Employees WHERE username = 'odavis'), (SELECT positionID FROM Positions WHERE positionTitle = 'System Analyst'), 90000, '2020-09-15', NULL),
((SELECT employeeID FROM Employees WHERE username = 'nsloan'), (SELECT positionID FROM Positions WHERE positionTitle = 'Database Administrator'), 80000, '2019-11-30', '2022-11-30'),
((SELECT employeeID FROM Employees WHERE username = 'sharris'), (SELECT positionID FROM Positions WHERE positionTitle = 'Network Engineer'), 75000, '2018-07-01', NULL),
((SELECT employeeID FROM Employees WHERE username = 'jjohnson'), (SELECT positionID FROM Positions WHERE positionTitle = 'Software Engineer'), 60000, '2024-07-01', NULL);

INSERT INTO Projects (projectName, startDate, endDate, projectedBudget) VALUES
('Project A', '2022-03-01', NULL, 50000),
('Project B', '2023-01-01', '2023-06-01', 75000),
('Project C', '2021-05-01', '2022-02-28', 60000),
('Project D', '2020-08-15', '2021-04-30', 85000),
('Project E', '2019-10-01', '2020-07-31', 90000);

-- selecting Employees by username and Projects by projectName
INSERT INTO ProjectEmployees (employeeID, projectID, role, hoursWorkedTotal) VALUES
((SELECT employeeID FROM Employees WHERE username = 'ecohen'), (SELECT projectID from Projects WHERE projectName = 'Project A'), 'Developer', 60),
((SELECT employeeID FROM Employees WHERE username = 'mbriggs'), (SELECT projectID from Projects WHERE projectName = 'Project A'), 'Manager', 80),
((SELECT employeeID FROM Employees WHERE username = 'odavis'), (SELECT projectID from Projects WHERE projectName = 'Project C'), 'Analyst', 100),
((SELECT employeeID FROM Employees WHERE username = 'nsloan'), (SELECT projectID from Projects WHERE projectName = 'Project D'), 'DB Admin', 50),
((SELECT employeeID FROM Employees WHERE username = 'ecohen'), (SELECT projectID from Projects WHERE projectName = 'Project D'), 'DB Designer', 30),
((SELECT employeeID FROM Employees WHERE username = 'sharris'), (SELECT projectID from Projects WHERE projectName = 'Project E'), 'Network Eng', 150);

-- selecting Projects by projectName
INSERT INTO Resources (resourceName, resourceCost, resourceDesc, projectID) VALUES
('Server A', 1000, 'High-performance server', (SELECT projectID from Projects WHERE projectName = 'Project A')),
('Server B', 1500, 'Backup server', NULL),
('Laptop A', 1200, 'Developer laptop', (SELECT projectID from Projects WHERE projectName = 'Project A')),
('Desktop B', 800, 'Office desktop', (SELECT projectID from Projects WHERE projectName = 'Project D')),
('Router C', 600, 'Network router', (SELECT projectID from Projects WHERE projectName = 'Project E'));
