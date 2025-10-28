import React, { useState, useMemo, useEffect } from 'react';

// === Utility Functions for CSV Parsing and Data Handling ===

/**
 * A basic CSV parser that handles simple comma-separated values.
 * It treats the first row as headers.
 * @param {string} text The raw CSV text input.
 * @returns {{data: Array<Object>, columns: Array<string>}}
 */
const parseCSV = (text) => {
  if (!text.trim()) {
    return { data: [], columns: [] };
  }

  const rows = text.trim().split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));

  if (rows.length === 0) {
    return { data: [], columns: [] };
  }

  const columns = rows[0];
  const data = rows.slice(1).map(row => {
    const rowObj = {};
    columns.forEach((col, index) => {
      // Map data fields using the header names
      rowObj[col] = row[index] || '';
    });
    return rowObj;
  });

  return { data, columns };
};

// =========================================================

const App = () => {
  const [csvText, setCsvText] = useState('');
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Initial data and column setup effect
  useEffect(() => {
    try {
      const { data, columns } = parseCSV(csvText);
      setData(data);
      setColumns(columns);
      setCurrentPage(1); // Reset page on new data
    } catch (e) {
      console.error("Error parsing CSV:", e);
      setData([]);
      setColumns([]);
    }
  }, [csvText]);

  // Handle file drop/paste
  const handleTextChange = (event) => {
    setCsvText(event.target.value);
  };

  // Logic for filtering, sorting, and pagination
  const processedData = useMemo(() => {
    let currentData = [...data];

    // 1. Filtering
    if (globalFilter) {
      const filterLower = globalFilter.toLowerCase();
      currentData = currentData.filter(row =>
        columns.some(col => {
          const cellValue = String(row[col] || '').toLowerCase();
          return cellValue.includes(filterLower);
        })
      );
    }

    // 2. Sorting
    if (sortConfig.key) {
      currentData.sort((a, b) => {
        const aValue = String(a[sortConfig.key] || '').toLowerCase();
        const bValue = String(b[sortConfig.key] || '').toLowerCase();

        // Simple string comparison logic
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return currentData;
  }, [data, columns, globalFilter, sortConfig]);

  // 3. Pagination calculation
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentTableData = processedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    if (sortConfig.direction === 'asc') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Pagination handlers
  const goToPage = (page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-4">
      {/* Page Size Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          {[5, 10, 20, 50].map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      {/* Page Navigation */}
      <div className="flex space-x-2 items-center">
        <span className="text-sm text-gray-700">
          Showing {processedData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, processedData.length)} of {processedData.length} records
        </span>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300 transition duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold px-2">
          Page {totalPages > 0 ? currentPage : 0} of {totalPages}
        </span>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-300 transition duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-['Inter']">
      <script src="https://cdn.tailwindcss.com"></script>
      <style jsx>{`
        /* Custom scrollbar for better look */
        .csv-table-container::-webkit-scrollbar {
          height: 8px;
        }
        .csv-table-container::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
        .csv-table-container::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            CSV Data Viewer
          </h1>
          <p className="text-gray-500">
            Paste your raw CSV text below (commas as delimiters, first row as headers).
          </p>
        </header>

        {/* CSV Input Area */}
        <div className="mb-6 p-6 bg-white shadow-lg rounded-xl border border-gray-200">
          <textarea
            value={csvText}
            onChange={handleTextChange}
            rows="6"
            placeholder="Paste your CSV data here, e.g.:&#10;Name,Age,City&#10;Alice,30,New York&#10;Bob,25,London"
            className="w-full p-4 text-sm font-mono border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Data Controls and Table */}
        {data.length > 0 && (
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            {/* Controls */}
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 sm:mb-0">
                Data Table ({processedData.length} entries)
              </h2>
              {/* Global Filter */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={globalFilter}
                  onChange={(e) => {
                    setGlobalFilter(e.target.value);
                    setCurrentPage(1); // Reset page on filter change
                  }}
                  placeholder="Search all columns..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Table Container - Responsive Scrolling */}
            <div className="csv-table-container overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition duration-150 select-none"
                        onClick={() => handleSort(column)}
                      >
                        <div className="flex items-center">
                          {column}
                          {getSortIcon(column)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTableData.length > 0 ? (
                    currentTableData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-blue-50 transition duration-150">
                        {columns.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {row[column]}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 text-lg">
                        {globalFilter ? "No results found for your search term." : "Table data is empty."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && <PaginationControls />}
          </div>
        )}

        {/* Empty State */}
        {csvText.trim() === '' && (
          <div className="p-12 text-center bg-white shadow-lg rounded-xl border-dashed border-2 border-gray-300 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xl font-medium">Ready for your data!</p>
            <p className="text-sm">Paste a CSV file content into the box above to see it formatted as an interactive table.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;