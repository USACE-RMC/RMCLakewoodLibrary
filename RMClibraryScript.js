// Load the book data from JSON
let books = [];

// Fetch the JSON data
// Get the current page's directory path
const currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
const jsonPath = currentPath + 'RMCJSON.json';

fetch(jsonPath)
    .then(response => response.json())
    .then(data => {
        books = data;
        displayBooks(books);
        populateAuthorFilter();
    })

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');
const statusFilter = document.getElementById('statusFilter');
const authorFilter = document.getElementById('authorFilter');
const booksTable = document.getElementById('booksTable').getElementsByTagName('tbody')[0];
const checkoutBarcode = document.getElementById('checkoutBarcode');
const checkoutUsername = document.getElementById('checkoutUsername');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkinBarcode = document.getElementById('checkinBarcode');
const checkinBtn = document.getElementById('checkinBtn');
const modal = document.getElementById('confirmationModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const closeModal = document.getElementById('closeModal');

// Event Listeners
searchBtn.addEventListener('click', searchBooks);
resetBtn.addEventListener('click', resetFilters);
statusFilter.addEventListener('change', filterBooks);
authorFilter.addEventListener('change', filterBooks);
checkoutBtn.addEventListener('click', checkoutBook);
checkinBtn.addEventListener('click', checkinBook);
closeModal.addEventListener('click', () => modal.style.display = 'none');

// Display books in the table
function displayBooks(booksToDisplay) {
    booksTable.innerHTML = '';
    
    if (booksToDisplay.length === 0) {
        const row = booksTable.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 6;
        cell.textContent = 'No books found';
        cell.style.textAlign = 'center';
        return;
    }
    
    booksToDisplay.forEach(book => {
        const row = booksTable.insertRow();
        
        const titleCell = row.insertCell(0);
        titleCell.textContent = book.Book_Title;
        
        const authorCell = row.insertCell(1);
        authorCell.textContent = book.Author;
        
        const barcodeCell = row.insertCell(2);
        barcodeCell.textContent = book.Barcode;
        
        const statusCell = row.insertCell(3);
        statusCell.textContent = book.Status;
        statusCell.className = book.Status === 'Available' ? 'status-available' : 'status-checked-out';
        
        const userCell = row.insertCell(4);
        userCell.textContent = book.User || '-';
        
        const actionCell = row.insertCell(5);
        const actionBtn = document.createElement('button');
        actionBtn.className = 'action-btn';
        
        if (book.Status === 'Available') {
            actionBtn.textContent = 'Check Out';
            actionBtn.addEventListener('click', () => {
                checkoutBarcode.value = book.Barcode;
                checkoutUsername.focus();
            });
        } else {
            actionBtn.textContent = 'Check In';
            actionBtn.addEventListener('click', () => {
                checkinBarcode.value = book.Barcode;
                checkinBtn.focus();
            });
        }
        
        actionCell.appendChild(actionBtn);
    });
}

// Populate author filter dropdown
function populateAuthorFilter() {
    const authors = [...new Set(books.map(book => book.Author))].sort();
    
    authors.forEach(author => {
        const option = document.createElement('option');
        option.value = author;
        option.textContent = author;
        authorFilter.appendChild(option);
    });
}

// Search books by title or user
function searchBooks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayBooks(books);
        return;
    }
    
    const filteredBooks = books.filter(book => 
        book.Book_Title.toLowerCase().includes(searchTerm) || 
        (book.User && book.User.toLowerCase().includes(searchTerm))
    );
    
    displayBooks(filteredBooks);
}

// Filter books by status or author
function filterBooks() {
    const statusValue = statusFilter.value;
    const authorValue = authorFilter.value;
    
    let filteredBooks = books;
    
    if (statusValue) {
        filteredBooks = filteredBooks.filter(book => book.Status === statusValue);
    }
    
    if (authorValue) {
        filteredBooks = filteredBooks.filter(book => book.Author === authorValue);
    }
    
    displayBooks(filteredBooks);
}

// Reset all filters
function resetFilters() {
    searchInput.value = '';
    statusFilter.value = '';
    authorFilter.value = '';
    displayBooks(books);
}

// Check out a book
function checkoutBook() {
    const barcode = checkoutBarcode.value.trim();
    const username = checkoutUsername.value.trim();
    
    if (!barcode) {
        showModal('Error', 'Please enter a book barcode.');
        return;
    }
    
    if (!username) {
        showModal('Error', 'Please enter a username.');
        return;
    }
    
    const bookIndex = books.findIndex(book => book.Barcode === barcode);
    
    if (bookIndex === -1) {
        showModal('Error', 'Book not found. Please check the barcode and try again.');
        return;
    }
    
    if (books[bookIndex].Status === 'Checked Out') {
        showModal('Error', 'This book is already checked out.');
        return;
    }
    
    // Update book status
    books[bookIndex].Status = 'Checked Out';
    books[bookIndex].User = username;
    
    // Save to JSON (in a real application, this would be a server request)
    saveBooks();
    
    // Update display
    displayBooks(books);
    
    // Clear form
    checkoutBarcode.value = '';
    checkoutUsername.value = '';
    
    // Show confirmation
    showModal('Success', `Book "${books[bookIndex].Book_Title}" has been checked out to ${username}.`);
}

// Check in a book
function checkinBook() {
    const barcode = checkinBarcode.value.trim();
    
    if (!barcode) {
        showModal('Error', 'Please enter a book barcode.');
        return;
    }
    
    const bookIndex = books.findIndex(book => book.Barcode === barcode);
    
    if (bookIndex === -1) {
        showModal('Error', 'Book not found. Please check the barcode and try again.');
        return;
    }
    
    if (books[bookIndex].Status === 'Available') {
        showModal('Error', 'This book is already available.');
        return;
    }
    
    const username = books[bookIndex].User;
    
    // Update book status
    books[bookIndex].Status = 'Available';
    books[bookIndex].User = '';
    
    // Save to JSON (in a real application, this would be a server request)
    saveBooks();
    
    // Update display
    displayBooks(books);
    
    // Clear form
    checkinBarcode.value = '';
    
    // Show confirmation
    showModal('Success', `Book "${books[bookIndex].Book_Title}" has been checked in from ${username}.`);
}

// Save books to JSON (in a real application, this would be a server request)
function saveBooks() {
    // In a real application, this would send the data to a server
    console.log('Books saved:', books);
    
    // For demonstration purposes, we're just logging the data
    // In a real application, you would use fetch() to send the data to a server
    // fetch('save-books.php', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(books),
    // })
    // .then(response => response.json())
    // .then(data => console.log('Success:', data))
    // .catch(error => console.error('Error:', error));
}

// Show modal with message
function showModal(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.style.display = 'flex';
}