import React, { useState, useEffect, useCallback } from 'react';
import { booksAPI, borrowsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Icon = ({ src, alt = '', size = 18, style = {} }) => (
  <img src={src} alt={alt} width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} />
);

const ICONS = {
  search:  'https://cdn-icons-png.flaticon.com/512/622/622669.png',
  books:   'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
  book:    'https://cdn-icons-png.flaticon.com/512/2991/2991112.png',
  star:    'https://cdn-icons-png.flaticon.com/512/1828/1828884.png',
  borrow:  'https://cdn-icons-png.flaticon.com/512/2965/2965395.png',
  isbn:    'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
  year:    'https://cdn-icons-png.flaticon.com/512/747/747310.png',
  pub:     'https://cdn-icons-png.flaticon.com/512/3143/3143437.png',
  pages:   'https://cdn-icons-png.flaticon.com/512/2991/2991112.png',
  lang:    'https://cdn-icons-png.flaticon.com/512/484/484633.png',
  dl:      'https://cdn-icons-png.flaticon.com/512/2965/2965395.png',
};

const CATEGORIES = ['All','Fiction','Non-Fiction','Science','Technology','History','Biography',
  'Self-Help','Business','Arts','Philosophy','Religion','Travel','Children','Comics','Education','Law','Medical','Other'];

const BOOK_ICONS = {
  Fiction:     'https://cdn-icons-png.flaticon.com/512/2991/2991112.png',
  'Non-Fiction':'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
  Science:      'https://cdn-icons-png.flaticon.com/512/2103/2103651.png',
  Technology:   'https://cdn-icons-png.flaticon.com/512/3281/3281289.png',
  History:      'https://cdn-icons-png.flaticon.com/512/854/854874.png',
  Biography:    'https://cdn-icons-png.flaticon.com/512/1077/1077063.png',
  'Self-Help':  'https://cdn-icons-png.flaticon.com/512/3588/3588295.png',
  Business:     'https://cdn-icons-png.flaticon.com/512/2942/2942909.png',
  Arts:         'https://cdn-icons-png.flaticon.com/512/3321/3321752.png',
  Philosophy:   'https://cdn-icons-png.flaticon.com/512/2919/2919600.png',
  Religion:     'https://cdn-icons-png.flaticon.com/512/1698/1698355.png',
  Travel:       'https://cdn-icons-png.flaticon.com/512/201/201623.png',
  Children:     'https://cdn-icons-png.flaticon.com/512/3048/3048122.png',
  Comics:       'https://cdn-icons-png.flaticon.com/512/2583/2583347.png',
  Education:    'https://cdn-icons-png.flaticon.com/512/3976/3976625.png',
  Law:          'https://cdn-icons-png.flaticon.com/512/2107/2107845.png',
  Medical:      'https://cdn-icons-png.flaticon.com/512/2382/2382461.png',
  Other:        'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
};

