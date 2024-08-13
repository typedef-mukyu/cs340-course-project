var express = require('express');
var app = express();
var db = require('./db-connector');
var path = require('path');
var os = require("os") 
PORT = 3939;

/*
Citation Scope: General setup, CRUD route structuring, DB query struture
Date: 8/1/2024
Originality: Adapted
Source: https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/Step%208%20-%20Dynamically%20Updating%20Data/public/js
*/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static and route index
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/*

    CRUD Routes for Emplyees

*/

// Read all employees
app.get('/employees', function(req, res) {
    let query = 'SELECT * FROM Employees';
    db.pool.query(query, function(err, results) {
        if (err) throw err;
        res.json(results);
    });
});

// Create a new employee
app.post('/employees', function(req, res) {
    let query = 'INSERT INTO Employees (fullName, employeeID, username, projectHoursTotal) VALUES (?, ?, ?, ?)';
    let values = [req.body.fullName, req.body.employeeID, req.body.username, req.body.projectHoursTotal];
    db.pool.query(query, values, function(err, results) {
        if (err) throw err;
        res.sendStatus(201);
    });
});

// Update an employee
app.put('/employees/:id', function(req, res) {
    let query = 'UPDATE Employees SET fullName = ?, username = ?, projectHoursTotal = ? WHERE employeeID = ?';
    let values = [req.body.fullName, req.body.username, req.body.projectHoursTotal, req.params.id];
    db.pool.query(query, values, function(err, results) {
        if (err) throw err;
        res.sendStatus(200);
    });
});

// Delete an employee
app.delete('/employees/:id', function(req, res) {
    let query = 'DELETE FROM Employees WHERE employeeID = ?';
    db.pool.query(query, req.params.id, function(err, results) {
        if (err) throw err;
        res.sendStatus(204);
    });
});

/*

    CRUD Routes for Positions

*/

// Read all positions
app.get('/positions', function(req, res) {
    let query = 'SELECT * FROM Positions';
    db.pool.query(query, function(err, results) {
        if (err) throw err;
        res.json(results);
    });
});

// Create a new position
app.post('/positions', function(req, res) {
    let query = 'INSERT INTO Positions (positionTitle, budgetedSalary) VALUES (?, ?)';
    let values = [req.body.positionTitle, req.body.budgetedSalary];
    db.pool.query(query, values, function(err, results) {
        if (err) throw err;
        res.sendStatus(201);
    });
});

// Update a position
app.put('/positions/:id', function(req, res) {
    let query = 'UPDATE Positions SET positionTitle = ?, budgetedSalary = ? WHERE positionID = ?';
    let values = [req.body.positionTitle, req.body.budgetedSalary, req.params.id];
    db.pool.query(query, values, function(err, results) {
        if (err) throw err;
        res.sendStatus(200);
    });
});

// Delete a position
app.delete('/positions/:id', function(req, res) {
    let query = 'DELETE FROM Positions WHERE positionID = ?';
    db.pool.query(query, req.params.id, function(err, results) {
        if (err) throw err;
        res.sendStatus(204);
    });
});

/*

    CRUD Routes for Projects

*/

// Read all projects
app.get('/projects', function(req, res) {
    let query = 'SELECT * FROM Projects';
    db.pool.query(query, function(err, results) {
        if (err) throw err;
        res.json(results);
    });
});

// Create a new project
app.post('/projects', function(req, res) {
    let query = 'INSERT INTO Projects (projectName, startDate, endDate, projectedBudget) VALUES (?, ?, ?, ?)';
    let values = [req.body.projectName, req.body.startDate, req.body.endDate, req.body.projectedBudget];
    db.pool.query(query, values, function(err, results) {
        if (err) throw err;
        res.sendStatus(201);
    });
});

// Update a project
app.put('/projects/:id', function(req, res) {
    let query = 'UPDATE Projects SET projectName = ?, startDate = ?, endDate = ?, projectedBudget = ? WHERE projectID = ?';
    let values = [req.body.projectName, req.body.startDate, req.body.endDate, req.body.projectedBudget, req.params.id];
    db.pool.query(query, values, function(err, results) {
        if (err) throw err;
        res.sendStatus(200);
    });
});

// Delete a project
app.delete('/projects/:id', function(req, res) {
    let query = 'DELETE FROM Projects WHERE projectID = ?';
    db.pool.query(query, req.params.id, function(err, results) {
        if (err) throw err;
        res.sendStatus(204);
    });
});

/*

    CRUD Routes for Resources

*/

// Read all resources
app.get('/resources', function(req, res) {
    let query = 'SELECT Resources.*, Projects.projectName FROM Resources LEFT JOIN Projects ON Resources.ProjectID = Projects.ProjectID;';
    db.pool.query(query, function(err, results) {
        if (err) throw err;
        res.json(results);
    });
});
// Read resources matching no projects
app.get('/resources/projects', function(req, res) {
    let query = 'SELECT Resources.*, Projects.projectName FROM Resources LEFT JOIN Projects ON Resources.ProjectID = Projects.ProjectID WHERE Resources.projectID IS NULL;';
    db.pool.query(query, function(err, results) {
        if (err) throw err;
        res.json(results);
    });
});
// Read resources matching a project
app.get('/resources/projects/:id', function(req, res) {
    let query = 'SELECT Resources.*, Projects.projectName FROM Resources LEFT JOIN Projects ON Resources.ProjectID = Projects.ProjectID WHERE Resources.projectID = ?;';
    let values = [req.params.id]
    db.pool.query(query, values, function(err, results) {
        if (err) throw err;
        res.json(results);
    });
});
// Create a new resource
app.post('/resources', function(req, res) {
    let query = 'INSERT INTO Resources (resourceName, resourceCost, resourceDesc, projectID) VALUES (?, ?, ?, ?)';
    let values = [req.body.resourceName, req.body.resourceCost, req.body.resourceDesc, req.body.projectID];
    db.pool.query(query, values, function(err, results) {
        if (err) throw err;
        res.sendStatus(201);
    });
});

