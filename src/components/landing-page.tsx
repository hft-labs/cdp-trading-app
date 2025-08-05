"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Shield, Wallet, Zap, BarChart3, Github, ExternalLink, Diamond } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Diamond className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Basecoin</span>
              <div className="text-xs text-gray-400 -mt-1">BYOC</div>
            </div>

          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#demo" className="text-gray-400 hover:text-white transition-colors">
              Demo
            </a>
            <a
              href="https://github.com"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">Sign In</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Build Your Own <span className="text-blue-500">Coinbase</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 leading-relaxed">
            A fully open-source, self-custodial crypto exchange built entirely with Coinbase Developer Platform. Trade,
            swap, and manage your assets — all while maintaining complete control of your keys.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3">
              Try the Demo
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
            >
              <Github className="mr-2 w-4 h-4" />
              View Source Code
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Self-Custodial
            </span>
            <span>•</span>
            <span>Built on Base</span>
            <span>•</span>
            <span>Powered by CDP</span>
            <span>•</span>
            <span>100% Open Source</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Composable Finance, Reimagined</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Built with modular CDP primitives, Basecoin demonstrates how to create a full-featured exchange using open,
            composable building blocks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Embedded Wallets</h3>
              <p className="text-sm text-gray-400">
                Seamless user custody and key management without browser extensions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Fiat Onramp</h3>
              <p className="text-sm text-gray-400">Easy fiat-to-crypto funding with integrated payment processing</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Swap API</h3>
              <p className="text-sm text-gray-400">Lightning-fast asset trading with optimal routing and pricing</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Analytics & Data</h3>
              <p className="text-sm text-gray-400">Real-time balances, charts, and insights via SQL API</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Demo CTA Section */}
      <section id="demo" className="bg-gradient-to-r from-blue-600 to-blue-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Build Your Own Exchange?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience the power of composable finance. Try our live demo running on Base, then fork the code to build
            your own.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
              <Shield className="mr-2 w-4 h-4" />
              Sign In & Trade
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 bg-transparent"
            >
              <ExternalLink className="mr-2 w-4 h-4" />
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">100%</div>
            <div className="text-gray-400">Open Source</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">Self</div>
            <div className="text-gray-400">Custodial</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">Base</div>
            <div className="text-gray-400">Powered</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <Diamond className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-white">Basecoin</span>
                <span className="text-gray-500 ml-2">by Coinbase Developer Platform</span>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-white transition-colors">
                GitHub
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Discord
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Twitter
              </a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>Built with ❤️ using Coinbase Developer Platform • Fork it, build it, make it yours</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
