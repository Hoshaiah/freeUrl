export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
      <div className="text-center">
        {/* Animated logo/spinner */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>

        {/* Loading text */}
        <h2 className="text-2xl font-semibold text-indigo-900 mb-2">
          Loading...
        </h2>
        <p className="text-indigo-600">
          Please wait while we prepare your experience
        </p>
      </div>
    </div>
  )
}
