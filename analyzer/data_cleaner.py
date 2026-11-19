import csv
import io


def clean_csv(csv_text: str) -> dict:
    reader = csv.DictReader(io.StringIO(csv_text))
    rows = list(reader)
    headers = reader.fieldnames or []

    issues = []
    cleaned_rows = []
    duplicates = 0
    missing = 0
    seen = set()

    for i, row in enumerate(rows):
        row_key = str(sorted(row.items()))
        if row_key in seen:
            duplicates += 1
            issues.append({"row": i+1, "type": "duplicate", "message": "Duplicate row removed"})
            continue
        seen.add(row_key)

        cleaned_row = {}
        for key, value in row.items():
            if value is None or value.strip() == '':
                missing += 1
                issues.append({"row": i+1, "col": key, "type": "missing", "message": f"Missing value in column '{key}'"})
                cleaned_row[key] = "N/A"
            else:
                cleaned_row[key] = value.strip()
        cleaned_rows.append(cleaned_row)

    output = io.StringIO()
    if cleaned_rows and headers:
        writer = csv.DictWriter(output, fieldnames=headers)
        writer.writeheader()
        writer.writerows(cleaned_rows)

    return {
        "original_rows": len(rows),
        "cleaned_rows": len(cleaned_rows),
        "duplicates_removed": duplicates,
        "missing_values": missing,
        "issues": issues,
        "cleaned_csv": output.getvalue(),
        "message": f"Cleaned {len(rows)} rows: removed {duplicates} duplicates, fixed {missing} missing values"
    }
