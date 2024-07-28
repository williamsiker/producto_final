import React, { useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './firebase-config'; // Make sure auth and storage are imported correctly
import Thumbnail from './Thumbnail';
import Modal from 'react-modal';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Configura el elemento raíz para el modal
Modal.setAppElement('#root');

const PdfLibrary = () => {
  const [pdfs, setPdfs] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [tags, setTags] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchPdfs = async () => {
        try {
          const pdfsRef = ref(storage, 'pdfs/');
          const previewsRef = ref(storage, 'previews/');
          const previewRes = await listAll(previewsRef);
          const previewsMap = new Map();

          await Promise.all(previewRes.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            const name = itemRef.name.replace('.png', '');
            previewsMap.set(name, url);
          }));

          const pdfsRes = await listAll(pdfsRef);
          const urls = await Promise.all(pdfsRes.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            const name = itemRef.name.replace('.pdf', '');
            const previewUrl = previewsMap.get(name) || '';
            return { pdfUrl: url, previewUrl, name, id: name };
          }));

          setPdfs(urls);
        } catch (error) {
          console.error('Error fetching PDFs:', error);
        }
      };

      fetchPdfs();
    }
  }, [user]);

  const openModal = (pdf) => {
    setSelectedPdf(pdf);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedPdf(null);
  };

  const handleTagChange = (e) => {
    const { name, value } = e.target;
    setTags(prevTags => ({ ...prevTags, [name]: value }));
  };

  const handleSaveTags = () => {
    console.log('Tags saved:', tags);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!user ? (
        <button onClick={handleLogin}>Login with Google</button>
      ) : (
        <>
          <button onClick={handleLogout}>Logout</button>
          <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {pdfs.map((pdf, index) => (
              <div key={index} style={{ border: '1px solid #ccc', padding: '10px' }}>
                <Thumbnail
                  fileUrl={pdf.pdfUrl}
                  previewUrl={pdf.previewUrl}
                  title={pdf.name}
                  onClick={() => openModal(pdf)}
                />
              </div>
            ))}
            
            <Modal 
              isOpen={modalIsOpen} 
              onRequestClose={closeModal} 
              style={{ content: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%' } }}
            >
              {selectedPdf && (
                <div>
                  <button onClick={closeModal}>Close</button>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ flex: 1, overflow: 'auto' }}>
                      <Worker workerUrl={"https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js"}>
                        <Viewer fileUrl={selectedPdf.pdfUrl} />
                      </Worker>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <input
                        type="text"
                        name="tag"
                        placeholder="Add a tag"
                        onChange={handleTagChange}
                      />
                      <button onClick={handleSaveTags}>Save Tag</button>
                    </div>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        </>
      )}
    </div>
  );
};

export default PdfLibrary;
