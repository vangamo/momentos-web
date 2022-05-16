import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const { NODE_ENV } = process.env;
const HOST_API = 'production' === NODE_ENV ? '' : `${window.location.protocol}//${window.location.hostname}:5000`;

const DEFAULT_EXPENSE_EDIT = {id:0, candidates:[], ticket:{concept: '', amount: 0, date: (new Date()).toISOString(), category: '', account: ''}}

function ExpensesTickets() {
  const [documents, setDocuments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseEdit, setExpenseEdit] = useState(DEFAULT_EXPENSE_EDIT);
  const [categories, setCategories] = useState([]);

  const { status: paperlessApiStatus, listDocuments, config: {host: paperlessHost} } = useOutletContext();

  const saveDocuments = (docData) => {
    setDocuments((oldDocuments) => [
      ...oldDocuments,
      ...docData.results
        .filter((doc) => !oldDocuments.find((prevDoc) => doc.id === prevDoc.id))
        .filter((doc) => doc.document_type === 2 || doc.title.toLocaleLowerCase().includes('ticket') || doc.title.toLocaleLowerCase().includes('factura'))
        .filter((doc) => !expenses.filter(d=>d.origin===paperlessHost).find((exp) => {
          const originData = JSON.parse(exp.originData);
          if( doc.id===322 ) { console.log(originData.id); console.dir({doc, originData}); }
          return doc.id === originData.id;
        }))
      ]);

    const nextPage = docData.next && docData.next.match(/page=([0-9]+)/);
    if( nextPage ) {
      listDocuments(nextPage[1])
        .then((docData) => {
          saveDocuments(docData);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  useEffect(() => {
    if (paperlessApiStatus) {
      listDocuments()
        .then((docData) => {
          saveDocuments(docData);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [paperlessApiStatus]);

  useEffect(() => {
    fetch(`${HOST_API}/api/expenses/?fields=origin`)
      .then((response) => response.json())
      .then((dataExpenses) => {
        setExpenses(dataExpenses);
        setDocuments((documents) => [...documents.filter((ticket) => !dataExpenses.filter(exp=>exp.origin===paperlessHost).find((exp) => {
          const originData = JSON.parse(exp.originData);
          if( ticket.id===322 ) { console.log(originData.id); console.dir({ticket, originData}); }
          return ticket.id === originData.id;
        }))])
      });
  }, []);
  
  useEffect( () => {

    fetch(`${HOST_API}/api/expenses/categories`)
      .then( response => response.json() )
      .then( data => {
        setCategories(data.results.map(catObj => catObj.category));
      });

  }, []);

 const handleClickPair = (ev) => {
    const clickedId = parseInt(ev.target.dataset['id']);
    const ticket = documents.find((doc) => doc.id === clickedId);

    const parts = ticket.title.match(/(.*) ([0-9]{2,4})\.([0-9]{1,2})\.([0-9]{1,2}) +- +([0-9]+[.,]?[0-9]*)/);
    if( !parts ) {
      setExpenseEdit({
        id: clickedId,
        candidates: [],
        ticket: {
          concept: ticket.title,
          amount: 0,
          date: (new Date()).toISOString(),
          category: '',
          account: ''
        }
      });
    }
    else {
      const ticketTitle = parts[1];
      const ticketDate = `${parts[2]}-${parts[3]}-${parts[4]}`;
      const ticketAmount = parts[5].replace(',','.');

      const candidates = expenses.filter((e) => e.date.startsWith(ticketDate) && Math.abs(Math.abs(parseInt(ticketAmount))-Math.abs(parseInt(e.amount))) <= 10 );

      if( candidates.length ) {
        setExpenseEdit({
          id: clickedId,
          candidates: candidates,
          ticket: candidates[0]
        });
      }
      else {
        const newTitle = ticketTitle.replace('ticket', '').replace('Ticket', '').trim();
        const newTitleCapitalized = newTitle.substring(0,1).toLocaleUpperCase() + newTitle.substring(1);

        setExpenseEdit({
          id: clickedId,
          candidates: [],
          ticket: {
            concept: newTitleCapitalized,
            amount: ticketAmount*-1,
            date: `${parts[2]}.${parts[3]}.${parts[4]}`,
            category: '',
            account: ''
          }
        });
      }
    }
  };

  const handleChangeSelectEdit = (ev) => {
    const selectedIndex = parseInt(ev.target.value);
    setExpenseEdit({
      ...expenseEdit,
      ticket: expenseEdit.candidates[selectedIndex]
    });
  };

  const handleChangeInputEdit = (ev) => {
    const field = ev.target.name;
    const newValue = ev.target.value;
    setExpenseEdit({
      ...expenseEdit,
      ticket: {
        ...expenseEdit.ticket,
        [field]: newValue
      }
    });
  };

  const createTicketPairedToExpense = (expenseEdit) => {
    const ticketData = documents.find((d) => d.id === expenseEdit.id);
    const newPairData = {
      origin: paperlessHost,
      data: JSON.stringify(ticketData),
      expenseId: expenseEdit.ticket.id
    }

    return fetch(`${HOST_API}/api/expense/${expenseEdit.ticket.id}/origin`, {method:'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify(newPairData)})
    .then(response => response.json())
    .then( data => {
      console.dir({expenseEdit, newPairData, ticketData});
      setExpenses(
        expenses.map((e) => {
          if( e.id === newPairData.expenseId ) {
            e.origin = newPairData.origin;
            e.originData = newPairData.data;
          }
          return e;
        })
      );
      setDocuments(
        documents.filter((d) => d.id !== expenseEdit.id)
      )
      setExpenseEdit(DEFAULT_EXPENSE_EDIT);
    });
  };

  const createNewExpense = (expenseData) => {
    const VALID_FORMAT_DATES = [
      new RegExp(/([0-9]{2,4})-([0-9]{1,2})-([0-9]{1,2})(T([0-9]{1,2}):([0-9]{1,2}):?([0-9]{0,2})?)/), // ISO
      new RegExp(/([0-9]{2,4})\.([0-9]{1,2})\.([0-9]{1,2})([ -]([0-9]{1,2})[.:]([0-9]{1,2})[.:]?([0-9]{0,2})?)?/), // IGM
      new RegExp(/([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{2,4})( ([0-9]{1,2}):([0-9]{1,2}):?([0-9]{0,2})?)?/) // ESP
    ];
    
    const validFormat = VALID_FORMAT_DATES.find( format => format.test(expenseData.date) );
    
    if( validFormat ) {
      const dateValues = validFormat.exec(expenseData.date);
      if(expenseData.date.includes('/')) {
        const swp = dateValues[3];
        dateValues[3] = dateValues[1];
        dateValues[1] = swp;
      }
      if( !dateValues[4] ) {
        dateValues[5] = '00';
        dateValues[6] = '00';
      }
      if( dateValues[1].length === 2 ) {
        dateValues[1] = '20'+dateValues[1];
      }
      expenseData.date = `${dateValues[1]}-${dateValues[2].padStart(2, '0')}-${dateValues[3].padStart(2, '0')}T${dateValues[5].padStart(2, '0')}:${dateValues[6].padStart(2, '0')}:00+02:00`;
    }
    else {
      console.error(`Date format error: "${expenseData.date}"`);
      return;
    }
    if( typeof expenseData.amount === 'string' || expenseData.amount instanceof String ) {
      expenseData.amount = expenseData.amount.replace(',', '.');
    }

    return fetch(`${HOST_API}/api/expenses/`, {method:'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify(expenseData)})
    .then(response => response.json())
    .then( data => {
      data.origin = null;
      data.originData = null;
      setExpenses([
        ...expenses,
        data
      ]);
      const newExpenseEdit = {
        ...expenseEdit,
        candidates: [data],
        ticket: data
      };
      setExpenseEdit(newExpenseEdit);
      createTicketPairedToExpense( newExpenseEdit );
    });
  }

  const handleClickSavePair = (ev) => {
    if( expenseEdit.ticket.id ) {
      createTicketPairedToExpense( expenseEdit );
    }
    else {
      createNewExpense( expenseEdit.ticket );
    }
  }

  const handleClickChangeTicket = () => {
    const clickedId = expenseEdit.id;
    const ticket = documents.find((doc) => doc.id === clickedId);

    const parts = ticket.title.match(/(.*) ([0-9]{2,4})\.([0-9]{1,2})\.([0-9]{1,2}) +- +([0-9]+[.,]?[0-9]*)/);

    const ticketTitle = parts[1];
    const ticketAmount = parts[5].replace(',','.');

    const newTitle = ticketTitle.replace('ticket', '').replace('Ticket', '').trim();
    const newTitleCapitalized = newTitle.substring(0,1).toLocaleUpperCase() + newTitle.substring(1);

    setExpenseEdit({
      id: clickedId,
      candidates: [],
      ticket: {
        concept: newTitleCapitalized,
        amount: ticketAmount*-1,
        date: `${parts[2]}.${parts[3]}.${parts[4]}`,
        category: '',
        account: ''
      }
    });
  }

  const renderEditTicket = () => {
    if( expenseEdit.candidates.length ) {
      return <>
        <select onChange={handleChangeSelectEdit} value={expenseEdit.candidates.findIndex((c) => c.id === expenseEdit.ticket.id)}>
          {expenseEdit.candidates.map((c, idx) => <option key={idx} value={idx}>{c.concept} - {c.date} - {c.amount}</option>)}
        </select>
        <button onClick={handleClickChangeTicket}>Editar</button>
        <button onClick={handleClickSavePair}>Guardar</button>
      </>;
    }
    else {
      return <>
        <input type="text" name="concept" id="concept" value={expenseEdit.ticket.concept} onChange={handleChangeInputEdit} />
        <input type="text" name="date" id="date" placeholder='Fecha' value={expenseEdit.ticket.date} onChange={handleChangeInputEdit} />
        <input type="text" name="amount" id="amount" placeholder="Importe" value={expenseEdit.ticket.amount} onChange={handleChangeInputEdit} />
        <input type="text" name="category" id="category" placeholder="Cat" list="categories_of_expenses" value={expenseEdit.ticket.category} onChange={handleChangeInputEdit} />
        <datalist id="categories_of_expenses">
          {categories.map((cat, idx) => 
          <option key={idx} value={cat}/>
          )}
        </datalist>
        <input type="text" name="account" id="account" placeholder="Cuenta" value={expenseEdit.ticket.account} onChange={handleChangeInputEdit} />
        <button onClick={handleClickSavePair}>Guardar</button>
      </>;
    }
  }

  const filteredTickets = documents.filter((doc) => !expenses.filter(d=>d.origin===paperlessHost).find((exp) => {
    const originData = JSON.parse(exp.originData);
    return doc.id === originData.id;
  }))

  return (
    <section>
      Tickets! (tenemos {filteredTickets.length} tickets y {expenses.length} gastos)
      <ul>
        {filteredTickets.map((doc) => (
          <li key={doc.id}>
            <p>{doc.title}</p>
            <p>{expenseEdit.id === doc.id ? renderEditTicket(doc) : <button data-id={doc.id} onClick={handleClickPair}>Asociar</button>}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ExpensesTickets;
