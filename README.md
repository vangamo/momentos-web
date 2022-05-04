# Momentos Webapp

## Run in development mode

```bash
docker container start wpcare-postgres
cd server
source bin/activate
pip install -r requirements.txt
FLASK_ENV=development bin/flask run --debugger
```

## Notes:

### Python modules:

- <https://docs.python.org/3/tutorial/modules.html>

### Build a Python web server with Flask:

- <https://rapidapi.com/blog/how-to-build-an-api-in-python/>
- <https://flask-restful.readthedocs.io/en/latest/intermediate-usage.html>