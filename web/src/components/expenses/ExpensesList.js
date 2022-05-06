import { Outlet } from "react-router-dom";


function ExpensesList(props) {
  return (
  <p>
    No sé

    <ul>
      {props.moments.filter(moment => moment.cat.includes('Compras')).map((moment, idx) => <li key={idx}>{moment.name}</li>)}
    </ul>

    <Outlet></Outlet>

  </p>);
}

export default ExpensesList;