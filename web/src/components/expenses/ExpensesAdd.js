import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import '../../styles/Form.scss';

const { NODE_ENV } = process.env;
const HOST_API = 'production' === NODE_ENV ? '' : `${window.location.protocol}//${window.location.hostname}:5000`;

function ExpensesAdd(props) {
  const [categories, setCategories ] = useState([]);
  const [newExpense, setNewExpense] = useState({concept: '', amount: 0, date: (new Date()).toISOString(), category: '', account: ''})

  const firstInput = useRef(null);

  const navigateTo = useNavigate();

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

  const handleClickNewExpenseAndClose = () => {
    createNewExpense(newExpense).then((data) => {
      navigateTo('..');
      return data;
    });
  }

  const createNewExpense = (expenseData) => {
    const VALID_FORMAT_DATES = [
      new RegExp(/([0-9]{2,4})-([0-9]{1,2})-([0-9]{1,2})(T([0-9]{1,2}):([0-9]{1,2}):?([0-9]{0,2})?)/), // ISO
      new RegExp(/([0-9]{2,4})\.([0-9]{1,2})\.([0-9]{1,2})([ -]([0-9]{1,2})[.:]([0-9]{1,2})[.:]?([0-9]{0,2})?)?/), // IGM
      new RegExp(/([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{2,4})( ([0-9]{1,2}):([0-9]{1,2}):?([0-9]{0,2})?)?/) // ESP
    ];
    
    const validFormat = VALID_FORMAT_DATES.find( format => format.test(expenseData.date) );
    
    if( validFormat ) {
      const dateValues = validFormat.exec(expenseData.date);
      if(expenseData.date.includes('/')) {
        const swp = dateValues[3];
        dateValues[3] = dateValues[1];
        dateValues[1] = swp;
      }
      if( !dateValues[4] ) {
        dateValues[5] = '00';
        dateValues[6] = '00';
      }
      if( dateValues[1].length === 2 ) {
        dateValues[1] = '20'+dateValues[1];
      }
      expenseData.date = `${dateValues[1]}-${dateValues[2].padStart(2, '0')}-${dateValues[3].padStart(2, '0')}T${dateValues[5].padStart(2, '0')}:${dateValues[6].padStart(2, '0')}:00+02:00`;
    }
    else {
      console.error(`Date format error: "${expenseData.date}"`);
      return;
    }
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
        <input
          type={navigator.userAgent.includes('Android') ? 'datetime-local' : 'text'}
          className="inputData__textField"
          name='date'
          id='date'
          placeholder='Fecha/Hora'
          tabIndex={3}
          value={newExpense.date}
          onChange={handleChangeNewExpense}
        />
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
          <button type="submit" className="button" onClick={handleClickNewExpenseAndClose}>
            Crear y cerrar
          </button>
          <button type="submit" className="button" onClick={handleClickNewExpense}>
            Crear y seguir
          </button>
        </fieldset>
      </form>
  </section>);
}

export default ExpensesAdd;