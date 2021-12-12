# X-12-OTF
COMP10120 Project for group X12
# Code Review
Can only change master branch via pull requests. So create a new branch for each feature
# Deployment
Deployment at: https://openthoughtfloor.herokuapp.com/

# Cloning
- Clone via HTTPS or SSH(will need to set up SSH keys like in gitlab)
- cd into directory
- python -m venv venv
- venv\Scripts\activate (vscode does this automatically every time you start a terminal)
- pip intall -r requirements.txt

# Database
- When developing, we will use local database only
- Download and install latest postgresql here: https://www.postgresql.org/download/
- This will give you access to the local database
- Create new txt file in the root directory of project called database_url.txt
- Write this in the file, and sub in your password (instead of YourPassword) you chose during installation: postgres://postgres:YourPassword@localhost:5432/postgres
- You can then use pg4 admin to easily inspect data.
- Running the app.py first time will generate all tables and some dummy data
- You want to test something not included in dummy data, you have to insert the data yourself 
# Running locally
- venv\Scripts\activate (vscode does this automatically every time you start a terminal)
- python app.py
