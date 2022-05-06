import { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import ExpensesList from './expenses/ExpensesList';
import '../styles/App.scss';
import ExpensesTickets from './expenses/ExpensesTickets';
import Expenses from './expenses/Expenses';
import MomentList from './moments/MomentsList';
import Dashboard from './Dashboard';

function App() {
  const [moments, setMoments] = useState([]);
  const [newMmt, setNewMmt] = useState({name: '', date: (new Date()).toISOString(), cat:''})

  useEffect( () => {

    fetch('http://127.0.0.1:5000/api/moments/')
      .then( response => response.json() )
      .then( data => {
        setMoments(data);
      });

  }, []);

  const handleChangeNewMmt = (ev) => {
    setNewMmt({...newMmt, [ev.target.id]: ev.target.value});
  }

  const createNewMoment = (mmtData) => {
    return fetch('http://127.0.0.1:5000/api/moments/', {method:'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify(newMmt)})
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
        </ul>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard></Dashboard>}></Route>
          <Route path="moments" element={<MomentList moments={moments} createNewMoment={createNewMoment}></MomentList>}>
          </Route>
          <Route path="expenses" element={<Expenses></Expenses>}>
            <Route path="tickets" element={<ExpensesTickets></ExpensesTickets>}></Route>
            <Route path="*" element={<ExpensesList moments={moments}></ExpensesList>}></Route>
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
