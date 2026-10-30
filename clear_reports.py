import requests

url = "https://spotholes-dashboard-default-rtdb.firebaseio.com/roadReports.json"

confirm = input(
    "Type DELETE or DELETE roadReports to permanently remove all reports: "
).strip()

if confirm in ["DELETE", "DELETE roadReports", "yes", "y"]:
    response = requests.delete(url, timeout=30)
    response.raise_for_status()
    print("Deleted roadReports successfully.")
else:
    print("Cancelled. No deletion requested.")
