import {useState, useEffect} from 'react';
import '../styles/App.scss';

function App() {

  const [moments, setMoments] = useState([]);
  const [newMmt, setNewMmt] = useState({name: '', date: (new Date()).toISOString(), cat:''})

  const [documents, setDocuments] = useState([]);
  const [loginPaperless, setLoginPaperless] = useState({host: '', username:'', password:''});
  const [authPaperless, setAuthPaperless] = useState(''); // '151f4708bfb6bfea1025b0661bbb8fdb926f8653'

  useEffect( () => {

    if( authPaperless ) {
      fetch(
        `https://${loginPaperless.host}/api/documents/`,
        {method:'GET',
        headers: {'Authorization': `Token ${authPaperless}`}})
      .then(response => response.json())
      .then( docData => {
        console.log(docData);
        setDocuments(docData.results.filter(doc => doc.document_type===2));
      })
      .catch((error) => {
        console.log(error);
        setAuthPaperless('');
      })
    }

  }, [authPaperless, loginPaperless.host]);



  useEffect( () => {

    fetch('http://127.0.0.1:5000/api/moments/')
      .then( response => response.json() )
      .then( data => {
        setMoments(data);
      });

  }, []);

  const handleChangeLoginPaperless = (ev) => {
    setLoginPaperless({...loginPaperless, [ev.target.id]: ev.target.value});
  }

  const handleClickLoginPaperless = () => {
      if( !authPaperless ) {
        fetch(`https://${loginPaperless.host}/api/token/`, {method:'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify({username:loginPaperless.username, password:loginPaperless.password})})
        .then(response => response.json())
        .then( data => {
          setAuthPaperless(data.token);
          setLoginPaperless( {host: loginPaperless.host, username:'', password:''} );
        });
      }
  }

  const handleChangeNewMmt = (ev) => {
    setNewMmt({...newMmt, [ev.target.id]: ev.target.value});
  }

  const handleClickNewMmt = () => {

    fetch('http://127.0.0.1:5000/api/moments/', {method:'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify(newMmt)})
    .then(response => response.json())
    .then( data => {
      setMoments([...moments, newMmt]);
      setNewMmt({name: '', date: (new Date()).toISOString(), cat:''});
    });



  };
  
  return (
    <div className="App">
      <header>
        <h1>Momentos</h1>
        { !!authPaperless || (
          <form onSubmit={(ev) => ev.preventDefault()}>
            <input type="text" name="host" id="host" value={loginPaperless.host} onChange={handleChangeLoginPaperless} />
            <input type="text" name="username" id="username" value={loginPaperless.username} onChange={handleChangeLoginPaperless} />
            <input type="password" name="password" id="password" value={loginPaperless.password} onChange={handleChangeLoginPaperless} />
            <button onClick={handleClickLoginPaperless}>Login</button>
          </form>
        )}
      </header>
      <nav>
        <ul>
          <li>
            Momentos
          </li>
          <li>
            Contactos (Personas - grupos)
          </li>
          <li>
            Fotos (Sources - Últimas)
          </li>
          <li>
            Compras (Tickets - Recurrentes - Cuentas)
          </li>
        </ul>
      </nav>
      <section>
        <ul>
          {documents.map(doc => <li key={doc.id}><p>{doc.title}</p><p>{doc.document_type}</p></li>)}
        </ul>
        <ul>
          {moments.map((moment, idx) => <li key={idx}>{moment.name}</li>)}
        </ul>

        <ul>
          {moments.filter(moment => moment.cat.includes('Compras')).map((moment, idx) => <li key={idx}>{moment.name}</li>)}
        </ul>
        <form action="" onSubmit={ev => ev.preventDefault()}>
          <input type="text" name="name" id="name" placeholder="Nombre" value={newMmt.name} onChange={handleChangeNewMmt}/>
          <input type="text" name="date" id="date" placeholder="Fecha/Hora" value={newMmt.date} onChange={handleChangeNewMmt}/>
          <input type="text" name="cat" id="cat" placeholder="Cat" value={newMmt.cat} onChange={handleChangeNewMmt}/>
          <button onClick={handleClickNewMmt}>Nuevo</button>
        </form>
      </section>
    </div>
  );
}

export default App;
