// Load library data
let libraryData = [];
let currentPage = 1;
const booksPerPage = 50;

fetch('library.json')
    .then(response => response.json())
    .then(data => {
        libraryData = data;
        displayBooks();
    });

// Display books with pagination in a table
function displayBooks() {
    const booksContainer = document.getElementById('booksContainer');
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToDisplay = libraryData.slice(startIndex, endIndex);

    booksContainer.innerHTML = booksToDisplay.map(book => `
        <tr>
            <td>${book['Book Title']}</td>
            <td>${book['Author']}</td>
            <td>${book['Barcode']}</td>
            <td>${book['Status']}</td>
            <td>${book['User'] || 'N/A'}</td>
        </tr>
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

    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>Barcode</th>
                    <th>Status</th>
                    <th>User</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(book => `
                    <tr>
                        <td>${book['Book Title']}</td>
                        <td>${book['Author']}</td>
                        <td>${book['Barcode']}</td>
                        <td>${book['Status']}</td>
                        <td>${book['User'] || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Check out a book
function checkoutBook() {
    const name = document.getElementById('checkoutName').value;
    const barcode = document.getElementById('checkoutBarcode').value;

    const book = libraryData.find(book => book.Barcode === barcode);
    if (book && book.Status === 'Available') {
        book.Status = 'Checked Out';
        book.User = name;
        alert(`Book checked out successfully!`);
        displayBooks();
    } else {
        alert(`Book not available or invalid barcode.`);
    }
}

// Check in a book
function checkinBook() {
    const barcode = document.getElementById('checkinBarcode').value;

    const book = libraryData.find(book => book.Barcode === barcode);
    if (book && book.Status === 'Checked Out') {
        book.Status = 'Available';
        book.User = 'nan';
        alert(`Book checked in successfully!`);
        displayBooks();
    } else {
        alert(`Book not checked out or invalid barcode.`);
    }
}