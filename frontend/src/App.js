import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from './components/Header';
import AppFooter from './components/Footer';
import NotFound from './page/NotFound';
import ClassNotes from './page/ClassNotes';
import './App.css';
function App() {
  return (
    <Router>
      <Layout>
        <AppHeader />
        <Routes>
          <Route path='/' element={<NotFound />} />
          <Route path='/class-notes' element={<ClassNotes />} />
        </Routes>
        <AppFooter />
      </Layout>
    </Router>
  );
}

export default App;
