import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

// https://jsrepos.com/lib/kpdecker-jsdiff

function score_words( user, stored, threshold=2 ) {
  if( !user || ! stored ) {
    return 0;
  }

  return _score_words_int( user, stored.toLocaleLowerCase(), threshold ) / Math.max( user.length, stored.length )
}

function _score_words_int( user, stored, threshold ) {
  if( !threshold ) {
    return 0;
  }

  if( user.length === 0 ) {
    return stored.length / 2;
  }
  else if( stored.length === 0 ) {
    return -0.5 * user.length;
  }
  else if( user[0] === stored[0] ) {
    return 1.0 + _score_words_int( user.substring(1), stored.substring(1), threshold );
  }
  else {
    return Math.max(
      _score_words_int( user.substring(1), stored, threshold-1 ),
      _score_words_int( user, stored.substring(1), threshold-1 )
    );
  }
}

function score_string( user, stored ) {
  if( !user || ! stored ) {
    return 0;
  }
  
  const userArray = user.split(/[ ./,'"]+/g);
  const storedArray = stored.split(/[ ./,'"]+/g);

  return _score_string_int( userArray, storedArray, 3 ) / storedArray.length;
}

function _score_string_int( user, stored, threshold ) {
  if( !threshold ) {
    return 0;
  }
  if( user.length === 0 ) {
    return stored.length / 2;
  }
  else if( stored.length === 0 ) {
    return -0.5 * user.length;
  }
  else {
    return score_words( user[0], stored[0] ) +
      Math.max(
        _score_string_int( user, stored.slice(1), threshold-1 ),
        _score_string_int( user.slice(1), stored, threshold-1 ),
        _score_string_int( user.slice(1), stored.slice(1), threshold )
      );
  }
}

const { NODE_ENV } = process.env;
const HOST_API =
  'production' === NODE_ENV
    ? ''
    : `${window.location.protocol}//${window.location.hostname}:5000`;

const DEFAULT_NEW_ITEM = {
  name: '',
  data: '',
  qty: 1,
  amount: 0,
  brand: ''
};

function ExpenseItems(props) {
  const inputData = useRef(null);

  const [expenseData, setExpenseData] = useState({
    concept: '',
    amount: 0,
    date: new Date().toISOString(),
    category: '',
    account: '',
  });
  const [newTicket, setNewTicket] = useState(
    DEFAULT_NEW_ITEM
  );
  const [itemList, setItemList] = useState([]);
  const [ticketHistory, setTicketHistory] = useState([]);

  const params = useParams();
  const expenseId = parseInt(params.id)

  useEffect(() => {
    fetch(`${HOST_API}/api/expense/${expenseId}`)
      .then((response) => response.json())
      .then((data) => {
        setExpenseData(data);
      });
    fetch(`${HOST_API}/api/expense/${expenseId}/items`)
      .then((response) => response.json())
      .then((data) => {
        setItemList(data.results);
      });
  }, [expenseId]);

  useEffect(() => {
    fetch(`${HOST_API}/api/expenses/items?q=${encodeURI(expenseData.business)}`)
      .then((response) => response.json())
      .then((data) => {
        setTicketHistory(data.results);
      });
  }, [expenseData]);
 
  const [name, setName] = useState('');

  const handleChangeNewTicket = (ev) => {
    const inputName = ev.target.name;
    const inputValue = inputName === 'data' ? ev.target.value.toLocaleUpperCase() : ev.target.value;
    setNewTicket({
      ...newTicket,
      [inputName]: inputValue
    });
    setName(inputName);
  }

  const ticketShown1 = ticketHistory.filter((t) => (t.name && t.name.toLocaleLowerCase().includes(name.toLocaleLowerCase())) || (t.data && t.data.toLocaleUpperCase().includes(name.toLocaleUpperCase()))  );

  const ticketShown2 = ticketHistory.map((t) => ({t: t, s: score_words(name, t.data)})).filter((t) => t.s > 0.5).sort((t1,t2) => t2.s - t1.s);

  // var startTime = performance.now();
  const typedName = name==='name' ? newTicket.name.trim().toLocaleLowerCase(): name==='data' ? newTicket.data.trim().toLocaleLowerCase() : '';
  let count = 0;
  const ticketShown = 
    !typedName ? [] :
    ticketHistory
      .map((t) => {
        if( count > 10 ) {
          return {t: 0, s: 0};
        }
        else {
          const score = t.count*0.1 + score_string(typedName, name==='name' ? t.name : t.data);
          if( score > 0.7 ) {
            ++count;
            return {t: t, s: score};
          }
          else {
            return {t: 0, s: 0};
          }
        }        
      })
      .filter((t) => t.s > 0)
      .sort((t1,t2) => t2.s - t1.s);
  //var ellapsedTime = performance.now() - startTime;
  //console.log('Ellapsed', ellapsedTime);
  // console.log(ticketShown);

  const handleSelectResult = (ev) => {
    const ticketId = parseInt(ev.target.dataset['id'],10);
    const ticket = ticketHistory.find((t) => t.id === ticketId);
    console.log(ticket);
    setNewTicket({
      ...newTicket,
      name: ticket.name,
      data: ticket.data,
      amount: ticket.amount,
      brand: ticket.brand
    });
  };

  const handleClickAddNewItem = () => {
    newTicket.amount = newTicket.amount.replace(',', '.');

    
    setItemList([
      ...itemList,
      newTicket
    ]);

    setTicketHistory((ticketHistory) => {
      fetch(
        `${HOST_API}/api/expense/${expenseId}/items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newTicket)
        })
        .then((response) => response.json())
        .then((itemData) => {

          const found = ticketHistory.find((t)=>t.name === newTicket.name && t.data === newTicket.data);
          if(found) {
            return ticketHistory.map((t) => {
              if(t.name === newTicket.name && t.data === newTicket.data) {
                return {
                  ...t,
                  count: t.count+1
                };
              }
              else {
                return t;
              }
            })
          }
          else {
            return [
              ...ticketHistory,
              {
                ...newTicket,
                id: 100+ticketHistory.length,
                count: 1,
                origin: 'Ticket ' + expenseData.business
              }
            ];
          }

        })

    });
    setNewTicket(DEFAULT_NEW_ITEM);
    inputData.current.focus();
  };

  return (
    <p>
      Detalle de {params.id}
      <input readOnly value={expenseData.business} /> {name}
      <ul>
        {itemList.map((item, idx) => <li key={idx}>{item.qty && `${item.qty}x` } {item.name ? item.name : `[${item.data}]`} {item.amount}</li>)}
      </ul>
      <input
        tabIndex={1}
        name="data"
        id="newTicket-data"
        ref={inputData}
        placeholder="data"
        value={newTicket.data}
        onChange={handleChangeNewTicket}
      />
      <input
        tabIndex={name === 'name' ? 2 : 2 + ticketShown.length}
        name="name"
        id="newTicket-name"
        placeholder="name"
        value={newTicket.name}
        onChange={handleChangeNewTicket}
      />
      <input
        tabIndex={3 + ticketShown.length}
        name="qty"
        id="newTicket-qty"
        placeholder="qty"
        value={newTicket.qty}
        onChange={handleChangeNewTicket}
      />
      <input
        tabIndex={4 + ticketShown.length}
        name="amount"
        id="newTicket-amount"
        placeholder="amount"
        value={newTicket.amount}
        onChange={handleChangeNewTicket}
      />
      <input
        tabIndex={5 + ticketShown.length}
        name="brand"
        id="newTicket-brand"
        placeholder="brand"
        value={newTicket.brand}
        onChange={handleChangeNewTicket}
      />
      <button tabIndex={6 + ticketShown.length} onClick={handleClickAddNewItem}>Añadir</button>
      <ul>
        {ticketShown.map((t, idx) => (
          <li
            key={t.t.id}
            tabIndex={idx + 2}
            data-id={t.t.id}
            onClick={handleSelectResult}
            onKeyUp={(ev) => (ev.key === 'Enter' || ev.key === ' ') && handleSelectResult(ev)}
          >
            {t.t.name} {t.t.brand}[{t.t.data}] {t.s}
          </li>
        ))}
      </ul>
    </p>
  );
}


export default ExpenseItems;