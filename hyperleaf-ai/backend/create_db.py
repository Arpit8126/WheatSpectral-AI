import sqlalchemy
from sqlalchemy import create_engine, text
from database import Base, SQLALCHEMY_DATABASE_URL, engine
import models 

def create_database_if_not_exists():
    if "postgresql" in SQLALCHEMY_DATABASE_URL:
        try:
            base_url = SQLALCHEMY_DATABASE_URL.rsplit('/', 1)[0] + '/postgres'
            db_name = SQLALCHEMY_DATABASE_URL.rsplit('/', 1)[1].split('?')[0]
            
            temp_engine = create_engine(base_url, isolation_level="AUTOCOMMIT", connect_args={"connect_timeout": 2})
            with temp_engine.connect() as conn:
                result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'"))
                if not result.fetchone():
                    print(f"[INFO] Database '{db_name}' does not exist. Creating...")
                    conn.execute(text(f"CREATE DATABASE {db_name}"))
                    print(f"[SUCCESS] Database '{db_name}' created.")
                else:
                    print(f"[INFO] Database '{db_name}' verified.")
        except Exception as e:
            print(f"[INFO] Remote Postgres check skipped: {e}")

def init_tables():
    print("[INFO] Initializing tables...")
    Base.metadata.create_all(bind=engine)
    print("[SUCCESS] Tables verified and created successfully!")

if __name__ == "__main__":
    create_database_if_not_exists()
    init_tables()
