import { Outlet } from 'react-router-dom';
import PaperlessLogin from './PaperlessLogin';
import usePaperlessApi from '../../hooks/usePaperlessApi';

function Expenses(props) {
  const paperlessApi = usePaperlessApi();
  const { status: paperlessApiStatus, login } = paperlessApi;

  return (
    <>
      <h2>Gastos</h2>
      <Outlet context={paperlessApi}></Outlet>
      {!paperlessApiStatus && (
        <PaperlessLogin fetchLogin={login}></PaperlessLogin>
      )}
    </>
  );
}

export default Expenses;
