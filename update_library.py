import json

def update_library(data):
    with open('library.json', 'w') as file:
        json.dump(data, file, indent=4)

# Example usage
if __name__ == "__main__":
    with open('library.json', 'r') as file:
        library_data = json.load(file)

    # Modify library_data as needed
    # Example: library_data[0]['Status'] = 'Checked Out'

    update_library(library_data)
