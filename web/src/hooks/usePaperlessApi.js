import { useState } from 'react';
import API from '../services/PaperlessApi';

function usePaperlessApi(config = { authToken: '', host: '' }) {
  const [authPaperless, setAuthPaperless] = useState(config.authToken);
  const [hostServer, setHostServer] = useState(config.host);

  const login = ({ host, username, password }) => {
    console.log('pplssHook. Login. Attempt login');

    API.getToken(host, username, password).then((newAuthToken) => {
      console.log('pplssHook. Login. Attempt success');

      setAuthPaperless(newAuthToken);
      setHostServer(host);
    });
  };

  const listDocuments = () => {
    console.log('pplssHook. Documents. Fetching');
    return API.getInstance(hostServer, authPaperless)
      .getDocuments()
      .then((data) => {
        console.log(`pplssHook. Documents. Revived ${data.length}`);
        return data;
      });
  };

  return {
    config: { authToken: authPaperless, host: hostServer },
    status: authPaperless,
    login,
    listDocuments,
  };
}

export default usePaperlessApi;
