import React, { useState } from "react";
import Papa from "papaparse";
import "./CSVSearch.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Debit/Credit Visualiser",
      fullSize: true,

      font: { weight: "bold", size: 20 },
    },
  },
};

const CSVSearch = () => {
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [labels, setLabels] = useState([]);
  // const[debitData, setDebitData] = useState([]);
  // const[creditData, setCreditData] = useState([]);

  const handleAccountChange = (account) => {
    if (selectedAccounts.includes(account)) {
      setSelectedAccounts(selectedAccounts.filter((acc) => acc !== account));
    } else {
      setSelectedAccounts([...selectedAccounts, account]);
    }
  };

  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(year + "-" + month + "-" + day);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    if (selectedAccounts.length === 0) {
      alert("Please select at least one CSV file.");
      return;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (startDateObj > endDateObj) {
      alert("Start date cannot be later than end date.");
      return;
    }

    try {
      // Initialize an array to store promises for fetching and parsing CSV files
      const fetchAndParsePromises = [];

      // Loop through the selected accounts
      for (const account of selectedAccounts) {
        const csvFilePath = `${process.env.PUBLIC_URL}/csvFiles/${account}.csv`;
        const promise = fetch(csvFilePath)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to fetch ${account}.csv file.`);
            }
            return response.text();
          })
          .then((text) => {
            return new Promise((resolve) => {
              Papa.parse(text, {
                header: true,
                complete: (result) => {
                  const csvData = result.data;
                  const filteredRows = csvData.filter((row) => {
                    const rowDate = parseDate(row.Date);
                    return (
                      row.Description.toLowerCase().includes(
                        keyword.toLowerCase()
                      ) &&
                      rowDate >= startDateObj &&
                      rowDate <= endDateObj
                    );
                  });
                  resolve(filteredRows);
                },
              });
            });
          });

        fetchAndParsePromises.push(promise);
      }

      // Use Promise.all to wait for all promises to resolve
      const results = await Promise.all(fetchAndParsePromises);

      // Flatten the array of results
      const allSearchResults = results.flat();

      // Set the combined results
      console.log(allSearchResults);
      setSearchResults(allSearchResults);
    } catch (error) {
      console.error("Error fetching or parsing CSV:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const labels = searchResults.map((item) => {
    return item.Date;
  });
  // console.log(labels);

  const debitData = searchResults.map((item) => {
    return item.Debit;
  });

  const creditData = searchResults.map((item) => {
    return item.Credit;
  });

  // searchResults.map(item => item.Debit);

  // searchResults.map(item => item.Credit);

  // console.log(debitData)

  const data = {
    labels,
    datasets: [
      {
        label: "Debit",
        data: debitData,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Credit",
        data: creditData,
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div className="container">
      <h2>Bank Statement Checker App</h2>
      <div className="input-div">
        <h4>Enter keyword:</h4>
        <input
          type="text"
          placeholder="Enter keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="input-div">
        <h4>Select Accounts:</h4>
        <label className="checkbox-label">
          <span
            className={`custom-checkbox ${
              selectedAccounts.includes("axis") ? "checked" : ""
            }`}
            onClick={() => handleAccountChange("axis")}
          >
            {selectedAccounts.includes("axis") ? "✔" : ""}
          </span>
          <span
            className={`checkbox-label-text ${
              selectedAccounts.includes("axis") ? "checked" : ""
            }`}
          >
            axis.csv
          </span>
        </label>
        <label className="checkbox-label">
          <span
            className={`custom-checkbox ${
              selectedAccounts.includes("hdfc") ? "checked" : ""
            }`}
            onClick={() => handleAccountChange("hdfc")}
          >
            {selectedAccounts.includes("hdfc") ? "✔" : ""}
          </span>
          <span
            className={`checkbox-label-text ${
              selectedAccounts.includes("hdfc") ? "checked" : ""
            }`}
          >
            hdfc.csv
          </span>
        </label>
        <label className="checkbox-label">
          <span
            className={`custom-checkbox ${
              selectedAccounts.includes("icici") ? "checked" : ""
            }`}
            onClick={() => handleAccountChange("icici")}
          >
            {selectedAccounts.includes("icici") ? "✔" : ""}
          </span>
          <span
            className={`checkbox-label-text ${
              selectedAccounts.includes("icici") ? "checked" : ""
            }`}
          >
            icici.csv
          </span>
        </label>
      </div>
      <div className="input-div">
        <h4>Select Date Range:</h4>
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
      </div>
      <button onClick={handleSearch}>Search</button>
      <div>
        <h3>Search Results:</h3>

        <div className="chart-contain">
          <Bar options={options} data={data} />
        </div>

        {isLoading ? (
          <span className="visually-hidden">Loading...</span>
        ) : (
          <>
            <h3
              style={{
                textAlign: "center",
                color: "#666666",
                fontSize: "20px",
                margin: "20px",
                textDecoration: "underline",
              }}
            >
              Transaction Table Data
            </h3>
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
          </>
        )}
      </div>
    </div>
  );
};

export default CSVSearch;
