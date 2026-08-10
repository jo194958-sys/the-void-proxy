// ===================== ULTRAVIOLET + WISP + EPOXY SETUP =====================
import { BareMuxConnection } from "/baremux/index.mjs";

// Construct the Wisp WebSocket URL from current location
const wispUrl = `wss://${location.host}/wisp/`;
console.log("🌑 Wisp URL:", wispUrl);

// Create BareMux connection (uses SharedWorker for transport)
const connection = new BareMuxConnection("/baremux/worker.js");

// Set up Epoxy transport pointing to the Wisp server
// This is what fixes YouTube — Epoxy handles modern TLS properly
connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]).then(() => {
  console.log("✅ Epoxy transport connected to Wisp server");
  document.getElementById("proxy-status").textContent = "Ready to browse";
}).catch((err) => {
  console.error("❌ Epoxy transport failed:", err);
  document.getElementById("proxy-status").textContent = "Transport error — proxy may not work";
});

// Register UV service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((reg) => {
      console.log("✅ UV Service Worker registered:", reg.scope);
    })
    .catch((err) => {
      console.error("❌ UV SW registration failed:", err);
    });
}

// ===================== CALCULATOR + SECRET UNLOCK =====================
let calcInput = "";
const calcDisplay = document.getElementById("calc-display");
const SECRET_CODE = "4444";

document.querySelectorAll(".calc-btn[data-num]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const num = btn.getAttribute("data-num");
    if (calcInput.length < 12) {
      calcInput += num;
      calcDisplay.textContent = calcInput;
    }
    if (calcInput === SECRET_CODE) {
      setTimeout(unlockProxy, 400);
    }
  });
});

document.getElementById("calc-clear").addEventListener("click", () => {
  calcInput = "";
  calcDisplay.textContent = "0";
});

document.getElementById("calc-eval").addEventListener("click", () => {
  if (calcInput) {
    calcDisplay.textContent = calcInput;
  }
});

// ===================== UNLOCK PROXY =====================
function unlockProxy() {
  const studySite = document.getElementById("study-site");
  const voidProxy = document.getElementById("void-proxy");

  studySite.style.transition = "opacity 0.5s";
  studySite.style.opacity = "0";

  setTimeout(() => {
    studySite.style.display = "none";
    voidProxy.style.display = "block";
    voidProxy.style.opacity = "0";
    voidProxy.style.transition = "opacity 0.5s";

    requestAnimationFrame(() => {
      voidProxy.style.opacity = "1";
    });

    document.getElementById("url-input").focus();
  }, 500);
}

// ===================== PANIC BUTTON =====================
document.getElementById("panic-btn").addEventListener("click", () => {
  const studySite = document.getElementById("study-site");
  const voidProxy = document.getElementById("void-proxy");

  voidProxy.style.transition = "opacity 0.3s";
  voidProxy.style.opacity = "0";

  setTimeout(() => {
    voidProxy.style.display = "none";
    document.getElementById("proxy-frame").style.display = "none";
    document.getElementById("proxy-placeholder").style.display = "flex";
    document.getElementById("url-input").value = "";

    studySite.style.display = "block";
    studySite.style.opacity = "0";
    studySite.style.transition = "opacity 0.5s";

    requestAnimationFrame(() => {
      studySite.style.opacity = "1";
    });

    calcInput = "";
    calcDisplay.textContent = "0";
  }, 300);
});

// ===================== PROXY NAVIGATION (Ultraviolet) =====================
const urlInput = document.getElementById("url-input");
const goBtn = document.getElementById("go-btn");
const proxyFrame = document.getElementById("proxy-frame");
const proxyPlaceholder = document.getElementById("proxy-placeholder");
const proxyStatus = document.getElementById("proxy-status");

function navigateProxy() {
  let url = urlInput.value.trim();
  if (!url) return;

  // Add protocol if missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    if (url.includes(".") && !url.includes(" ")) {
      url = "https://" + url;
    } else {
      url = "https://www.google.com/search?q=" + encodeURIComponent(url);
    }
  }

  proxyStatus.textContent = "Loading...";

  // Use Ultraviolet config to encode and construct proxy URL
  if (window.__uv$config) {
    const encodedUrl = window.__uv$config.encodeUrl(url);
    const proxyUrl = window.__uv$config.prefix + encodedUrl;
    proxyFrame.src = proxyUrl;
  } else {
    proxyFrame.src = url;
  }

  proxyFrame.style.display = "block";
  proxyPlaceholder.style.display = "none";

  // Clear loading status after a delay
  proxyFrame.addEventListener("load", () => {
    proxyStatus.textContent = "Ready to browse";
  }, { once: true });
}

goBtn.addEventListener("click", navigateProxy);

urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    navigateProxy();
  }
});

// ===================== FALLING LEAVES =====================
const leavesContainer = document.getElementById("leaves-container");
const leafColors = ["#c4602a", "#e08a3c", "#a63523", "#d4a544", "#8b5e2a"];
const leafShapes = [
  "M 12 2 C 8 6, 4 10, 6 18 Q 12 22, 18 18 C 20 10, 16 6, 12 2 Z",
  "M 10 4 Q 5 8, 5 16 Q 10 20, 15 16 Q 15 8, 10 4 Z",
  "M 12 2 Q 6 8, 6 16 Q 12 20, 18 16 Q 18 8, 12 2 Z",
];

function createLeaf() {
  const leaf = document.createElement("div");
  leaf.className = "leaf";

  const size = 15 + Math.random() * 20;
  const left = Math.random() * 100;
  const duration = 6 + Math.random() * 8;
  const delay = Math.random() * 3;
  const color = leafColors[Math.floor(Math.random() * leafColors.length)];
  const shape = leafShapes[Math.floor(Math.random() * leafShapes.length)];

  leaf.style.left = left + "%";
  leaf.style.width = size + "px";
  leaf.style.height = size + "px";
  leaf.style.animationDuration = duration + "s";
  leaf.style.animationDelay = delay + "s";

  leaf.innerHTML =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="' + shape + '" fill="' + color + '" stroke="' + color + '" stroke-width="0.5"/>' +
    '<path d="M 12 2 L 12 20" stroke="#5a3a1a" stroke-width="0.5" opacity="0.5"/>' +
    "</svg>";

  leavesContainer.appendChild(leaf);
  setTimeout(() => leaf.remove(), (duration + delay) * 1000 + 500);
}

setInterval(createLeaf, 600);
for (let i = 0; i < 8; i++) {
  setTimeout(createLeaf, i * 200);
}

// ===================== KEYBOARD SHORTCUT (Panic) =====================
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    document.getElementById("void-proxy").style.display !== "none"
  ) {
    document.getElementById("panic-btn").click();
  }
});