// Update a resource
app.put('/resources/:id', function(req, res) {
    let query = 'UPDATE Resources SET resourceName = ?, resourceCost = ?, resourceDesc = ?, projectID = ? WHERE resourceID = ?';
    let values = [req.body.resourceName, req.body.resourceCost, req.body.resourceDesc, req.body.projectID, req.params.id];
    db.pool.query(query, values, function(err, results) {
        if (err) throw err;
        res.sendStatus(200);
    });
});

// Delete a resource
app.delete('/resources/:id', function(req, res) {
    let query = 'DELETE FROM Resources WHERE resourceID = ?';
    db.pool.query(query, req.params.id, function(err, results) {
        if (err) throw err;
        res.sendStatus(204);
    });
});

/*

    CRUD Routes for EmployeePositions

*/

// Read all employee positions
app.get('/employee_positions', function(req, res) {
    let query = 'SELECT EmployeePositions.*, Employees.fullName, Positions.positionTitle FROM EmployeePositions INNER JOIN Employees on EmployeePositions.employeeID = Employees.employeeID INNER JOIN Positions on EmployeePositions.positionID = Positions.positionID;';
    db.pool.query(query, function(err, results) {
        if (err) throw err;
        res.json(results);
    });
});

// Create a new employee position
app.post('/employee_positions', function(req, res) {
    let query = 'INSERT INTO EmployeePositions (employeeID, positionID, salary, startDate, endDate) VALUES (?, ?, ?, ?, ?)';
    let values = [req.body.employeeID, req.body.positionID, req.body.salary, req.body.startDate, req.body.endDate];
    db.pool.query(query, values, function(err, results) {
        if (err) throw err;
        res.sendStatus(201);
    });
});

// Update an employee position
app.put('/employee_positions/:id', function(req, res) {
    let query = 'UPDATE EmployeePositions SET employeeID = ?, positionID = ?, salary = ?, startDate = ?, endDate = ? WHERE employeePositionID = ?';
    let values = [req.body.employeeID, req.body.positionID, req.body.salary, req.body.startDate, req.body.endDate, req.params.id];
    db.pool.query(query, values, function(err, results) {
        if (err) throw err;
        res.sendStatus(200);
    });
});

// Delete an employee position
app.delete('/employee_positions/:id', function(req, res) {
    let query = 'DELETE FROM EmployeePositions WHERE employeePositionID = ?';
    db.pool.query(query, req.params.id, function(err, results) {
        if (err) throw err;
        res.sendStatus(204);
    });
});


// Read all project employees
app.get('/project_employees', function(req, res) {
    let query = 'SELECT ProjectEmployees.*, Employees.fullName, Projects.projectName FROM ProjectEmployees INNER JOIN Employees ON ProjectEmployees.employeeID = Employees.employeeID INNER JOIN Projects ON ProjectEmployees.projectID = Projects.projectID;';
    db.pool.query(query, function(err, results) {
        if (err) throw err;
        res.json(results);
    });
});

// Create a new project employee
app.post('/project_employees', (req, res) => {
    const query = 'INSERT INTO ProjectEmployees (employeeID, projectID, role, hoursWorkedTotal) VALUES (?, ?, ?, ?)';
    const values = [req.body.employeeID, req.body.projectID, req.body.role, req.body.hoursWorkedTotal];

    db.pool.query(query, values, (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(409).json({ message: 'Duplicate entry: This employee is already assigned to this project.' });
            } else {
                res.status(500).json({ message: 'Error adding project employee' });
            }
        } else {
            res.sendStatus(201);
        }
    });
});

// Update a project employee
app.put('/project_employees/:id', function(req, res) {
    let query = 'UPDATE ProjectEmployees SET employeeID = ?, projectID = ?, role = ?, hoursWorkedTotal = ? WHERE projectEmployeeID = ?';
    let values = [req.body.employeeID, req.body.projectID, req.body.role, req.body.hoursWorkedTotal, req.params.id];
    db.pool.query(query, values, function(err, results) {
        if (err) throw err;
        res.sendStatus(200);
    });
});

// Delete a project employee
app.delete('/project_employees/:id', function(req, res) {
    let query = 'DELETE FROM ProjectEmployees WHERE projectEmployeeID = ?';
    db.pool.query(query, req.params.id, function(err, results) {
        if (err) throw err;
        res.sendStatus(204);
    });
});

// Start Express server and log incoming requests
app.listen(PORT, function() {
    console.log('Express started on ' + os.hostname() + ":" + PORT + '; press Ctrl-C to terminate.');
});