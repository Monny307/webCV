import { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
  showNavbar?: boolean
  showFooter?: boolean
}

export default function Layout({ children, showNavbar = true, showFooter = true }: LayoutProps) {
  return (
    <>
      {showNavbar && <Navbar />}
      <main className="main-content">
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  )
}
