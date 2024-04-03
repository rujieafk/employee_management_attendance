const config = require('./dbConfig');
const sql = require('mssql');
const xlsx = require('xlsx');
const Employee = require('./employee');

// Function to read Excel file and insert data into the database
const insertEmployeesFromExcel = async (filePath) => {
    try {
        // Load Excel file
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
        const sheet = workbook.Sheets[sheetName];
        
        // Parse Excel data
        const data = xlsx.utils.sheet_to_json(sheet);

        // Insert each row into the database
        for (const row of data) {
            const newEmp = new Employee(row.employeeId, row.name);
            await insertEmployee(newEmp); // Assuming insertEmployee function is defined elsewhere
        }

        // console.log("Data inserted successfully!");
    } catch (error) {
        console.error("Error inserting data:", error);
    }
};

// Display the list
const getEmployees = async () => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM Employee");
        console.log(result.recordset); 

        //All the records with details
        // return result.recordset;

        //Number of affected row
        return result;
        
    } catch (error) {
        console.log(error);
    }
}


// Inserts the employee into the list
const insertEmployee = async (Employee) => {
    try {
        const attendance = "0";
        let pool = await sql.connect(config);
        let employee = await pool.request()
            .input('employeeId', Employee.employeeId)
            .input('name', Employee.name)
            .input('eventId', Employee.eventId)
            .input('attendance', attendance)
            .query(`
                INSERT INTO Employee (employeeId, name, eventId, attendance)
                VALUES (@employeeId, @name, @eventId, @attendance)
            `); 
        return employee;
    } catch (error) {
        console.log(error);
    }
}

const getEvents = async () => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT * FROM Event");
        console.log(result);
        return result.recordset;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const checkEmployeeExists = async (employeeId, eventId) => {
    try {
      let pool = await sql.connect(config);
      let result = await pool.request()
        .input('employeeId', employeeId)
        .input('eventId', eventId)
        .query('SELECT * FROM Employee WHERE employeeId = @employeeId AND eventId = @eventId');
      return result.recordset.length > 0;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

module.exports = {
    insertEmployeesFromExcel,
    insertEmployee, 
    getEmployees,
    getEvents,
    checkEmployeeExists,
};
