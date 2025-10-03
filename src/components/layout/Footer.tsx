import React from 'react';
import { useNavigate } from 'react-router-dom';

interface FooterProps {
  variant?: 'default' | 'minimal';
}

export const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const navigate = useNavigate();

  if (variant === 'minimal') {
    return (
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            © 2024 Behavioral Learning Platform. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }

  const footerLinks = [
    {
      title: 'Learning',
      links: [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Quizzes & Games', href: '/gamification' },
        { name: 'Study Sessions', href: '/sessions' },
        { name: 'Progress Tracking', href: '/progress' }
      ]
    },
    {
      title: 'Communication',
      links: [
        { name: 'Messages', href: '/chat' },
        { name: 'Find Tutors', href: '/tutors' },
        { name: 'Community', href: '/community' },
        { name: 'Parent Portal', href: '/parent-portal' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Safety Guidelines', href: '/safety' },
        { name: 'Report Issues', href: '/report' }
      ]
    },
    {
      title: 'Account',
      links: [
        { name: 'Profile Settings', href: '/profile' },
        { name: 'Subscription', href: '/subscription' },
        { name: 'Privacy Settings', href: '/privacy' },
        { name: 'Data Export', href: '/data-export' }
      ]
    }
  ];

  const socialLinks = [
    {
      name: 'Twitter',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      )
    },
    {
      name: 'Facebook',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm4.95 5.05a3 3 0 01.95 2.2v5.5a3 3 0 01-3 3h-5.5a3 3 0 01-2.2-.95A3 3 0 014.3 12.75v-5.5a3 3 0 01.95-2.2A3 3 0 017.25 4.3h5.5a3 3 0 012.2.95zM10 7a3 3 0 100 6 3 3 0 000-6zm4-1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'YouTube',
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zM8.082 14.207L7.5 13.707V6.293l.582-.5L14.707 10 8.082 14.207z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">BL</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Behavioral Learning</h3>
                <p className="text-sm text-gray-600">Platform</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Empowering students through personalized learning, gamification, and AI-powered behavioral insights.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => navigate(link.href)}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
              <span>© 2024 Behavioral Learning Platform. All rights reserved.</span>
              <div className="flex space-x-6">
                <button
                  onClick={() => navigate('/privacy')}
                  className="hover:text-gray-900 transition-colors"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => navigate('/terms')}
                  className="hover:text-gray-900 transition-colors"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => navigate('/cookies')}
                  className="hover:text-gray-900 transition-colors"
                >
                  Cookie Policy
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>All systems operational</span>
              </div>
              <div className="text-xs text-gray-500">
                Version 1.0.0
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Child Safety Verified</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
              <span>PCI DSS Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};