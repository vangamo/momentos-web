import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import PaperlessLogin from './PaperlessLogin';
import ExpensesList from './ExpensesList';
import usePaperlessApi from '../../hooks/usePaperlessApi';

function Expenses(props) {
  const paperlessApi = usePaperlessApi();
  const { status: paperlessApiStatus, login } = paperlessApi;

  const location = useLocation();
  console.log(location);

  return (
    <>
      <h2>Gastos</h2>
      { location.pathname === '/expenses' && <ExpensesList></ExpensesList> }
      <Outlet context={paperlessApi}></Outlet>
      {!paperlessApiStatus && (
        <PaperlessLogin fetchLogin={login}></PaperlessLogin>
      )}
    </>
  );
}

export default Expenses;
