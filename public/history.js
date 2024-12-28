let currentPage = 0;
const recordsPerPage = 15;
let allData = []; // Store all fetched data

async function fetchHistoricalData(reset = true) {
    try {
        if (reset) {
            currentPage = 0;
            const response = await fetch('/data/history');
            allData = await response.json();
        }
        
        const tableBody = document.getElementById('historyTableBody');
        if (reset) {
            tableBody.innerHTML = ''; // Clear only on reset/initial load
        }

        // Calculate start and end indices for current page
        const startIndex = currentPage * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const currentPageData = allData.slice(startIndex, endIndex);

        // Add new records
        currentPageData.forEach(reading => {
            const row = document.createElement('tr');
            const date = new Date(reading.timestamp);
            
            let status = 'normal';
            if (reading.temperature > 30 || reading.humidity > 70) {
                status = 'alert';
            } else if (reading.temperature > 25 || reading.humidity > 60) {
                status = 'warning';
            }

            row.innerHTML = `
                <td>${date.toLocaleDateString()}</td>
                <td>${date.toLocaleTimeString()}</td>
                <td>${reading.temperature.toFixed(1)}°C</td>
                <td>${reading.humidity.toFixed(1)}%</td>
                <td><span class="status-badge status-${status}">
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </span></td>
            `;
            
            tableBody.appendChild(row);
        });

        // Show/hide "Show More" button based on remaining data
        const showMoreBtn = document.getElementById('showMoreBtn');
        if (endIndex >= allData.length) {
            showMoreBtn.style.display = 'none';
        } else {
            showMoreBtn.style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching historical data:', error);
    }
}

// Function to handle "Show More" clicks
function showMore() {
    currentPage++;
    fetchHistoricalData(false);
}

// Initialize date filters
function initializeDateFilters() {
    const today = new Date();
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    // Set default dates
    startDate.valueAsDate = today;
    endDate.valueAsDate = today;
}

// Fetch data initially and set up refresh
document.addEventListener('DOMContentLoaded', () => {
    initializeDateFilters();
    fetchHistoricalData();
    
    // Set up refresh interval
    setInterval(() => fetchHistoricalData(true), 30000);
    
    // Add event listeners
    document.getElementById('refreshBtn').addEventListener('click', () => fetchHistoricalData(true));
    document.getElementById('showMoreBtn').addEventListener('click', showMore);
    
    // Add event listeners for date filters
    document.getElementById('timeRange').addEventListener('change', (e) => {
        const today = new Date();
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        switch(e.target.value) {
            case 'today':
                startDate.valueAsDate = today;
                endDate.valueAsDate = today;
                break;
            case 'week':
                const lastWeek = new Date(today);
                lastWeek.setDate(today.getDate() - 7);
                startDate.valueAsDate = lastWeek;
                endDate.valueAsDate = today;
                break;
            case 'month':
                const lastMonth = new Date(today);
                lastMonth.setMonth(today.getMonth() - 1);
                startDate.valueAsDate = lastMonth;
                endDate.valueAsDate = today;
                break;
        }
        
        fetchHistoricalData();
    });
}); 