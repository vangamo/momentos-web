# How to install

## Steps followed during proof of concept

```bash
# install
sudo apt install python3-virtualenv
virtualenv server
pip install flask
pip install flask-restful
pip install flask-cors
# pip install psycopg2-binary
pip freeze > requirements.txt

# install
pip install -r requirements.txt

# activate
cd server
source bin/activate

# deactivate
deactivate

# docker run --name momentos-postgres -p 5432:5432 -e POSTGRES_USER=momentos -e POSTGRES_PASSWORD=mysecretpassword -d postgres
# docker container start momentos-postgres
```

## TODO: PostgreSQL

- <https://hub.docker.com/_/postgres/>
- <https://www.geeksforgeeks.org/postgresql-python-querying-data/>
- <https://www.rockyourcode.com/install-psycopg2-binary-with-docker/>
