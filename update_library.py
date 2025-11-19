import json
import csv
import os
import sys

# Load issue body from environment variable
issue_body = os.environ.get("ISSUE_BODY", "")

try:
    # Try to parse JSON
    data = json.loads(issue_body)

    # Validate required keys
    required_keys = {"barcode", "user", "action"}
    if not isinstance(data, dict):
        raise ValueError("Issue body is not a JSON object")

    missing = required_keys - data.keys()
    if missing:
        raise ValueError(f"Missing required keys: {missing}")

except json.JSONDecodeError:
    print("❌ Issue body is not valid JSON.")
    sys.exit(1)

except ValueError as e:
    print(f"❌ Validation error: {e}")
    sys.exit(1)

# If we reach here, JSON is valid and has required fields
barcode = data["barcode"]
user = data["user"]
action = data["action"]

# Load library data
with open("data/library.json", "r") as f:
    books = json.load(f)

# Update book status
updated = False
for book in books:
    if book["Barcode"] == barcode:
        if action == "checkout":
            book["Status"] = "Checked Out"
            book["User"] = user
            updated = True
        elif action == "checkin":
            book["Status"] = "Available"
            book["User"] = ""
            updated = True

if not updated:
    print(f"⚠️ No book found with barcode {barcode}.")
    sys.exit(1)

# Save updated library data
with open("data/library.json", "w") as f:
    json.dump(books, f, indent=2)

with open("data/library.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["Book Title", "Author", "Barcode", "Status", "User"])
    writer.writeheader()
    writer.writerows(books)

print("✅ Library updated successfully.")
