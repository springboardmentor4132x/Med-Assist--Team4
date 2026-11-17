import hashlib
import secrets
import hmac

ITERATIONS = 600000

def hash_password(password: str):
    salt = secrets.token_hex(16)

    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        ITERATIONS
    ).hex()

    return f"pbkdf2_sha256${ITERATIONS}${salt}${hashed}"


def verify_password(plain_password: str, hashed_password: str):
    try:
        algorithm, iterations, salt, stored_hash = hashed_password.split("$")

        if algorithm != "pbkdf2_sha256":
            return False

        new_hash = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            int(iterations)
        ).hex()

        return hmac.compare_digest(new_hash, stored_hash)

    except (ValueError, TypeError):
        return False