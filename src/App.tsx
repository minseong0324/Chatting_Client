import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChattingPage from './Pages/ChattingPage/ChattingPage';

import './App.css'




function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    
      <Router>
        <Routes>
          <Route path="/" element={<ChattingPage />} />
          
        </Routes>
      </Router>
    </>
  )
}

export default App
