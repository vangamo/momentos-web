import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const { NODE_ENV } = process.env;
const HOST_API = 'production' === NODE_ENV ? '' : `${window.location.protocol}//${window.location.hostname}:5000`;

function ExpensesTickets() {
  const [documents, setDocuments] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const { status: paperlessApiStatus, listDocuments } = useOutletContext();

  useEffect(() => {
    if (paperlessApiStatus) {
      listDocuments()
        .then((docData) => {
          setDocuments([
            ...documents,
            ...docData.results
              .filter((doc) => !documents.find((prevDoc) => doc.id === prevDoc.id))
              .filter((doc) => doc.document_type === 2 || doc.title.toLocaleLowerCase().includes('ticket') || doc.title.toLocaleLowerCase().includes('factura'))
              .filter((doc) => !expenses.filter(d=>d.origin==='pplss.pweak.es').find((exp) => {
                const originData = JSON.parse(exp.originData);
                return doc.id === originData.id;
              }))
            ]);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [listDocuments, paperlessApiStatus]);

  useEffect(() => {
    fetch(`${HOST_API}/api/expenses/?fields=origin`)
      .then((response) => response.json())
      .then((data) => {
        setExpenses(data);
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
