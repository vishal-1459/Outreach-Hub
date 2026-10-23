import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Job Outreach Email Automation Backend"
    assert data["status"] == "running"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["contact_pdf"]["exists"] is True
    assert data["resume_pdf"]["exists"] is True

def test_contacts_endpoint():
    response = client.get("/contacts?start=1&end=5")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 5
    assert len(data["contacts"]) == 5
    assert data["contacts"][0]["sno"] == 1
    assert data["contacts"][0]["email"] == "akanksha.puri@sourcefuse.com"

def test_preview_endpoint():
    payload = {"start": 1, "end": 3}
    response = client.post("/preview", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 3
    assert len(data["previews"]) == 3
    assert "Akanksha" in data["previews"][0]["body"]

def test_send_endpoint_safety_guard():
    # Sending without confirm: true and without dry_run: true must be rejected
    payload = {"start": 1, "end": 2, "confirm": False, "dry_run": False}
    response = client.post("/send", json=payload)
    assert response.status_code == 400
    assert "Safety guard" in response.json()["detail"]

def test_send_endpoint_dry_run():
    payload = {"start": 1, "end": 2, "dry_run": True, "force": True}
    response = client.post("/send", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["dry_run"] is True
    assert data["processed"] == 2
    assert data["sent"] == 2
