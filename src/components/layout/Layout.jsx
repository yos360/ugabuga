import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'

export default function Layout({ children }) {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
