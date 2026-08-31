import { onMounted, onUnmounted, ref } from "vue";

const STATION = import.meta.env.VITE_STATION || "ramdam";
const NOWPLAYING_URL =
  import.meta.env.VITE_NOWPLAYING_URL || `/api/nowplaying/${STATION}`;
const WS_URL =
  import.meta.env.VITE_WS_URL ||
  "wss://azuracast.ramdam.fm/api/live/nowplaying/websocket";

function emptySong() {
  return { id: "", title: "", artist: "" };
}

function songFromNp(np) {
  const source = np?.now_playing?.song || np?.song;
  if (!source) {
    return null;
  }
  return {
    id: source.id || "",
    title: source.title || "",
    artist: source.artist || "",
  };
}

export function useNowPlaying() {
  const song = ref(emptySong());
  let socket = null;
  let pollTimer = null;
  let reconnectTimer = null;
  let closed = false;

  function applyNp(np) {
    const next = songFromNp(np);
    if (!next) {
      return;
    }
    song.value = next;
  }

  function applyPayload(payload) {
    if (payload?.data?.np) {
      applyNp(payload.data.np);
    }
  }

  async function fetchOnce() {
    try {
      const response = await fetch(NOWPLAYING_URL);
      if (!response.ok) {
        return;
      }
      applyNp(await response.json());
    } catch {
      // Le polling ou le socket reprendra.
    }
  }

  function stopPoll() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function startPoll() {
    if (pollTimer || closed) {
      return;
    }
    pollTimer = setInterval(fetchOnce, 15000);
  }

  function handleMessage(event) {
    let json;
    try {
      json = JSON.parse(event.data);
    } catch {
      return;
    }

    if (json.connect) {
      const connect = json.connect;
      if (Array.isArray(connect.data)) {
        connect.data.forEach((row) => applyPayload(row));
      }
      if (connect.subs) {
        Object.values(connect.subs).forEach((sub) => {
          (sub.publications || []).forEach((row) => applyPayload(row));
        });
      }
      return;
    }

    if (json.pub) {
      applyPayload(json.pub);
    }
  }

  function connectWs() {
    if (closed) {
      return;
    }

    try {
      socket = new WebSocket(WS_URL);
    } catch {
      startPoll();
      return;
    }

    socket.addEventListener("open", () => {
      stopPoll();
      socket.send(
        JSON.stringify({
          subs: {
            [`station:${STATION}`]: { recover: true },
          },
        }),
      );
    });

    socket.addEventListener("message", handleMessage);

    socket.addEventListener("error", () => {
      startPoll();
    });

    socket.addEventListener("close", () => {
      startPoll();
      if (!closed) {
        reconnectTimer = setTimeout(connectWs, 5000);
      }
    });
  }

  onMounted(async () => {
    await fetchOnce();
    connectWs();
  });

  onUnmounted(() => {
    closed = true;
    stopPoll();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    if (socket) {
      socket.close();
    }
  });

  return { song };
}
