import { useState } from 'react';

function PaperlessLogin(props) {
  const [loginPaperless, setLoginPaperless] = useState({
    host: '',
    username: '',
    password: '',
  });

  const handleChangeLoginPaperless = (ev) => {
    setLoginPaperless({ ...loginPaperless, [ev.target.id]: ev.target.value });
  };

  const handleClickLoginPaperless = () => {
    props.fetchLogin(loginPaperless);
  };

  return (
    <div>
      <form onSubmit={(ev) => ev.preventDefault()}>
        <input
          type='text'
          name='host'
          id='host'
          value={loginPaperless.host}
          onChange={handleChangeLoginPaperless}
        />
        <input
          type='text'
          name='username'
          id='username'
          value={loginPaperless.username}
          onChange={handleChangeLoginPaperless}
        />
        <input
          type='password'
          name='password'
          id='password'
          value={loginPaperless.password}
          onChange={handleChangeLoginPaperless}
        />
        <button onClick={handleClickLoginPaperless}>Login</button>
      </form>
    </div>
  );
}

export default PaperlessLogin;
