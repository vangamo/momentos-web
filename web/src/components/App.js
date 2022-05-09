import { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Expenses from './expenses/Expenses';
import '../styles/App.scss';
import ExpensesTickets from './expenses/ExpensesTickets';
import MomentList from './moments/MomentsList';
import Dashboard from './Dashboard';
import ExpensesAdd from './expenses/ExpensesAdd';
import ExpensesList from './expenses/ExpensesList';
import ExpensesEdit from './expenses/ExpensesEdit';

const { NODE_ENV } = process.env;
const HOST_API = 'production' === NODE_ENV ? '' : 'http://127.0.0.1:5000';

function App() {
  const [moments, setMoments] = useState([]);
  const [newMmt, setNewMmt] = useState({name: '', date: (new Date()).toISOString(), cat:''})

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
      <header>
        <h1>Momentos</h1>
        
      </header>
      <nav>
        <ul>
          <li>
            <NavLink to="moments">Momentos</NavLink>
          </li>
          <li>
            Contactos (Personas - grupos)
          </li>
          <li>
            Fotos (Sources - Últimas)
          </li>
          <li>
            <NavLink to="expenses">Compras</NavLink> (<NavLink to="expenses/tickets">Tickets</NavLink> - Recurrentes - Cuentas)
          </li>
          <li>
            Tools (<a href={`${HOST_API}/api/export`}>Export</a> - Import)
          </li>
        </ul>
      </nav>
      <main>
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
