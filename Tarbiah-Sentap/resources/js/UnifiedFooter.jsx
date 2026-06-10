import React from 'react';

const UnifiedFooter = () => {
  return (
    <footer className="bg-[#121212] text-white py-12 px-8 md:px-16 lg:px-24" data-purpose="main-footer">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(150%) skewX(-25deg); }
        }

        .shimmer-container {
          position: relative;
          overflow: hidden;
          display: inline-block;
        }

        .shimmer-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 4s infinite linear;
          pointer-events: none;
        }

        .social-icon-circle {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background-color: #c5a059;
          color: #121212;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .social-icon-circle:hover {
          background-color: #d4b784;
          color: #000000;
          transform: scale(1.15);
          box-shadow: 0 0 15px rgba(197, 160, 89, 0.4);
        }

        .link-underline-reveal {
          position: relative;
          text-decoration: none;
        }
        .link-underline-reveal::after {
          content: '';
          position: absolute;
          width: 0;
          height: 1px;
          bottom: -2px;
          left: 0;
          background-color: #c5a059;
          transition: width 0.3s ease-in-out;
        }
        .link-underline-reveal:hover::after {
          width: 100%;
        }
      `}} />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Spacer for Left side to balance centered logo */}
        <div aria-hidden="true" className="hidden md:block w-1/4"></div>
        
        {/* BEGIN: Center Brand Section */}
        <div className="flex flex-col items-center justify-center w-full md:w-1/2" data-purpose="brand-identity">
          {/* Logo Image with Metallic Shimmer */}
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-2 border-[#D4AF37] overflow-hidden mb-4 mx-auto shimmer-container">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1XK8ugUWz0dleaVxmbfXHDlhjE7sIc_98N_IBeCooiB4IDjgy-LSc_Z-ey5CkIwsAwuFNBk4BpV0TytgBFAZbzRwZYiXOYMyPO_UVbFTnVxZiRixkbgHCnZScYbk0vTQQ1UumaeBrCyzvdD1coDm2-QdiVWnrAjn82enkIcwJ6ureGXH6fRnKzmvrsLlPf2BusxHVzrmXB3zUoMjW7uzdF-midZBKt8mAKAGeNHz_sKaGp18onXUEgth6XrgCw8lynPbhT0Y5Vzs" alt="Tarbiah Sentap Logo" className="h-16 w-16 object-contain" />
            <div className="shimmer-overlay"></div>
          </div>
        </div>
        {/* END: Center Brand Section */}
        
        {/* BEGIN: Right Social Media Section */}
        <div className="w-full md:w-1/4 flex flex-col items-center md:items-end gap-3" data-purpose="social-media-links">
          <h3 className="text-white font-serif font-semibold text-sm uppercase tracking-wider">Social Media</h3>
          <div className="flex items-center gap-3">
            {/* Instagram */}
            <a className="social-icon-circle w-10 h-10 rounded-full flex items-center justify-center" href="#" title="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
            </a>
            {/* Facebook */}
            <a className="social-icon-circle w-10 h-10 rounded-full flex items-center justify-center" href="#" title="Facebook">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
            </a>
            {/* Twitter / X */}
            <a className="social-icon-circle w-10 h-10 rounded-full flex items-center justify-center" href="#" title="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
            </a>
            {/* TikTok */}
            <a className="social-icon-circle w-10 h-10 rounded-full flex items-center justify-center" href="#" title="TikTok">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31 0 2.591.214 3.75.606V5.32c-1.027-.308-2.112-.473-3.235-.473V15.5c0 2.209-1.791 4-4 4s-4-1.791-4-4 1.791-4 4-4c.404 0 .794.06 1.161.172v-4.88c-.378-.053-.765-.081-1.161-.081-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9V7.632c1.554 1.13 3.468 1.8 5.545 1.8v-4.4c-2.485 0-4.5-2.015-4.5-4.5V0h-4.565z"></path></svg>
            </a>
            {/* YouTube */}
            <a className="social-icon-circle w-10 h-10 rounded-full flex items-center justify-center" href="#" title="YouTube">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg>
            </a>
          </div>
        </div>
        {/* END: Right Social Media Section */}
      </div>
      
      {/* BEGIN: Legal / Copyright */}
      <div className="mt-12 pt-8 border-t border-white/10 text-center" data-purpose="footer-bottom">
        <p className="text-white/40 text-xs font-serif tracking-widest uppercase mb-0 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-0">
          <span>© 2023 The Manuscript Sanctuary. All Rights Reserved.</span>
          <span className="hidden md:inline mx-2">|</span>
          <div>
            <a className="link-underline-reveal hover:text-[#c5a059] transition-colors duration-300" href="#">Privacy Policy</a>
            <span className="mx-2">|</span>
            <a className="link-underline-reveal hover:text-[#c5a059] transition-colors duration-300" href="#">Terms of Service</a>
          </div>
        </p>
      </div>
      {/* END: Legal / Copyright */}
    </footer>
  );
};

export default UnifiedFooter;
