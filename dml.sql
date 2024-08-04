-- Employees Table Queries

-- Select all employees
SELECT * FROM Employees;

-- Insert a new employee
INSERT INTO Employees (fullName, employeeID, username, projectHoursTotal)
VALUES (:fullName, :employeeID, :username, :projectHoursTotal);

-- Update an employee
UPDATE Employees
SET fullName = :fullName, username = :username, projectHoursTotal = :projectHoursTotal
WHERE employeeID = :employeeID;

-- Delete an employee
DELETE FROM Employees WHERE employeeID = :employeeID;

-- Positions Table Queries

-- Select all positions
SELECT * FROM Positions;

-- Insert a new position
INSERT INTO Positions (positionTitle, budgetedSalary)
VALUES (:positionTitle, :budgetedSalary);

-- Update a position
UPDATE Positions
SET positionTitle = :positionTitle, budgetedSalary = :budgetedSalary
WHERE positionID = :positionID;

-- Delete a position
DELETE FROM Positions WHERE positionID = :positionID;

-- Projects Table Queries

-- Select all projects
SELECT * FROM Projects;

-- Insert a new project
INSERT INTO Projects (projectName, startDate, endDate, projectedBudget)
VALUES (:projectName, :startDate, :endDate, :projectedBudget);

-- Update a project
UPDATE Projects
SET projectName = :projectName, startDate = :startDate, endDate = :endDate, projectedBudget = :projectedBudget
WHERE projectID = :projectID;

-- Delete a project
DELETE FROM Projects WHERE projectID = :projectID;

-- Resources Table Queries

-- Select all resources
SELECT Resources.*, Projects.projectName FROM Resources
LEFT JOIN Projects ON Resources.projectID = Projects.projectID;

-- Select all resources not associated with a Project
SELECT Resources.*, Projects.projectName FROM Resources
LEFT JOIN Projects ON Resources.projectID = Projects.projectID -- use left join here to avoid excluding Resources with NULL projectID
WHERE Resources.projectID IS NULL;

-- Select all resources
SELECT Resources.*, Projects.projectName FROM Resources
LEFT JOIN Projects ON Resources.projectID = Projects.projectID -- use left join here to avoid excluding Resources with NULL projectID
WHERE Resources.projectID = :id;

-- Insert a new resource
INSERT INTO Resources (resourceName, resourceCost, resourceDesc, projectID)
VALUES (:resourceName, :resourceCost, :resourceDesc, :projectID);

-- Update a resource
UPDATE Resources
SET resourceName = :resourceName, resourceCost = :resourceCost, resourceDesc = :resourceDesc, projectID = :projectID
WHERE resourceID = :resourceID;

-- Delete a resource
DELETE FROM Resources WHERE resourceID = :resourceID;

-- EmployeePositions Table Queries

-- Select all employee positions
SELECT EmployeePositions.*, Employees.fullName, Positions.positionTitle FROM EmployeePositions
INNER JOIN Employees ON EmployeePositions.employeeID = Employees.employeeID
INNER JOIN Positions ON EmployeePositions.positionID = Positions.positionID;

-- Insert a new employee position
INSERT INTO EmployeePositions (employeeID, positionID, salary, startDate, endDate)
VALUES (:employeeID, :positionID, :salary, :startDate, :endDate);

-- Update an employee position
UPDATE EmployeePositions
SET employeeID = :employeeID, positionID = :positionID, salary = :salary, startDate = :startDate, endDate = :endDate
WHERE employeePositionID = :employeePositionID;

-- Delete an employee position
DELETE FROM EmployeePositions WHERE employeePositionID = :employeePositionID;

-- ProjectEmployees Table Queries

-- Select all project employees
SELECT ProjectEmployees.*, Employees.fullName, Projects.projectName FROM ProjectEmployees
INNER JOIN Employees ON ProjectEmployees.employeeID = Employees.employeeID
INNER JOIN Projects ON ProjectEmployees.projectID = Projects.projectID;

-- Insert a new project employee
INSERT INTO ProjectEmployees (employeeID, projectID, role, hoursWorkedTotal)
VALUES (:employeeID, :projectID, :role, :hoursWorkedTotal);

-- Update a project employee
UPDATE ProjectEmployees
SET employeeID = :employeeID, projectID = :projectID, role = :role, hoursWorkedTotal = :hoursWorkedTotal
WHERE projectEmployeeID = :projectEmployeeID;

-- Delete a project employee
DELETE FROM ProjectEmployees WHERE projectEmployeeID = :projectEmployeeID;