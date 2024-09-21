"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Zap, ChevronDown } from "lucide-react"
import * as THREE from "three"
import Link from "next/link"

export function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Set up scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    // Create Earth
    const earthRadius = 8
    const geometry = new THREE.SphereGeometry(earthRadius, 64, 64)
    const texture = new THREE.TextureLoader().load("/assets/2k_earth_daymap.jpg")
    const material = new THREE.MeshPhongMaterial({ map: texture })
    const earth = new THREE.Mesh(geometry, material)
    scene.add(earth)

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)

    camera.position.z = 20

    // Create networking connections
    const connectionsMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true })
    const connectionsGroup = new THREE.Group()
    scene.add(connectionsGroup)

    function createConnection() {
      const startPoint = new THREE.Vector3().setFromSpherical(
        new THREE.Spherical(earthRadius, Math.random() * Math.PI, Math.random() * Math.PI * 2)
      )
      const endPoint = new THREE.Vector3().setFromSpherical(
        new THREE.Spherical(earthRadius, Math.random() * Math.PI, Math.random() * Math.PI * 2)
      )
      
      const midPoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5)
      midPoint.normalize().multiplyScalar(earthRadius * 1.5)

      const curve = new THREE.QuadraticBezierCurve3(startPoint, midPoint, endPoint)
      
      const points = curve.getPoints(50)
      const curveGeometry = new THREE.BufferGeometry().setFromPoints(points)
      const curveObject = new THREE.Line(curveGeometry, connectionsMaterial)
      
      return curveObject
    }

    // Add initial connections
    for (let i = 0; i < 20; i++) {
      connectionsGroup.add(createConnection())
    }

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)
      earth.rotation.y += 0.002
      connectionsGroup.rotation.y += 0.001

      // Randomly add/remove connections
      if (Math.random() < 0.03) {
        if (connectionsGroup.children.length > 15) {
          connectionsGroup.remove(connectionsGroup.children[0])
        }
        connectionsGroup.add(createConnection())
      }

      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      renderer.dispose()
    }
  }, [])

  const scrollToContent = () => {
    const contentElement = document.getElementById("main-content")
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white font-sans">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center justify-between min-h-screen">
        <header className="w-full max-w-6xl mx-auto text-center pt-16 px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Make Your Connection Private with FHE
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Secure, Anonymous, and Decentralized VPN powered by Fully Homomorphic Encryption
          </p>
          <Button className="text-lg px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-300 transform hover:scale-105" onClick={() => alert("Download started!")}>
            Download Extension
          </Button>
          <button onClick={scrollToContent} className="block mx-auto mt-16 animate-bounce">
            <ChevronDown className="w-8 h-8" />
            <span className="sr-only">Scroll to content</span>
          </button>
        </header>

        <main id="main-content" className="w-full max-w-6xl mx-auto my-16 px-4">
          <section className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-gray-800 p-6 rounded-lg">
              <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-semibold mb-2">Unparalleled Privacy</h2>
              <p className="text-gray-300">Our VPN uses Fully Homomorphic Encryption to ensure your data remains private even from us.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <Lock className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-semibold mb-2">Smart Contract Payments</h2>
              <p className="text-gray-300">Pay for your VPN service securely and anonymously using blockchain technology.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <Zap className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-semibold mb-2">Lightning Fast</h2>
              <p className="text-gray-300">Experience high-speed connections without compromising on security or privacy.</p>
            </div>
          </section>

          <section className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-4">What is Fully Homomorphic Encryption (FHE)?</h2>
            <p className="text-xl text-gray-300 mb-8">
              FHE allows computations to be performed on encrypted data without decrypting it first. This means your data remains secure and private at all times, even while it&apos;s being processed.
            </p>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-2">Built on Fhenix Network</h3>
              <p className="text-gray-300">
                Our VPN leverages the power of the Fhenix network, a cutting-edge blockchain platform that supports Fully Homomorphic Encryption, ensuring unparalleled privacy and security for all your online activities.
              </p>
            </div>
          </section>

          <section className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">1. Download and Install</h3>
                <p className="text-gray-300 mb-4">Get our browser extension or desktop app with a single click. The installation process is quick and straightforward.</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">2. Connect to FHE Network</h3>
                <p className="text-gray-300 mb-4">With a single tap, connect to our global network of FHE-powered servers. Your connection is now fully encrypted and private.</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">3. Browse Securely</h3>
                <p className="text-gray-300 mb-4">Enjoy complete privacy and security as you browse. Your data is encrypted end-to-end, protecting you from prying eyes.</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">4. Pay with Smart Contracts</h3>
                <p className="text-gray-300 mb-4">Use cryptocurrency and smart contracts for seamless, anonymous payments. No need for traditional payment methods that can be traced.</p>
              </div>
            </div>
          </section>

          <section className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to Take Control of Your Privacy?</h2>
            <Button className="text-lg px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-300 transform hover:scale-105" onClick={() => alert("Download started!")}>
              Download Now
            </Button>
            <p className="mt-4 text-gray-300">Available for Windows, macOS, iOS, and Android</p>
          </section>
        </main>

        <footer className="w-full max-w-6xl mx-auto text-center pb-8 px-4">
          <div className="flex justify-center items-center space-x-8 mb-8">
            <img src="/assets/Fhenix-logo-white.svg" alt="Partner Logo" className="h-12" />
            <img src="/assets/Fhenix-logo-white.svg" alt="Partner Logo" className="h-12" />
            <img src="/assets/Fhenix-logo-white.svg" alt="Partner Logo" className="h-12" />
          </div>
          <nav className="mb-4">
            <ul className="flex justify-center space-x-4">
              <li><Link href="#" className="hover:text-green-500 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-green-500 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-green-500 transition-colors">Support</Link></li>
              <li><Link href="#" className="hover:text-green-500 transition-colors">Careers</Link></li>
            </ul>
          </nav>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} FHE VPN. All rights reserved. | <Link href="#" className="hover:underline">Privacy Policy</Link> | <Link href="#" className="hover:underline">Terms of Service</Link>
          </p>
        </footer>
      </div>
    </div>
  )
}