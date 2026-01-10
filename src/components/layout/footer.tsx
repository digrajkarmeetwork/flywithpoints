import Link from 'next/link';
import { Plane, Github, Twitter } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Search Flights', href: '/search' },
    { label: 'Sweet Spots', href: '/sweet-spots' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Plane className="h-8 w-8 text-blue-400 transform -rotate-45" />
              <span className="text-xl font-bold text-white">
                Fly<span className="text-blue-400">WithPoints</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs mb-4">
              Find the best award flight redemptions and maximize your travel rewards with AI-powered recommendations.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/digrajkarmeetwork/flywithpoints"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} FlyWithPoints. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Not affiliated with any airline or loyalty program. Award availability and pricing subject to change.
          </p>
        </div>
      </div>
    </footer>
  );
}
