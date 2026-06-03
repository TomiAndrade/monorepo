import { useState, useEffect } from 'react'
import './App.css'
import ScannerForm from './components/ScannerForm'
import SummaryCards from './components/SummaryCards'
import FileTypeChart from './components/FileTypeChart'
import FileTypeTable from './components/FileTypeTable'
import QualityReport from './components/QualityReport'
import DownloadButtons from './components/DownloadButtons'

function App() {
  const [results, setResults] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const toggleTheme = () => setDarkMode((prev) => !prev)

  return (
    <div className="app">
      <div className="app-header">
        <h1 className="app-title">Inventario de Evidencia</h1>
        <button type="button" className="theme-toggle" onClick={toggleTheme}>
          {darkMode ? '☀️ Claro' : '🌙 Oscuro'}
        </button>
      </div>

      <ScannerForm onResults={setResults} />

      {results && (
        <>
          <SummaryCards results={results} />
          <DownloadButtons results={results} />
          <FileTypeChart byExtension={results.byExtension} />
          <QualityReport quality={results.quality} />
          <FileTypeTable byExtension={results.byExtension} />
        </>
      )}
    </div>
  )
}

export default App
