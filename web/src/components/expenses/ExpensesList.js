import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const { NODE_ENV } = process.env;
const HOST_API = 'production' === NODE_ENV ? '' : 'http://127.0.0.1:5000';

function ExpensesList(props) {
  const [expenses, setExpenses] = useState([]);

  useEffect( () => {

    fetch(`${HOST_API}/api/expenses/`)
      .then( response => response.json() )
      .then( data => {
        setExpenses(data);
      });

  }, []);

  const handleClickDeleteExpense = (ev) => {
    ev.preventDefault();
    console.log(ev.target.dataset['expense']);
    const expenseId = parseInt(ev.target.dataset['expense']);

    fetch(`${HOST_API}/api/expense/${expenseId}`,{method:'DELETE'})
      .then( response => response.json() )
      .then( data => {
        if( data.result === 'OK' ) {
          setExpenses(expenses.filter(e=>e.id !== expenseId));
        }
      });
  
  }

  return (
  <p>
    No sé

    <ul>
        {expenses.map((exp, idx) => (
          <li key={idx}>{exp.concept} - {exp.amount} <Link to={`edit/${exp.id}`}><button>Editar</button></Link> <button data-expense={exp.id} data-idx={idx} onClick={handleClickDeleteExpense}>Borrar</button></li>
        ))}
      </ul>
    <Link to='add'>Añadir</Link>

  </p>);
}

export default ExpensesList;