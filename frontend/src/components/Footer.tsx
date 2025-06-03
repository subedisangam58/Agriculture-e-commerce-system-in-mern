import React from 'react'

function Footer() {
    return (
        <div className="bg-gray-800 text-white py-4 mt-10 position-fixed bottom-0 w-full">
            <div className="container mx-auto text-center">
                <p className="text-sm">© 2025 FreshMarket. All rights reserved.</p>
                <div className="flex justify-center space-x-4 mt-2">
                    <a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a>
                    <a href="/terms" className="text-gray-400 hover:text-white">Terms of Service</a>
                    <a href="/contact" className="text-gray-400 hover:text-white">Contact Us</a>
                </div>
            </div>
        </div>
    )
}

export default Footer
