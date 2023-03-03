const inquirer = require('inquirer');
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'company_db', 
  port: 3306
}, console.log(`You are now connected to the database`));

//I get prompted to view all departments, view all roles, view all employees, add a role, add an employee, and update an employee role
const displayPrompt = [
  {
    type: "list",
    name: "start",
    message: "What would you like to do?",
    choices: [
      "View all departments", 
      "View all roles", 
      "View all employees", 
      "Add a role", 
      "Add an employee", 
      "Update an employee role", 
      "Exit"
    ]
  }
];

const start = async () => {
  const actions = {
    "View all departments": viewDepartments,
    "View all roles": viewRoles,
    "View all employees": allEmployees,
    "Add a role": addRole,
    "Add an employee": addEmployee,
    "Update an employee role": updateRole,
    "Exit": () => {
      console.log("Bye");
      process.exit();
    }
  };

  //using the inquier.prompt the user is given the prompts and displays it and awaits an answer
  //then the selected action is looked up with answer.start then is checked to see if selected action exists
  const answer = await inquirer.prompt(displayPrompt);
  const selectedAction = actions[answer.start];

  if (selectedAction) {
    selectedAction();
  } else {
    console.log("Must choose an option displayed.");
  }
};

//You are able to see Role titles with salary as well as a department id
function viewRoles() {
  db.query('SELECT * FROM role', (err, results) => {
    if (err) {
      console.error(err);
      return;
    } 
      
    console.table(results);
    start();
  });
}
//You are able to see employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
function allEmployees() {
  db.query('SELECT * FROM employee', (err, results) => {
    if (err) {
      console.error(err);
      return;
    } 
      
    console.table(results);
    start();
  });
}


// You are able to view all the departments with ids
function viewDepartments() {
  db.query("SELECT * FROM department", (err, results) => {
    if (err) {
      console.error(err);
      return;
    }

    console.table(results);
    start();
  });
}


// You are able to add a role with the name of it along with salary and for what department it belongs to
async function addRole() {
  try {
    const departmentResults = await new Promise((resolve, reject) => {
      db.query(`SELECT * FROM department`, (err, results) => {
        if (err) {
          console.log("Error: ", err);
          reject();
        } else {
          resolve(results);
        }
      });
    });

    const departmentArray = [];
    for (let i = 0; i < departmentResults.length; i++) {
      let department = departmentResults[i];
      let departmentObject = { name: department.name, value: department.id };
      departmentArray.push(departmentObject);
    }

    const newRole = await inquirer.prompt([
      {
        type: "input",
        name: "roleName",
        message: "What is the name of the role?",
      },
      {
        type: "number",
        name: "salary",
        message: "What is the salary for this role?",
      },
      {
        type: "list",
        name: "department",
        message: "What department does this role belong to?",
        choices: departmentArray,
      },
    ]);

    await new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO role (title, salary, department_id) VALUES ("${newRole.roleName}", "${newRole.salary}", "${newRole.department}")`,
        (err, results) => {
          if (err) {
            console.log("Error: ", err);
            reject();
          } else {
            resolve();
          }
        }
      );
    });

    console.log(`${newRole.roleName} has been added to the database!`);
    start();
  } catch (error) {
    console.log(error);
  }
}

//You are able to add an employee with their first and last name with what position and for which manager they are under
async function addEmployee() {
  db.query(`SELECT * FROM role`, (err, results) => {
    if (err) {
      console.log("Error: ", err);
      return;
    } 

    let roleArray = [];

    for (let i = 0; i < results.length; i++) {
      let role = results[i];
      let roleObject = { name: role.title, value: role.id };
      roleArray.push(roleObject);
    }

    db.query(`SELECT * FROM employee`, async (err, managerId) => {
      if (err) {
        console.log("Error: ", err);
        return;
      } 

      let managerArray = [];

      for (let i = 0; i < managerId.length; i++) {
        let manager = managerId[i];
        let managerObject = { name: `${manager.first_name} ${manager.last_name}`, value: manager.id };
        managerArray.push(managerObject);
      }

      const newEmployee = await inquirer.prompt([
        {
          type: "input",
          name: "firstName",
          message:
            "What is the first name of the new employee?",
        },
        {
          type: "input",
          name: "lastName",
          message:
            "What is the last name of the new employee?",
        },
        {
          type: "list",
          name: "role",
          message:
            "What is this employee's position?",
          choices: roleArray,
        },
        {
          type: "list",
          name: "manager",
          message:
            "Who is the manager?",
          choices: managerArray,
        },
      ]);

      db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${newEmployee.firstName}", "${newEmployee.lastName}", "${newEmployee.role}", "${newEmployee.manager}")`, (err, results) => {
        if (err) {
          console.log("Error: ", err);
          return;
        } else {
          console.log(`${newEmployee.firstName}has been added to the database!`);
          start();
        }
      });
    });
  });
}

// You are able to update an employees role to a new role
async function updateRole() {
  try {
    const roles = await new Promise((resolve, reject) => {
      db.query(`SELECT * FROM role`, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
    const roleChoices = roles.map(role => ({name: role.title, value: role.id}));

    const employees = await new Promise((resolve, reject) => {
      db.query(`SELECT * FROM employee`, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    const employeeChoices = employees.map(employee => ({name: employee.first_name + ' ' + employee.last_name, value: employee.id}));

    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "employeeId",
        message: "Which employee's role would you like to update?",
        choices: employeeChoices,
      },
      {
        type: "list",
        name: "newRoleId",
        message: "What is the new role for this employee?",
        choices: roleChoices,
      },
    ]);

    const { employeeId, newRoleId } = answers;
    await new Promise((resolve, reject) => {
      db.query(`UPDATE employee SET role_id = ? WHERE id = ?`, [newRoleId, employeeId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    console.log("The role has been updated!");
    start();
  } catch (error) {
    console.log(error);
  }
}



start();