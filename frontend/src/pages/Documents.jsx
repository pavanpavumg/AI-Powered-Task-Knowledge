import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import DocumentCard from '../components/DocumentCard';
import { Upload, X, File, FileText } from 'lucide-react';

const Documents = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState('file'); // 'file' or 'text'
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Reader overlay state
  const [selectedDoc, setSelectedDoc] = useState(null);

  const hasWriteAccess = user.role.name === 'Admin' || user.role.name === 'Manager';

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/documents/');
      setDocs(response.data);
    } catch (e) {
      console.error('Error fetching docs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document? This will remove it from the semantic search index.')) {
      try {
        await api.delete(`/documents/${docId}`);
        fetchDocs();
      } catch (e) {
        alert('Error deleting document: ' + (e.response?.data?.detail || e.message));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploading(true);

    try {
      if (uploadTab === 'file') {
        if (!file) {
          throw new Error('Please select a file to upload');
        }
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);
        
        await api.post('/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await api.post('/documents/', {
          title,
          content
        });
      }

      setTitle('');
      setContent('');
      setFile(null);
      setShowUploadModal(false);
      fetchDocs();
    } catch (err) {
      setUploadError(err.response?.data?.detail || err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Title Block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', marginBottom: '4px' }}>Knowledge Library</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Browse documentation and resources indexed for semantic searching.
          </p>
        </div>
        
        {hasWriteAccess && (
          <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
            <Upload size={18} />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Docs Listing Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <span className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 500 }}>Loading document vaults...</span>
        </div>
      ) : docs.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '60px 40px', borderRadius: '16px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>No documents have been indexed yet.</p>
          {hasWriteAccess && (
            <button onClick={() => setShowUploadModal(true)} className="btn btn-secondary">Upload First Document</button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {docs.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              currentUserRole={user.role.name}
              onView={(d) => setSelectedDoc(d)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Document Reader Overlay */}
      {selectedDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '40px'
        }}>
          <div className="glass animate-fade-in" style={{
            width: '100%',
            maxWidth: '800px',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '30px',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedDoc(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={22} />
            </button>

            <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '16px', marginBottom: '20px' }}>
              <span className="badge badge-in-progress" style={{ marginBottom: '8px' }}>Indexed KMS Document</span>
              <h2 style={{ fontSize: '1.65rem', marginBottom: '4px', fontFamily: 'var(--font-title)' }}>
                {selectedDoc.title}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Uploaded by @{selectedDoc.uploader.username} on {new Date(selectedDoc.created_at).toLocaleDateString()}
              </span>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              fontSize: '0.96rem',
              color: 'var(--text-primary)',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.03)'
            }}>
              {selectedDoc.content}
            </div>
            
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedDoc(null)} className="btn btn-secondary">
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal Dialog */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(5, 8, 16, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass animate-fade-in" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '30px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowUploadModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', fontFamily: 'var(--font-title)' }}>
              Index Document
            </h2>

            {/* Tab Swaps */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--card-border)',
              borderRadius: '10px',
              padding: '3px',
              marginBottom: '20px'
            }}>
              <button
                type="button"
                className="btn"
                onClick={() => setUploadTab('file')}
                style={{
                  flex: 1,
                  background: uploadTab === 'file' ? 'var(--bg-tertiary)' : 'transparent',
                  color: uploadTab === 'file' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '6px 0',
                  borderRadius: '6px',
                  fontSize: '0.82rem'
                }}
              >
                Upload File (.txt, .md)
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setUploadTab('text')}
                style={{
                  flex: 1,
                  background: uploadTab === 'text' ? 'var(--bg-tertiary)' : 'transparent',
                  color: uploadTab === 'text' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '6px 0',
                  borderRadius: '6px',
                  fontSize: '0.82rem'
                }}
              >
                Write Rich Text
              </button>
            </div>

            {uploadError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.85rem'
              }}>
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Server Setup Guidelines"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {uploadTab === 'file' ? (
                <div className="form-group">
                  <label className="form-label">Select File</label>
                  <div style={{
                    border: '1px dashed var(--card-border)',
                    borderRadius: '12px',
                    padding: '24px 20px',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.01)',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="file"
                      id="fileInput"
                      accept=".txt,.md,.json,.html"
                      onChange={(e) => setFile(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <FileText size={28} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {file ? file.name : 'Click to select a text/markdown file'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Files will be parsed and vector indexed automatically
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Document Content</label>
                  <textarea
                    required
                    placeholder="Type or paste document information here..."
                    className="form-control"
                    rows="6"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {uploading ? 'Indexing...' : 'Index Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
