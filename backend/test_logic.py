from logic import get_report_status
from datetime import datetime, timedelta

def test_logic():
    today = datetime.now()
    
    # Test 1: Due date is 3 days from now (should be Effectué)
    due_date_3 = (today + timedelta(days=3)).strftime("%Y-%m-%d")
    assert get_report_status(due_date_3) == True
    print(f"Test 1 Passed: {due_date_3} is Effectué")

    # Test 2: Due date is today (should be Non effectué)
    due_date_0 = today.strftime("%Y-%m-%d")
    assert get_report_status(due_date_0) == False
    print(f"Test 2 Passed: {due_date_0} is Non effectué")

    # Test 3: Due date is exactly 2 days from now (should be Non effectué based on > threshold)
    due_date_2 = (today + timedelta(days=2)).strftime("%Y-%m-%d")
    # depending on the exact second, but the comparison is on days
    # actually, threshold = today + timedelta(days=2). 
    # if today is 2026-03-01 16:00, threshold is 2026-03-03 16:00.
    # due_date_str 2026-03-03 is parsed as 2026-03-03 00:00.
    # 2026-03-03 00:00 < 2026-03-03 16:00.
    # So it should be False.
    assert get_report_status(due_date_2) == False
    print(f"Test 3 Passed: {due_date_2} is Non effectué")

if __name__ == "__main__":
    test_logic()
