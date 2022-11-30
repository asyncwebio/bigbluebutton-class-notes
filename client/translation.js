let meetingId,
  translationEnabled,
  sourceLanguage,
  recorder,
  isRecording,
  assymblySocket,
  timer;

let isAddTranscriptionToNotedEnabled = false;

const padAPIToken =
  "NbjYGryqHjX7HX360uC9zXpstpgnwq0ECgJqDDysaO1VwaBhHBK82rKRmplN1";

const socket = io("https://tts.higheredlab.com");
let padId;

socket.on("TRANSLATED", (data) => {
  if (data[sourceLanguage]) {
    setText(data);
  }
});

function getPadId() {
  const url = document.querySelector('[title="pad"]').src;
  const padURL = new URL(url);
  const padId = padURL.searchParams.get("padName");
  return padId;
}

function addTextToNotes(text) {
  try {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      padID: getPadId(),
      text: text,
      apikey: padAPIToken,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "https://bbb01.quiklrn.net/pad/api/1.2.15/appendText",
      requestOptions
    );
  } catch (error) {}
}

function addScriptTag() {
  var head = document.getElementsByTagName("head")[0];
  var script = document.createElement("script");
  script.src = "https://www.WebRTC-Experiment.com/RecordRTC.js";
  ("https://www.WebRTC-Experiment.com/RecordRTC.js");
  head.appendChild(script);
}

async function getToken() {
  const res = await fetch("https://tts.higheredlab.com/translator/v1/token");
  const { token } = await res.json();
  return token;
}

function isPresentorListner() {
  let targetNode = document.querySelector(
    'section[aria-label="Actions bar"] > div > div:nth-child(2)'
  );
  const config = { childList: true };
  const observer = new MutationObserver(async () => {
    let isPrersentor = document.querySelector(
      'button[aria-label="Share your screen"]'
    );
    // If presentor and no socket connection to assymbly ai then start the assymbky ai connection
    if (isPrersentor && !assymblySocket) {
      console.log("isPrersentor");
      run();
    }

    if (!isPrersentor && assymblySocket) {
      console.log("End Not Presentor");
      if (assymblySocket) {
        assymblySocket.send(JSON.stringify({ terminate_session: true }));
        assymblySocket.close();
        assymblySocket = null;
      }

      if (recorder) {
        recorder.pauseRecording();
        recorder = null;
      }
    }
  });
  observer.observe(targetNode, config);
}

const run = async () => {
  try {
    if (assymblySocket) {
      assymblySocket.send(JSON.stringify({ terminate_session: true }));
      assymblySocket.close();
      assymblySocket = null;
    }

    if (recorder) {
      recorder.pauseRecording();
      recorder = null;
    }
  } catch (error) {
    console.log(error);
  }

  const tmpToken = await getToken();
  assymblySocket = new WebSocket(
    `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${tmpToken}`
  );
  // handle incoming messages to display transcription to the DOM
  assymblySocket.onmessage = (message) => {
    const res = JSON.parse(message.data);

    if (res.message_type == "FinalTranscript" && res?.text) {
      socket.emit("TRANSCRIPTION", {
        sourceLang: sourceLanguage,
        transcription: res.text,
        meetingId,
      });

      if (isAddTranscriptionToNotedEnabled) {
        addTextToNotes(res.text);
      }
    }
  };

  assymblySocket.onerror = (event) => {
    console.log("Error Event:", JSON.stringify(event));
    assymblySocket.close();
  };

  assymblySocket.onclose = (event) => {
    console.log("Close Event: ", JSON.stringify(event));
    assymblySocket = null;
    console.log("Restarting the Assymbly AI socket");
    run();
  };

  assymblySocket.onopen = () => {
    // once socket is open, begin recording
    console.log("Socket Opened");
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        recorder = new RecordRTC(stream, {
          type: "audio",
          mimeType: "audio/webm;codecs=pcm", // endpoint requires 16bit PCM audio
          recorderType: StereoAudioRecorder,
          timeSlice: 250, // set 250 ms intervals of data that sends to AAI
          desiredSampRate: 16000,
          numberOfAudioChannels: 1, // real-time requires only one channel
          bufferSize: 4096,
          audioBitsPerSecond: 128000,
          ondataavailable: (blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64data = reader.result;

              // audio data must be sent as a base64 encoded string
              if (assymblySocket) {
                assymblySocket.send(
                  JSON.stringify({
                    audio_data: base64data.split("base64,")[1],
                  })
                );
              }
            };
            reader.readAsDataURL(blob);
          },
        });

        recorder.startRecording();
      })
      .catch((err) => console.error(err));
  };

  isRecording = !isRecording;
};

const checkElement = async (selector) => {
  while (document.querySelector(selector) === null) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return true;
};

const setData = async () => {
  const currentURL = new URL(window.location.href);
  const sessionToken = currentURL.searchParams.get("sessionToken");
  const url = `${currentURL.origin}/bigbluebutton/api/enter?sessionToken=${sessionToken}`;
  const res = await fetch(url, { method: "GET" });
  const { response } = await res.json();
  meetingId = response.externMeetingID;
  response.metadata.forEach((meta) => {
    if (Boolean(meta["translation-enabled"])) {
      translationEnabled = true;
    }
    if (meta["translation-source-language"]) {
      sourceLanguage = meta["translation-source-language"].trim();
    }
  });
};

