import React from 'react';
import './DialogBox.css';

const DialogBox = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2>{title}</h2>
        <p>{message}</p>
        <button className="dialog-btn" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default DialogBox;
