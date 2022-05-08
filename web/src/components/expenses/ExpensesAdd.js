import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

function ExpensesAdd(props) {
  const [categories, setCategories ] = useState([]);
  const [newExpense, setNewExpense] = useState({concept: '', amount: 0, date: (new Date()).toISOString(), category: '', account: ''})


  useEffect( () => {

    fetch('http://127.0.0.1:5000/api/expenses/categories')
      .then( response => response.json() )
      .then( data => {
        setCategories(data.results.map(catObj => catObj.category));
      });

  }, []);

  const handleChangeNewExpense = (ev) => {
    setNewExpense( {...newExpense, [ev.target.id]: ev.target.value} );
  }

  const handleClickNewExpense = () => {
    createNewExpense(newExpense);
  }

  const createNewExpense = (expenseData) => {
    return fetch('http://127.0.0.1:5000/api/expenses/', {method:'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify(expenseData)})
    .then(response => response.json())
    .then( data => {
      return data;
    });
  }

  return (
  <div>
    Nuevo gasto

      <form action='' onSubmit={(ev) => ev.preventDefault()}>
      
        <input
          type='text'
          name='concept'
          id='concept'
          placeholder='Concepto'
          value={newExpense.concept}
          onChange={handleChangeNewExpense}
        />
        <input
          type='text'
          name='amount'
          id='amount'
          placeholder='Cantidad'
          value={newExpense.amount}
          onChange={handleChangeNewExpense}
        />
        <input
          type='text'
          name='date'
          id='date'
          placeholder='Fecha/Hora'
          value={newExpense.date}
          onChange={handleChangeNewExpense}
        />
        <input
          type='text'
          name='category'
          id='category'
          placeholder='Categoría'
          list="categories_of_expenses"
          value={newExpense.category}
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
          value={newExpense.account}
          onChange={handleChangeNewExpense}
        />
        <button onClick={handleClickNewExpense}>Nuevo</button>
      </form>

    <Link to='..'>Volver</Link>

  </div>);
}

export default ExpensesAdd;