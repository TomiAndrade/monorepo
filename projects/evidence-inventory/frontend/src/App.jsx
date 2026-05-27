import { useState } from 'react'
import './App.css'
import ScannerForm from './components/ScannerForm'
import SummaryCards from './components/SummaryCards'
import FileTypeChart from './components/FileTypeChart'
import FileTypeTable from './components/FileTypeTable'

function App() {
  const [results, setResults] = useState(null)

  return (
    <div className="app">
      <h1 className="app-title">Inventario de Evidencia</h1>

      <ScannerForm onResults={setResults} />

      {results && (
        <>
          <SummaryCards results={results} />
          <FileTypeChart byExtension={results.byExtension} />
          <FileTypeTable byExtension={results.byExtension} />
        </>
      )}
    </div>
  )
}

export default App
