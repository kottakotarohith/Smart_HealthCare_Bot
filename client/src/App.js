import React from 'react';
import './App.css';
import { createBrowserRouter , RouterProvider } from 'react-router-dom';

import RootLayout from './RootLayout';

function App() {

  const router = createBrowserRouter([
    {
      path:'',
      element: <RootLayout/>,
      children:[

      ]
    }
  ])

  return (
   <div>

   </div>
  );
}

export default App;
