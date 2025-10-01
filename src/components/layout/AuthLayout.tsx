import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  backgroundVariant?: 'gradient' | 'pattern' | 'solid';
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showLogo = true,
  backgroundVariant = 'gradient'
}) => {
  const getBackgroundClasses = () => {
    switch (backgroundVariant) {
      case 'pattern':
        return 'bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200';
      case 'solid':
        return 'bg-gradient-to-br from-blue-200 via-green-200 to-yellow-200';
      default:
        return 'bg-gradient-to-br from-pink-200 via-yellow-200 to-blue-200';
    }
  };

  return (
    <div className={`min-h-screen flex ${getBackgroundClasses()} relative overflow-hidden`}>
      {/* Fun Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" fill="none">
          {/* Floating stars */}
          <g className="text-yellow-500">
            <circle cx="100" cy="100" r="4" fill="currentColor" />
            <circle cx="300" cy="150" r="3" fill="currentColor" />
            <circle cx="500" cy="80" r="5" fill="currentColor" />
            <circle cx="800" cy="120" r="4" fill="currentColor" />
            <circle cx="1000" cy="180" r="3" fill="currentColor" />
            <circle cx="200" cy="300" r="4" fill="currentColor" />
            <circle cx="600" cy="250" r="5" fill="currentColor" />
            <circle cx="900" cy="350" r="3" fill="currentColor" />
            <circle cx="150" cy="500" r="4" fill="currentColor" />
            <circle cx="450" cy="450" r="3" fill="currentColor" />
            <circle cx="750" cy="520" r="5" fill="currentColor" />
            <circle cx="1100" cy="480" r="4" fill="currentColor" />
            <circle cx="350" cy="650" r="3" fill="currentColor" />
            <circle cx="650" cy="700" r="4" fill="currentColor" />
            <circle cx="950" cy="680" r="5" fill="currentColor" />
          </g>
          {/* Fun shapes */}
          <g className="text-pink-500">
            <rect x="80" y="250" width="15" height="15" rx="3" fill="currentColor" transform="rotate(45 87.5 257.5)" />
            <rect x="280" y="350" width="12" height="12" rx="2" fill="currentColor" transform="rotate(30 286 356)" />
            <rect x="480" y="300" width="18" height="18" rx="4" fill="currentColor" transform="rotate(60 489 309)" />
            <rect x="680" y="150" width="14" height="14" rx="3" fill="currentColor" transform="rotate(15 687 157)" />
            <rect x="880" y="550" width="16" height="16" rx="3" fill="currentColor" transform="rotate(75 888 558)" />
          </g>
          {/* Playful triangles */}
          <g className="text-green-500">
            <polygon points="120,400 135,375 150,400" fill="currentColor" />
            <polygon points="320,200 335,175 350,200" fill="currentColor" />
            <polygon points="720,400 735,375 750,400" fill="currentColor" />
            <polygon points="920,250 935,225 950,250" fill="currentColor" />
            <polygon points="420,600 435,575 450,600" fill="currentColor" />
          </g>
          {/* Cute clouds */}
          <g className="text-blue-400">
            <ellipse cx="180" cy="180" rx="25" ry="15" fill="currentColor" opacity="0.6" />
            <ellipse cx="165" cy="175" rx="15" ry="10" fill="currentColor" opacity="0.6" />
            <ellipse cx="195" cy="175" rx="18" ry="12" fill="currentColor" opacity="0.6" />

            <ellipse cx="580" cy="380" rx="30" ry="18" fill="currentColor" opacity="0.6" />
            <ellipse cx="560" cy="375" rx="18" ry="12" fill="currentColor" opacity="0.6" />
            <ellipse cx="600" cy="375" rx="20" ry="14" fill="currentColor" opacity="0.6" />

            <ellipse cx="1080" cy="280" rx="28" ry="16" fill="currentColor" opacity="0.6" />
            <ellipse cx="1060" cy="275" rx="16" ry="11" fill="currentColor" opacity="0.6" />
            <ellipse cx="1100" cy="275" rx="19" ry="13" fill="currentColor" opacity="0.6" />
          </g>
        </svg>
      </div>

      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          {showLogo && (
            <div className="mb-8">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🎮</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">Fun Learning</div>
                  <div className="text-sm text-orange-500">Adventure</div>
                </div>
              </Link>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          <div>
            {children}
          </div>

          {/* Trust Indicators */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-purple-600">🌟 Loved by kids everywhere! 🌟</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Super Safe</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Kid Approved</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
                <span>Parent Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Hero/Visual */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400">
        
          {/* Content */}
          <div className="relative flex flex-col justify-center h-full px-12">
            <div className="max-w-md">
              <div className="mb-8">
                <div className="inline-flex items-center space-x-2 text-white mb-4">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold">🌈</span>
                  </div>
                  <span className="font-semibold">Fun Learning Adventure</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  Let's Make Learning Fun! 🎉
                </h1>
                <p className="text-xl text-blue-100 mb-8">
                  Join thousands of kids who are having a blast while learning awesome new things!
                </p>
              </div>

              {/* Feature highlights */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Cool adventures just for you! 🚀</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Fun games and exciting challenges! 🎮</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Chat with awesome teachers anytime! 💬</span>
                </div>
                <div className="flex items-center space-x-3 text-white">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Watch yourself become a learning superhero! 🦸</span>
                </div>
              </div>

              {/* Statistics */}
              <div className="mt-12 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">👋 10,000+</div>
                  <div className="text-sm text-blue-200">Happy Kids Learning</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">🎆 95%</div>
                  <div className="text-sm text-blue-200">Kids Love It</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">🌟 500+</div>
                  <div className="text-sm text-blue-200">Awesome Teachers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Fun Decorative elements */}
          <div className="absolute top-10 right-10 w-16 h-16 bg-yellow-300 bg-opacity-20 rounded-full"></div>
          <div className="absolute top-32 right-24 w-8 h-8 bg-pink-300 bg-opacity-30 rounded-full"></div>
          <div className="absolute bottom-20 left-10 w-20 h-20 bg-cyan-300 bg-opacity-20 rounded-full"></div>
          <div className="absolute bottom-40 left-32 w-12 h-12 bg-green-300 bg-opacity-25 rounded-full"></div>
          <div className="absolute top-1/2 right-5 w-6 h-6 bg-purple-300 bg-opacity-40 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};