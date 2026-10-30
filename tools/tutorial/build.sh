#!/bin/sh
# usage: build.sh <outdir>  — joins title(3s) + recording + end(5s) + synthesized music (LUFS -18) -> tutorial.mp4
set -e
HERE=$(cd "$(dirname "$0")" && pwd); D=$1; cd "$D"
TRIM=$(node -e "console.log(JSON.parse(require('fs').readFileSync('meta.json')).trim)"); TOTAL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('meta.json')).total)")
DUR=$(node -e "console.log(($TOTAL+8).toFixed(2))")
VF="scale=1920:1080,fps=30,format=yuv420p,setsar=1"
ffmpeg -y -loglevel error -loop 1 -t 3 -i title.png -vf "$VF,fade=in:0:10,fade=out:st=2.6:d=0.4" -c:v libx264 -crf 20 title.mp4
ffmpeg -y -loglevel error -loop 1 -t 5 -i end.png -vf "$VF,fade=in:0:10" -c:v libx264 -crf 20 end.mp4
ffmpeg -y -loglevel error -ss "$TRIM" -t "$TOTAL" -i rec.webm -vf "$VF" -c:v libx264 -crf 20 -preset medium rec.mp4
printf "file title.mp4\nfile rec.mp4\nfile end.mp4\n" > list.txt
ffmpeg -y -loglevel error -f concat -i list.txt -c copy video.mp4
node "$HERE/music.mjs" music.wav "$(node -e "console.log(Math.ceil($DUR)+1)")"
ffmpeg -y -loglevel error -i music.wav -af loudnorm=I=-18:TP=-2:LRA=7 -ar 48000 music18.wav
ffmpeg -y -loglevel error -i video.mp4 -i music18.wav -map 0:v -map 1:a -c:v libx264 -crf 22 -preset medium -pix_fmt yuv420p -r 30 -c:a aac -b:a 128k -t "$DUR" -movflags +faststart tutorial.mp4
ffmpeg -nostats -i tutorial.mp4 -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | head -2 || true
ffprobe -v error -show_entries format=duration,size -of default=nw=1 tutorial.mp4