const btnClick = (elm) => {
  document.getElementById("cc-text").innerText = "";
  document.querySelectorAll('button[class="lan-btn"]').forEach((elm) => {
    elm.style.background = "#ccc";
    elm.style.color = "#333";
  });

  sourceLanguage = elm.innerText.trim();

  socket.close();
  socket.connect();
  socket.emit("CREATE_CHANNEL", `${meetingId}`);
  elm.style.background = "#0F70D7";
  elm.style.color = "white";
};

const setText = (data) => {
  try {
    const elm = document.getElementById("cc-text");
    if (timer) {
      clearTimeout(timer);
    }

    const texts = elm.innerText;
    elm.innerText = texts + data[sourceLanguage].text;
    elm.scrollIntoView(false);
    // elm.scrollTop = elm.scrollHeight;

    // start the timer
    timer = setTimeout(() => {
      elm.innerHTML = "";
    }, 15000);
  } catch (error) {
    console.error(error);
  }
};

async function main() {
  const elm = await checkElement("#layout");
  await setData();
  addScriptTag();
  try {
    if (elm && translationEnabled) {
      const root = document.querySelector('section[aria-label="Actions bar"]');
      const menu = document.createElement("div");
      menu.innerHTML = `    
    
        <button id="floating-menu"><svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM14.8055 18.4151C17.1228 17.4003 18.7847 15.1667 18.9806 12.525C18.1577 12.9738 17.12 13.3418 15.9371 13.598C15.7882 15.4676 15.3827 17.1371 14.8055 18.4151ZM9.1945 5.58487C7.24725 6.43766 5.76275 8.15106 5.22208 10.244C5.4537 10.4638 5.84813 10.7341 6.44832 11.0008C6.89715 11.2003 7.42053 11.3798 8.00537 11.5297C8.05853 9.20582 8.50349 7.11489 9.1945 5.58487ZM10.1006 13.9108C10.2573 15.3675 10.5852 16.6202 10.9992 17.5517C11.2932 18.2133 11.5916 18.6248 11.8218 18.8439C11.9037 18.9219 11.9629 18.9634 12 18.9848C12.0371 18.9634 12.0963 18.9219 12.1782 18.8439C12.4084 18.6248 12.7068 18.2133 13.0008 17.5517C13.4148 16.6202 13.7427 15.3675 13.8994 13.9108C13.2871 13.9692 12.6516 14 12 14C11.3484 14 10.7129 13.9692 10.1006 13.9108ZM8.06286 13.598C8.21176 15.4676 8.61729 17.1371 9.1945 18.4151C6.8772 17.4003 5.21525 15.1666 5.01939 12.525C5.84231 12.9738 6.88001 13.3418 8.06286 13.598ZM13.9997 11.8896C13.369 11.9609 12.6993 12 12 12C11.3008 12 10.631 11.9609 10.0003 11.8896C10.0135 9.66408 10.4229 7.74504 10.9992 6.44832C11.2932 5.78673 11.5916 5.37516 11.8218 5.15605C11.9037 5.07812 11.9629 5.03659 12 5.01516C12.0371 5.03659 12.0963 5.07812 12.1782 5.15605C12.4084 5.37516 12.7068 5.78673 13.0008 6.44832C13.5771 7.74504 13.9865 9.66408 13.9997 11.8896ZM15.9946 11.5297C15.9415 9.20582 15.4965 7.11489 14.8055 5.58487C16.7528 6.43766 18.2373 8.15107 18.7779 10.244C18.5463 10.4638 18.1519 10.7341 17.5517 11.0008C17.1029 11.2003 16.5795 11.3798 15.9946 11.5297Z"
    fill="currentColor"
  />
</svg></button>
        <div id="cc-container" style="display: none">
            <div>
                <button class="lan-btn" id="default-btn" style="background: #0F70D7; color:white;" onclick="btnClick(this)">${sourceLanguage}</button>
            </div>
            <div id="cc-area" class="cc-area-style">
                <span id="cc-text"></span>
            </div>
        </div>

`;
      menu.className = "floating-menu";
      root.appendChild(menu);

      if (document.querySelector('button[aria-label="Share your screen"]')) {
        await run();
      }
      isPresentorListner();

      document.getElementById("floating-menu").onclick = () => {
        const defaultbtn = document.getElementById("default-btn");
        try {
          if (
            document.querySelector('[aria-label="Shared Notes"]') &&
            !document.querySelector('[title="pad"]')
          ) {
            isAddTranscriptionToNotedEnabled = true;
            document.querySelector('div[aria-label="Shared Notes"]').click();
          }
        } catch (error) {
          console.log(error);
        }
        btnClick(defaultbtn);
        const isHidden =
          document.getElementById("cc-container").style.display == "none";
        document.getElementById("cc-container").style.display = isHidden
          ? "flex"
          : "none";
      };
    } else {
      console.log("Unable to add translation widget");
    }
  } catch (error) {
    console.log("Unable to add translation widget");
    console.error(error);
  }
}
main();
