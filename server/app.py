from flask import Flask, request, send_file
from flask_restful import Api, Resource
from flask_cors import CORS
import sqlite3

from datetime import timezone
import datetime
import json

con = sqlite3.connect('./data/moments.db')
cur = con.cursor()
try:
  cur.execute('SELECT id, name, start, end, type, categories FROM moments')
  allMoments = cur.fetchall()
  print(allMoments)
except:
  try:
    cur.execute('''DROP TABLE moments''')
    con.commit()
  except:
    pass

  cur.execute('''CREATE TABLE moments (
                   "id"	INTEGER NOT NULL,
                   name TEXT NOT NULL,
                   start TEXT NOT NULL,
                   end TEXT,
                   type TEXT,
                   categories TEXT,
	                 PRIMARY KEY("id" AUTOINCREMENT) )''')
  con.commit()

try:
  cur.execute('SELECT id, concept, amount, date, timestamp, category, ref, account FROM expenses')
  allMoments = cur.fetchall()
  print(allMoments)
except:
  try:
    cur.execute('''DROP TABLE expenses''')
    con.commit()
  except:
    pass

  cur.execute('''CREATE TABLE expenses (
                   "id"	INTEGER NOT NULL,
                   concept TEXT NOT NULL,
                   amount REAL NOT NULL,
                   date TEXT NOT NULL,
                   timestamp INTEGER NOT NULL,
                   category TEXT,
                   ref TEXT,
                   account TEXT,
	                 PRIMARY KEY("id" AUTOINCREMENT) )''')
  #                origin? ticket_image? items[]?
  con.commit()
con.close()


# FLASK_ENV=development bin/flask run --debugger

app = Flask(__name__, static_url_path='', static_folder='static_react')
cors = CORS(app, resources={'/api/*': {'origins': '*'}})
api = Api(app)

class Moment(Resource):
  def get(self, id:int=None):
    con = sqlite3.connect('./data/moments.db')
    print(id)
    
    if id is not None:
      return id, 200
    
    else:
      cur = con.cursor()
      cur.execute("select * from moments")
      allMoments = [ {"id": m[0], "name": m[1], "start": m[2], "cat": [] if m[5] is None else m[5] } for m in cur.fetchall() ]
      # allMoments = cur.fetchall()
      print(allMoments)
      return allMoments, 200

  def post(self):
    con = sqlite3.connect('./data/moments.db')
    cur = con.cursor()
    cur.execute('''INSERT INTO moments (name, start, categories) VALUES(:name,:date, :cat)''', request.json )
    request.json['id'] = cur.lastrowid
    con.commit()
    con.close()
    
    return request.json, 200

  def put(self, id=0):
    return 'Site not updated', 404

  def delete(self, id=0):
    return 'Site not deleted', 404

api.add_resource(Moment, "/api/moments/", "/api/moment/", "/api/moment/<int:id>")

