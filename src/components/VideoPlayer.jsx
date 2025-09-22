const VideoPlayer = ({ videoId }) => {
  if (!videoId) {
    return null;
  }

  return (
    <div className="video-wrapper">
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="Random YouTube Video"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
