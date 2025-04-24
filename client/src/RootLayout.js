import React from 'react'
import { Outlet } from 'react-router-dom';
import './RootLayout.css'
// import Header from './components/header/Header'
// import Footer from './components/footer/Footer';

function RootLayout() {
    return (
        <div className='root-layout '>
        {/* <Header/> */}
        <div style={{minHeight:"100vh" , paddingTop:"45px"}}>
            <div className=" main-content ">

                <Outlet/>

            </div>
        </div>
        
        {/* <Footer/> */}
    </div>
      );
}

export default RootLayout