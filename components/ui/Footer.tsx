"use client"
import React from 'react'
import Image from 'next/image'
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Heart,
  Shield,
  Zap,
  Globe
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Features', href: '/#features' },
      { name: 'Pricing', href: '/pricing' },
      // { name: 'API', href: '/api' },
      // { name: 'Status', href: '/status' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      // { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    // support: [
    //   { name: 'Help Center', href: '/help' },
    //   { name: 'Documentation', href: '/docs' },
    //   { name: 'Status Page', href: '/status' },
    //   { name: 'Support', href: '/support' },
    // ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      // { name: 'GDPR', href: '/gdpr' },
    ],
  }

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com', icon: Github },
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
    { name: 'Email', href: 'mailto:hello@uptyne.com', icon: Mail },
  ]

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <Image 
                  src="/logo.png" 
                  alt="Uptyne Logo" 
                  width={40} 
                  height={40} 
                  className="mr-2"
                />
                <span className="text-xl font-bold text-gray-900">Uptyne</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                Monitor your websites and get instant alerts when they go down. 
                Professional uptime monitoring for modern businesses.
              </p>
              {/* <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div> */}
            </div>

            {/* Product Links */}
            {/* <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}

            {/* Company Links */}
            {/* <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}

            {/* Support Links */}
            {/* <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}

            {/* Legal Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-blue-500 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Instant Alerts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span>Global Monitoring</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              © {currentYear} Uptyne. All rights reserved.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-xs text-gray-500">
              Made with <Heart className="inline h-3 w-3 text-red-500" /> for reliable web monitoring
            </p>
            <p className="text-xs text-gray-500">
              Uptyne is not affiliated with any third-party services mentioned.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 