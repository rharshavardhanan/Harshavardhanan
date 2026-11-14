Mood films: one short AI-generated film per project, made in Flow (Veo).
The site finds them by name while it builds; nothing else needs changing.

  mood-<name>.mp4     the film (1280x720, H.264, with its own sound)
  poster-<name>.avif  a still from it, shown until the film plays

  <name>: odovox, aftermeet, robot (Sequential Conformal Prediction), road,
          kattral, cache, halluc (Hallucination Detection)

A project without a film uses its particle recording instead
(public/media/case-<slug>.mp4 and cover-<slug>.avif).

To add one from a raw file in videos/ (the raw files are not committed):
  ffmpeg -i videos/RAW.mp4 -vf scale=1280:-2 -c:v libx264 -crf 26 -preset slow \
    -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k public/media/mood/mood-NAME.mp4
  ffmpeg -ss 3 -i videos/RAW.mp4 -frames:v 1 -vf scale=1280:-2 /tmp/p.png
  magick /tmp/p.png -quality 55 public/media/mood/poster-NAME.avif
(Pick the poster's second, -ss, by eye: odovox 6.5, halluc 4.5.)

If a raw film has a black border baked in, find it with
  ffmpeg -i videos/RAW.mp4 -vf cropdetect=limit=24 -an -f null -
and crop a 16:9 window inside it before scaling, clear of any rounded corners.
The halluc film had 22px down each side and ~30px rounded corners:
  -vf "crop=1200:675:40:22,scale=1280:720:flags=lanczos"
