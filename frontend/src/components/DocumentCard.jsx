import React from 'react';
import { FileText, Download, Trash2, Eye } from 'lucide-react';
import api from '../api/api';

const DocumentCard = ({ doc, currentUserRole, onView, onDelete }) => {
  const isManagerOrAdmin = currentUserRole === 'Admin' || currentUserRole === 'Manager';

  const handleDownload = () => {
    api.get(`/documents/${doc.id}/download`, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const originalName = doc.file_path ? doc.file_path.split('_').slice(1).join('_') : `${doc.title}.txt`;
        link.setAttribute('download', originalName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => {
        alert('Failed to download document: ' + err.message);
      });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="glass animate-fade-in" style={{
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Doc Header */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
          padding: '10px',
          borderRadius: '10px',
          color: 'var(--primary)'
        }}>
          <FileText size={22} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{
            fontSize: '1.05rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--text-primary)'
          }}>
            {doc.title}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Uploaded {formatDate(doc.created_at)} by @{doc.uploader.username}
          </span>
        </div>
      </div>

      {/* Snippet Preview */}
      <p style={{
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        minHeight: '3.6em'
      }}>
        {doc.content}
      </p>

      {/* Doc Actions */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderTop: '1px solid var(--card-border)',
        paddingTop: '12px',
        marginTop: 'auto'
      }}>
        <button
          onClick={() => onView(doc)}
          className="btn btn-secondary"
          style={{ flex: 1, padding: '8px', fontSize: '0.82rem', gap: '6px' }}
        >
          <Eye size={14} />
          <span>Read</span>
        </button>

        {doc.file_path && (
          <button
            onClick={handleDownload}
            className="btn btn-secondary"
            style={{ padding: '8px', fontSize: '0.82rem', width: '38px' }}
            title="Download Original File"
          >
            <Download size={14} />
          </button>
        )}

        {isManagerOrAdmin && onDelete && (
          <button
            onClick={() => onDelete(doc.id)}
            className="btn btn-danger"
            style={{ padding: '8px', fontSize: '0.82rem', width: '38px' }}
            title="Delete Document"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
