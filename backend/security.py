from pwdlib import PasswordHash

# Create password hashing object
password_hash = PasswordHash.recommended()


# Hash a password
def hash_password(password: str):
    return password_hash.hash(password)


# Verify a password
def verify_password(plain_password: str, hashed_password: str):
    return password_hash.verify(plain_password, hashed_password)