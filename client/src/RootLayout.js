import React from 'react'
import { Outlet } from 'react-router-dom';
import './RootLayout.css'

function RootLayout() {
    return (
        <div className='root-layout '>
        <div style={{minHeight:"100vh" }}>
            <div className=" main-content ">

                <Outlet/>

            </div>
        </div>
        
        {/* <Footer/> */}
    </div>
      );
}

export default RootLayout

// src/RootLayout.js
// import React, { useContext } from 'react';
// import { Outlet } from 'react-router-dom';
// import Header from './components/header/Header';
// import LanguageContext from './LanguageContext';
// import './RootLayout.css';

// const RootLayout = () => {
//   const { language, setLanguage } = useContext(LanguageContext);
  
//   const handleLanguageChange = (e) => {
//     setLanguage(e.target.value);
//   };

//   return (
//     <div className="root-layout">
//       <Header />
//       <div className="language-selector">
//         <select value={language} onChange={handleLanguageChange}>
//           <option value="English">English</option>
//           <option value="Spanish">Spanish</option>
//           {/* Add other languages as needed */}
//         </select>
//       </div>
//       <main>
//         <Outlet />
//       </main>
//     </div>
//   );
// };

// export default RootLayout;