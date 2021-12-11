from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

class Database:
    def __init__(self, app):
        self.db = SQLAlchemy(app)
        self.migrate = Migrate(app, self.db)
        self.create_test_database()

        # self.db.session.execute("""
        # UPDATE test
        # SET test_text = 'This has been updated'
        # WHERE test_id = 2
        # """)
        # self.db.session.commit()
        # self.db.session.close()

    def create_test_database(self):
        self.db.session.execute("""
        CREATE TABLE IF NOT EXISTS test
        (
            test_id serial NOT NULL,
            test_text character varying(200) NOT NULL,
            PRIMARY KEY (test_id)
        );
        """)
        self.db.session.commit()
        self.db.session.close()
    

    def insert_dummy_data(self):
        self.db.session.execute("""
        INSERT INTO test (test_text)
        VALUES('Hello worlds')
        """)
        self.db.session.commit()
        self.db.session.close()

    def select_from_test(self):
        result = self.db.session.execute("""
        SELECT * 
        FROM test
        ORDER BY test_id ASC
        """)
        self.db.session.commit()
        self.db.session.close()
        return result
