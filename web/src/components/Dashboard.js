import { useState, useEffect } from 'react';

function Dashboard(props) {
  const [newMmt, setNewMmt] = useState({
    name: '',
    date: new Date().toISOString(),
    cat: '',
  });

  const handleChangeNewMmt = (ev) => {
    setNewMmt({ ...newMmt, [ev.target.id]: ev.target.value });
  };

  const handleClickNewMmt = () => {
    props.createNewMoment( newMmt )
    .then( createdData => {
      setNewMmt({name: '', date: (new Date()).toISOString(), cat:''});
    });
  };

  return (
    <>
    <h2>Panel de control</h2>
      <form action='' onSubmit={(ev) => ev.preventDefault()}>
        <input
          type='text'
          name='name'
          id='name'
          placeholder='Nombre'
          value={newMmt.name}
          onChange={handleChangeNewMmt}
        />
        <input
          type='text'
          name='date'
          id='date'
          placeholder='Fecha/Hora'
          value={newMmt.date}
          onChange={handleChangeNewMmt}
        />
        <input
          type='text'
          name='cat'
          id='cat'
          placeholder='Cat'
          value={newMmt.cat}
          onChange={handleChangeNewMmt}
        />
        <button onClick={handleClickNewMmt}>Nuevo</button>
      </form>
    </>
  );




}

export default Dashboard;