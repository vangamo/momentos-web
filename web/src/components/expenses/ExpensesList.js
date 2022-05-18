import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Table.scss';

const { NODE_ENV } = process.env;
const HOST_API = 'production' === NODE_ENV ? '' : `${window.location.protocol}//${window.location.hostname}:5000`;

const MONTHS = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const isoToHuman = (date) => {
  const regExp = new RegExp(/([0-9]{2,4})-([0-9]{1,2})-([0-9]{1,2})(T([0-9]{1,2}):([0-9]{1,2}):?([0-9]{0,2})?)/);
  const dateValues = regExp.exec(date);
  if (!dateValues) {
    console.error(date);
    return '?';
  }
  return `${dateValues[3]}${MONTHS[parseInt(dateValues[2], 10)]} ${dateValues[5]}:${dateValues[6]}`;
};

const isoToHour = (date) => {
  const regExp = new RegExp(/([0-9]{2,4})-([0-9]{1,2})-([0-9]{1,2})(T([0-9]{1,2}):([0-9]{1,2}):?([0-9]{0,2})?)/);
  const dateValues = regExp.exec(date);
  if (!dateValues) {
    console.error(date);
    return '?';
  }
  return `${dateValues[5]}:${dateValues[6]}`;
};

const isoToShort = (date) => {
  const regExp = new RegExp(/([0-9]{2,4})-([0-9]{1,2})-([0-9]{1,2})(T([0-9]{1,2}):([0-9]{1,2}):?([0-9]{0,2})?)/);
  const dateValues = regExp.exec(date);
  if (!dateValues) {
    console.error(date);
    return '?';
  }

  const currentYear = (new Date()).getFullYear();
  if( parseInt(dateValues[1], 10) === currentYear ) {
    return `${dateValues[3]}${MONTHS[parseInt(dateValues[2], 10)]}`;
  }
  else {
    return `${dateValues[3]}${MONTHS[parseInt(dateValues[2], 10)]} - ${dateValues[1]}`;
  }
};

const groupBy = (array, callback) => {
  const groups = {};
  let lastId;

  for( let idx = 0; idx < array.length; idx++ ) {
    const elem = array[idx];
    const currentId = callback(elem, idx, array);
    if( currentId === lastId ) {
      groups[currentId].push(elem);
    }
    else if( currentId ) {
      groups[currentId] = [elem];
      lastId = currentId;
    }
  }
  console.dir(groups);
  return groups;
};

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
      <Link to="add">Añadir</Link>
      <Table expenses={expenses} handleClickDeleteExpense={handleClickDeleteExpense}></Table>
    </section>
  );
}

function Table(props) {
  //const groups = props.expenses.groupBy((exp) => isoToShort(exp.date)); Not implemented yet
  const groups = groupBy( props.expenses, (exp) => isoToShort(exp.date) )

  return (
    <table className="gastosTable">
      <thead>
        <tr className="gastosTable__head-row">
          <th>Fecha</th>
          <th className="imp">Concepto</th>
          <th>Cantidad</th>
          <th className="imp"></th>
        </tr>
      </thead>
      {Object.keys(groups).map((date, idx) => (
        <tbody>
          <tr>
            <td className="gastosTable__rowgroup" colspan="100">
              {date.replace(/^0+/, '')}
            </td>
          </tr>
          {groups[date].map((exp, idx) => (
            <tr className="gastosTable__row" key={idx}>
              <td>{isoToHour(exp.date) === '00:00' ? '' : isoToHour(exp.date)}</td>
              <td className="imp">
                {exp.concept}
                <Link to={`detail/${exp.id}/items`}>
                <span>
                  {exp.itemCount && `Item x${exp.itemCount}`}
                </span>
                </Link>
                <span>
                  {exp.originCount && `Origin x${exp.originCount}`}
                </span>
              </td>
              <td>{exp.amount}</td>
              <td className="imp">
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
      ))}
    </table>
  );
}

export default ExpensesList;
