const issueTopics = {
    federal: ["Education funding", "Climate and environment", "Health care", "Immigration", "Civil rights", "Something else"],
    state: ["Education policy", "Transportation", "Housing", "Health and wellness", "Environment", "Something else"],
    local: ["Public safety", "Parks and recreation", "Public transportation", "Housing", "Roads and infrastructure", "Something else"],
    school: ["School funding", "Student mental health", "School safety", "Curriculum and classes", "Transportation", "Something else"]
};

const officialsByScope = {
    federal: [
        ["Demo U.S. Senator", "United States Senate", "Federal representative"],
        ["Demo U.S. Representative", "U.S. House of Representatives", "Federal representative"],
        ["Demo Federal Office", "Relevant federal department", "Public office"]
    ],
    state: [
        ["Demo State Senator", "State Senate", "State representative"],
        ["Demo State Representative", "State House of Representatives", "State representative"],
        ["Demo State Office", "Relevant state department", "Public office"]
    ],
    local: [
        ["Demo City Council Member", "City Council", "Local representative"],
        ["Demo County Official", "County government", "Local representative"],
        ["Demo Mayor", "Office of the Mayor", "Local representative"]
    ],
    school: [
        ["PXU Governing Board Member", "Phoenix Union High School District", "School board"],
        ["PXU Student Support Office", "Phoenix Union High School District", "District office"],
        ["PXU Superintendent’s Office", "Phoenix Union High School District", "District office"]
    ]
};

const followUp = document.getElementById("follow-up");
const followUpTitle = document.getElementById("follow-up-title");
const followUpCopy = document.getElementById("follow-up-copy");
const issueField = document.getElementById("issue-field");
const issueSelect = document.getElementById("issue-select");
const stateField = document.getElementById("state-field");
const stateSelect = document.getElementById("state-select");
const districtField = document.getElementById("district-field");
const districtSelect = document.getElementById("district-select");
const officialsSection = document.getElementById("officials-section");
const officialsHeading = document.querySelector(".officials-heading");
const officialsTitle = document.getElementById("officials-title");
const officialsCopy = document.getElementById("officials-copy");
const officialsList = document.getElementById("officials-list");
const demoNote = document.getElementById("demo-note");
const profileView = document.getElementById("profile-view");
const profileStep = document.getElementById("profile-step");
const scopeStep = document.getElementById("scope-step");
const progressDots = [...document.querySelectorAll(".progress-dot")];
const stepPanels = [scopeStep, followUp, officialsSection, profileStep];

let selectedScope = "";
let selectedProfile = null;
let activeStep = 1;
let highestCompletedStep = 1;
let hasResults = false;
let transitionTimer;
let isTransitioning = false;
let pendingStep = null;
const fadeOutDuration = 900;
const renderDelay = 220;
const fadeInDuration = 1400;

function setProgress(step) {
    activeStep = step;
    highestCompletedStep = Math.max(highestCompletedStep, step);
    progressDots.forEach((dot, index) => {
        const dotStep = index + 1;
        dot.classList.toggle("is-current", dotStep === step);
        dot.classList.toggle("is-complete", dotStep < highestCompletedStep);
        dot.disabled = dotStep > highestCompletedStep
            || (dotStep === 3 && !hasResults)
            || (dotStep === 4 && !selectedProfile);
        if (dotStep === step) {
            dot.setAttribute("aria-current", "step");
        } else {
            dot.removeAttribute("aria-current");
        }
    });
}

function panelForStep(step) {
    return stepPanels[step - 1];
}

function transitionToStep(step) {
    if (
        step === activeStep
        || (step === 2 && !selectedScope)
        || (step === 3 && !hasResults)
        || (step === 4 && !selectedProfile)
    ) return;
    if (isTransitioning) {
        pendingStep = step;
        return;
    }

    const outgoing = panelForStep(activeStep);
    const incoming = panelForStep(step);
    isTransitioning = true;
    outgoing.classList.add("is-fading-out");
    setProgress(step);

    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => {
        transitionTimer = window.setTimeout(() => {
            outgoing.hidden = true;
            outgoing.classList.remove("is-fading-out");
            incoming.hidden = false;
            incoming.classList.add("is-fading-in");
            void incoming.offsetWidth;
            transitionTimer = window.setTimeout(() => {
                incoming.classList.remove("is-fading-in");
                isTransitioning = false;
                const nextStep = pendingStep;
                pendingStep = null;
                if (nextStep !== null) transitionToStep(nextStep);
            }, fadeInDuration);
        }, renderDelay);
    }, fadeOutDuration);
}

function resetIssueOptions(scope) {
    issueSelect.replaceChildren(new Option("Choose a topic", ""));
    issueTopics[scope].forEach((topic) => issueSelect.add(new Option(topic, topic)));
}

function resetProfileView() {
    selectedProfile = null;
    profileView.replaceChildren();
    profileStep.hidden = true;
}

function resetOfficials() {
    hasResults = false;
    highestCompletedStep = Math.min(highestCompletedStep, activeStep);
    resetProfileView();
    officialsSection.hidden = true;
    officialsList.replaceChildren();
    setProgress(activeStep);
}