class Expense(Resource):
  def get(self, id:int=None):
    con = sqlite3.connect('./data/moments.db')
    
    if id is not None:
      cur = con.cursor()
      cur.execute("select id, concept, amount, date, timestamp, category, account, business FROM expenses WHERE id=?", [id])
      e = cur.fetchone()
      expenseData = {"id": e[0], "concept": e[1], "amount": e[2], "date": e[3], "timestamp": e[4], "category": e[5], "account": e[6], "business": e[7]}
      
      return expenseData, 200
    
    else:
      cur = con.cursor()
      cur.execute('''
SELECT e.id, e.concept, e.amount, e.date, e.timestamp, e.category, e.account, eo.count, ei.count
FROM expenses e
  LEFT JOIN (SELECT expense_id, COUNT(*) count FROM expense_origin WHERE item_id IS NULL GROUP BY expense_id) AS eo ON (e.id = eo.expense_id)
  LEFT JOIN (SELECT expense_id, COUNT(*) count FROM expense_items GROUP BY expense_id) AS ei ON (e.id = ei.expense_id)
ORDER BY e.date DESC
''')
        
      allExpenses = [ {"id": e[0], "concept": e[1], "amount": e[2], "date": e[3], "timestamp": e[4], "category": e[5], "account": e[6], "originCount": e[7], "itemCount": e[8]} for e in cur.fetchall() ]
      
      return allExpenses, 200

  def post(self):
    con = sqlite3.connect('./data/moments.db')
    cur = con.cursor()
    dt = datetime.datetime.now(timezone.utc)
      
    utc_time = dt.replace(tzinfo=timezone.utc)
    utc_timestamp = utc_time.timestamp()

    request.json['timestamp'] = utc_timestamp
    request.json['ref'] = request.json['ref'] if 'ref' in request.json else None

    print( request.json )
    cur.execute('''INSERT INTO expenses (concept, amount, date, timestamp, category, ref, account) VALUES (:concept, :amount, :date, :timestamp, :category, :ref, :account)''', request.json )
    request.json['id'] = cur.lastrowid
    con.commit()
    con.close()

    return request.json, 200

  def put(self, id=0):
    if id < 1:
      return {'result': 'not_found'}, 404

    con = sqlite3.connect('./data/moments.db')
    cur = con.cursor()
    
    request.json['id'] = id
    request.json['ref'] = request.json['ref'] if 'ref' in request.json else None

    print( request.json )
    cur.execute(''' UPDATE expenses SET concept=:concept, amount=:amount, date=:date, timestamp=:timestamp, category=:category, ref=:ref, account=:account WHERE id=:id LIMIT 1 ''', request.json )
    con.commit()
    con.close()

    if cur.rowcount == 1:
      return {'result': 'OK'}, 200
    elif cur.rowcount == 0:
      return {'result': 'not_found'}, 404
    else:
      return {'result': 'wrong_rowcount_'+str(cur.rowcount)}, 500

  def delete(self, id=0):
    con = sqlite3.connect('./data/moments.db')
    cur = con.cursor()

    if id < 1:
      return {'result': 'not_found'}, 404

    cur.execute('''DELETE FROM expenses WHERE id=? LIMIT 1''', [id] )
    con.commit()
    con.close()
    if cur.rowcount == 1:
      return {'result': 'OK'}, 200
    elif cur.rowcount == 0:
      return {'result': 'not_found'}, 404
    else:
      return {'result': 'wrong_rowcount_'+str(cur.rowcount)}, 500

api.add_resource(Expense, "/api/expenses/", "/api/expense/", "/api/expense/<int:id>")

class ExpenseItem(Resource):
  def get(self, expenseId=None, itemId:int=None):
    print(id)
    con = sqlite3.connect('./data/moments.db')
    cur = con.cursor()
    cur.execute('''
SELECT eo.id origin_id, eo.origin, eo.data,
       ei.id item_id, ei.qty, ei.name, ei.brand, ei.amount
FROM expense_origin eo
  LEFT JOIN expense_items ei ON (eo.item_id = ei.id)
WHERE eo.expense_id = :expense_id AND eo.origin LIKE 'Ticket%'
UNION ALL
SELECT eo.id origin_id, eo.origin origin, eo.data data,
       ei.id item_id, ei.qty, ei.name, ei.brand, ei.amount
FROM expense_items ei
  LEFT JOIN expense_origin eo ON (ei.id = eo.item_id)
WHERE eo.id IS NULL AND ei.expense_id = :expense_id
ORDER BY origin_id, item_id;
    ''', {'expense_id': expenseId} )
    allTickets = [ {'itemOriginId': c[0], 'origin': c[1], 'data': c[2], 'itemId': c[3], 'qty': c[4], 'name': c[5], 'brand': c[6], 'amount': c[7]} for c in cur.fetchall() ]
    print(allTickets)
    return {'results': allTickets}, 200

  def post(self, expenseId=None):
    con = sqlite3.connect('./data/moments.db')
    cur = con.cursor()

    print(request.json)

    newItem = {
      'qty': request.json['qty'] if 'qty' in request.json and request.json['qty'] != '' else 1,
      'name': request.json['name'],
      'brand': request.json['brand'] if 'brand' in request.json and request.json['brand'] != '' else None,
      'amount': request.json['amount'],
      'expense_id': expenseId
    }

    cur.execute('''
INSERT INTO expense_items (qty, name, brand, amount, expense_id)
VALUES (:qty, :name, :brand, :amount, :expense_id)
      ''', newItem )
    newItem['id'] = cur.lastrowid

    newItemOrigin = {
      'data': request.json['data'],
      'expense_id': expenseId,
      'item_id': newItem['id']
    }

    cur.execute('''
INSERT INTO expense_origin (origin, data, expense_id, item_id)
VALUES ((SELECT 'Ticket ' || business FROM expenses WHERE id=:expense_id), :data, :expense_id, :item_id );
      ''', newItemOrigin )
    newItemOrigin['id'] = cur.lastrowid
    newItemOrigin['origin'] = '???'

    con.commit()
    con.close()

    result = {
      'itemOriginId': newItemOrigin['id'],
      'origin': newItemOrigin['origin'],
      'data': newItemOrigin['data'], 
      'itemId': newItem['id'],
      'qty': newItem['qty'],
      'name': newItem['name'],
      'brand': newItem['brand'], 
      'amount': newItem['amount']}

    return {"status": "Ok", "result": result}, 200

  def put(self, expenseId=None):
    return {'status': 'Not implemented'}, 501
  def delete(self, expenseId=None):
    return {'status': 'Not implemented'}, 501

