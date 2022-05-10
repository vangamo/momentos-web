import { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import '../../styles/Form.scss';

const { NODE_ENV } = process.env;
const HOST_API = 'production' === NODE_ENV ? '' : `${window.location.protocol}//${window.location.hostname}:5000`;

function ExpensesAdd(props) {
  const [categories, setCategories ] = useState([]);
  const [newExpense, setNewExpense] = useState({concept: '', amount: 0, date: (new Date()).toISOString(), category: '', account: ''})

  const firstInput = useRef(null);

  useEffect( () => {

    fetch(`${HOST_API}/api/expenses/categories`)
      .then( response => response.json() )
      .then( data => {
        setCategories(data.results.map(catObj => catObj.category));
      });

    firstInput.current.focus();
    firstInput.current.scrollIntoView();

  }, []);

  const handleChangeNewExpense = (ev) => {
    setNewExpense( {...newExpense, [ev.target.id]: ev.target.value} );
  }

  const handleClickNewExpense = () => {
    createNewExpense(newExpense);
  }

  const createNewExpense = (expenseData) => {
    expenseData.date = expenseData.date + ':00+02:00';
    expenseData.amount = expenseData.amount.replace(',', '.');

    return fetch(`${HOST_API}/api/expenses/`, {method:'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify(expenseData)})
    .then(response => response.json())
    .then( data => {
      return data;
    });
  }

  return (
  <section>
    Nuevo gasto

      <form className="inputData" onSubmit={(ev) => ev.preventDefault()}>
        <label htmlFor="concept" className="inputData__label">Concepto:</label>
        <input
          type='text'
          className="inputData__textField"
          name='concept'
          id='concept'
          placeholder='Concepto'
          ref={firstInput}
          autofocus={true}
          tabIndex={1}
          value={newExpense.concept}
          onChange={handleChangeNewExpense}
        />
        <label htmlFor="amount" className="inputData__label">Importe:</label>
        <input
          type='text'
          className="inputData__textField"
          name='amount'
          id='amount'
          placeholder='En euros'
          inputMode='numeric'
          tabIndex={2}
          value={newExpense.amount}
          onChange={handleChangeNewExpense}
        />
        <label htmlFor="date" className="inputData__label">Fecha:</label>
        {/*navigator.userAgent.includes('Android') ? 'datetime-local' : 'text' */}
        <input
          type='datetime-local'
          className="inputData__textField"
          name='date'
          id='date'
          placeholder='Fecha/Hora'
          tabIndex={3}
          value={newExpense.date}
          onChange={handleChangeNewExpense}
        />
        value={newExpense.date}
        <label htmlFor="category" className="inputData__label">Categoría:</label>
        <input
          type='text'
          className="inputData__textField"
          name='category'
          id='category'
          placeholder='Categoría'
          tabIndex={4}
          list="categories_of_expenses"
          value={newExpense.category}
          onChange={handleChangeNewExpense}
        />
        <datalist id="categories_of_expenses">
          {categories.map((cat, idx) => 
          <option key={idx} value={cat}/>
          )}
        </datalist>
        <label htmlFor="account" className="inputData__label">Cuenta:</label>
        <input
          type='text'
          className="inputData__textField"
          name='account'
          id='account'
          placeholder='Cuenta'
          tabIndex={5}
          value={newExpense.account}
          onChange={handleChangeNewExpense}
        />
        <input type="file" accept="image/*" capture="camera" class="inputData__fileField"></input>

        <fieldset class="inputData__controls">
          <Link to='..'>
            <button type="reset" className="button">
              Atrás
            </button>
          </Link>
          <button type="submit" className="button" onClick={handleClickNewExpense}>
            Crear
          </button>
        </fieldset>
      </form>
  </section>);
}

export default ExpensesAdd;