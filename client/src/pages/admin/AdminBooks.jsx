import React, { useState, useEffect, useCallback } from 'react';
import { booksAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Icon = ({ src, alt = '', size = 18, style = {} }) => {
  if (src && src.startsWith('http')) {
    return <img src={src} alt={alt} width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} />
  }
  return <i className={`fi ${src}`} style={{ fontSize: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, ...style }} title={alt}></i>
};

const ICONS = {
  search:  'fi-rr-search',
  add:     'fi-rr-plus',
  books:   'fi-rr-books',
  edit:    'fi-rr-edit',
  trash:   'fi-rr-trash',
  star:    'fi-sr-star',
  loading: 'fi-rr-spinner',
  close:   'fi-rr-cross',
};

const CATEGORIES = ['Fiction','Non-Fiction','Science','Technology','History','Biography',
  'Self-Help','Business','Arts','Philosophy','Religion','Travel','Children','Comics','Education','Law','Medical','Other'];

const BOOK_ICONS = { 
  Fiction: 'fi-rr-book-alt', 'Non-Fiction': 'fi-rr-books', Science: 'fi-rr-microscope', Technology: 'fi-rr-laptop',
  History: 'fi-rr-time-past', Biography: 'fi-rr-user', 'Self-Help': 'fi-rr-bulb', Business: 'fi-rr-briefcase', Arts: 'fi-rr-palette',
  Philosophy: 'fi-rr-brain', Other: 'fi-rr-books' 
};

const extractImageUrl = (url) => {
  try {
    if (!url) return '';
    if (url.includes('google.com/imgres')) {
      const urlObj = new URL(url);
      const imgurl = urlObj.searchParams.get('imgurl');
      if (imgurl) return imgurl;
    }
    return url;
  } catch (err) {
    return url;
  }
};

