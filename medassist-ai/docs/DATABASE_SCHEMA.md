# Database Schema (Module 1)

```mermaid
erDiagram
    USERS ||--o{ MEDICAL_RECORDS : "has"
    USERS ||--o{ ACCESS_GRANTS : "patient grants"
    USERS ||--o{ ACCESS_GRANTS : "doctor/clinic receives"
    USERS {
        int id PK
        string full_name
        string email UK
        string hashed_password
        int age
        string gender
        string contact
        string address
        string blood_group
        string role "patient|doctor|clinic|admin"
        bool is_active
        datetime created_at
    }
    MEDICAL_RECORDS {
        int id PK
        int patient_id FK
        string record_type
        string title
        text description
        date diagnosed_on
        string status
        datetime created_at
    }
    ACCESS_GRANTS {
        int id PK
        int patient_id FK
        int grantee_id FK
        datetime created_at
    }
    REVOKED_TOKENS {
        string jti PK
        datetime expires_at
    }
```

Tables are created automatically when the backend starts.

## API summary

| Method | Endpoint | Who |
|---|---|---|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| POST | /api/auth/logout | logged in |
| GET / PUT | /api/users/me | logged in (own profile) |
| GET | /api/users/{id} | self, admin, or authorised doctor/clinic |
| GET / POST | /api/history | patient (own) |
| PUT / DELETE | /api/history/{id} | patient (own) |
| GET | /api/history/patient/{id} | self or authorised doctor/clinic |
| GET / POST | /api/access | patient: list / grant access |
| DELETE | /api/access/{grantee_id} | patient: revoke |
| GET | /api/access/patients | doctor/clinic |
| GET | /api/admin/users, /api/admin/stats | admin |
| PATCH | /api/admin/users/{id}/role, /status | admin |
| POST | /api/admin/access | admin |
