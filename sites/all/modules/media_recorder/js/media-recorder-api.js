/**
 * @file
 * Adds an interface between the media recorder jQuery plugin and the drupal media module.
 */

(function($) {
  'use strict';

  Drupal.behaviors.mediaRecorder = {
    attach: function(context, settings) {
      $('.field-widget-media-recorder').once().each(function (key, element) {

        // Hide all file field related elements.
        $(element).find('span.file, span.file-size, .media-recorder-upload, .media-recorder-upload-button, .media-recorder-remove-button').hide();

        // Declare DOM elements.
        var $element = $(element);
        var $audioConstraintButton = $element.find('.media-recorder-enable-audio');
        var $videoConstraintButton = $element.find('.media-recorder-enable-video');
        var $previewWrapper = $element.find('.media-recorder-preview');
        var $statusWrapper = $element.find('.media-recorder-status');
        var $controlsWrapper = $element.find('.media-recorder-controls');
        var $recordButton = $element.find('.media-recorder-record');
        var $stopButton = $element.find('.media-recorder-stop');

        // Click handler for enable audio button.
        $audioConstraintButton.bind('click', function (event) {
          event.preventDefault();
          $audioConstraintButton.addClass('active');
          $videoConstraintButton.removeClass('active');
          startStream({
            audio: true,
            video: false
          });
        });

        // Click handler for enable video button.
        $videoConstraintButton.bind('click', function (event) {
          event.preventDefault();
          $audioConstraintButton.removeClass('active');
          $videoConstraintButton.addClass('active');
          startStream({
            audio: true,
            video: true
          });
        });

        // Click handler for record button.
        $recordButton.bind('click', function (event) {
          event.preventDefault();
          Drupal.mediaRecorder.record();
        });

        // Click handler for stop button.
        $stopButton.bind('click', function (event) {
          event.preventDefault();
          Drupal.mediaRecorder.stop();
        });

        // Listen for the record event.
        $(Drupal.mediaRecorder).bind('recordStart', function (event, data) {
          $recordButton.hide();
          $stopButton.show();

          $(Drupal.mediaRecorder).trigger('status', 'Recording 00:00');

          var currentSeconds = 0;
          Drupal.mediaRecorder.statusInterval = setInterval(function () {
            currentSeconds = currentSeconds + 1;
            var currentMilliSeconds = new Date(currentSeconds * 1000);
            var time = millisecondsToTime(currentMilliSeconds);
            function millisecondsToTime(milliSeconds) {
              var milliSecondsDate = new Date(milliSeconds);
              var mm = milliSecondsDate.getMinutes();
              var ss = milliSecondsDate.getSeconds();
              if (mm < 10) {
                mm = "0" + mm;
              }
              if (ss < 10) {
                ss = "0" + ss;
              }
              return mm + ':' + ss;
            }
            $(Drupal.mediaRecorder).trigger('status', 'Recording ' + time);
          }, 1000);
        });

        // Listen for the stop event.
        $(Drupal.mediaRecorder).bind('recordStop', function (event, data) {
          $recordButton.show();
          $stopButton.hide();
          clearInterval(Drupal.mediaRecorder.statusInterval);
          $(Drupal.mediaRecorder).trigger('status', 'Press record to start recording.');

          // Append file object data.
          $element.find('.media-recorder-fid').val(data.fid);
          $element.find('.media-recorder-refresh').trigger('mousedown');
        });

        $(Drupal.mediaRecorder).bind('status', function (event, msg) {
          $statusWrapper.text(msg);
        });

        // Initial state.
        $previewWrapper.hide();
        $controlsWrapper.hide();
        $(Drupal.mediaRecorder).trigger('status', 'Select audio or video to begin recording.');

        /**
         * Start user media stream.
         */
        function startStream (constraints) {
          if (Drupal.mediaRecorder.stream) {
            stopStream();
          }
          navigator.getUserMedia(constraints,
            function(stream) {
              Drupal.mediaRecorder.stream = stream;
              Drupal.mediaRecorder.format = constraints.video ? 'webm' : 'ogg';
              Drupal.mediaRecorder.mimetype = constraints.video ? 'video/webm' : 'audio/ogg';
              Drupal.mediaRecorder.audioContext = new AudioContext();
              Drupal.mediaRecorder.analyser = Drupal.mediaRecorder.audioContext.createAnalyser();
              Drupal.mediaRecorder.microphone = Drupal.mediaRecorder.audioContext.createMediaStreamSource(stream);
              Drupal.mediaRecorder.analyser.smoothingTimeConstant = 0.75;
              Drupal.mediaRecorder.analyser.fftSize = 512;

              $previewWrapper.show();
              $controlsWrapper.show();
              $stopButton.hide();

              $(Drupal.mediaRecorder).trigger('status', 'Press record to start recording.');

              if (constraints.video) {
                var video = $('<video muted autoplay src="' + URL.createObjectURL(Drupal.mediaRecorder.stream) + '"></video>');
                var volumeMeter = $(createVolumeMeter());
                video.appendTo($previewWrapper).height($previewWrapper.height());
                volumeMeter.appendTo($previewWrapper).height($previewWrapper.height());
                video[0].play();
                $previewWrapper.addClass('video').removeClass('audio');
              } else {
                var audioVisualizer = $(createAudioVisualizer());
                audioVisualizer.appendTo($previewWrapper).height($previewWrapper.height());
                $previewWrapper.addClass('audio').removeClass('video');
              }
            },
            function(error) {
            }
          );
        }

        /**
         * Stop user media stream.
         */
        function stopStream () {
          Drupal.mediaRecorder.analyser.disconnect();
          Drupal.mediaRecorder.microphone.disconnect();
          Drupal.mediaRecorder.stream.stop();
          $previewWrapper.text('');
          $previewWrapper.hide();
        }

        /**
         * Create volume meter canvas element that uses getUserMedia stream.
         */
        function createVolumeMeter () {
          var canvas = document.createElement('canvas');
          var canvasContext = canvas.getContext("2d");

          Drupal.mediaRecorder.meterProcessor = Drupal.mediaRecorder.audioContext.createScriptProcessor(2048, 1, 1);
          Drupal.mediaRecorder.microphone.connect(Drupal.mediaRecorder.analyser);
          Drupal.mediaRecorder.analyser.connect(Drupal.mediaRecorder.meterProcessor);
          Drupal.mediaRecorder.meterProcessor.connect(Drupal.mediaRecorder.audioContext.destination);

          Drupal.mediaRecorder.meterProcessor.onaudioprocess = function() {
            var freqData = new Uint8Array(Drupal.mediaRecorder.analyser.frequencyBinCount);
            Drupal.mediaRecorder.analyser.getByteFrequencyData(freqData);
            var level = Math.max.apply(Math, freqData);
            canvasContext.clearRect(0, 0, canvas.width, canvas.clientHeight);
            canvasContext.fillStyle = '#00ff00';
            canvasContext.fillRect(0, canvas.height - (canvas.height * (level / 255)), canvas.width, canvas.height * (level / 255));
          };

          canvas.className = 'media-recorder-meter';

          return canvas;
        }

        /**
         * Create audio visualizer canvas element that uses getUserMedia stream.
         */
        function createAudioVisualizer () {
          var canvas = document.createElement('canvas');
          var canvasContext = canvas.getContext("2d");
          var micStatus = false;

          if (!Drupal.mediaRecorder.audioContext || !Drupal.mediaRecorder.microphone || !Drupal.mediaRecorder.analyser) {
            var textWidth, textString = 'Audio visualizer unable to initialize';

            canvasContext.font = 'bold 1em Arial';
            canvasContext.fillStyle = '#ffffff';
            textWidth = canvasContext.measureText(textString).width;
            canvasContext.fillText(textString, (canvas.width / 2) - (textWidth / 2), canvas.height / 2);

            return canvas;
          }

          Drupal.mediaRecorder.visualizerProcessor = Drupal.mediaRecorder.audioContext.createScriptProcessor(2048, 1, 1);
          Drupal.mediaRecorder.microphone.connect(Drupal.mediaRecorder.analyser);
          Drupal.mediaRecorder.analyser.connect(Drupal.mediaRecorder.visualizerProcessor);
          Drupal.mediaRecorder.visualizerProcessor.connect(Drupal.mediaRecorder.audioContext.destination);

          Drupal.mediaRecorder.visualizerProcessor.onaudioprocess = function() {
            var freqData = new Uint8Array(Drupal.mediaRecorder.analyser.frequencyBinCount);
            Drupal.mediaRecorder.analyser.getByteFrequencyData(freqData);
            var volume = getVolume();

            if (volume === 0) {
              micStatus = false;
              $(Drupal.mediaRecorder).trigger('status', 'Your mic has a problem. Check your browser or computer audio settings.');
            } else if (volume && !micStatus) {
              micStatus = true;
              $(Drupal.mediaRecorder).trigger('status', 'Press record to start recording.');
            }

            var barWidth = Math.ceil(canvas.width / (Drupal.mediaRecorder.analyser.frequencyBinCount * 0.5));
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < Drupal.mediaRecorder.analyser.frequencyBinCount; i++) {
              canvasContext.fillStyle = 'hsl(' + i / Drupal.mediaRecorder.analyser.frequencyBinCount * 360 + ', 100%, 50%)';
              if ((barWidth * i) + barWidth < canvas.width) {
                canvasContext.fillRect(barWidth * i, canvas.height, barWidth - 1, -(Math.floor((freqData[i] / 255) * canvas.height) + 1));
              }
            }

            // Private function for determining current volume.
            function getVolume() {
              var values = 0;
              var length = freqData.length;
              for (var i = 0; i < length; i++) {
                values += freqData[i];
              }
              return values / length;
            }
          };

          canvas.className = 'media-recorder-visualizer';

          return canvas;
        }
      });

      /**
       * Start recording and trigger recording event.
       */
      Drupal.mediaRecorder.record = function () {

        // Create a new MediaRecorder.
        Drupal.mediaRecorder.recorder = new MediaRecorder(Drupal.mediaRecorder.stream);
        Drupal.mediaRecorder.recorder.ondataavailable = function (e) {
          var blob = new Blob([e.data], {
            type: e.data.type || Drupal.mediaRecorder.mimetype
          });
          Drupal.mediaRecorder.sendBlob(blob);
        };

        // Notify server that a recording stream has started.
        $.ajax({
          url: Drupal.mediaRecorder.origin + Drupal.settings.basePath + 'media_recorder/record/stream/start',
          type: 'POST',
          data: {
            format: Drupal.mediaRecorder.format
          },
          success: function (data, textStatus, jqXHR) {
            Drupal.mediaRecorder.recorder.start(2000);
            $(Drupal.mediaRecorder).trigger('recordStart');
          }
        });
      };

      /**
       * Stop recording and trigger stopped event.
       */
      Drupal.mediaRecorder.stop = function () {
        Drupal.mediaRecorder.recorder.stop();

        // Notify server that a recording stream has stopped.
        $.ajax({
          url: Drupal.mediaRecorder.origin + Drupal.settings.basePath + 'media_recorder/record/stream/finish',
          type: 'POST',
          data: {},
          success: function (data, textStatus, jqXHR) {
            $(Drupal.mediaRecorder).trigger('recordStop', data);
          }
        });
       };

      Drupal.mediaRecorder.sendBlob = function (blob) {
        var formData = new FormData();
        formData.append("mediaRecorder", blob);
        var req = new XMLHttpRequest();
        req.open('POST', Drupal.mediaRecorder.origin + Drupal.settings.basePath + 'media_recorder/record/stream/record', true);
        req.send(formData);
      };
    },
  };
})(jQuery);
