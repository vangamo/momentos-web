from flask import Flask, request, send_file
from flask_restful import Api, Resource
from flask_cors import CORS

# FLASK_ENV=development bin/flask run --debugger

app = Flask(__name__, static_url_path='', static_folder='static_react')
cors = CORS(app, resources={'/api/*': {'origins': '*'}})
api = Api(app)

class Moment(Resource):
  def get(self, id:int=None):
    print(id)
    
    if id is not None:
      return id, 200
    
    else:
      return {"error": True, "message": "Site not found"}, 404

  def post(self, id=0):
    return 'Site not created', 404

  def put(self, id=0):
    return 'Site not updated', 404

  def delete(self, id=0):
    return 'Site not deleted', 404

api.add_resource(Moment, "/api/moments/", "/api/moment/", "/api/moment/<int:id>")

@app.route('/api/moment/<mmt_id>/contact/<contact_id>/')
def get_example(mmt_id=None, contact_id=None):
  if not mmt_id.isnumeric() or not contact_id.isnumeric():
    return 'Wrong identifiers'
  
  return send_file(
    './static_react/index.html',
    mimetype='image/jpeg',
    as_attachment=True,
    attachment_filename='index.html')

## React routes

@app.route('/sites/<path:whatever>')
@app.route('/site/<path:whatever>')
@app.route('/clients/<path:whatever>')
@app.route('/client/<path:whatever>')
def get_react_landing_with_params(whatever):
  return app.send_static_file('index.html')

@app.route('/sites/')
@app.route('/site/')
@app.route('/clients/')
@app.route('/client/')
@app.route('/')
def get_react_landing():
  return app.send_static_file('index.html')

# if __name__ == '__main__':
#   app.run(debug=True)