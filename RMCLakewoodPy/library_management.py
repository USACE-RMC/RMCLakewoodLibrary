import tkinter as tk
from tkinter import messagebox, ttk
import csv
import os

# Load books from CSV file
def load_books():
    books = []
    try:
        # Debugging: Print the current working directory
        print("Current working directory:", os.getcwd())
        
        # Attempt to open the CSV file
        with open("LibraryBooks.csv", mode="r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            
            # Debugging: Print the headers of the CSV file
            print("CSV Headers:", reader.fieldnames)
            
            for row in reader:
                books.append({
                    "Book_Title": row.get("Book_Title", "").strip(),
                    "Author": row.get("Author", "").strip(),
                    "Barcode": row.get("Barcode", "").strip(),
                    "Status": row.get("Status", "").strip(),
                    "User": row.get("User", "").strip()
                })
        
        # Debugging: Print the loaded books
        print("Books loaded:", books)
        
    except FileNotFoundError:
        messagebox.showerror("Error", "LibraryBooks.csv file not found.")
    except Exception as e:
        messagebox.showerror("Error", f"An error occurred while loading books: {e}")
    return books

# Save books to CSV file
def save_books(books):
    try:
        with open("LibraryBooks.csv", mode="w", encoding="utf-8", newline="") as file:
            fieldnames = ["Book_Title", "Author", "Barcode", "Status", "User"]
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(books)
    except Exception as e:
        messagebox.showerror("Error", f"An error occurred while saving books: {e}")

# Search books
def search_books():
    query = search_entry.get().strip().lower()
    search_by = search_by_var.get()
    results = []
    for book in books:
        if query in book[search_by].lower():
            results.append(book)
    update_treeview(results)

# Check out a book
def check_out_book():
    barcode = barcode_entry.get().strip()
    user = user_entry.get().strip()
    if not barcode or not user:
        messagebox.showerror("Error", "Please enter both barcode and user name.")
        return
    for book in books:
        if book["Barcode"] == barcode:
            if book["Status"] == "Available":
                book["Status"] = "Checked Out"
                book["User"] = user
                save_books(books)
                update_treeview(books)
                messagebox.showinfo("Success", f'Book "{book["Book_Title"]}" checked out by {user}.')
                return
            else:
                messagebox.showerror("Error", f'Book "{book["Book_Title"]}" is already checked out.')
                return
    messagebox.showerror("Error", "Barcode not found.")

# Check in a book
def check_in_book():
    barcode = barcode_entry.get().strip()
    if not barcode:
        messagebox.showerror("Error", "Please enter the barcode.")
        return
    for book in books:
        if book["Barcode"] == barcode:
            if book["Status"] == "Checked Out":
                book["Status"] = "Available"
                book["User"] = ""
                save_books(books)
                update_treeview(books)
                messagebox.showinfo("Success", f'Book "{book["Book_Title"]}" checked in.')
                return
            else:
                messagebox.showerror("Error", f'Book "{book["Book_Title"]}" is already available.')
                return
    messagebox.showerror("Error", "Barcode not found.")

# Update treeview with books
def update_treeview(data):
    for item in tree.get_children():
        tree.delete(item)
    for book in data:
        tree.insert("", "end", values=(book["Book_Title"], book["Author"], book["Barcode"], book["Status"], book["User"]))

# Load books
books = load_books()

# Debugging: Check if books list is empty
if not books:
    print("No books loaded. Please check the CSV file.")

# Create GUI
root = tk.Tk()
root.title("Library Management System")

# Search Section
search_frame = tk.Frame(root)
search_frame.pack(pady=10)
search_label = tk.Label(search_frame, text="Search:")
search_label.pack(side="left", padx=5)
search_entry = tk.Entry(search_frame)
search_entry.pack(side="left", padx=5)
search_by_var = tk.StringVar(value="Book_Title")
search_by_menu = ttk.Combobox(search_frame, textvariable=search_by_var, values=["Book_Title", "Author", "User"], state="readonly")
search_by_menu.pack(side="left", padx=5)
search_button = tk.Button(search_frame, text="Search", command=search_books)
search_button.pack(side="left", padx=5)

# Treeview for displaying books
tree = ttk.Treeview(root, columns=("Book_Title", "Author", "Barcode", "Status", "User"), show="headings")
tree.heading("Book_Title", text="Book Title")
tree.heading("Author", text="Author")
tree.heading("Barcode", text="Barcode")
tree.heading("Status", text="Status")
tree.heading("User", text="User")
tree.pack(pady=10, fill="both", expand=True)
update_treeview(books)

# Check Out/In Section
action_frame = tk.Frame(root)
action_frame.pack(pady=10)
barcode_label = tk.Label(action_frame, text="Barcode:")
barcode_label.pack(side="left", padx=5)
barcode_entry = tk.Entry(action_frame)
barcode_entry.pack(side="left", padx=5)
user_label = tk.Label(action_frame, text="User:")
user_label.pack(side="left", padx=5)
user_entry = tk.Entry(action_frame)
user_entry.pack(side="left", padx=5)
check_out_button = tk.Button(action_frame, text="Check Out", command=check_out_book)
check_out_button.pack(side="left", padx=5)
check_in_button = tk.Button(action_frame, text="Check In", command=check_in_book)
check_in_button.pack(side="left", padx=5)

# Run the application
root.mainloop()