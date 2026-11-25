# Submission recording studio

Local-only tooling for a100-second captioned, silent demo. It uses the actual Heist simulator and Three.js renderer in Chrome, driven by the saved ordinary-control integration route. The video explicitly identifies scripted controls, edited time cuts and separate classic ML evidence. It is not footage of a human playing or a substitute for human enjoyment tests.

Run from the project directory:

```sh
node scripts/export-heist-demo.mjs
node scripts/submission-studio.mjs
```

Open http://127.0.0.1:4174 and choose Record100-second demo. Keep that tab visible until saved. The tool captures only its own canvas; no microphone, desktop or account access is requested. Actual saved chart PNGs and the genuine Experiment001 PyCharm audit screenshot appear in evidence chapters. There is no generated game footage or fake IDE usage.

The loopback server accepts same-origin uploads only and writes fixed output filenames in the parent outputs directory: echo-squad-demo.mp4 or .webm, plus a JSON capture manifest. It never publishes to YouTube. Input hash, source commit, rule version, actual result, capture frames, duration and format are saved in the manifest. Review the produced video before upload. The regular public game does not load this tool or its scripted controller.
