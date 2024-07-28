import React, { useState } from 'react';
import { storage, db } from './firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, set } from 'firebase/database';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    
    try {
      // Sube el archivo PDF
      const pdfStorageRef = ref(storage, `pdfs/${file.name}`);
      await uploadBytes(pdfStorageRef, file);
      const pdfDownloadUrl = await getDownloadURL(pdfStorageRef);
      setPdfUrl(pdfDownloadUrl);

      // Genera y sube la vista previa de la primera página
      const previewUrl = await generateAndUploadPreview(file);
      setPreviewUrl(previewUrl);

      await saveFileMetadata(file.name, pdfDownloadUrl, previewUrl);

    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const generateAndUploadPreview = async (pdfFile) => {
    const previewStorageRef = ref(storage, `previews/${pdfFile.name.replace('.pdf', '.png')}`);
    
    // Lee el archivo PDF
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1); // Solo la primera página
    const viewport = page.getViewport({ scale: 0.2 });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({ canvasContext: context, viewport }).promise;
    const imgData = canvas.toDataURL('image/png');

    // Convierte la imagen a un Blob y sube
    const blob = await fetch(imgData).then(res => res.blob());
    await uploadBytes(previewStorageRef, blob);
    return await getDownloadURL(previewStorageRef);
  };

  const saveFileMetadata = async (fileName, pdfUrl, previewUrl) => {
    const fileId = fileName.replace('.pdf', ''); // Usar el nombre del archivo sin la extensión como ID
    const fileMetadataRef = dbRef(db, `files/${fileId}`);
    await set(fileMetadataRef, {
      name: fileName,
      pdfUrl: pdfUrl,
      previewUrl: previewUrl,
      timestamp: Date.now()
    });
  };

  return (
    <div>
      <h2>Subir PDF</h2>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {pdfUrl && (
        <div>
          <p>PDF URL: <a href={pdfUrl} target="_blank" rel="noopener noreferrer">{pdfUrl}</a></p>
        </div>
      )}
      {previewUrl && (
        <div>
          <p>Preview URL: <a href={previewUrl} target="_blank" rel="noopener noreferrer">{previewUrl}</a></p>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
