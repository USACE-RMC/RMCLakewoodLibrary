// 🔗 Replace with your actual GitHub Pages URL
const DATA_URL = 'https://raw.githubusercontent.com/USACE-RMC/RMCLakewoodLibrary/main/RMCJSON.json';

let books = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
    setupEventListeners();
});

function fetchBooks() {
    fetch(DATA_URL)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            books = data;
            populateTable(books);
            populateAuthorFilter(books);
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
            showModal('Error', 'Unable to load book data. Please check the file path or permissions.');
            console.log('Fetched books:', data);
        });
}

function populateTable(data) {
    const tbody = document.querySelector('#booksTable tbody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" style="text-align:center;">No books found.</td>`;
        tbody.appendChild(row);
        return;
    }

    data.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book["Book Title"]}</td>
            <td>${book.Author}</td>
            <td>${book.Barcode}</td>
            <td class="${book.Status === 'Available' ? 'status-available' : 'status-checked-out'}">${book.Status}</td>
            <td>${book.User !== 'nan' ? book.User : ''}</td>
            <td>
                <button class="action-btn" onclick="checkOutBook('${book.Barcode}')">Check Out</button>
                <button class="action-btn" onclick="checkInBook('${book.Barcode}')">Check In</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function populateAuthorFilter(data) {
    const authorFilter = document.getElementById('authorFilter');
    const authors = [...new Set(data.map(book => book.Author).filter(Boolean))];
    authorFilter.innerHTML = '<option value="">Filter by Author</option>';
    authors.forEach(author => {
        const option = document.createElement('option');
        option.value = author;
        option.textContent = author;
        authorFilter.appendChild(option);
    });
}

function setupEventListeners() {
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('resetBtn').addEventListener('click', handleReset);
    document.getElementById('checkoutBtn').addEventListener('click', handleManualCheckout);
    document.getElementById('checkinBtn').addEventListener('click', handleManualCheckin);
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('confirmationModal').style.display = 'none';
    });
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const authorFilter = document.getElementById('authorFilter').value;

    const filteredBooks = books.filter(book => {
        const matchesSearch = book["Book Title"].toLowerCase().includes(searchTerm) || book.User.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter ? book.Status === statusFilter : true;
        const matchesAuthor = authorFilter ? book.Author === authorFilter : true;
        return matchesSearch && matchesStatus && matchesAuthor;
    });

    populateTable(filteredBooks);
}

function handleReset() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('authorFilter').value = '';
    populateTable(books);
}

function handleManualCheckout() {
    const barcode = document.getElementById('checkoutBarcode').value.trim();
    const username = document.getElementById('checkoutUsername').value.trim();
    if (barcode && username) {
        checkOutBook(barcode, username);
    } else {
        showModal('Missing Info', 'Please enter both barcode and username.');
    }
}

function handleManualCheckin() {
    const barcode = document.getElementById('checkinBarcode').value.trim();
    if (barcode) {
        checkInBook(barcode);
    } else {
        showModal('Missing Info', 'Please enter a barcode.');
    }
}

function checkOutBook(barcode, username = 'Guest') {
    const book = books.find(b => b.Barcode === barcode);
    if (book && book.Status === 'Available') {
        book.Status = 'Checked Out';
        book.User = username;
        populateTable(books);
        showModal('Checked Out', `"${book["Book Title"]}" has been checked out to ${username}.`);
    } else {
        showModal('Unavailable', 'Book is already checked out or not found.');
    }
}

function checkInBook(barcode) {
    const book = books.find(b => b.Barcode === barcode);
    if (book && book.Status === 'Checked Out') {
        book.Status = 'Available';
        book.User = 'nan';
        populateTable(books);
        showModal('Checked In', `"${book["Book Title"]}" has been checked in.`);
    } else {
        showModal('Error', 'Book is not checked out or not found.');
    }
}

function showModal(title, message) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('confirmationModal').style.display = 'flex';
}



