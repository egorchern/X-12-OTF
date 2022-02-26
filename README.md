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
- You can then use pg4 admin to easily inspect data.
# Running locally
- venv\Scripts\activate (vscode does this automatically every time you start a terminal)
- python app.py

# Environmental variables for running locally
- You have to configure the environmental variables before running the app.py
- Set the following environmental variables:
- DATABASE_URL: postgres://postgres:YourPassword@localhost:5432/postgres
- MAILING_EMAIL: mailing email address
- MAILING_PASSWORD: mailing email password
To set environmental variables permanently in Windows
- Launch CMD as administrator
- Type SETX EnvironmentVariableNameHere ValueHere /m
- Make sure to restart your machine, otherwise the newly added environmental variable won't be accessible
To set environmental variables permanently in Linux
- Launch shell
- Type sudo -H vi /etc/environment
- Enter password
- Add variable in the file opened. NAME=Value
- Save and close the file
- Logout and Login again

