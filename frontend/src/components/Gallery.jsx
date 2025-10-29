import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, X, ZoomIn, ZoomOut, Image as ImageIcon, Video } from 'lucide-react';
import axios from 'axios';

function Gallery({ onClose }) {
  const [activeTab, setActiveTab] = useState('images'); // 'images' or 'videos'
  const [photoshoots, setPhotoshoots] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    fetchPhotoshoots();
    fetchVideos();
  }, []);

  const fetchPhotoshoots = async () => {
    try {
      const response = await axios.get('/api/design/photoshoots');
      setPhotoshoots(response.data.photoshoots);
    } catch (error) {
      console.error('Error fetching photoshoots:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get('/api/video/list');
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this photoshoot?')) return;
    
    try {
      await axios.delete(`/api/design/photoshoots/${id}`);
      setPhotoshoots(photoshoots.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting photoshoot:', error);
      alert('Failed to delete photoshoot');
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await axios.delete(`/api/video/${id}`);
      setVideos(videos.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">My Gallery</h2>
            <p className="text-purple-100 text-sm mt-1">
              {photoshoots.length} images • {videos.length} videos
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('images')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'images'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              Images ({photoshoots.length})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'videos'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Video className="w-5 h-5" />
              Videos ({videos.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : activeTab === 'images' ? (
            // Images Tab
            photoshoots.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="bg-purple-100 p-4 rounded-full mb-4">
                  <ImageIcon className="w-12 h-12 text-purple-600" />
                </div>
                <div className="text-gray-400 text-lg mb-2">No images yet</div>
                <div className="text-gray-500 text-sm">Generate your first photoshoot to see it here!</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photoshoots.map((photoshoot) => (
                  <div
                    key={photoshoot.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div 
                      className="relative aspect-square cursor-pointer"
                      onClick={() => setSelectedImage(photoshoot.result_url)}
                    >
                      <img
                        src={photoshoot.result_url}
                        alt={photoshoot.garment_filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {photoshoot.garment_filename}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(photoshoot.created_at)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(photoshoot.id)}
                          className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Videos Tab
            videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Video className="w-12 h-12 text-blue-600" />
                </div>
                <div className="text-gray-400 text-lg mb-2">No videos yet</div>
                <div className="text-gray-500 text-sm">Generate your first video to see it here!</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div 
                      className="relative aspect-square cursor-pointer bg-black"
                      onClick={() => setSelectedVideo(video.video_url)}
                    >
                      <video
                        src={video.video_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                        <div className="bg-white/90 p-4 rounded-full">
                          <Video className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            Video {video.id}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(video.created_at)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Image Modal with Zoom */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-60 flex flex-col"
          onClick={() => {
            setSelectedImage(null);
            setZoom(100);
          }}
        >
          {/* Top Controls */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom(prev => Math.max(prev - 25, 50));
                }}
                disabled={zoom <= 50}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <ZoomOut className="w-5 h-5 text-white" />
              </button>
              <span className="text-white font-medium min-w-[60px] text-center">{zoom}%</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom(prev => Math.min(prev + 25, 200));
                }}
                disabled={zoom >= 200}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <ZoomIn className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom(100);
                }}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-white text-sm font-medium"
              >
                Reset
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedImage(null);
                setZoom(100);
              }}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Image Container */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={selectedImage}
              alt="Full size"
              className="rounded-lg transition-transform duration-300"
              style={{ 
                transform: `scale(${zoom / 100})`,
                maxWidth: zoom > 100 ? 'none' : '100%',
                maxHeight: zoom > 100 ? 'none' : '100%'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Bottom Hint */}
          <div className="p-4 text-center">
            <p className="text-white/60 text-sm">Click anywhere to close • Use zoom controls to adjust size</p>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/95 z-60 flex flex-col"
          onClick={() => setSelectedVideo(null)}
        >
          {/* Top Controls */}
          <div className="flex items-center justify-between p-4">
            <div className="text-white font-semibold">Video Playback</div>
            <button
              onClick={() => setSelectedVideo(null)}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Video Container */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            <video
              src={selectedVideo}
              controls
              autoPlay
              loop
              className="rounded-lg"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Bottom Hint */}
          <div className="p-4 text-center">
            <p className="text-white/60 text-sm">Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