const emptyBook = {
  title: '', author: '', isbn: '', category: 'Fiction', description: '',
  publishedYear: '', publisher: '', language: 'English', pages: '',
  totalCopies: 1, isFeatured: false, tags: '', coverImage: ''
};

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: 'All', sort: 'newest', page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(emptyBook);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, category: filters.category === 'All' ? '' : filters.category, limit: 15 };
      const res = await booksAPI.getAll(params);
      setBooks(res.data.books);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const openAdd = () => { setEditBook(null); setForm(emptyBook); setShowModal(true); };
  const openEdit = (book) => {
    setEditBook(book);
    setForm({
      title: book.title, author: book.author, isbn: book.isbn, category: book.category,
      description: book.description || '', publishedYear: book.publishedYear || '',
      publisher: book.publisher || '', language: book.language || 'English',
      pages: book.pages || '', totalCopies: book.totalCopies, isFeatured: book.isFeatured || false,
      tags: (book.tags || []).join(', '), coverImage: book.coverImage || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.isbn || !form.category) {
      return toast.error('Please fill required fields: title, author, ISBN, category');
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (typeof form.tags === 'string') {
        payload.tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      }

      if (editBook) {
        await booksAPI.update(editBook._id, payload);
        toast.success('Book updated successfully!');
      } else {
        await booksAPI.create(payload);
        toast.success('Book added successfully!');
      }
      setShowModal(false);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally { setSaving(false); }
  };

  const handleDelete = async (bookId) => {
    try {
      await booksAPI.delete(bookId);
      toast.success('Book deleted');
      setDeleteConfirm(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book');
    }
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v, page: 1 }));

  return (
    <div>
      {/* Action toolbar — Add button right-aligned; goes full-width on mobile */}
      <div className="admin-toolbar">
        <span className="admin-toolbar-title">
          {pagination.total > 0 ? `${pagination.total} books` : 'All books'}
        </span>
        <button className="btn btn-primary" onClick={openAdd}>
          <Icon src={ICONS.add} alt="Add" size={16} style={{ marginRight: 6 }} />
          Add New Book
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="search-filters" style={{ marginBottom: 20 }}>
        <div className="search-box" style={{ flex: 2 }}>
          <span className="search-icon"><Icon src={ICONS.search} alt="Search" size={18} /></span>
          <input
            className="form-input"
            style={{ paddingLeft: 44 }}
            placeholder="Search books..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
          />
        </div>
        <select className="form-input form-select filter-select" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="form-input form-select filter-select" value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
          <option value="title">A-Z</option>
        </select>
      </div>


      {/* Books table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><Icon src={ICONS.books} alt="" size={16} style={{ marginRight: 6 }} /> All Books ({pagination.total || 0})</div>
        </div>
        <div className="table-container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
          ) : books.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><Icon src={ICONS.books} alt="" size={38} /></div><h3>No books found</h3></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Copies</th>
                  <th>Available</th>
                  <th>Rating</th>
                  <th>Borrows</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 38, height: 50, borderRadius: 6, background: '#eff6ff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20, flexShrink: 0, overflow: 'hidden'
                        }}>
                          {book.coverImage
                            ? <img src={book.coverImage.startsWith('http') ? book.coverImage : `http://localhost:5000${book.coverImage}`} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x220?text=No+Cover'; }} />
                            : <Icon src={BOOK_ICONS[book.category] || ICONS.books} alt={book.category} size={22} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', maxWidth: 180 }}>{book.title}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{book.author}</div>
                          {book.isFeatured && <span className="badge badge-blue" style={{ fontSize: '0.68rem', marginTop: 2 }}><Icon src={ICONS.star} alt="" size={11} style={{ marginRight: 2 }} />Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#64748b' }}>{book.isbn}</td>
                    <td><span className="badge badge-blue">{book.category}</span></td>
                    <td style={{ fontWeight: 600 }}>{book.totalCopies}</td>
                    <td>
                      <span className={`badge ${book.availableCopies > 0 ? 'badge-green' : 'badge-red'}`}>
                        {book.availableCopies}
                      </span>
                    </td>
                    <td><Icon src={ICONS.star} alt="Rating" size={13} style={{ marginRight: 2 }} /> {book.averageRating?.toFixed(1) || '0.0'}</td>
                    <td>{book.totalBorrows}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(book)}><Icon src={ICONS.edit} alt="Edit" size={14} style={{ marginRight: 4 }} />Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(book)}><Icon src={ICONS.trash} alt="Delete" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination.pages > 1 && (
          <div className="pagination" style={{ padding: '16px 0' }}>
            <button className="page-btn" onClick={() => setFilter('page', filters.page - 1)} disabled={filters.page === 1}>‹</button>
            {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => (
              <button key={i + 1} className={`page-btn ${filters.page === i + 1 ? 'active' : ''}`} onClick={() => setFilter('page', i + 1)}>{i + 1}</button>
            ))}
            <button className="page-btn" onClick={() => setFilter('page', filters.page + 1)} disabled={filters.page === pagination.pages}>›</button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title">{editBook ? <><Icon src={ICONS.edit} alt="" size={16} style={{ marginRight: 6 }} />Edit Book</> : <><Icon src={ICONS.add} alt="" size={16} style={{ marginRight: 6 }} />Add New Book</>}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icon src={ICONS.close} alt="" size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="form-input" placeholder="Book title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Author *</label>
                    <input className="form-input" placeholder="Author name" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} required />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">ISBN *</label>
                    <input className="form-input" placeholder="e.g. 978-0-00-000000-0" value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-input form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Publisher</label>
                    <input className="form-input" placeholder="Publisher name" value={form.publisher} onChange={e => setForm(f => ({ ...f, publisher: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Published Year</label>
                    <input className="form-input" type="number" placeholder="e.g. 2023" value={form.publishedYear} onChange={e => setForm(f => ({ ...f, publishedYear: e.target.value }))} />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <input className="form-input" placeholder="Language" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pages</label>
                    <input className="form-input" type="number" placeholder="Number of pages" value={form.pages} onChange={e => setForm(f => ({ ...f, pages: e.target.value }))} />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Total Copies</label>
                    <input className="form-input" type="number" min="1" value={form.totalCopies} onChange={e => setForm(f => ({ ...f, totalCopies: parseInt(e.target.value) || 1 }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma separated)</label>
                    <input className="form-input" placeholder="e.g. classic, adventure, fantasy" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input form-textarea" placeholder="Book description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Image URL</label>
                  <input className="form-input" type="url" placeholder="https://example.com/image.jpg" value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: extractImageUrl(e.target.value) }))} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />
                  <label htmlFor="featured" style={{ fontWeight: 500, fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                    <Icon src={ICONS.star} alt="" size={14} style={{ marginRight: 4 }} /> Mark as Featured Book
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editBook ? 'Update Book' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title"><Icon src={ICONS.trash} alt="" size={16} style={{ marginRight: 6 }} />Delete Book</div>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}><Icon src={ICONS.close} alt="Close" size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#475569' }}>Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>? This action cannot be undone.</p>
              {deleteConfirm.availableCopies < deleteConfirm.totalCopies && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', fontSize: '0.82rem', color: '#dc2626' }}>
                  <Icon src={ICONS.trash} alt="" size={14} style={{ marginRight: 6 }} /> Some copies are currently borrowed. Cannot delete.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}
                style={{ background: '#ef4444', color: 'white' }}>
                <Icon src={ICONS.trash} alt="" size={14} style={{ marginRight: 6 }} /> Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