export default function BookCatalogue() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: 'All', availability: '', sort: 'newest', page: 1 });
  const [selectedBook, setSelectedBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [borrowing, setBorrowing] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, category: filters.category === 'All' ? '' : filters.category };
      const res = await booksAPI.getAll(params);
      setBooks(res.data.books);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const openBook = async (book) => {
    setSelectedBook(book);
    setReviewForm({ rating: 5, comment: '' });
    try {
      const res = await reviewsAPI.getByBook(book._id);
      setReviews(res.data);
    } catch { setReviews([]); }
  };

  const handleBorrow = async (bookId) => {
    setBorrowing(true);
    try {
      await borrowsAPI.borrow(bookId);
      toast.success('Book borrowed successfully! Due in 14 days 📚');
      setSelectedBook(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to borrow book');
    } finally { setBorrowing(false); }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return toast.error('Please write a comment');
    setReviewLoading(true);
    try {
      await reviewsAPI.add({ bookId: selectedBook._id, ...reviewForm });
      toast.success('Review added!');
      const res = await reviewsAPI.getByBook(selectedBook._id);
      setReviews(res.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    } finally { setReviewLoading(false); }
  };

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div>
      {/* Search & Filters */}
      <div className="search-filters">
        <div className="search-box" style={{ flex: 2, minWidth: 260 }}>
          <span className="search-icon"><Icon src={ICONS.search} alt="Search" size={18} /></span>
          <input
            className="form-input"
            style={{ paddingLeft: 44 }}
            placeholder="Search by title, author, ISBN..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
          />
        </div>
        <select
          className="form-input form-select filter-select"
          value={filters.category}
          onChange={e => setFilter('category', e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="form-input form-select filter-select"
          value={filters.availability}
          onChange={e => setFilter('availability', e.target.value)}
        >
          <option value="">All Books</option>
          <option value="available">Available Only</option>
        </select>
        <select
          className="form-input form-select filter-select"
          value={filters.sort}
          onChange={e => setFilter('sort', e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Top Rated</option>
          <option value="title">A-Z Title</option>
        </select>
        {(filters.search || filters.category !== 'All' || filters.availability) && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setFilters({ search: '', category: 'All', availability: '', sort: 'newest', page: 1 })}
          >✕ Clear</button>
        )}
      </div>

      {/* Results count */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          {loading ? 'Loading...' : `${pagination.total || 0} book${pagination.total !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Books grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon"><Icon src={ICONS.books} alt="Books" size={48} /></div>
          <h3>No books found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map(book => (
            <div key={book._id} className="book-card" onClick={() => openBook(book)}>
              <div className="book-cover">
                {book.coverImage
                  ? <img src={`http://localhost:5000${book.coverImage}`} alt={book.title} />
                  : <span className="book-cover-placeholder"><Icon src={BOOK_ICONS[book.category] || ICONS.books} alt={book.category} size={40} /></span>
                }
                <span className={`book-badge ${book.availableCopies === 0 ? 'unavailable' : ''}`}>
                  {book.availableCopies > 0 ? `✓ ${book.availableCopies} left` : 'Unavailable'}
                </span>
              </div>
              <div className="book-info">
                <div className="book-category">{book.category}</div>
                <div className="book-title">{book.title}</div>
                <div className="book-author">by {book.author}</div>
                <div className="book-meta">
                  <div className="book-rating">
                    <Icon src={ICONS.star} alt="Rating" size={13} style={{ marginRight: 3 }} /> {book.averageRating?.toFixed(1) || '0.0'}
                    <span style={{ color: '#94a3b8', fontWeight: 400 }}>({book.reviewCount})</span>
                  </div>
                  <div className="book-copies">
                    <strong>{book.availableCopies}</strong>/{book.totalCopies}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setFilter('page', filters.page - 1)} disabled={filters.page === 1}>‹</button>
          {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button key={p} className={`page-btn ${filters.page === p ? 'active' : ''}`} onClick={() => setFilter('page', p)}>
                {p}
              </button>
            );
          })}
          <button className="page-btn" onClick={() => setFilter('page', filters.page + 1)} disabled={filters.page === pagination.pages}>›</button>
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedBook(null); }}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div className="modal-title"><Icon src={ICONS.books} alt="" size={18} style={{ marginRight: 6 }} />Book Details</div>
              <button className="modal-close" onClick={() => setSelectedBook(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
                <div style={{
                  width: 120, height: 170, borderRadius: 10, flexShrink: 0,
                  background: 'linear-gradient(135deg, #eff6ff, #bfdbfe)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 52, overflow: 'hidden'
                }}>
                  {selectedBook.coverImage
                      ? <img src={`http://localhost:5000${selectedBook.coverImage}`} alt={selectedBook.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Icon src={BOOK_ICONS[selectedBook.category] || ICONS.books} alt={selectedBook.category} size={52} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a56db', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    {selectedBook.category}
                  </div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: 4, fontFamily: 'Sora, sans-serif' }}>
                    {selectedBook.title}
                  </h2>
                  <p style={{ color: '#64748b', marginBottom: 12 }}>by <strong>{selectedBook.author}</strong></p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    <span className={`badge ${selectedBook.availableCopies > 0 ? 'badge-green' : 'badge-gray'}`}>
                      {selectedBook.availableCopies > 0 ? `✓ ${selectedBook.availableCopies} copies available` : 'Not Available'}
                    </span>
                    <span className="badge badge-blue"><Icon src={ICONS.star} alt="" size={12} style={{ marginRight: 3 }} />{selectedBook.averageRating?.toFixed(1) || '0.0'} ({selectedBook.reviewCount} reviews)</span>
                    <span className="badge badge-gray"><Icon src={ICONS.dl} alt="" size={12} style={{ marginRight: 3 }} />{selectedBook.totalBorrows} borrows</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16, fontSize: '0.82rem', color: '#475569' }}>
                    {selectedBook.isbn && <div><Icon src={ICONS.isbn} alt="" size={13} style={{ marginRight: 4 }} />ISBN: <strong>{selectedBook.isbn}</strong></div>}
                    {selectedBook.publishedYear && <div><Icon src={ICONS.year} alt="" size={13} style={{ marginRight: 4 }} />Year: <strong>{selectedBook.publishedYear}</strong></div>}
                    {selectedBook.publisher && <div><Icon src={ICONS.pub} alt="" size={13} style={{ marginRight: 4 }} />Publisher: <strong>{selectedBook.publisher}</strong></div>}
                    {selectedBook.pages && <div><Icon src={ICONS.pages} alt="" size={13} style={{ marginRight: 4 }} />Pages: <strong>{selectedBook.pages}</strong></div>}
                    {selectedBook.language && <div><Icon src={ICONS.lang} alt="" size={13} style={{ marginRight: 4 }} />Language: <strong>{selectedBook.language}</strong></div>}
                  </div>
                  {selectedBook.description && (
                    <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.7 }}>{selectedBook.description}</p>
                  )}
                </div>
              </div>

              {/* Borrow button */}
              {selectedBook.availableCopies > 0 && (
                <button
                  className="btn btn-primary btn-full btn-lg"
                  style={{ marginBottom: 24 }}
                  onClick={() => handleBorrow(selectedBook._id)}
                  disabled={borrowing}
                >
                  {borrowing ? 'Processing...' : <><Icon src={ICONS.book} alt="" size={16} style={{ marginRight: 6 }} />Borrow This Book (14 days)</>}
                </button>
              )}

              {/* Reviews */}
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, marginBottom: 16, color: '#0f172a' }}>
                  <Icon src={ICONS.star} alt="" size={16} style={{ marginRight: 6 }} />Reviews ({reviews.length})
                </h3>
                {/* Add review form */}
                <form onSubmit={handleAddReview} style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#334155', display: 'block', marginBottom: 8 }}>Your Rating</label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map(s => (
                        <button type="button" key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: s <= reviewForm.rating ? '#f59e0b' : '#cbd5e1' }}>
                          ★
                        </button>
                      ))}
                      <span style={{ marginLeft: 8, fontSize: '0.875rem', color: '#64748b', alignSelf: 'center' }}>{reviewForm.rating}/5</span>
                    </div>
                  </div>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Share your thoughts about this book..."
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    style={{ marginBottom: 10 }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={reviewLoading}>
                    {reviewLoading ? '...' : '✓ Submit Review'}
                  </button>
                </form>
                {reviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.875rem' }}>
                    No reviews yet. Be the first to review!
                  </div>
                ) : (
                  <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                    {reviews.map(r => (
                      <div key={r._id} className="review-card">
                        <div className="review-header">
                          <div className="review-avatar">{r.user?.name?.[0]?.toUpperCase() || 'U'}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.user?.name || 'Anonymous'}</div>
                            <div style={{ display: 'flex', gap: 1 }}>
                              {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? '#f59e0b' : '#e2e8f0', fontSize: 13 }}>★</span>)}
                            </div>
                          </div>
                          <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8' }}>
                            {new Date(r.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#475569', marginLeft: 42 }}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