api.add_resource(ExpenseItem, "/api/expense/<int:expenseId>/items", "/api/expense/<int:expenseId>/item", "/api/expense/<int:itemIid>/item/<int:itemId>")

@app.route('/api/expenses/items', methods=['GET'])
def get_expenses_items():
  print(request.args['q'])
  origin = 'Ticket ' + request.args['q']

  con = sqlite3.connect('./data/moments.db')
  cur = con.cursor()
  cur.execute('''
SELECT ei.name, ei.brand, ei.amount, MIN(eo.id) as id, eo.origin, eo.data, COUNT(*) count
FROM expense_origin eo
  LEFT JOIN expense_items ei ON (eo.item_id = ei.id)
WHERE eo.origin = ?
GROUP BY ei.name, ei.brand, ei.amount, eo.origin, eo.data
ORDER BY count DESC, id;
  ''', [origin])
  allTicket = [ {"name": c[0], "brand": c[1], 'amount': c[2], 'id': c[3], 'origin': c[4], 'data': c[5], 'count': c[6]} for c in cur.fetchall() ]
  
  print(allTicket)
  return {'results': allTicket}, 200

@app.route('/api/expenses/categories', methods=['GET'])
def get_expense_categories():
  con = sqlite3.connect('./data/moments.db')
  cur = con.cursor()
  cur.execute("SELECT category, COUNT(*) AS counter FROM expenses GROUP BY category ORDER BY counter DESC")
  allCategories = [ {"category": c[0], "count": c[1]} for c in cur.fetchall() ]
  
  print(allCategories)
  return {'results': allCategories}, 200

@app.route('/api/export', methods=['GET'])
def export():
  con = sqlite3.connect('./data/moments.db')
  cur = con.cursor()
  cur.execute("select id, concept, amount, date, timestamp, category, ref, account from expenses")
  allExpenses = [ {"id": e[0], "concept": e[1], "amount": e[2], "date": e[3], "timestamp": e[4], "category": e[5], "ref": e[6], "account": e[7]} for e in cur.fetchall() ]
  print(allExpenses)

  cur.execute("select * from moments")
  allMoments = [ {"id": m[0], "name": m[1], "start": m[2], "cat": [] if m[5] is None else m[5] } for m in cur.fetchall() ]
  # allMoments = cur.fetchall()
  print(allMoments)

  with open('./data/tmp/export.json', 'w', encoding='utf8') as file:
    file.write( json.dumps({"moments":allMoments, "expenses": allExpenses}, sort_keys=True, indent=2) )

  return send_file(
    './data/tmp/export.json',
    mimetype='application/json',
    as_attachment=True,
    attachment_filename='export.json')


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