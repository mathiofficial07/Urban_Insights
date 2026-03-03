import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Import images
import heroImage1 from '../assets/pexels-arifulhb-3680457.jpg';
import heroImage2 from '../assets/pexels-dave-romain-927855-2780774.jpg';
import heroImage3 from '../assets/pexels-evgeniy-grozev-814830.jpg';
import communityImage from '../assets/pexels-maxavans-5057597.jpg';
import infrastructureImage from '../assets/pexels-nhavan-34241774.jpg';
import technologyImage from '../assets/pexels-pixabay-459225.jpg';
import safetyImage from '../assets/pexels-pixabay-46169.jpg';
import analyticsImage from '../assets/pexels-trace-707047.jpg';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Hero slideshow images with descriptions
  const heroImages = [
    {
      src: heroImage1,
      title: "Smart City Infrastructure",
      description: "Advanced urban planning meets cutting-edge technology",
      relevance: "Showcases modern city development that Urban Insights helps optimize"
    },
    {
      src: heroImage2,
      title: "Connected Communities",
      description: "Building better neighborhoods through data-driven insights",
      relevance: "Represents the community focus of our platform for collective problem-solving"
    },
    {
      src: heroImage3,
      title: "Innovative Urban Solutions",
      description: "Transforming city management with AI-powered analytics",
      relevance: "Demonstrates the technological innovation behind Urban Insights' predictive capabilities"
    },
    {
      src: communityImage,
      title: "Community Engagement",
      description: "Empowering citizens to participate in local governance",
      relevance: "Highlights the collaborative approach to urban issue resolution"
    },
    {
      src: infrastructureImage,
      title: "Modern Infrastructure",
      description: "Smart city systems for sustainable urban development",
      relevance: "Showcases the infrastructure management capabilities of our platform"
    },
    {
      src: technologyImage,
      title: "Digital Transformation",
      description: "Leveraging technology for efficient public services",
      relevance: "Represents the technological foundation of Urban Insights"
    },
    {
      src: safetyImage,
      title: "Public Safety",
      description: "Creating safer communities through proactive monitoring",
      relevance: "Emphasizes the safety and security aspects of our platform"
    },
    {
      src: analyticsImage,
      title: "Data-Driven Governance",
      description: "Using analytics to make informed urban decisions",
      relevance: "Demonstrates the power of data in modern city management"
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds (1 second transition + 4 second display)

    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'About', href: '#about' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Navigation */}
      <nav className={`bg-white transition-all duration-300 sticky top-0 z-50 ${isScrolled ? 'shadow-lg shadow-blue-100/50' : 'shadow-sm'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPinIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Urban Insights
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform"></span>
                </a>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:border-blue-300 transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-base font-medium border border-gray-300 hover:border-blue-300 transition-all text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-base font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
            )}
          </div>
        </nav>

        {/* Enhanced Hero Section with Background Slideshow */}
        <section className="relative h-screen overflow-hidden">
          {/* Background Slideshow */}
          <div className="absolute inset-0">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60"></div>
              </div>
            ))}
          </div>

          {/* Slideshow Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>

          {/* Current Image Description */}
          <div className="absolute bottom-16 left-8 right-8 text-center z-20">
            <div className="max-w-4xl mx-auto bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-2">
                {heroImages[currentImageIndex].title}
              </h3>
              <p className="text-lg text-white/90 mb-2">
                {heroImages[currentImageIndex].description}
              </p>
              <p className="text-sm text-white/80 italic">
                {heroImages[currentImageIndex].relevance}
              </p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-20 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium text-white/90 border border-white/20 shadow-lg">
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Powered by Advanced AI & Machine Learning
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="block text-white drop-shadow-lg">Community Issue</span>
                <span className="block bg-gradient-to-r from-cyan-200 to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
                  Prediction & Resolution
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl md:text-2xl lg:text-3xl text-white/90 max-w-4xl mx-auto leading-relaxed drop-shadow">
                Harness the power of AI to identify, predict, and resolve community issues
                <span className="block font-semibold text-white drop-shadow">faster than ever before</span>
              </p>
            </div>

            {/* CTA Buttons - Separate container for better control */}
            <div className="mt-8 text-center">
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  to="/register" 
                  className="group relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl backdrop-blur-sm min-w-[160px]"
                >
                  Get Started Now
                </Link>
                <a 
                  href="#how-it-works" 
                  className="group border-2 border-white/30 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm min-w-[160px]"
                >
                  <span className="flex items-center justify-center">
                    Learn More
                    <ChevronDownIcon className="h-5 w-5 ml-2 group-hover:translate-y-1 transition-transform" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

      {/* Stats Section  */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Communities Worldwide
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform delivers measurable results that transform urban management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="text-5xl font-bold text-blue-600 mb-3">95%</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">Accuracy Rate</div>
              <div className="text-gray-600">AI-powered predictions you can trust</div>
            </div>
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="text-5xl font-bold text-green-600 mb-3">24/7</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">Monitoring</div>
              <div className="text-gray-600">Round-the-clock community oversight</div>
            </div>
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="text-5xl font-bold text-purple-600 mb-3">10K+</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">Issues Resolved</div>
              <div className="text-gray-600">Making communities safer every day</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage and resolve community issues effectively
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MagnifyingGlassIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Classification</h3>
              <p className="text-gray-600">
                AI-powered categorization of complaints using Natural Language Processing and Naive Bayes algorithms
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPinIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hotspot Detection</h3>
              <p className="text-gray-600">
                K-Means clustering identifies geographic areas with high concentration of similar issues
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Risk Prediction</h3>
              <p className="text-gray-600">
                Random Forest models predict severity levels to prioritize critical issues
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 pb-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple four-step process to transform community feedback into actionable insights
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Complaint</h3>
              <p className="text-gray-600 text-sm">
                Citizens report issues through our user-friendly interface
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Processing</h3>
              <p className="text-gray-600 text-sm">
                ML algorithms analyze and classify the complaint automatically
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pattern Detection</h3>
              <p className="text-gray-600 text-sm">
                System identifies hotspots and predicts potential escalations
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Resolution</h3>
              <p className="text-gray-600 text-sm">
                Authorities prioritize and resolve issues based on AI insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Urban Insights</h3>
              <p className="text-gray-400">
                Transforming communities through AI-powered issue resolution
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li className="cursor-not-allowed">Pricing</li>
                <li className="cursor-not-allowed">Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition">About</a></li>
                <li>Contact</li>
                <li className="cursor-not-allowed">Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <UserGroupIcon className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Urban Insights. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
