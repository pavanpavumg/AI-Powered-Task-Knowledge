import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { 
  FileText, CheckSquare, BarChart2, LogOut, Upload, Plus, 
  Search, Users, Activity, FileCheck, Layers, Calendar, Filter
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('documents'); // 'documents', 'tasks', 'analytics'
  const { logout, user } = useAuth();
  
  // Documents States
  const [docs, setDocs] = useState([]);
  const [docsTotal, setDocsTotal] = useState(0);
  const [docPage, setDocPage] = useState(1);
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docSuccess, setDocSuccess] = useState('');
  const [docError, setDocError] = useState('');
  
  // Tasks States
  const [tasks, setTasks] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState('');
  const [taskError, setTaskError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [editTaskId, setEditTaskId] = useState(null);
  
  // Analytics & Logs States
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  
  const [loadingList, setLoadingList] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/analytics/users');
      // Only display users with user role
      const usersOnly = response.data.filter(u => u.role_name === 'user');
      setUsersList(usersOnly);
    } catch (err) {
      console.error("Failed to load users list", err);
    }
  };

  const fetchDocuments = async (page = 1) => {
    setLoadingList(true);
    try {
      const response = await api.get(`/documents?page=${page}&limit=5`);
      setDocs(response.data.results);
      setDocsTotal(response.data.total);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchTasks = async () => {
    setLoadingList(true);
    try {
      let url = '/tasks';
      const params = [];
      if (filterStatus) params.push(`status=${filterStatus}`);
      if (filterAssignee) params.push(`assigned_to=${filterAssignee}`);
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      const response = await api.get(url);
      setTasks(response.data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await api.get('/analytics');
      setAnalytics(response.data);
      
      const logsResponse = await api.get('/activity-logs?limit=8');
      setActivityLogs(logsResponse.data.results);
    } catch (err) {
      console.error("Failed to load analytics", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments(docPage);
    } else if (activeTab === 'tasks') {
      fetchTasks();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, docPage, filterStatus, filterAssignee]);

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!docFile) {
      setDocError('Please select a file to upload');
      return;
    }
    setUploadingDoc(true);
    setDocSuccess('');
    setDocError('');

    const formData = new FormData();
    formData.append('title', docTitle);
    formData.append('file', docFile);

    try {
      await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setDocSuccess('Document uploaded and index scheduled in FAISS successfully!');
      setDocTitle('');
      setDocFile(null);
      e.target.reset(); 
      fetchDocuments(1);
      setDocPage(1);
    } catch (err) {
      setDocError(err.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskAssignee) {
      setTaskError('Please select an assignee user');
      return;
    }
    setCreatingTask(true);
    setTaskSuccess('');
    setTaskError('');

    try {
      if (editTaskId) {
        await api.patch(`/tasks/${editTaskId}`, {
          title: taskTitle,
          description: taskDesc,
          assigned_to: parseInt(taskAssignee)
        });
        setTaskSuccess('Task updated successfully!');
        setEditTaskId(null);
      } else {
        await api.post('/tasks', {
          title: taskTitle,
          description: taskDesc,
          assigned_to: parseInt(taskAssignee)
        });
        setTaskSuccess('Task created and assigned successfully!');
      }
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignee('');
      fetchTasks();
    } catch (err) {
      setTaskError(err.response?.data?.detail || 'Failed to save task changes');
    } finally {
      setCreatingTask(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', color: 'var(--text-primary)' }}>
      {/* Sidebar navigation */}
      <aside style={{
        width: '260px',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-title)' }}>
            TaskSphere
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', tracking: '0.05em' }}>
            Admin Console
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button 
            className={`btn ${activeTab === 'documents' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start', gap: '12px' }}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={18} />
            Documents
          </button>
          <button 
            className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start', gap: '12px' }}
            onClick={() => setActiveTab('tasks')}
          >
            <CheckSquare size={18} />
            Task Management
          </button>
          <button 
            className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ justifyContent: 'flex-start', gap: '12px' }}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={18} />
            Analytics & Logs
          </button>
        </nav>

        <div style={{ 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '20px',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Signed in as:<br/>
            <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong>
          </div>
          <button 
            className="btn btn-outline" 
            style={{ width: '100%', gap: '8px', justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }} 
            onClick={logout}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main dashboard content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', maxHeight: '100vh' }}>
        {/* Render Tab Contents */}
        
        {activeTab === 'documents' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '6px' }}>Document Vault</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Upload text materials for offline FAISS vector space indexing.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
              {/* Document Upload Form */}
              <div className="glass" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={18} style={{ color: 'var(--accent-primary)' }} />
                  Upload Text File
                </h3>

                {docSuccess && <div className="alert alert-success" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>{docSuccess}</div>}
                {docError && <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>{docError}</div>}

                <form onSubmit={handleDocumentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Document Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Server Setup Guidelines"
                      className="form-control"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select .txt File</label>
                    <input 
                      type="file" 
                      required
                      accept=".txt"
                      className="form-control"
                      onChange={(e) => setDocFile(e.target.files[0])}
                      style={{ padding: '8px' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={uploadingDoc} style={{ marginTop: '8px' }}>
                    {uploadingDoc ? 'Uploading...' : 'Upload & Index'}
                  </button>
                </form>
              </div>

              {/* Document List */}
              <div className="glass" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>
                  Uploaded Documents
                </h3>

                {loadingList && docs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading documents vault...</div>
                ) : docs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No documents found. Upload a text document to populate.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <th style={{ padding: '12px' }}>Title</th>
                            <th style={{ padding: '12px' }}>File Identifier</th>
                            <th style={{ padding: '12px' }}>Uploaded By</th>
                            <th style={{ padding: '12px' }}>Upload Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {docs.map(doc => (
                            <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                              <td style={{ padding: '12px', fontWeight: 500 }}>{doc.title}</td>
                              <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{doc.filename}</td>
                              <td style={{ padding: '12px' }}>{doc.uploader_name}</td>
                              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{formatDate(doc.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {docsTotal > 5 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
                        <button 
                          className="btn btn-outline" 
                          disabled={docPage === 1}
                          onClick={() => setDocPage(prev => Math.max(1, prev - 1))}
                        >
                          Prev
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.9rem' }}>
                          Page {docPage} of {Math.ceil(docsTotal / 5)}
                        </span>
                        <button 
                          className="btn btn-outline" 
                          disabled={docPage * 5 >= docsTotal}
                          onClick={() => setDocPage(prev => prev + 1)}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '6px' }}>Task Registry</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Create development items and track status updates across staff.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
              {/* Task Creation Form */}
              <div className="glass" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={18} style={{ color: 'var(--accent-primary)' }} />
                  {editTaskId ? 'Edit Task' : 'Create New Task'}
                </h3>

                {taskSuccess && <div className="alert alert-success" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>{taskSuccess}</div>}
                {taskError && <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>{taskError}</div>}

                <form onSubmit={handleTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Task Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Fix Navigation Layout"
                      className="form-control"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Task Description</label>
                    <textarea 
                      placeholder="Detailed tasks deliverables..."
                      className="form-control"
                      rows="4"
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assign To User</label>
                    <select 
                      required
                      className="form-control"
                      value={taskAssignee}
                      onChange={(e) => setTaskAssignee(e.target.value)}
                      style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)' }}
                    >
                      <option value="">-- Choose User --</option>
                      {usersList.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={creatingTask} style={{ marginTop: '8px' }}>
                    {creatingTask ? 'Saving...' : editTaskId ? 'Save Changes' : 'Assign Task'}
                  </button>
                  {editTaskId && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ marginTop: '8px', marginLeft: '8px' }}
                      onClick={() => {
                        setEditTaskId(null);
                        setTaskTitle('');
                        setTaskDesc('');
                        setTaskAssignee('');
                        setTaskSuccess('');
                        setTaskError('');
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </form>
              </div>

              {/* Task Filtering & List */}
              <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>All Assigned Tasks</h3>
                  
                  {/* Filters */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '6px' }}
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <Users size={14} style={{ color: 'var(--text-secondary)' }} />
                      <select 
                        value={filterAssignee}
                        onChange={(e) => setFilterAssignee(e.target.value)}
                        style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '6px' }}
                      >
                        <option value="">All Assignees</option>
                        {usersList.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {loadingList && tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading task lists...</div>
                ) : tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No tasks found matching filter selections.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    {tasks.map(task => (
                      <div key={task.id} className="glass" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <div>
                            <h4 style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>{task.title}</h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {task.id}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              disabled={task.status !== 'pending'}
                              onClick={() => {
                                setEditTaskId(task.id);
                                setTaskTitle(task.title);
                                setTaskDesc(task.description || '');
                                setTaskAssignee(task.assigned_to.toString());
                                setTaskSuccess('');
                                setTaskError('');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="btn btn-outline btn-sm"
                              style={{ 
                                padding: '4px 8px', 
                                fontSize: '0.75rem', 
                                opacity: task.status === 'pending' ? 1 : 0.4,
                                cursor: task.status === 'pending' ? 'pointer' : 'not-allowed'
                              }}
                            >
                              Edit
                            </button>
                            <span className={`badge ${task.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '12px' }}>
                          {task.description || 'No description provided.'}
                        </p>
                        
                        {task.status === 'completed' && (
                          <div style={{
                            background: 'rgba(255, 255, 255, 0.01)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            padding: '12px',
                            fontSize: '0.85rem',
                            marginBottom: '12px',
                            marginTop: '12px'
                          }}>
                            <div><strong style={{ color: 'var(--text-primary)' }}>Finished:</strong> {formatDate(task.completed_at)}</div>
                            {task.completion_note && (
                              <div style={{ marginTop: '4px' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>Completion Note:</strong> {task.completion_note}
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                          <span>Assignee: <strong style={{ color: 'var(--text-primary)' }}>{task.assigned_to_name}</strong></span>
                          <span>Created: {formatDate(task.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '6px' }}>System Audit & Analytics</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Realtime counts and audit logs representing client actions.</p>
            </div>

            {loadingAnalytics && !analytics ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Compiling analytics metrics...</div>
            ) : analytics ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Stats cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  <div className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)' }}>
                      <CheckSquare size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Tasks</span>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '2px 0 0 0' }}>{analytics.total_tasks}</h2>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                      <FileCheck size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completed Tasks</span>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '2px 0 0 0' }}>{analytics.completed_tasks}</h2>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(234,179,8,0.1)', color: '#eab308' }}>
                      <Layers size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pending Tasks</span>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '2px 0 0 0' }}>{analytics.pending_tasks}</h2>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)' }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Documents</span>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '2px 0 0 0' }}>{analytics.total_documents}</h2>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  {/* Top Search Queries list */}
                  <div className="glass" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Search size={18} style={{ color: 'var(--accent-primary)' }} />
                      Top Search Queries
                    </h3>

                    {analytics.top_searches.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        No search queries recorded in activity logs.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {analytics.top_searches.map((item, idx) => {
                          const maxCount = analytics.top_searches[0]?.count || 1;
                          const pct = (item.count / maxCount) * 100;
                          return (
                            <div key={idx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                                <span>"{item.query}"</span>
                                <strong style={{ color: 'var(--text-secondary)' }}>{item.count} count</strong>
                              </div>
                              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '3px' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Audit Logs list */}
                  <div className="glass" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
                      Audit Activity Logs
                    </h3>

                    {activityLogs.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        No logs recorded yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activityLogs.map((log) => (
                          <div key={log.id} style={{ 
                            padding: '10px 14px', 
                            borderRadius: '8px', 
                            background: 'rgba(255,255,255,0.01)', 
                            border: '1px solid rgba(255,255,255,0.03)',
                            fontSize: '0.85rem'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{log.action.toUpperCase()}</span>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{formatDate(log.created_at)}</span>
                            </div>
                            <p style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{log.details || 'No detail metadata.'}</p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Actor: {log.user_name} ({log.user_email})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
