import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const { NODE_ENV } = process.env;
const HOST_API = 'production' === NODE_ENV ? '' : `${window.location.protocol}//${window.location.hostname}:5000`;

function ExpensesTickets() {
  const [documents, setDocuments] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const { status: paperlessApiStatus, listDocuments } = useOutletContext();

  const saveDocuments = (docData) => {
    setDocuments((oldDocuments) => [
      ...oldDocuments,
      ...docData.results
        .filter((doc) => !oldDocuments.find((prevDoc) => doc.id === prevDoc.id))
        .filter((doc) => doc.document_type === 2 || doc.title.toLocaleLowerCase().includes('ticket') || doc.title.toLocaleLowerCase().includes('factura'))
        .filter((doc) => !expenses.filter(d=>d.origin==='pplss.pweak.es').find((exp) => {
          const originData = JSON.parse(exp.originData);
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
  }, []);

  useEffect(() => {
    fetch(`${HOST_API}/api/expenses/?fields=origin`)
      .then((response) => response.json())
      .then((data) => {
        setExpenses(data);
        setDocuments(documents.filter((doc) => !data.filter(d=>d.origin==='pplss.pweak.es').find((exp) => {
          const originData = JSON.parse(exp.originData);
          return doc.id === originData.id;
        })))
      });
  }, []);
  
  const editTicket = (ticket) => {
    const parts = ticket.title.match(/(.*) ([0-9]{2,4})\.([0-9]{1,2})\.([0-9]{1,2}) +- +([0-9]+[.,]?[0-9]*)/);
    if( !parts ) {
      return <>
      <input type="text" name="" id="" value={ticket.title} />
      <input type="text" name="" id="" placeholder='Fecha' />
      <input type="text" name="" id="" placeholder="Importe" />
      <input type="text" name="" id="" placeholder="Cat" />
      <input type="text" name="" id="" placeholder="Cuenta" />
      </>;      
    }
    const ticketTitle = parts[1];
    const ticketDate = `${parts[2]}-${parts[3]}-${parts[4]}`;
    const ticketAmount = parts[5].replace(',','.');

    const candidates = expenses.filter((e) => e.date.startsWith(ticketDate) && Math.abs(Math.abs(parseInt(ticketAmount))-Math.abs(parseInt(e.amount))) <= 10 );
    if( candidates.length ) {
      return <select>
        {candidates.map((c) => <option>{c.concept} - {c.date} - {c.amount}</option>)}
      </select>
    }
    
    return <>
    <input type="text" name="" id="" value={ticketTitle.replace('ticket ', '').replace('Ticket ', '').trim()} />
    <input type="text" name="" id="" value={`${parts[2]}.${parts[3]}.${parts[4]}`} />
    <input type="text" name="" id="" value={ticketAmount*-1} />
    <input type="text" name="" id="" placeholder="Cat" />
    <input type="text" name="" id="" placeholder="Cuenta" />
    </>
  };
/*
  const shownTickets = documents
    .filter((doc) => !expenses.filter(d=>d.origin==='pplss.pweak.es').find((exp) => {
      const originData = JSON.parse(exp.originData);
      return doc.id === originData.id;
    }));

  console.log(documents.length, shownTickets.length);
*/
  return (
    <section>
      Tickets!
      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            <p>{doc.title}</p>
            <p>{editTicket(doc)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ExpensesTickets;
