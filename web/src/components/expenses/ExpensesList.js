import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

function ExpensesList(props) {
  const [expenses, setExpenses] = useState([]);

  useEffect( () => {

    fetch('http://127.0.0.1:5000/api/expenses/')
      .then( response => response.json() )
      .then( data => {
        setExpenses(data);
      });

  }, []);

  const handleClickDeleteExpense = (ev) => {
    ev.preventDefault();
    console.log(ev.target.dataset['expense']);
    const expenseId = parseInt(ev.target.dataset['expense']);

    fetch(`http://127.0.0.1:5000/api/expense/${expenseId}`,{method:'DELETE'})
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
          <li key={idx}>{exp.concept} - {exp.amount} <button data-expense={exp.id} data-idx={idx} onClick={handleClickDeleteExpense}>Borrar</button></li>
        ))}
      </ul>
    <Link to='add'>Añadir</Link>

  </p>);
}

export default ExpensesList;