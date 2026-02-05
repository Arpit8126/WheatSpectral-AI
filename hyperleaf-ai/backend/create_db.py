import sqlalchemy
from sqlalchemy import create_engine, text
from database import Base, SQLALCHEMY_DATABASE_URL
# We need to import models so Base knows about them
import models 

def create_database_if_not_exists():
    # Parse the URL to get the base URL to connect to 'postgres' db
    # Assumes format: postgresql://user:pass@host/dbname
    base_url = SQLALCHEMY_DATABASE_URL.rsplit('/', 1)[0] + '/postgres'
    db_name = SQLALCHEMY_DATABASE_URL.rsplit('/', 1)[1]
    
    engine = create_engine(base_url, isolation_level="AUTOCOMMIT")
    with engine.connect() as conn:
        # Check if database exists
        result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'"))
        if not result.fetchone():
            print(f"Database '{db_name}' does not exist. Creating...")
            conn.execute(text(f"CREATE DATABASE {db_name}"))
            print(f"Database '{db_name}' created.")
        else:
            print(f"Database '{db_name}' already exists.")

def init_tables():
    # Now connect to the actual DB and create tables
    # Need to re-create engine here or import it after DB creation? 
    # The 'engine' imported from database.py was created at module level.
    # If the DB didn't exist, that engine creation might not have failed yet (lazy connection),
    # but using it would fail if DB didn't exist.
    
    from database import engine
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    create_database_if_not_exists()
    init_tables()
