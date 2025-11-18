// Load library data
let libraryData = [];
let currentPage = 1;
const booksPerPage = 9; // Display 9 books per page for a card layout

fetch('data/library.json') // Update the path to include the "data" folder
    .then(response => response.json())
    .then(data => {
        libraryData = data;
        displayBooks();
    });

require('dotenv').config(); // Load environment variables from .env file

// Function to trigger GitHub Action via GitHub Issues
function triggerGitHubAction(barcode, user, action) {
    const token = process.env.YOUR_GITHUB_TOKEN; // Load token from .env file
    const repoOwner = 'USACE-RMC'; // Replace with your GitHub username
    const repoName = 'RMCLakewoodLibrary'; // Replace with your repository name

    const issueTitle = `Library Update: ${action} book with barcode ${barcode}`;
    const issueBody = JSON.stringify({
        barcode: barcode,
        user: user,
        action: action,
    });

    fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: issueTitle,
            body: issueBody,
        }),
    })
    .then(response => response.json())
    .then(result => {
        console.log('GitHub Issue created:', result);
        alert('GitHub Action triggered successfully!');
    })
    .catch(error => {
        console.error('Error triggering GitHub Action:', error);
        alert('Failed to trigger GitHub Action.');
    });
}

// Display books with pagination in card layout
function displayBooks() {
    const booksContainer = document.getElementById('booksContainer');
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToDisplay = libraryData.slice(startIndex, endIndex);

    booksContainer.innerHTML = booksToDisplay.map(book => `
        <div class="book-card">
            <h3>${book['Book Title']}</h3>
            <p><strong>Author:</strong> ${book['Author']}</p>
            <p><strong>Barcode:</strong> ${book['Barcode']}</p>
            <p class="status ${book.Status === 'Checked Out' ? 'checked-out' : ''}">
                <strong>Status:</strong> ${book.Status}
            </p>
            <p><strong>User:</strong> ${book.User && book.User !== 'nan' ? book.User : 'None'}</p>
        </div>
    `).join('');
    
    document.getElementById('currentPage').textContent = `Page ${currentPage}`;
}

// Change page
function changePage(direction) {
    const totalPages = Math.ceil(libraryData.length / booksPerPage);
    currentPage += direction;

    if (currentPage < 1) {
        currentPage = 1;
    } else if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    displayBooks();
}

// Search for books
function searchBooks() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const results = libraryData.filter(book =>
        book['Book Title'].toLowerCase().includes(query) ||
        book['Author'].toLowerCase().includes(query) ||
        (book['User'] && book['User'].toLowerCase().includes(query))
    );

    const booksContainer = document.getElementById('booksContainer');
    booksContainer.innerHTML = results.map(book => `
        <div class="book-card">
            <h3>${book['Book Title']}</h3>
            <p><strong>Author:</strong> ${book['Author']}</p>
            <p><strong>Barcode:</strong> ${book['Barcode']}</p>
            <p class="status ${book.Status === 'Checked Out' ? 'checked-out' : ''}">
                ${book.Status}
            </p>
            <button onclick="checkoutBook('${book.Barcode}')">Check Out</button>
        </div>
    `).join('');
}

// Check out a book
function checkoutBook() {
    const barcode = document.getElementById('checkoutBarcode').value;
    const userName = document.getElementById('checkoutUser').value;

    if (!barcode || !userName) {
        alert('Please enter both barcode and user name.');
        return;
    }

    const book = libraryData.find(book => book.Barcode === barcode);
    if (book && book.Status === 'Available') {
        book.Status = 'Checked Out';
        book.User = userName;
        alert(`Book checked out successfully by ${userName}!`);
        displayBooks();

        // Trigger GitHub Action
        triggerGitHubAction(barcode, userName, 'checkout');
    } else if (book) {
        alert(`Book is already checked out.`);
    } else {
        alert(`Invalid barcode. Book not found.`);
    }
}


// Check in a book
// Updated checkinBook function
function checkinBook() {
    const barcode = document.getElementById('checkinBarcode').value;

    if (!barcode) {
        alert('Please enter the barcode.');
        return;
    }

    const book = libraryData.find(book => book.Barcode === barcode);
    if (book && book.Status === 'Checked Out') {
        book.Status = 'Available';
        book.User = '';
        alert(`Book checked in successfully!`);
        displayBooks();

        // Trigger GitHub Action
        triggerGitHubAction(barcode, '', 'checkin');
    } else if (book) {
        alert(`Book is already available.`);
    } else {
        alert(`Invalid barcode. Book not found.`);
    }
}


// Function to send updated library data to the backend
function updateLibraryBackend(data) {
    fetch('/update_library', { // Replace '/update_library' with your backend endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Send the updated library data
    })
    .then(response => response.json())
    .then(result => {
        console.log('Library updated:', result);
        alert('Library files updated successfully!');
    })
    .catch(error => {
        console.error('Error updating library:', error);
        alert('Failed to update library files.');
    });
}