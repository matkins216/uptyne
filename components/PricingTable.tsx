
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
        <div className="w-full max-w-xl mx-auto py-20">
            <h2 className="text-3xl font-bold text-center mb-8">Pricing</h2>
            <stripe-pricing-table
                pricing-table-id="prctbl_1RqznNGR7vUgYi5gQnlQ3CMd"
          publishable-key="pk_live_51Rg7OWGR7vUgYi5g1Xr7DKODcvf2csynWN6y4B2MdehvKt8LXkZ0HQuI7GwprFn7QalHRJuDQbkbz3lVzbyPF5hr00dK7fEERZ"
                client-reference-id="124567"
                className=''
            />
        </div>
    );
};
export default PricingTable;