import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Play, X, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'
import Sidebar from '../components/Layout/Sidebar'
import { mockVideos } from '../utils/mockvideos'


function Clips() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredVideos, setFilteredVideos] = useState(mockVideos)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const filtered = mockVideos.filter(video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.channel.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredVideos(filtered)
  }, [searchTerm])

  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 bg-gray-50 overflow-hidden ml-20 md:ml-40 flex flex-col">
          
          {/* Header Section */}
          <div className="px-4 sm:px-6 md:px-10 py-4 sm:py-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-center text-blue-800 drop-shadow-md">
              Educational Videos
            </h1>
            
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for educational videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 border border-blue-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow text-sm sm:text-base"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Video Grid */}
          <div className="px-4 sm:px-6 md:px-10 pb-6 overflow-y-auto flex-1">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto"
              layout
            >
              <AnimatePresence>
                {filteredVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative h-64 mb-4">
                      {/* Video Container */}
                      <div 
                        className="w-full h-full bg-white rounded-xl relative overflow-hidden transition-all duration-300 group-hover:shadow-lg shadow-md border border-gray-200"
                      >
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${video.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                        
                        {/* Thumbnail */}
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-fill transition-opacity duration-300"
                          onError={(e) => {
                            console.log(`Failed to load thumbnail for: ${video.title}`)
                            e.target.src = `https://via.placeholder.com/640x360/374151/ffffff?text=${encodeURIComponent(video.title.substring(0, 20) + '...')}`
                          }}
                          onLoad={(e) => {
                            e.target.style.opacity = '1'
                          }}
                          loading="lazy"
                          style={{ opacity: 0 }}
                        />
                        
                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-blue-600/90 backdrop-blur-sm rounded-full p-4 border border-blue-500/50 shadow-lg"
                          >
                            <Play className="text-white" size={32} fill="white" />
                          </motion.div>
                        </div>
                        
                        {/* Duration Badge */}
                        <div className="absolute bottom-3 right-3 bg-gray-900/80 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="text-center">
                      <h3 className="text-gray-800 font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{video.channel}</p>
                      <p className="text-gray-500 text-xs">{video.views} views</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredVideos.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-gray-600 text-xl">No videos found</div>
                <div className="text-gray-500 text-sm mt-2">Try adjusting your search terms</div>
              </motion.div>
            )}
          </div>

          {/* Floating Video Player Modal */}
          <AnimatePresence>
            {selectedVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedVideo(null)}
              >
                {/* Blurred Background */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-lg"></div>
                
                {/* Video Player Container */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl ${
                    isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl aspect-video'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Video Player */}
                  <iframe
                    src={`${selectedVideo.videoUrl}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&rel=0&modestbranding=1`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={selectedVideo.title}
                    referrerPolicy="strict-origin-when-cross-origin"
                  ></iframe>
                  
                  {/* Player Controls */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="bg-blue-600/80 hover:bg-blue-700/90 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="bg-blue-600/80 hover:bg-blue-700/90 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
                    >
                      {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                    <button
                      onClick={() => setSelectedVideo(null)}
                      className="bg-red-600/80 hover:bg-red-700/90 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  {/* Video Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                    <h2 className="text-white text-xl font-bold mb-2">{selectedVideo.title}</h2>
                    <div className="flex items-center justify-between text-white/80">
                      <span>{selectedVideo.channel}</span>
                      <span>{selectedVideo.views} views</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  )
}

export default Clips