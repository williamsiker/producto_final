// src/Library.js
import React, { useState, useEffect } from 'react';
import Thumbnail from './Thumbnail';
import './styles.css';

const Library = ({ pdfFiles }) => {
  return (
    <div className="container">
      <h1>Mi Biblioteca</h1>
      <div className="row">
        {pdfFiles.map((file, index) => (
          <div className="col-md-4" key={index}>
            <div className="card">
              <div className="card-header">
                <h5>PDF {index + 1}</h5>
              </div>
              <div className="card-body">
                <Thumbnail file={file} />
                <p>Descripción del PDF</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
