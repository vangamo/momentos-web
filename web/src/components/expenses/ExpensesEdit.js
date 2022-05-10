import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom";

const { NODE_ENV } = process.env;
const HOST_API = 'production' === NODE_ENV ? '' : `${window.location.protocol}//${window.location.hostname}:5000`;

function ExpensesEdit(props) {
  const [categories, setCategories ] = useState([]);
  const [expenseData, setExpenseData] = useState({concept: '', amount: 0, date: (new Date()).toISOString(), category: '', account: ''})

  const params = useParams();
  const navigateTo = useNavigate();

  useEffect( () => {

    fetch(`${HOST_API}/api/expense/${params.id}`)
    .then( response => response.json() )
    .then( data => {
      setExpenseData(data);
    });

    fetch(`${HOST_API}/api/expenses/categories`)
      .then( response => response.json() )
      .then( data => {
        setCategories(data.results.map(catObj => catObj.category));
      });

  }, []);

  const handleChangeNewExpense = (ev) => {
    setExpenseData( {...expenseData, [ev.target.id]: ev.target.value} );
  }

  const handleClickNewExpense = () => {
    createNewExpense(expenseData);
  }

  const createNewExpense = (expenseData) => {
    return fetch(`${HOST_API}/api/expense/${params.id}`, {method:'PUT', headers:{'Content-Type': 'application/json'}, body: JSON.stringify(expenseData)})
    .then(response => response.json())
    .then( data => {
      navigateTo('..');
      return data;
    });
  }

  return (
  <div>
    Editar gasto

      <form action='' onSubmit={(ev) => ev.preventDefault()}>
      
        <input
          type='text'
          name='concept'
          id='concept'
          placeholder='Concepto'
          value={expenseData.concept}
          onChange={handleChangeNewExpense}
        />
        <input
          type='text'
          name='amount'
          id='amount'
          placeholder='Cantidad'
          value={expenseData.amount}
          onChange={handleChangeNewExpense}
        />
        <input
          type='text'
          name='date'
          id='date'
          placeholder='Fecha/Hora'
          value={expenseData.date}
          onChange={handleChangeNewExpense}
        />
        <input
          type='text'
          name='category'
          id='category'
          placeholder='Categoría'
          list="categories_of_expenses"
          value={expenseData.category}
          onChange={handleChangeNewExpense}
        />
        <datalist id="categories_of_expenses">
          {categories.map((cat, idx) => 
          <option value={cat}/>
          )}
        </datalist>
        <input
          type='text'
          name='account'
          id='account'
          placeholder='Cuenta'
          value={expenseData.account}
          onChange={handleChangeNewExpense}
        />
        <button onClick={handleClickNewExpense}>Nuevo</button>
      </form>

    <Link to='..'>Volver</Link>

  </div>);
}

export default ExpensesEdit;