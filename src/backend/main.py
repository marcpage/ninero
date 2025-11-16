#!/usr/bin/env python3


"""Babysitter Match - tiny FastAPI backend (SQLite, JWT)"""


from datetime import datetime
from hashlib import sha256
from sqlite3 import connect, IntegrityError

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from jwt import encode, decode, ExpiredSignatureError, InvalidTokenError


app = FastAPI(title="Babysitter Match API")

# MARK: CORS (allow any origin in dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MARK: SQLite setup
DB_FILE = "babysitter.db"
conn = connect(DB_FILE, check_same_thread=False)
cursor = conn.cursor()

# Tables
cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password_hash TEXT,
        name TEXT,
        is_babysitter BOOLEAN DEFAULT 0
    )
    """
)

cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        parent_id INTEGER,
        created_at TEXT,
        FOREIGN KEY(parent_id) REFERENCES users(id)
    )
    """
)

cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        babysitter_id INTEGER,
        message TEXT,
        applied_at TEXT,
        FOREIGN KEY(job_id) REFERENCES jobs(id),
        FOREIGN KEY(babysitter_id) REFERENCES users(id)
    )
    """
)

conn.commit()

# MARK: Security
SECRET_KEY = "change_this_in_production_123456789"
ALGORITHM = "HS256"
security = HTTPBearer()


def hash_password(password: str) -> str:
    """Return SHA-256 hex digest of *password*."""
    return sha256(password.encode()).hexdigest()


def create_token(user_id: int) -> str:
    """Create a JWT that expires in 1 hour."""
    payload = {
        "sub": str(user_id),  # <-- store as string (jwt lib expects string)
        "exp": datetime.utcnow().timestamp() + 3600,
    }
    return encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> int:
    """Validate JWT and return user id (int)."""
    try:
        payload = decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        user_id_str: str = payload["sub"]
        return int(user_id_str)  # <-- convert back to int
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc


# MARK: Pydantic models
class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    is_babysitter: bool = False


class Login(BaseModel):
    email: str
    password: str


class JobCreate(BaseModel):
    title: str
    description: str


class ApplicationCreate(BaseModel):
    job_id: int
    message: str


# MARK: Routes
@app.post("/register")
def register(user: UserCreate):
    hashed = hash_password(user.password)
    try:
        cursor.execute(
            """
            INSERT INTO users (email, password_hash, name, is_babysitter)
            VALUES (?, ?, ?, ?)
            """,
            (user.email, hashed, user.name, user.is_babysitter),
        )
        conn.commit()
        user_id = cursor.lastrowid
        assert user_id
        return {"message": "Registered", "token": create_token(user_id)}
    except IntegrityError as exc:
        raise HTTPException(status_code=400, detail="Email already exists") from exc


@app.post("/login")
def login(creds: Login):
    hashed = hash_password(creds.password)
    cursor.execute(
        "SELECT id FROM users WHERE email = ? AND password_hash = ?",
        (creds.email, hashed),
    )
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"token": create_token(row[0])}


@app.get("/jobs")
def get_jobs():
    cursor.execute("SELECT id, title, description FROM jobs ORDER BY id DESC")
    return [{"id": r[0], "title": r[1], "description": r[2]} for r in cursor.fetchall()]


@app.post("/jobs")
def post_job(job: JobCreate, user_id: int = Depends(verify_token)):
    cursor.execute(
        """
        INSERT INTO jobs (title, description, parent_id, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (job.title, job.description, user_id, datetime.utcnow().isoformat()),
    )
    conn.commit()
    return {"message": "Job posted"}


@app.post("/apply")
def apply(application: ApplicationCreate, user_id: int = Depends(verify_token)):
    cursor.execute(
        """
        INSERT INTO applications (job_id, babysitter_id, message, applied_at)
        VALUES (?, ?, ?, ?)
        """,
        (
            application.job_id,
            user_id,
            application.message,
            datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()
    return {"message": "Applied!"}


@app.get("/")
def root():
    return {
        "message": "Babysitter Match API is running! Visit /docs for the interactive UI."
    }
