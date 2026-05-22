import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  Users, 
  ShoppingBag, 
  LayoutDashboard, 
  Plus, 
  Search, 
  Trash, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Database,
  Activity
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Mock Data for offline/demo mode
const MOCK_BOOKS = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', quantity: 12 },
  { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780446310789', quantity: 7 },
  { id: 3, title: '1984', author: 'George Orwell', isbn: '9780451524935', quantity: 15 },
  { id: 4, title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769174', quantity: 4 }
];

const MOCK_MEMBERS = [
  { id: 'm1', name: 'John Doe', email: 'john@example.com', membershipType: 'Premium' },
  { id: 'm2', name: 'Jane Smith', email: 'jane@example.com', membershipType: 'Regular' },
  { id: 'm3', name: 'Robert Johnson', email: 'robert@example.com', membershipType: 'Premium' }
];

const MOCK_ORDERS = [
  { id: 1, bookId: 1, memberId: 'm1', quantity: 1, orderDate: new Date().toISOString(), status: 'PLACED' },
  { id: 2, bookId: 3, memberId: 'm2', quantity: 2, orderDate: new Date().toISOString(), status: 'PLACED' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOffline, setIsOffline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Data States
  const [books, setBooks] = useState(MOCK_BOOKS);
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [orders, setOrders] = useState(MOCK_ORDERS);

  // Search/Filter States
  const [bookSearch, setBookSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  // Form States
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', quantity: 5 });
  const [newMember, setNewMember] = useState({ name: '', email: '', membershipType: 'Regular' });
  const [newOrder, setNewOrder] = useState({ bookId: '', memberId: '', quantity: 1 });

  // System status
  const [systemStatus, setSystemStatus] = useState({
    gateway: 'inactive',
    eureka: 'inactive',
    config: 'inactive',
    books: 'inactive',
    members: 'inactive',
    orders: 'inactive'
  });

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Check connection & fetch backend data
  const refreshData = async () => {
    setLoading(true);
    let offline = false;

    // Check Config Server & Eureka Server directly if possible, or assume status
    try {
      // 1. Fetch Books
      const booksRes = await axios.get(`${API_BASE_URL}/books`);
      setBooks(booksRes.data);
      systemStatus.books = 'active';
      systemStatus.gateway = 'active';
    } catch (e) {
      offline = true;
      systemStatus.books = 'inactive';
    }

    try {
      // 2. Fetch Members
      const membersRes = await axios.get(`${API_BASE_URL}/members`);
      setMembers(membersRes.data);
      systemStatus.members = 'active';
    } catch (e) {
      offline = true;
      systemStatus.members = 'inactive';
    }

    try {
      // 3. Fetch Orders
      const ordersRes = await axios.get(`${API_BASE_URL}/orders`);
      setOrders(ordersRes.data);
      systemStatus.orders = 'active';
    } catch (e) {
      offline = true;
      systemStatus.orders = 'inactive';
    }

    setIsOffline(offline);
    setSystemStatus({
      gateway: offline ? 'inactive' : 'active',
      eureka: offline ? 'inactive' : 'active',
      config: offline ? 'inactive' : 'active',
      books: systemStatus.books,
      members: systemStatus.members,
      orders: systemStatus.orders
    });

    if (offline) {
      showToast('Backend services are offline. Running in Demo Mode with Mock Data.', 'warning');
    } else {
      showToast('Successfully synchronized with the API Gateway backend microservices.', 'success');
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Form Submissions
  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author || !newBook.isbn) {
      showToast('Please fill in all book fields', 'error');
      return;
    }

    if (isOffline) {
      const created = { ...newBook, id: Date.now(), quantity: parseInt(newBook.quantity) };
      setBooks(prev => [...prev, created]);
      showToast(`Book "${newBook.title}" added to local state.`, 'success');
      setNewBook({ title: '', author: '', isbn: '', quantity: 5 });
    } else {
      try {
        const res = await axios.post(`${API_BASE_URL}/books`, {
          ...newBook,
          quantity: parseInt(newBook.quantity)
        });
        setBooks(prev => [...prev, res.data]);
        showToast(`Book "${res.data.title}" successfully saved via API Gateway!`, 'success');
        setNewBook({ title: '', author: '', isbn: '', quantity: 5 });
      } catch (err) {
        showToast('Error adding book to database: ' + err.message, 'error');
      }
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) {
      showToast('Please fill in all member fields', 'error');
      return;
    }

    if (isOffline) {
      const created = { ...newMember, id: 'm_' + Date.now() };
      setMembers(prev => [...prev, created]);
      showToast(`Member "${newMember.name}" added to local state.`, 'success');
      setNewMember({ name: '', email: '', membershipType: 'Regular' });
    } else {
      try {
        const res = await axios.post(`${API_BASE_URL}/members`, newMember);
        setMembers(prev => [...prev, res.data]);
        showToast(`Member "${res.data.name}" successfully registered!`, 'success');
        setNewMember({ name: '', email: '', membershipType: 'Regular' });
      } catch (err) {
        showToast('Error registering member: ' + err.message, 'error');
      }
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.bookId || !newOrder.memberId || !newOrder.quantity) {
      showToast('Please select a book, member, and input quantity.', 'error');
      return;
    }

    const orderQty = parseInt(newOrder.quantity);

    if (isOffline) {
      // Find book and verify quantity
      const bookIndex = books.findIndex(b => b.id.toString() === newOrder.bookId.toString());
      if (bookIndex === -1) {
        showToast('Book not found!', 'error');
        return;
      }
      
      const book = books[bookIndex];
      if (book.quantity < orderQty) {
        showToast(`Not enough stock. Available: ${book.quantity}`, 'error');
        return;
      }

      // Check if member exists
      const memberExists = members.some(m => m.id.toString() === newOrder.memberId.toString());
      if (!memberExists) {
        showToast('Member not found!', 'error');
        return;
      }

      // Update stock locally
      const updatedBooks = [...books];
      updatedBooks[bookIndex] = { ...book, quantity: book.quantity - orderQty };
      setBooks(updatedBooks);

      // Create order locally
      const order = {
        id: Date.now(),
        bookId: parseInt(newOrder.bookId),
        memberId: newOrder.memberId,
        quantity: orderQty,
        orderDate: new Date().toISOString(),
        status: 'PLACED'
      };
      setOrders(prev => [order, ...prev]);
      showToast('Order placed successfully (Demo Mode)!', 'success');
      setNewOrder({ bookId: '', memberId: '', quantity: 1 });
    } else {
      try {
        const res = await axios.post(`${API_BASE_URL}/orders`, {
          bookId: parseInt(newOrder.bookId),
          memberId: newOrder.memberId,
          quantity: orderQty
        });
        setOrders(prev => [res.data, ...prev]);
        showToast('Order successfully placed via API Gateway!', 'success');
        // Refresh book stock
        const booksRes = await axios.get(`${API_BASE_URL}/books`);
        setBooks(booksRes.data);
        setNewOrder({ bookId: '', memberId: '', quantity: 1 });
      } catch (err) {
        showToast('Failed to place order: ' + (err.response?.data || err.message), 'error');
      }
    }
  };

  const handleDeleteBook = async (id) => {
    if (isOffline) {
      setBooks(prev => prev.filter(b => b.id !== id));
      showToast('Book removed from local state.', 'info');
    } else {
      try {
        await axios.delete(`${API_BASE_URL}/books/${id}`);
        setBooks(prev => prev.filter(b => b.id !== id));
        showToast('Book deleted successfully from database!', 'success');
      } catch (err) {
        showToast('Failed to delete book: ' + err.message, 'error');
      }
    }
  };

  const handleDeleteMember = async (id) => {
    if (isOffline) {
      setMembers(prev => prev.filter(m => m.id !== id));
      showToast('Member removed from local state.', 'info');
    } else {
      try {
        await axios.delete(`${API_BASE_URL}/members/${id}`);
        setMembers(prev => prev.filter(m => m.id !== id));
        showToast('Member deleted successfully from database!', 'success');
      } catch (err) {
        showToast('Failed to delete member: ' + err.message, 'error');
      }
    }
  };

  // Filter lists
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) || 
    b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.isbn.includes(bookSearch)
  );

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
    m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <BookOpen className="logo-icon" size={28} />
          <span className="logo-text">LibFlow LMS</span>
        </div>

        <ul className="nav-list">
          <li 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard className="nav-icon" size={20} />
            Dashboard
          </li>
          <li 
            className={`nav-item ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            <BookOpen className="nav-icon" size={20} />
            Books
          </li>
          <li 
            className={`nav-item ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <Users className="nav-icon" size={20} />
            Members
          </li>
          <li 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag className="nav-icon" size={20} />
            Borrow Orders
          </li>
        </ul>

        <div className="sidebar-footer">
          <p>© 2026 LibFlow System</p>
          <p style={{ marginTop: '0.25rem', color: 'var(--color-primary)' }}>Java 25 & Spring Boot</p>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        <header className="header">
          <div className="welcome-section">
            <h1>Library Management Admin</h1>
            <p>Monitor status, manage book catalog, members, and borrow requests.</p>
          </div>

          <div className="status-indicator-bar">
            <div className="status-indicator-item">
              <span className={`status-dot ${isOffline ? 'inactive' : 'active'}`}></span>
              <span>Backend Connection</span>
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', borderRadius: '50px' }} onClick={refreshData} disabled={loading}>
              <RefreshCw className={loading ? 'animate-spin' : ''} size={14} />
              Sync API
            </button>
          </div>
        </header>

        {/* System Microservices Status Overview */}
        <section className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card" style={{ padding: '1.25rem' }}>
            <div className="stat-info">
              <h3>Config Server (8888)</h3>
              <span className={`badge ${isOffline ? 'badge-error' : 'badge-success'}`}>
                {isOffline ? 'Offline' : 'Online'}
              </span>
            </div>
            <div className="stat-icon-wrapper" style={{ color: 'var(--color-secondary)' }}>
              <Database size={20} />
            </div>
          </div>
          <div className="stat-card" style={{ padding: '1.25rem' }}>
            <div className="stat-info">
              <h3>Eureka Server (8761)</h3>
              <span className={`badge ${isOffline ? 'badge-error' : 'badge-success'}`}>
                {isOffline ? 'Offline' : 'Online'}
              </span>
            </div>
            <div className="stat-icon-wrapper">
              <Activity size={20} />
            </div>
          </div>
          <div className="stat-card" style={{ padding: '1.25rem' }}>
            <div className="stat-info">
              <h3>API Gateway (8080)</h3>
              <span className={`badge ${isOffline ? 'badge-error' : 'badge-success'}`}>
                {isOffline ? 'Offline' : 'Online'}
              </span>
            </div>
            <div className="stat-icon-wrapper" style={{ color: 'var(--status-info)' }}>
              <Activity size={20} />
            </div>
          </div>
        </section>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-info">
                  <h3>Total Books Available</h3>
                  <p>{books.reduce((acc, curr) => acc + curr.quantity, 0)}</p>
                </div>
                <div className="stat-icon-wrapper">
                  <BookOpen size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <h3>Registered Members</h3>
                  <p>{members.length}</p>
                </div>
                <div className="stat-icon-wrapper" style={{ color: 'var(--color-secondary)' }}>
                  <Users size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-info">
                  <h3>Total Orders Processed</h3>
                  <p>{orders.length}</p>
                </div>
                <div className="stat-icon-wrapper" style={{ color: 'var(--status-success)' }}>
                  <ShoppingBag size={24} />
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Recent Activity */}
              <div className="glass-panel">
                <div className="panel-header">
                  <h2>Recent Orders</h2>
                  <span className="badge badge-info">{orders.length} Active</span>
                </div>
                
                <div className="custom-table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Book</th>
                        <th>Member</th>
                        <th>Qty</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(order => {
                        const book = books.find(b => b.id.toString() === order.bookId.toString());
                        const member = members.find(m => m.id.toString() === order.memberId.toString());
                        return (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{book ? book.title : `Book #${order.bookId}`}</td>
                            <td>{member ? member.name : `Member #${order.memberId}`}</td>
                            <td>{order.quantity}</td>
                            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${order.status === 'PLACED' ? 'badge-success' : 'badge-error'}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders placed yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Service Health */}
              <div className="glass-panel">
                <div className="panel-header">
                  <h2>Service Map</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                    <div>
                      <p style={{ fontWeight: '600' }}>Book Service</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MySQL (Port 8081)</p>
                    </div>
                    <span className={`badge ${systemStatus.books === 'active' ? 'badge-success' : 'badge-error'}`}>
                      {systemStatus.books === 'active' ? 'Active' : 'Offline'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                    <div>
                      <p style={{ fontWeight: '600' }}>Member Service</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MongoDB (Port 8082)</p>
                    </div>
                    <span className={`badge ${systemStatus.members === 'active' ? 'badge-success' : 'badge-error'}`}>
                      {systemStatus.members === 'active' ? 'Active' : 'Offline'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
                    <div>
                      <p style={{ fontWeight: '600' }}>Order Service</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MySQL + Feign (Port 8083)</p>
                    </div>
                    <span className={`badge ${systemStatus.orders === 'active' ? 'badge-success' : 'badge-error'}`}>
                      {systemStatus.orders === 'active' ? 'Active' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <div className="glass-panel">
            <div className="panel-header">
              <h2>Book Catalog Management</h2>
              <span className="badge badge-info">{books.length} Total Books</span>
            </div>

            {/* Add Book Form */}
            <form onSubmit={handleAddBook} className="form-container" style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
              <h3 className="form-title">Add New Book to Collection</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Book Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. The Hobbit"
                    value={newBook.title}
                    onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Author</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. J.R.R. Tolkien"
                    value={newBook.author}
                    onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">ISBN Code</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. 9780261102217"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    min="1"
                    value={newBook.quantity}
                    onChange={(e) => setNewBook({...newBook, quantity: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                <Plus size={18} />
                Register Book
              </button>
            </form>

            {/* Search and List */}
            <div className="search-filter-bar">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={18} />
                <input 
                  type="text" 
                  className="form-control search-input" 
                  placeholder="Search books by title, author, or ISBN..." 
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="card-list">
              {filteredBooks.map(book => (
                <div className="item-card" key={book.id}>
                  <div className="item-card-header">
                    <h4 className="item-card-title">{book.title}</h4>
                    <p className="item-card-subtitle">by {book.author}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>ISBN: {book.isbn}</p>
                  </div>
                  <div className="item-card-details">
                    <span className={`badge ${book.quantity > 3 ? 'badge-success' : 'badge-warning'}`}>
                      {book.quantity} Copies Available
                    </span>
                    <button className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: '8px' }} onClick={() => handleDeleteBook(book.id)}>
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredBooks.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No books match the search criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="glass-panel">
            <div className="panel-header">
              <h2>Member Registry</h2>
              <span className="badge badge-info">{members.length} Registered Members</span>
            </div>

            {/* Add Member Form */}
            <form onSubmit={handleAddMember} className="form-container" style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
              <h3 className="form-title">Register New Library Member</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Alice Cooper"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="e.g. alice@gmail.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Membership Tier</label>
                <select 
                  className="form-control"
                  value={newMember.membershipType}
                  onChange={(e) => setNewMember({...newMember, membershipType: e.target.value})}
                  style={{ background: '#121420' }}
                >
                  <option value="Regular">Regular Member</option>
                  <option value="Premium">Premium Member</option>
                  <option value="VIP">VIP Gold Member</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                <Plus size={18} />
                Add Member
              </button>
            </form>

            {/* Search and List */}
            <div className="search-filter-bar">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={18} />
                <input 
                  type="text" 
                  className="form-control search-input" 
                  placeholder="Search members by name or email..." 
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="card-list">
              {filteredMembers.map(member => (
                <div className="item-card" key={member.id}>
                  <div className="item-card-header">
                    <h4 className="item-card-title">{member.name}</h4>
                    <p className="item-card-subtitle">{member.email}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.25rem', fontWeight: '500' }}>ID: {member.id}</p>
                  </div>
                  <div className="item-card-details">
                    <span className={`badge ${member.membershipType === 'VIP' ? 'badge-warning' : member.membershipType === 'Premium' ? 'badge-info' : 'badge-success'}`}>
                      {member.membershipType} Membership
                    </span>
                    <button className="btn btn-danger" style={{ padding: '0.4rem', borderRadius: '8px' }} onClick={() => handleDeleteMember(member.id)}>
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredMembers.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No library members found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="glass-panel">
            <div className="panel-header">
              <h2>Borrowing Order System</h2>
              <span className="badge badge-info">{orders.length} Borrow Orders</span>
            </div>

            {/* Place Order Form */}
            <form onSubmit={handlePlaceOrder} className="form-container" style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
              <h3 className="form-title">Create Borrow Transaction (Order)</h3>
              
              <div className="form-group">
                <label className="form-label">Select Book</label>
                <select 
                  className="form-control"
                  value={newOrder.bookId}
                  onChange={(e) => setNewOrder({...newOrder, bookId: e.target.value})}
                  style={{ background: '#121420' }}
                >
                  <option value="">-- Choose Book to Borrow --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id} disabled={b.quantity <= 0}>
                      {b.title} ({b.quantity} copies in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Member</label>
                <select 
                  className="form-control"
                  value={newOrder.memberId}
                  onChange={(e) => setNewOrder({...newOrder, memberId: e.target.value})}
                  style={{ background: '#121420' }}
                >
                  <option value="">-- Choose Borrowing Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.membershipType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Borrow Quantity</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="1"
                  max="5"
                  value={newOrder.quantity}
                  onChange={(e) => setNewOrder({...newOrder, quantity: e.target.value})}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                <ShoppingBag size={18} />
                Issue Book (Place Order)
              </button>
            </form>

            {/* List Borrow Orders */}
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Book Details</th>
                    <th>Member Details</th>
                    <th>Quantity Issued</th>
                    <th>Transaction Date</th>
                    <th>Order Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const book = books.find(b => b.id.toString() === order.bookId.toString());
                    const member = members.find(m => m.id.toString() === order.memberId.toString());
                    return (
                      <tr key={order.id}>
                        <td style={{ fontWeight: '600' }}>#{order.id}</td>
                        <td>
                          {book ? (
                            <div>
                              <p style={{ fontWeight: '500' }}>{book.title}</p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ISBN: {book.isbn}</p>
                            </div>
                          ) : `Book #${order.bookId}`}
                        </td>
                        <td>
                          {member ? (
                            <div>
                              <p style={{ fontWeight: '500' }}>{member.name}</p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.email}</p>
                            </div>
                          ) : `Member #${order.memberId}`}
                        </td>
                        <td>{order.quantity}</td>
                        <td>{new Date(order.orderDate).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${order.status === 'PLACED' ? 'badge-success' : 'badge-error'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No book borrow transactions found in system history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast" style={{ borderLeftColor: t.type === 'success' ? 'var(--status-success)' : t.type === 'error' ? 'var(--status-error)' : t.type === 'warning' ? 'var(--status-warning)' : 'var(--color-primary)' }}>
            {t.type === 'success' && <CheckCircle style={{ color: 'var(--status-success)' }} size={20} />}
            {t.type === 'error' && <AlertCircle style={{ color: 'var(--status-error)' }} size={20} />}
            {t.type === 'warning' && <AlertCircle style={{ color: 'var(--status-warning)' }} size={20} />}
            {t.type === 'info' && <Activity style={{ color: 'var(--color-primary)' }} size={20} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
