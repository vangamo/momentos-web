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
          console.log(docData);
          setDocuments([
            ...documents,
            ...docData.results
              .filter((doc) => doc.document_type === 2 || doc.title.toLocaleLowerCase().includes('ticket') || doc.title.toLocaleLowerCase().includes('factura'))
              .filter((doc) => !expenses.find((exp) => {
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
        setExpenses(data.filter(d=>d.origin==='pplss.pweak.es'));
      });
  }, []);
  
  return (
    <section>
      Tickets!
      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            <p>{doc.title}</p>
            <p>{doc.document_type}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ExpensesTickets;
