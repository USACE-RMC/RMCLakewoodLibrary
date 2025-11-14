let books = [];
let selectedBook = null;

// Load JSON data
fetch('RMCJSON.json')
  .then(response => response.json())
  .then(data => {
    books = data;
    populateTable(books);
    populateAuthorFilter(books);
  });

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

function populateAuthorFilter(data) {
  const authors = [...new Set(data.map(book => book.Author))];
  const authorFilter = document.getElementById('authorFilter');
  authors.forEach(author => {
    const option = document.createElement('option');
    option.value = author;
    option.textContent = author;
    authorFilter.appendChild(option);
  });
}

// Search and filter
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

// Checkout flow
function openNameModal(index) {
  selectedBook = index;
  document.getElementById('nameModal').style.display = 'flex';
}

document.getElementById('confirmNameBtn').addEventListener('click', () => {
  const name = document.getElementById('userNameInput').value.trim();
  if (name) {
    checkOutBook(selectedBook, name);
    document.getElementById('userNameInput').value = '';
    document.getElementById('nameModal').style.display = 'none';
  } else {
    alert('
