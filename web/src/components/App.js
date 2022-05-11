import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Expenses from './expenses/Expenses';
import '../styles/App.scss';
import ExpensesTickets from './expenses/ExpensesTickets';
import MomentList from './moments/MomentsList';
import Dashboard from './Dashboard';
import ExpensesAdd from './expenses/ExpensesAdd';
import ExpensesList from './expenses/ExpensesList';
import ExpensesEdit from './expenses/ExpensesEdit';

const { NODE_ENV } = process.env;
const HOST_API = 'production' === NODE_ENV ? '' : `${window.location.protocol}//${window.location.hostname}:5000`;

function App() {
  const [moments, setMoments] = useState([]);
  const [newMmt, setNewMmt] = useState({name: '', date: '', cat:''})

  const location = useLocation();

  useEffect( () => {

    fetch(`${HOST_API}/api/moments/`)
      .then( response => response.json() )
      .then( data => {
        setMoments(data);
      });

  }, []);

  const handleChangeNewMmt = (ev) => {
    setNewMmt({...newMmt, [ev.target.id]: ev.target.value});
  }

  const createNewMoment = (mmtData) => {
    return fetch(`${HOST_API}/api/moments/`, {method:'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify(newMmt)})
    .then(response => response.json())
    .then( data => {
      setMoments([...moments, data]);
      return data;
    });
  }

  const handleClickNewMmt = () => {

    createNewMoment( newMmt )
    .then( createdData => {
      setNewMmt({name: '', date: (new Date()).toISOString(), cat:''});
    });

  };
  
  return (
    <div className="App">
      <header className="App__header">
        <h1 className="App__title">Momentos</h1>
      </header>
      <nav className="mainMenu">
        <ul className="menu__list">
          <li className="menu__item">
            <NavLink className="menu__link" to="moments">Momentos</NavLink>
          </li>
          <li className="menu__item">
            Contactos
            <ul className="submenu__list">
              <li>Personas</li>
              <li>Grupos</li>
            </ul>
          </li>
          <li className="menu__item">
            Fotos
            <ul className="submenu__list">
              <li>Sources</li>
              <li>Últimas</li>
            </ul>
          </li>
          <li className={"menu__item" + (location.pathname.startsWith('/expenses') ? " active" : "")}>
            <NavLink className="menu__link" to="expenses">Compras</NavLink>
            <ul className="submenu__list">
              <li>
                <NavLink className="menu__link" to="expenses/tickets">Tickets</NavLink>
              </li>
              <li>Recurrentes</li>
              <li>Cuentas</li>
            </ul>
          </li>
          <li className="menu__item">
            Tools
            <ul className="submenu__list">
              <li>
                <a className="menu__link" href={`${HOST_API}/api/export`}>Export</a>
              </li>
              <li>
                Import
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <main className="App__main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/moments" element={<MomentList moments={moments} createNewMoment={createNewMoment} />} />
          <Route path="/expenses" element={<Expenses />}>
            <Route index element={<ExpensesList />} />
            <Route path="list" element={<ExpensesList />} />
            <Route path="add" element={<ExpensesAdd />} />
            <Route path="edit/:id" element={<ExpensesEdit />} />
            <Route path="tickets" element={<ExpensesTickets />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
