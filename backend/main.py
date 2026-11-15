
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import UserRegister, UserLogin
from security import hash_password, verify_password
from database import get_connection
from auth import create_access_token


# Create our FastAPI application
app = FastAPI(title="MedAssist AI Backend")


# Enable communication with React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to MedAssist AI Backend!"
    }


# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "Backend is running"
    }


# Database connection check
@app.get("/db-check")
def database_check():
    try:
        connection = get_connection()
        connection.close()

        return {
            "message": "PostgreSQL connected successfully!"
        }

    except Exception:
        return {
            "message": "Database connection failed"
        }


# User registration endpoint
@app.post("/register")
def register_user(user: UserRegister):

    connection = get_connection()
    cursor = connection.cursor()

    try:
        # Check whether email already exists
        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (user.email,)
        )

        if cursor.fetchone():
            raise HTTPException(
                status_code=409,
                detail="Email is already registered"
            )

        # Hash the password
        hashed_password = hash_password(user.password)

        # Save user details in PostgreSQL
        cursor.execute(
            """
            INSERT INTO users
            (full_name, email, password_hash, age, gender, contact)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                user.full_name,
                user.email,
                hashed_password,
                user.age,
                user.gender,
                user.contact
            )
        )

        user_id = cursor.fetchone()[0]
        connection.commit()

        return {
            "message": "Registration successful",
            "user_id": user_id
        }

    except HTTPException:
        connection.rollback()
        raise

    except Exception:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail="Registration failed"
        )

    finally:
        cursor.close()
        connection.close()


# User login endpoint
@app.post("/login")
def login_user(user: UserLogin):

    connection = get_connection()
    cursor = connection.cursor()

    try:
        # Find user by email
        cursor.execute(
            """
            SELECT id, email, password_hash
            FROM users
            WHERE email = %s
            """,
            (user.email,)
        )

        existing_user = cursor.fetchone()

        # Check whether user exists
        if not existing_user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        user_id, email, stored_password_hash = existing_user

        # Verify entered password
        if not verify_password(user.password, stored_password_hash):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        # Generate JWT access token
        access_token = create_access_token(user_id, email)

        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer"
        }

    finally:
        cursor.close()
        connection.close()
