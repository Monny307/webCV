import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section footer-about">
            <div className="footer-logo">
              <Image 
                src="/ahchip.png" 
                alt="AhhChip Logo" 
                width={480} 
                height={160}
                quality={100}
                style={{ width: 'auto', height: '40px' }}
              />
            </div>
            <p>AhhChip uses AI-powered CV matching to connect job seekers with their perfect opportunities.</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#cv">CV</a></li>
              <li><a href="#jobs">Browse Jobs</a></li>
              <li><a href="#my-jobs">My Applications</a></li>
              <li><a href="#profile">Profile</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Resources</h3>
            <ul className="footer-links">
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/resume-tips">Resume Tips</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Support</h3>
            <ul className="footer-links">
              <li><Link href="/contact-us">Contact Us</Link></li>
              <li><a href="mailto:support@ahhchip.com">support@ahhchip.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <Link href="/terms-of-service">Terms and Conditions</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </div>
          <div className="footer-bottom-center">
            <p>&copy; 2024 AhhChip. All rights reserved.</p>
          </div>
          <div className="footer-bottom-right">
            <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
