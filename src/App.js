import React, { useState, useEffect } from 'react';
import './App.css';
import * as XLSX from 'xlsx';

function App() {
  // State variables
  const [file, setFile] = useState('');
  const [excelData, setExcelData] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');

  // Fetch events from backend when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  // Function to fetch events
  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Function to handle dropdown change
  const handleDropdownChange = (e) => {
    setSelectedEvent(e.target.value);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    try {
      const data = await readFile(selectedFile);
      const parsedData = parseExcelData(data);
      setExcelData(parsedData);
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   // Checks if the input file is empty or not 
  //   if (!file) {
  //     console.log("No File Selected");
  //     alert("No File Selected");
  //     return;
  //   }

  //   // Only accepts an excel file
  //   const fileType = file.type;
  //   if (fileType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
  //     console.log("Please select an Excel file.");
  //     alert("Please select an Excel file.");
  //     return;
  //   }

  //   try {
  //     await sendDataToServer(excelData, selectedEvent); // Pass selectedEvent to sendDataToServer
  //     console.log('Uploading Data...');
      
  //     const inputElement = document.querySelector('input[type="file"]');
  //     if (inputElement) {
  //       inputElement.value = ''; // Reset the value to an empty string
  //     }
  //     // Clear the list
  //     setExcelData([]); // Reset excelData to an empty arra

  //   } catch (error) {
  //     console.error('Error occurred while sending data:', error);
  //   }
  // }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    //Checks if the event is select or not
    if(selectedEvent === ''){
      console.log("Please select an event");
      alert("Please select an event");
      return;
    }
    // Checks if the input file is empty or not 
    if (!file) {
      console.log("No File Selected");
      alert("No File Selected");
      return;
    }
  
    // Only accepts an excel file
    const fileType = file.type;
    if (fileType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      console.log("Please select an Excel file.");
      alert("Please select an Excel file.");
      return;
    }
  
    try {
      await sendDataToServer(excelData, selectedEvent);
      console.log('Document uploaded successfully.');
  
      const inputElement = document.querySelector('input[type="file"]');
      if (inputElement) {
        inputElement.value = '';
      }
      setExcelData([]);
      alert("Document uploaded successfully.");
    } catch (error) {
      if (error.message === "Failed to send data") {
        // Display custom message when the document already exists
        alert("Document already exist.");
        console.log("Upload Failed: Document already exist.");

        const inputElement = document.querySelector('input[type="file"]');
        if (inputElement) {
          inputElement.value = '';
        }
      } else {
        // Display default error message for other errors
        alert(error.message);
      }
    }
  }

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(new Uint8Array(e.target.result));
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  const parseExcelData = (data) => {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0]; // Assuming there's only one sheet
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1); // Exclude the first row (header)
  }

  const sendDataToServer = async (data, selectedEvent) => { // Receive selectedEvent as a parameter
    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ excelData: data, eventId: selectedEvent}), // Pass selectedEvent in the body
      });
      if (!response.ok) {
        throw new Error('Failed to send data');
      }
    } catch (error) {
      throw error;
    }
  }

  return (
    <div className="border-holder">
      <div className="border">
        <div className="border-content">
          <h1>UPLOAD EXCEL FILE</h1>
          <div>
            {/* Dropdown to select event */}
            <select onChange={handleDropdownChange} value={selectedEvent}>
              <option value="">Select Event</option>
              {events.map((event) => (
                <option key={event.eventId} value={event.eventId}>{event.name}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="file"
              name="thisEvent"
              className="thisfile"
              onChange={handleFileChange}
            />
          </div>
          <button className="btn" onClick={handleSubmit}>Upload</button>
        </div>
      </div>
      <div className="border">
        <div className="border-content">
          {excelData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {excelData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>No File Selected</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