function openProfile(profile) {
    selectedProfile = profile;
    profileView.replaceChildren();

    const backButton = document.createElement("button");
    backButton.className = "profile-back";
    backButton.type = "button";
    backButton.textContent = "Back to matching officials";
    backButton.addEventListener("click", closeProfile);

    const profileCard = document.createElement("div");
    profileCard.className = "profile-card";

    const summary = document.createElement("div");
    summary.className = "profile-summary";

    const avatar = document.createElement("div");
    avatar.className = "profile-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user preview-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

    const identity = document.createElement("div");
    const category = document.createElement("p");
    category.className = "eyebrow";
    category.textContent = profile.role;
    const name = document.createElement("h3");
    name.textContent = profile.name;
    const office = document.createElement("p");
    office.textContent = `${profile.office} · ${profile.district || profile.state || profile.scope}`;
    const issue = document.createElement("p");
    issue.textContent = `Issue: ${profile.topic}`;
    identity.append(category, name, office, issue);
    summary.append(avatar, identity);

    const contact = document.createElement("div");
    contact.className = "profile-contact";
    const contactTitle = document.createElement("h4");
    contactTitle.textContent = "Contact this office";
    const links = document.createElement("div");
    links.className = "contact-links";

    const slug = profile.name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/(^\.|\.$)/g, "");
    const contactLinks = [
        ["Email (demo)", `mailto:${slug}@example.com`],
        ["Phone (demo)", "tel:+15550100"],
        ["Instagram (demo)", "https://www.instagram.com/"],
        ["Facebook (demo)", "https://www.facebook.com/"],
        ["X (demo)", "https://x.com/"]
    ];
    contactLinks.forEach(([label, href]) => {
        const link = document.createElement("a");
        link.textContent = label;
        link.href = href;
        if (href.startsWith("https://")) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }
        links.append(link);
    });

    const note = document.createElement("p");
    note.className = "profile-demo-note";
    note.textContent = "Demo profile: contact links and details are placeholders, not real official accounts.";
    contact.append(contactTitle, links, note);
    profileCard.append(summary, contact);
    profileView.append(backButton, profileCard);
    transitionToStep(4);
}

function closeProfile() {
    transitionToStep(3);
}

function showOfficials() {
    const topic = issueSelect.value;
    const district = selectedScope === "school" ? districtSelect.value : "";
    if (!topic || (selectedScope === "school" && (!stateSelect.value || !district))) {
        resetOfficials();
        setProgress(2);
        return;
    }

    const state = selectedScope === "school" ? stateSelect.value : "";
    const scopeLabel = document.querySelector(`[data-scope="${selectedScope}"] strong`).textContent;
    const districtLabel = selectedScope === "school" ? district : "";
    officialsTitle.textContent = selectedScope === "school" ? district : "Public officials";
    officialsCopy.textContent = `Demo matches for ${topic}${state ? ` in ${state}` : ""}.`;
    officialsList.replaceChildren();
    resetProfileView();
    officialsHeading.hidden = false;
    officialsList.hidden = false;
    demoNote.hidden = false;

    officialsByScope[selectedScope].forEach(([name, office, role]) => {
        const card = document.createElement("article");
        card.className = "official-card";
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `View profile for ${name}`);
        card.addEventListener("click", () => openProfile({
            name,
            office,
            role,
            scope: scopeLabel,
            state,
            topic,
            district: districtLabel
        }));
        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openProfile({ name, office, role, scope: scopeLabel, state, topic, district: districtLabel });
            }
        });

        const avatar = document.createElement("div");
        avatar.className = "official-avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user preview-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

        const info = document.createElement("div");
        info.className = "official-info";
        const heading = document.createElement("h3");
        heading.textContent = name;
        const description = document.createElement("p");
        description.textContent = office;
        const meta = document.createElement("p");
        meta.className = "official-meta";
        meta.textContent = role;
        info.append(heading, description, meta);

        const openLabel = document.createElement("span");
        openLabel.className = "profile-open-label";
        openLabel.textContent = "View profile →";
        card.append(avatar, info, openLabel);
        officialsList.append(card);
    });

    hasResults = true;
    if (activeStep === 3) officialsSection.hidden = false;
    setProgress(activeStep);
    if (activeStep === 2) transitionToStep(3);
}

document.querySelectorAll(".scope-option").forEach((button) => {
    button.addEventListener("click", () => {
        if (isTransitioning) return;
        selectedScope = button.dataset.scope;
        document.querySelectorAll(".scope-option").forEach((option) => {
            option.setAttribute("aria-pressed", String(option === button));
        });

        resetOfficials();
        issueSelect.value = "";
        stateSelect.value = "";
        districtSelect.replaceChildren(new Option("Select a school board", ""));
        const isSchool = selectedScope === "school";
        stateField.hidden = !isSchool;
        districtField.hidden = !isSchool;
        issueField.hidden = isSchool;
        followUpTitle.textContent = isSchool ? "Find your school board" : "Tell us more about your issue";
        followUpCopy.textContent = isSchool
            ? "Choose your state and school board, then select a topic."
            : "Choose a topic to see who may be able to help.";
        resetIssueOptions(selectedScope);
        if (isSchool) issueSelect.value = "School funding";
        transitionToStep(2);
    });
});

progressDots.forEach((dot) => {
    dot.addEventListener("click", () => {
        const step = Number(dot.dataset.step);
        transitionToStep(step);
    });
});

stateSelect.addEventListener("change", () => {
    resetOfficials();
    setProgress(2);
    districtSelect.replaceChildren(new Option("Select a school board", ""));
    if (!stateSelect.value) return;

    if (stateSelect.value === "Arizona") {
        districtSelect.add(new Option("PXU — Phoenix Union High School District", "PXU — Phoenix Union High School District"));
    } else {
        districtSelect.add(new Option(`Demo ${stateSelect.value} School Board`, `Demo ${stateSelect.value} School Board`));
    }
});

issueSelect.addEventListener("change", showOfficials);
districtSelect.addEventListener("change", showOfficials);
setProgress(1);
