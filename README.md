<div align="center">
   <img alt="Class Notes Logo" width="60" src="https://higheredlab.com/wp-content/uploads/hel_icon.png">
</div>
<h1 align="center">Class Notes</h1>
<p align="center">Class Notes transcribes online classes with subtitles, summaries, topics and sentiments, enabling students, facing poor internet or language barrier, learn better at their own pace.</p>

<br />

<p align="center">
<a href="https://github.com/manishkatyan/class-notes/actions/workflows/eslint.yml/badge.svg">
<img src="https://github.com/manishkatyan/class-notes/actions/workflows/eslint.yml/badge.svg" alt="EsLint" />
</a>
</p>

### [View Demo](https://higheredlab.com/wp-content/uploads/Class_Notes_Demo.gif)

<br>

## Class Notes, powered by AssemblyAI, for BigBlueButton

[BigBlueButton](https://bigbluebutton.org/) is the most-popular open-source software for online classes. It is like-Zoom to conduct online classes but at a 40% lower cost, with better analytics, whiteboard, chat, poll, and, the best part, is white-labelled.

[AssemblyAI](https://www.assemblyai.com/) You can automatically convert audio and video files and live audio streams to text with AssemblyAI's Speech-to-Text APIs. You can do more with Audio Intelligence - summarization, content moderation, topic detection, and more. Powered by cutting-edge AI models.

### How it works?

After an online class ends, the BigBlueButton server processes the recording and makes it available for students to refer later.

The Class Notes plugin is triggered as soon as BigBlueButton completes its processing of the recording and converts the recording into MP4 format. It also strips off audio of the MP4 recording using `ffmpeg` and sends it to AssemblyAI to transcriot and provide information such as summary, topics and sentiment analysis. Class Notes displays that information along with MP4 video the class, enhacned with siubtitles, in a nice, easy-to-use UI.

Class Notes also lists out topics of discussion and provide easy navigation to jump off to the section of the class where that topic was discussed.

## ✨ Features

Class Notes provides you automated notes of the online classes that you can easily refer to, at your own pace, to improve your comprehension. Specifically:

- **MP4 Video with Subtiles.** View the class recording in MP4 format, along with subtitles, which, unlike BigBlueButton recording, plays smoothly in any browser on a laptop or a mobile device.
- **Transcription.** Below the video, you can read the full transcription of the class, annotated with corresponding time.
- **Summary.** Interested in just skimming through the lecture? Just go through the crisp summary of the class in a few bullet points.
- **Topics.** Want to learn more about specific topic? View the list of key topics discussed during the class and click on a topic to jump to the corresponding section of the lecture.
- **Sentiments.** Lastly, get a sense of the tone of the lecturer - postitive, neutraul or negative, with which specific part of the lecture was delivered.

<br/>

## 🖐 Requirements

The requirements to Setup Class Notes.

1. BigBlueButton Server.
2. bbb-mp4 installed.

<br/>

## ⏳ Installation

### Backend

```bash
cd backend
mkdir -p /etc/bigbluebutton/nginx
cp -r class_notes.nginx /etc/bigbluebutton/nginx/class_notes.nginx
nginx -t
service nginx reload

```

<br />

Setup post publish script

```bash
cp -r class_notes.rb class_notes_config.yml /usr/local/bigbluebutton/core/scripts/post_publish/
```

<br />

update the config file

```bash
vi /usr/local/bigbluebutton/core/scripts/post_publish/class_notes_config.yml
```

get the api key from https://www.assemblyai.com and update `assembly_ai_api_key` variable in class_notes_config.yml

If you set the `trigger_mode: "metadata"` in config file you need to pass `meta_class_notes_enabled=true` in meeting create call

<br/>

### Frontend

```bash
cd frontend
```

<br/>

Update the config file

```bash
vi  src/utils/config.js
```

<br />

Build the frontend

```bash
npm install
npm run build
```

<br/>

Copy the build files to /var/bigbluebutton/class-notes

```bash
mkdir -p /var/bigbluebutton/class-notes
cp -r build/* /var/bigbluebutton/class-notes

```

<br/>

## 📝 License

[MIT License](LICENSE.md)

Copyright © 2022 [HigherEdLab.com](https://higheredlab.com/)
