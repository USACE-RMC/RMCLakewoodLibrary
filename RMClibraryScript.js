// ✅ Keep your data source URL (pointing to CSV now)
const DATA_URL = 'https://raw.githubusercontent.com/USACE-RMC/RMCLakewoodLibrary/main/library.csv';

let books = [];
let selectedBook = null;

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  fetchBooks();
  setupEventListeners();
});

// ✅ Fetch CSV data using PapaParse
function fetchBooks() {
  Papa.parse(DATA_URL, {
    download: true,       // fetch the file from the URL
    header: true,         // use the first row as column headers
    skipEmptyLines: true, // ignore blank rows
    complete: function(results) {
      books = results.data; // PapaParse returns an array of objects
      populateTable(books);
      populateAuthorFilter(books);
    },
    error: function(err) {
      console.error('Error loading books:', err);
    }
  });
}

// ✅ Build table
function populateTable(data) {
  const tbody = document.querySelector('#booksTable tbody');
  tbody.innerHTML = '';
  data.forEach((book, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book["Book Title"]}</td>
      <td>${book.Author}</td>
      <td>${book.Barcode}</td>
      <td class="${book.Status === 'Available' ? 'status-available' : 'status-checked-out'}">${book.Status}</td>
      <td>${book.User !== 'nan' ? book.User : ''}</td>
      <td>
        ${book.Status === 'Available' 
          ? `<button class="action-btn" onclick="openNameModal(${index})">Check Out</button>` 
          : `<button class="action-btn" onclick="checkInBook(${index})">Check In</button>`}
      </td>
    `;
    tbody.appendChild(row);
  });
}

// ✅ Populate author filter
function populateAuthorFilter(data) {
  const authors = [...new Set(data.map(book => book.Author))];
  const authorFilter = document.getElementById('authorFilter');
  authorFilter.innerHTML = '<option value="">Filter by Author</option>';
  authors.forEach(author => {
    const option = document.createElement('option');
    option.value = author;
    option.textContent = author;
    authorFilter.appendChild(option);
  });
}

// ✅ Event listeners for search/filter
function setupEventListeners() {
  document.getElementById('searchBtn').addEventListener('click', () => {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const filtered = books.filter(book =>
      book["Book Title"].toLowerCase().includes(searchValue) ||
      (book.User && book.User.toLowerCase().includes(searchValue))
    );
    populateTable(filtered);
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('authorFilter').value = '';
    populateTable(books);
  });

  document.getElementById('statusFilter').addEventListener('change', e => {
    const value = e.target.value;
    const filtered = value ? books.filter(book => book.Status === value) : books;
    populateTable(filtered);
  });

  document.getElementById('authorFilter').addEventListener('change', e => {
    const value = e.target.value;
    const filtered = value ? books.filter(book => book.Author === value) : books;
    populateTable(filtered);
  });

  // Close modals
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('confirmationModal').style.display = 'none';
  });
  document.getElementById('cancelNameBtn').addEventListener('click', () => {
    document.getElementById('nameModal').style.display = 'none';
  });
  document.getElementById('confirmNameBtn').addEventListener('click', () => {
    const name = document.getElementById('userNameInput').value.trim();
    if (name) {
      checkOutBook(selectedBook, name);
      document.getElementById('userNameInput').value = '';
      document.getElementById('nameModal').style.display = 'none';
    } else {
      alert('Please enter your name to check out a book.');
    }
  });
}

// ✅ Checkout flow
function openNameModal(index) {
  selectedBook = index;
  document.getElementById('nameModal').style.display = 'flex';
}

function checkOutBook(index, userName) {
  if (books[index].Status === "Available") {
    books[index].Status = "Checked Out";
    books[index].User = userName;
    populateTable(books);
    showConfirmation("Book Checked Out", `"${books[index]["Book Title"]}" has been checked out by ${userName}.`);
  } else {
    showConfirmation("Error", `"${books[index]["Book Title"]}" is already checked out.`);
  }
}

function checkInBook(index) {
  if (books[index].Status === "Checked Out") {
    const userName = books[index].User;
    books[index].Status = "Available";
    books[index].User = "nan";
    populateTable(books);
    showConfirmation("Book Checked In", `"${books[index]["Book Title"]}" has been returned by ${userName}.`);
  } else {
    showConfirmation("Error", `"${books[index]["Book Title"]}" is not currently checked out.`);
  }
}

// ✅ Confirmation modal
function showConfirmation(title, message) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalMessage").textContent = message;
  document.getElementById("confirmationModal").style.display = "flex";
}


