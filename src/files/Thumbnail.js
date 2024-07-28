import React from 'react';
import defaultImage from './nois.jpg'; // Imagen predeterminada

const Thumbnail = ({ fileUrl, previewUrl, title, onClick }) => {
  const truncatedTitle = title.length > 20 ? `${title.substring(0, 20)}...` : title;

  return (
    <div onClick={onClick} style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
      <img 
        src={previewUrl || defaultImage} 
        alt="Preview" 
        style={{ width: '150px', height: '200px', objectFit: 'cover', borderRadius: '8px' }} 
      />
      <p style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {truncatedTitle}
      </p>
    </div>
  );
};

export default Thumbnail;
