// src/App.js
import React from 'react';
import './App.css';
import UploadForm from './files/UploadForm'; // Asegúrate de que la ruta sea correcta
import PdfLibrary from './files/PdfLibrary'; // Asegúrate de que la ruta sea correcta

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Mi Biblioteca de PDFs</h1>
      </header>
      <main>
        <UploadForm />
        <PdfLibrary />
      </main>
    </div>
  );
}

export default App;
