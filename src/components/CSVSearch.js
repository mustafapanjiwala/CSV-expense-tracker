import React, { useState } from "react";
import Papa from "papaparse";
import "./CSVSearch.css";

const CSVSearch = () => {
  const [keyword, setKeyword] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.value);
  };
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(year + "-" + month + "-" + day);
  };

  const handleSearch = async () => {
    if (!selectedFile) {
      alert("Please select a CSV file.");
      return;
    }

    const csvFilePath = `${process.env.PUBLIC_URL}/csvFiles/${selectedFile}.csv`;

    try {
      const response = await fetch(csvFilePath);
      if (!response.ok) {
        throw new Error("Failed to fetch CSV file.");
      }

      const text = await response.text();
      Papa.parse(text, {
        header: true,
        complete: (result) => {
          const csvData = result.data;
          const filteredRows = csvData.filter((row) => {
            const rowDate = parseDate(row.Date);
            return (
              row.Description.toLowerCase().includes(keyword.toLowerCase()) &&
              rowDate >= parseDate(startDate) &&
              rowDate <= parseDate(endDate)
            );
          });
          setSearchResults(filteredRows);
        },
      });
    } catch (error) {
      console.error("Error fetching or parsing CSV:", error);
    }
  };

  return (
    <div>
      <h2>Bank Statement Checker App</h2>
      <input
        type="text"
        placeholder="Enter keyword"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <select onChange={handleFileChange} value={selectedFile}>
        <option value="">Select CSV File</option>
        <option value="axis">axis.csv</option>
        <option value="hdfc">hdfc.csv</option>
        <option value="icici">icici.csv</option>
      </select>
      <input
        type="date"
        placeholder="Start Date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type="date"
        placeholder="End Date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <div>
        <h3>Search Results:</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((row, index) => (
              <tr key={index}>
                <td>{row.Date}</td>
                <td>{row.Description}</td>
                <td>{row.Debit}</td>
                <td>{row.Credit}</td>
                <td>{row.Balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CSVSearch;
