(function() {
  function attachStream(video, stream) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }

    video.src = stream;
  }

  window.initVideoPlayer = function(options) {
    var video = document.getElementById(options.videoId);
    var layer = document.getElementById(options.layerId);
    var button = document.getElementById(options.buttonId);

    if (!video || !layer || !button) {
      return;
    }

    function start() {
      if (!video.getAttribute("data-ready")) {
        attachStream(video, options.stream);
        video.setAttribute("data-ready", "1");
      }

      layer.classList.add("is-hidden");
      video.controls = true;

      var playTask = video.play();
      if (playTask && playTask.catch) {
        playTask.catch(function() {});
      }
    }

    layer.addEventListener("click", start);
    button.addEventListener("click", function(event) {
      event.stopPropagation();
      start();
    });
    video.addEventListener("click", function() {
      if (video.paused) {
        start();
      }
    });
  };
})();
