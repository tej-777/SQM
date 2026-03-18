#!/usr/bin/env python3

from datetime import datetime, date

# Test date conversion logic
test_dates = [
    "2026-03-05",  # Frontend format
    "3/5/2026",    # Staff dashboard format (mentioned by user)
    date(2026, 3, 5),  # Python date object
]

print("Testing date conversion logic:")
for test_date in test_dates:
    print(f"\nInput: {test_date} (type: {type(test_date)})")
    
    if isinstance(test_date, str):
        try:
            # Try YYYY-MM-DD format first
            converted = datetime.strptime(test_date, "%Y-%m-%d").date()
            print(f"  Converted (YYYY-MM-DD): {converted}")
        except ValueError:
            try:
                # Try M/D/YYYY format
                converted = datetime.strptime(test_date, "%m/%d/%Y").date()
                print(f"  Converted (M/D/YYYY): {converted}")
            except ValueError:
                print(f"  Error: Could not parse date format")
    else:
        print(f"  Using date object directly: {test_date}")

print("\nDatabase comparison test:")
# Test how dates would be compared in database
db_date = date(2026, 3, 5)
query_date = date(2026, 3, 5)

print(f"Database date: {db_date}")
print(f"Query date: {query_date}")
print(f"Equal: {db_date == query_date}")
print(f"Same type: {type(db_date) == type(query_date)}")
