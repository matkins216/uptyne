
"use client"
import { useEffect } from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'pricing-table-id': string;
        'publishable-key': string;
        'client-reference-id': string;
      }, HTMLElement>;
    }
  }
}



const PricingTable = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/pricing-table.js';
        script.async = true;

        // Add script to document
        document.body.appendChild(script);

        // Cleanup function
        return () => {
            document.body.removeChild(script);
        };
    }, []); // Empty dependency array means this runs once on mount

 

    return (
        <div className="w-full max-w-6xl mx-auto">
            <stripe-pricing-table
                pricing-table-id="prctbl_1RqznNGR7vUgYi5gQnlQ3CMd"
                publishable-key="pk_test_51Rg7OWGR7vUgYi5gVCk4GTVYNyqCl8FuCKo0pIloxEZmfoc5CZ0PNZ2SnVRNuJ2esS7qPjn6ZAebqKk4MkG4cqih00MSa5BXAx"
                client-reference-id="124567"
            />
        </div>
    );
};
export default PricingTable;