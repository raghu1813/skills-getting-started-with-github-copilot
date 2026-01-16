import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)


def test_signup_and_unregister():
    # Get activities
    activities = client.get("/activities").json()
    if not activities:
        pytest.skip("No activities available to test signup.")
    activity_name = list(activities.keys())[0]
    test_email = "testuser@mergington.edu"

    # Sign up
    signup_url = f"/activities/{activity_name}/signup?email={test_email}"
    signup_response = client.post(signup_url)
    assert signup_response.status_code == 200
    assert "message" in signup_response.json()

    # Unregister
    unregister_url = f"/activities/{activity_name}/unregister?email={test_email}"
    unregister_response = client.post(unregister_url)
    assert unregister_response.status_code == 200
    assert "message" in unregister_response.json()
