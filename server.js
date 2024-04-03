const dbOperation = require('./dbFiles/dbOperation');
const Employee = require('./dbFiles/employee');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000; // You can change the port as needed

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.get('/events', async (req, res) => {
  try {
    const events = await dbOperation.getEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).send("Error fetching events");
  }
});

// // POST endpoint to handle Excel data upload
// app.post('/upload', async (req, res) => {
//   const { excelData, eventId } = req.body; // Receive eventId from request body

//   // Process each row
//   for (const row of excelData) {
//     const [employeeId, name] = row; // Remove eventId from here

//     // Insert to Database
//     let newEmp = new Employee(employeeId, name, eventId); // Use eventId here
    
//     try {
//       await dbOperation.insertEmployee(newEmp);
//       console.log('Employee inserted:', newEmp);
//     } catch (error) {
//       console.error("Error inserting employee:", error); // Handling error
//     }
//   }

//   // Send response
//   res.status(200).send('Data received successfully');
// });

app.post('/upload', async (req, res) => {
  const { excelData, eventId } = req.body;

  try {
    for (const row of excelData) {
      const [employeeId, name] = row;

      // Check if employee already exists in the database for the given eventId
      const employeeExists = await dbOperation.checkEmployeeExists(employeeId, eventId);
      if (employeeExists) {
        return res.status(400).send(`Employee with ID ${employeeId} already exists for event ID ${eventId}`);
      }

      // Insert to Database
      let newEmp = new Employee(employeeId, name, eventId);
      await dbOperation.insertEmployee(newEmp);
      console.log('Employee inserted:', newEmp);
    }

    res.status(200).send('Data received successfully');
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).send('Error inserting data');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
