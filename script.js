// 1) PASTE your Google Apps Script Web App URL here (see README.md)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxG_wvxk94-E0HDAjfYtFh8D5kpCPXK7bZeQJMUWQCefB2cBH9a-MofFAoL1G6Q0Gg/exec";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const palette = ["#ff4d5e", "#5aa2ff", "#ffffff", "#2f6bff", "#ff8a95", "#bcdcff"];

// ---------- decorations ----------
(function decorate() {
    // 3D headline: split into words and letters
    const title = document.getElementById("title");
    let i = 0;
    title.innerHTML = title.textContent.split(" ").map((w) =>
        `<span class="word" aria-hidden="true">${[...w].map((c) => `<span class="ch" style="--i:${i++}">${c}</span>`).join("")}</span>`
    ).join(" ");

    // string lights
    const lights = document.querySelector(".lights");
    const count = Math.max(10, Math.floor(window.innerWidth / 55));
    for (let n = 0; n < count; n++) {
        const li = document.createElement("li");
        const c = palette[n % 5];
        li.style.background = c;
        li.style.boxShadow = `0 0 14px 3px ${c}`;
        li.style.animationDelay = (n % 5) * 0.4 + "s";
        lights.appendChild(li);
    }

    // hanging baubles
    const spots = [[3, 90, "#e0243b"], [11, 160, "#2f6bff"], [21, 110, "#e0243b"],
    [79, 120, "#2f6bff"], [89, 170, "#e0243b"], [96, 95, "#2f6bff"]];
    const bx = document.getElementById("baubles");
    spots.forEach(([x, len, c], n) => {
        const li = document.createElement("li");
        li.style.cssText = `--x:${x}%;--len:${len}px;--c:${c};--t:${2.6 + n * 0.45}s;--d:${-n * 0.7}s`;
        bx.appendChild(li);
    });

    if (reduceMotion) return;

    // layered snow (small = far, big = near)
    const snow = document.getElementById("snow");
    for (let n = 0; n < 70; n++) {
        const d = Math.random();
        const f = document.createElement("span");
        const s = 2 + d * 7;
        f.className = "flake";
        f.style.cssText = `left:${Math.random() * 100}%;width:${s}px;height:${s}px;opacity:${0.35 + d * 0.55};` +
            `filter:blur(${((1 - d) * 1.2).toFixed(1)}px);animation-duration:${15 - d * 9}s;` +
            `animation-delay:${-Math.random() * 15}s;--drift:${(Math.random() - 0.5) * 100}px`;
        snow.appendChild(f);
    }
})();

// ---------- mouse parallax + 3D card tilt ----------
if (!reduceMotion && window.matchMedia("(hover:hover)").matches) {
    const root = document.documentElement;
    window.addEventListener("mousemove", (e) => {
        const mx = e.clientX / window.innerWidth - 0.5;
        const my = e.clientY / window.innerHeight - 0.5;
        root.style.setProperty("--mx", mx.toFixed(3));
        root.style.setProperty("--my", my.toFixed(3));
        root.style.setProperty("--ry", (mx * 16).toFixed(2) + "deg");
        root.style.setProperty("--rx", (-my * 16).toFixed(2) + "deg");
    });
}

// ---------- confetti burst ----------
function confetti() {
    if (reduceMotion) return;
    for (let n = 0; n < 60; n++) {
        const c = document.createElement("span");
        const a = Math.random() * Math.PI * 2, r = 120 + Math.random() * 320;
        c.className = "confetti";
        c.style.cssText = `background:${palette[n % palette.length]};--dx:${Math.cos(a) * r}px;` +
            `--dy:${Math.sin(a) * r + 120}px;--r:${Math.random() * 900 - 450}deg`;
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 1700);
    }
}

// ---------- thank-you popup ----------
const popup = document.getElementById("popup");
const popClose = document.getElementById("popClose");
function showPopup(name) {
    document.getElementById("popName").textContent = name.split(" ")[0] || "friend";
    popup.hidden = false;
    requestAnimationFrame(() => popup.classList.add("show"));
    popClose.focus();
    confetti();
    if (!reduceMotion) {
        const sweets = ["🍬", "🍭", "🎄", "⭐", "🍫"];
        for (let n = 0; n < 24; n++) {
            const c = document.createElement("span");
            c.className = "candy-fall";
            c.textContent = sweets[n % sweets.length];
            c.style.cssText = `left:${Math.random() * 100}%;font-size:${1.2 + Math.random() * 1.6}rem;` +
                `animation-duration:${2.5 + Math.random() * 2.5}s;animation-delay:${Math.random() * 1.2}s`;
            popup.appendChild(c);
            setTimeout(() => c.remove(), 6500);
        }
    }
}
function hidePopup() {
    popup.classList.remove("show");
    setTimeout(() => (popup.hidden = true), 300);
}
popClose.addEventListener("click", hidePopup);
popup.addEventListener("click", (e) => { if (e.target === popup) hidePopup(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !popup.hidden) hidePopup(); });

// ---------- form ----------
const form = document.getElementById("xmasForm");
const btn = document.getElementById("submitBtn");
const msg = document.getElementById("msg");
const nameEl = document.getElementById("name");
const phoneEl = document.getElementById("phone");

function validPhone(v) {
    const digits = v.replace(/\D/g, "");
    return /^\+?[\d\s\-().]+$/.test(v.trim()) && digits.length >= 7 && digits.length <= 15;
}

function setLoading(on) {
    btn.disabled = on;
    btn.querySelector(".spinner-border").classList.toggle("d-none", !on);
    btn.querySelector(".btn-label").textContent = on ? "Sending…" : "Claim My Candy 🍬";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = ""; msg.className = "mt-3 text-center";

    const nameOk = nameEl.value.trim().length >= 2;
    const phoneOk = validPhone(phoneEl.value);
    nameEl.classList.toggle("is-invalid", !nameOk);
    phoneEl.classList.toggle("is-invalid", !phoneOk);
    if (!nameOk || !phoneOk) return;

    if (form.website.value) return; // honeypot caught a bot
    if (SCRIPT_URL.includes("PASTE_YOUR")) {
        msg.textContent = "Setup needed: add your Google Apps Script URL in script.js.";
        msg.classList.add("err");
        return;
    }

    setLoading(true);
    try {
        const data = new URLSearchParams({ name: nameEl.value.trim(), phone: phoneEl.value.trim() });
        // no-cors: Apps Script doesn't send CORS headers; the request still arrives.
        await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: data });
        showPopup(nameEl.value.trim());
        form.reset();
    } catch (err) {
        msg.textContent = "Could not send. Check your connection and try again.";
        msg.classList.add("err");
    } finally {
        setLoading(false);
    }
});

[nameEl, phoneEl].forEach((el) => el.addEventListener("input", () => el.classList.remove("is-invalid")));