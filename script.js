const words = ["Students", "Parents", "Veterans", "Voters"];
const typedEl = document.getElementById("typed");
const typeSpeed = 90;
const deleteSpeed = 50;
const holdTime = 1600;
const gapTime = 350;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroVisual = document.getElementById("hero-visual");
const navbar = document.querySelector(".navbar");

function updateNavbarState() {
    if (navbar instanceof HTMLElement) {
        navbar.classList.toggle("is-scrolled", window.scrollY > 8);
    }
}

updateNavbarState();
window.addEventListener("scroll", updateNavbarState, { passive: true });

if (!(typedEl instanceof HTMLElement)) {
    throw new Error('The typing effect requires an element with id="typed".');
}

let wordIndex = 0;
let charIndex = words[0].length;
let deleting = true;

function tick() {
    const word = words[wordIndex];

    if (!deleting) {
        charIndex++;
        typedEl.textContent = word.slice(0, charIndex);

        if (charIndex === word.length) {
            deleting = true;
            setTimeout(tick, holdTime);
            return;
        }

        setTimeout(tick, typeSpeed);
        return;
    }

    charIndex--;
    typedEl.textContent = word.slice(0, charIndex);

    if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, gapTime);
        return;
    }

    setTimeout(tick, deleteSpeed);
}

if (!prefersReducedMotion) {
    setTimeout(tick, holdTime);

    if (heroVisual instanceof HTMLElement) {
        heroVisual.addEventListener("pointermove", (event) => {
            const bounds = heroVisual.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;

            heroVisual.style.setProperty("--image-x", `${x * -10}px`);
            heroVisual.style.setProperty("--image-y", `${y * -10}px`);
            heroVisual.style.setProperty("--top-x", `${x * -18}px`);
            heroVisual.style.setProperty("--top-y", `${y * -18}px`);
            heroVisual.style.setProperty("--left-x", `${x * 24}px`);
            heroVisual.style.setProperty("--left-y", `${y * 24}px`);
            heroVisual.style.setProperty("--bottom-x", `${x * -30}px`);
            heroVisual.style.setProperty("--bottom-y", `${y * -30}px`);
        });

        heroVisual.addEventListener("pointerleave", () => {
            heroVisual.style.removeProperty("--image-x");
            heroVisual.style.removeProperty("--image-y");
            heroVisual.style.removeProperty("--top-x");
            heroVisual.style.removeProperty("--top-y");
            heroVisual.style.removeProperty("--left-x");
            heroVisual.style.removeProperty("--left-y");
            heroVisual.style.removeProperty("--bottom-x");
            heroVisual.style.removeProperty("--bottom-y");
        });
    }
}
