import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import PostList from './pages/PostList'
import EditorPage from './pages/Editor'

function AppHeader() {
  const location = useLocation()
  const isEditor = location.pathname === '/new' || location.pathname.startsWith('/edit/')

  return (
    <header className="app-header">
      <h1>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          Post Composer
        </Link>
      </h1>
      <nav>
        <Link to="/" className={`btn btn-sm ${!isEditor ? 'btn-primary' : ''}`}>
          Posts
        </Link>
        <Link to="/new" className={`btn btn-sm ${isEditor ? 'btn-primary' : ''}`}>
          New Post
        </Link>
      </nav>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app-layout">
          <AppHeader />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<PostList />} />
              <Route path="/new" element={<EditorPage />} />
              <Route path="/edit/:filename" element={<EditorPage />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}
