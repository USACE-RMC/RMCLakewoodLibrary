// Load library data
let libraryData = [];
let currentPage = 1;
const booksPerPage = 9; // Display 9 books per page for a card layout

fetch('library.json')
    .then(response => response.json())
    .then(data => {
        libraryData = data;
        displayBooks();
    });

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
                ${book.Status}
            </p>
            <button onclick="checkoutBook('${book.Barcode}')">Check Out</button>
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
function checkoutBook(barcode) {
    const book = libraryData.find(book => book.Barcode === barcode);
    if (book && book.Status === 'Available') {
        book.Status = 'Checked Out';
        book.User = 'User Name'; // Replace with actual user input
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