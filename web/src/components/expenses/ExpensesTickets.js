import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

function ExpensesTickets() {
  const [documents, setDocuments] = useState([]);

  const { status: paperlessApiStatus, listDocuments } = useOutletContext();

  useEffect(() => {
    if (paperlessApiStatus) {
      listDocuments()
        .then((docData) => {
          console.log(docData);
          setDocuments(
            docData.results.filter((doc) => doc.document_type === 2)
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [listDocuments, paperlessApiStatus]);

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
