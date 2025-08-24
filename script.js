import {
  animate,
  stagger,
} from "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

var insideDetailView = false;

async function animateAndOpenDetail(detailElem, fromLoad = false) {
  insideDetailView = true;

  const isBlog = detailElem.hasAttribute("blog");
  const type = isBlog ? "blog" : "experience";
  const id = detailElem.getAttribute(type);

  if (!id) return; 

  if (!fromLoad) {
    await animate("#footer", {
      opacity: [1, 0],
      y: [0, 20],
      blur: [0, 1],
    });
    await animate(
      "#content > *, #projects > *",
      {
        opacity: [1, 0],
        x: [0, -60],
        blur: [0, 1],
      },
      {
        delay: stagger(0.05),
      },
    );
  }

  document.getElementById("content").classList.add("hidden");
  document.getElementById("projects").classList.add("hidden");
  document.getElementById("detail-space").classList.remove("hidden");

  // *** FIX: Scroll window to the top ***
  window.scrollTo(0, 0);

  const detailParent = document.getElementById(`${type}-${id}`);
  const img =
    detailParent.querySelector(`img`) || detailParent.querySelector(`video`);
  const title = detailElem.querySelector("h3").textContent;
  const content = [];

  for (const child of detailParent.children) {
    if (child.tagName === "IMG" || child.tagName === "VIDEO") {
      continue;
    }
    content.push(child.innerHTML);
  }

  const contentWrapper = document.getElementById("detail-content");
  contentWrapper.innerHTML = "";

  if (img) {
    contentWrapper.appendChild(img.cloneNode());
  }

  const titleElement = document.createElement("h1");
  titleElement.textContent = title;
  contentWrapper.appendChild(titleElement);

  for (const paragraph of content) {
    const paragraphElement = document.createElement("p");
    paragraphElement.innerHTML = paragraph;
    contentWrapper.appendChild(paragraphElement);
    const separator = document.createElement("div");
    separator.innerHTML = `
    <div class="line-holder">
      <div class="smallLine smallLine1"></div>
      <div class="smallLine smallLine2"></div>
    </div>`;
    if (paragraph !== content[content.length - 1]) {
      contentWrapper.appendChild(separator);
    }
  }

  await animate(
    "#back, #detail-content > *",
    {
      opacity: [0, 1],
      x: [-60, 0],
      blur: [1, 0],
    },
    {
      delay: stagger(0.05),
    },
  );
  document.getElementById("footer").removeAttribute("style");
}

for (const detailLink of document.querySelectorAll("[blog], [experience]")) {
  detailLink.onclick = (event) => {
    event.preventDefault();
    const detailElem = event.target.closest("[blog], [experience]");
    const type = detailElem.hasAttribute("blog") ? "blog" : "experience";
    const id = detailElem.getAttribute(type);

    animateAndOpenDetail(detailElem);
    history.pushState({ type, id }, "", `?${type}=${id}`);
  };
}

async function main() {
  await animate(
    "#logo > *, #links > *, #content > h1:first-child > *, #content > p",
    {
      opacity: [0, 1],
      y: [20, 0],
      blur: [1, 0],
    },
    {
      delay: stagger(0.05),
    },
  );
  await animate(
    "#projects > a *, #projects > div",
    {
      opacity: [0, 1],
      blur: [1, 0],
      x: [-20, 0],
    },
    {
      delay: stagger(0.05),
    },
  );
  await animate(
    "footer > *",
    {
      opacity: [0, 1],
      y: [20, 0],
      blur: [1, 0],
    },
    {
      delay: stagger(0.15),
      duration: 0.1,
    },
  );
}

document.getElementById("back").onclick = async () => {
  insideDetailView = false;
  history.pushState({}, "", "/");
  const elements = Array.from(
    document.querySelectorAll("#back, #detail-content > *"),
  ).reverse();
  await animate(
    elements,
    {
      opacity: [1, 0],
      x: [0, -50],
      blur: [0, 1],
    },
    {
      delay: stagger(0.05),
    },
  );
  document.getElementById("content").classList.remove("hidden");
  document.getElementById("projects").classList.remove("hidden");
  document.getElementById("detail-space").classList.add("hidden");
  document.getElementById("projects").setAttribute("gone-back", "");
  await animate(
    "#content > *, #projects > *",
    {
      opacity: [0, 1],
      x: [-50, 0],
      blur: [1, 0],
    },
    {
      delay: stagger(0.05),
    },
  );
};

const urlParams = new URLSearchParams(window.location.search);
const blogId = urlParams.get("blog");
const experienceId = urlParams.get("experience");

if (blogId) {
  const detailElem = document.querySelector(`[blog="${blogId}"]`);
  if (detailElem) animateAndOpenDetail(detailElem, true);
} else if (experienceId) {
  const detailElem = document.querySelector(`[experience="${experienceId}"]`);
  if (detailElem) animateAndOpenDetail(detailElem, true);
} else {
  main();
}

window.addEventListener("popstate", (event) => {
  if (event.state && event.state.id) {
    const { type, id } = event.state;
    const detailElem = document.querySelector(`[${type}="${id}"]`);
    if (detailElem) animateAndOpenDetail(detailElem, true);
  } else {
    if (insideDetailView) {
      document.getElementById("back").click();
    }
  }
});