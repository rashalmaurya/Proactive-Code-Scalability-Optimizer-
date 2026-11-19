from data_cleaner import clean_csv


def test_clean_duplicates():
    csv_text = "name,age\nAlice,25\nAlice,25\nBob,30"
    result = clean_csv(csv_text)
    assert result["duplicates_removed"] == 1
    assert result["cleaned_rows"] == 2


def test_clean_missing():
    csv_text = "name,age\nAlice,\nBob,30"
    result = clean_csv(csv_text)
    assert result["missing_values"] == 1


def test_clean_whitespace():
    csv_text = "name,age\n  Alice  ,25\nBob,30"
    result = clean_csv(csv_text)
    assert result["cleaned_rows"] == 2
