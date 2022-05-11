import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Table.scss';

const { NODE_ENV } = process.env;
const HOST_API = 'production' === NODE_ENV ? '' : `${window.location.protocol}//${window.location.hostname}:5000`;

const isoToHuman = (date) => {
  const MONTHS = ['','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const regExp = new RegExp(/([0-9]{2,4})-([0-9]{1,2})-([0-9]{1,2})(T([0-9]{1,2}):([0-9]{1,2}):?([0-9]{0,2})?)/);
  const dateValues = regExp.exec(date);
  if(!dateValues) {
    console.error(date);
    return '?';
  }
  return `${dateValues[3]}${MONTHS[parseInt(dateValues[2],10)]} ${dateValues[5]}:${dateValues[6]}`;
}

function ExpensesList(props) {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetch(`${HOST_API}/api/expenses/`)
      .then((response) => response.json())
      .then((data) => {
        setExpenses(data);
      });
  }, []);

  const handleClickDeleteExpense = (ev) => {
    ev.preventDefault();

    const expenseId = parseInt(ev.target.dataset['expense']);

    fetch(`${HOST_API}/api/expense/${expenseId}`, { method: 'DELETE' })
      .then((response) => response.json())
      .then((data) => {
        if (data.result === 'OK') {
          setExpenses(expenses.filter((e) => e.id !== expenseId));
        }
      });
  };

  return (
    <section>
      No sé
      <Table expenses={expenses} handleClickDeleteExpense={handleClickDeleteExpense}></Table>
      <Link to="add">Añadir</Link>
    </section>
  );
}

function Table(props) {
  return (
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Concepto</th>
          <th>Cantidad</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {props.expenses.map((exp, idx) => (
          <tr key={idx}>
            <td>{isoToHuman(exp.date)}</td>
            <td>{exp.concept}</td>
            <td>{exp.amount}</td>
            <td>
              <Link to={`edit/${exp.id}`}>
                <button>Editar</button>
              </Link>{' '}
              <button data-expense={exp.id} data-idx={idx} onClick={props.handleClickDeleteExpense}>
                Borrar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ExpensesList;
