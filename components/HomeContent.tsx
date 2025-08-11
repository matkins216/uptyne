import Link from 'next/link'
import { CheckCircle, Shield, Zap, BarChart3, Clock, AlertTriangle } from 'lucide-react'

export function HomeContent() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Professional Website Monitoring & Uptime Tracking
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Monitor your websites, APIs, and online services with enterprise-grade uptime tracking. 
            Get instant alerts when your sites go down and comprehensive performance insights to ensure 
            your digital presence stays reliable 24/7.
          </p>
        </div>

        {/* Key Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Real-Time Monitoring
            </h3>
            <p className="text-gray-600">
              Continuous website monitoring with 99.9% uptime guarantee. Detect issues before they affect your users.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Instant Alerts
            </h3>
            <p className="text-gray-600">
              Get notified immediately via email, SMS, or webhook when your websites experience downtime.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Performance Analytics
            </h3>
            <p className="text-gray-600">
              Detailed response time tracking and performance metrics to optimize your website speed.
            </p>
          </div>
        </div>

        {/* Why Choose Uptyne Section */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Choose Uptyne for Website Monitoring?
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Enterprise-Grade Reliability
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">99.9% monitoring uptime guarantee</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Global monitoring locations worldwide</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Advanced SSL certificate monitoring</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Comprehensive Coverage
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">HTTP/HTTPS endpoint monitoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Port and ping monitoring</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">Keyword and content monitoring</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Industry Statistics */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Website Downtime Costs Businesses Billions
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">$5,600</div>
              <p className="text-gray-600">Average cost per minute of downtime</p>
            </div>
            <div className="p-6 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
              <p className="text-gray-600">Industry standard uptime requirement</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <p className="text-gray-600">Continuous monitoring coverage</p>
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="prose prose-lg max-w-none text-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Professional Website Monitoring Solutions for Modern Businesses
          </h3>
          
          <p className="text-lg leading-relaxed mb-6">
            In today's digital-first economy, website uptime monitoring is not just a technical requirement—it's a business necessity. 
            Every minute your website is down can result in lost revenue, damaged reputation, and frustrated customers. 
            Uptyne provides enterprise-grade website monitoring services that help businesses maintain 99.9% uptime and 
            deliver exceptional user experiences.
          </p>

          <h4 className="text-xl font-semibold text-gray-900 mb-4 mt-8">
            Advanced Uptime Monitoring Features
          </h4>
          
          <p className="mb-4">
            Our comprehensive website monitoring platform includes real-time uptime tracking, performance monitoring, 
            and instant alerting systems. Monitor HTTP/HTTPS endpoints, check SSL certificate validity, track response times, 
            and receive immediate notifications when issues arise.
          </p>

          <h4 className="text-xl font-semibold text-gray-900 mb-4 mt-8">
            Global Monitoring Network
          </h4>
          
          <p className="mb-4">
            With monitoring servers located across multiple continents, Uptyne provides accurate, real-time insights into 
            how your websites perform for users worldwide. Our distributed monitoring network ensures you catch regional 
            issues before they impact your global customer base.
          </p>

          <h4 className="text-xl font-semibold text-gray-900 mb-4 mt-8">
            Professional Alerting & Escalation
          </h4>
          
          <p className="mb-4">
            Configure custom alert thresholds and escalation procedures to ensure critical issues are addressed immediately. 
            Support multiple notification channels including email, SMS, Slack, and webhook integrations for seamless 
            incident response workflows.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Start Monitoring Your Websites Today
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust Uptyne for reliable website monitoring and uptime tracking. 
            Get started in minutes with our easy setup process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/blog"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
} 