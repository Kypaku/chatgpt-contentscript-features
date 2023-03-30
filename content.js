const archiveSVG = "<?xml version=\"1.0\" ?><svg height=\"19\" viewBox=\"0 0 48 48\" width=\"19\" xmlns=\"http://www.w3.org/2000/svg\"><path fill=\"white\" d=\"M41.09 10.45l-2.77-3.36c-.56-.66-1.39-1.09-2.32-1.09h-24c-.93 0-1.76.43-2.31 1.09l-2.77 3.36c-.58.7-.92 1.58-.92 2.55v25c0 2.21 1.79 4 4 4h28c2.21 0 4-1.79 4-4v-25c0-.97-.34-1.85-.91-2.55zm-17.09 24.55l-11-11h7v-4h8v4h7l-11 11zm-13.75-25l1.63-2h24l1.87 2h-27.5z\"/><path d=\"M0 0h48v48h-48z\" fill=\"none\"/></svg>";
const elSearch = `
<input placeholder="Search..." style="
    width: calc(100% - 100px);
    padding: 4px 8px;
    margin: 0 10px;
    background: #535353;
    border: 0 !important;
    border-radius: 4px;
" type="search">
`;

let q = "";
let showArchived = false;
const styleContent = `
	#__next > div.overflow-hidden.w-full.h-full.relative > div{
		min-width: 330px; 
	}
`;
const CONTAINER_SELECTOR = "#__next > div > div > div > div > nav > div > div";
function localeIncludes(str1, str2) {
    return (str1.toLocaleLowerCase && str1.toLocaleLowerCase()).includes(str2.toLocaleLowerCase && str2.toLocaleLowerCase());
}

function addStyle() {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = styleContent;
    document.body.appendChild(styleEl);
}

function addSearch(container, className) {
    if (!container.querySelector(className)) {
        const search = document.createElement("a");
        search.classList.add(className.slice(1));
        search.innerHTML = elSearch;
        container.prepend(search);
        search.oninput = function (ev) {
            q = ev?.target?.value;
        };
    }
}

function addToggler(container, className, parentClassName) {
    if (!container.querySelector(className)) {
        const toggler = document.createElement("span");
        toggler.classList.add(className.slice(1));
        container.querySelector(parentClassName)?.appendChild(toggler);
        toggler.style.textDecoration = "underline";
        toggler.style.fontSize = "11px";
        toggler.style.cursor = "pointer";
        toggler.onclick = function () {
            showArchived = !showArchived;
        };
    }
}

const getContainer = () => document.querySelector(CONTAINER_SELECTOR);
const getItems = () => Array.from(getContainer()?.children || []);
//* Main

function main() {
    addStyle();
    if(location.href.indexOf("chat.openai.com") >=0 ){
        let archivedChats = JSON.parse(localStorage.getItem("archivedChats") || "[]") || [];

        setInterval(() => {
            const container = getContainer();
            addSearch(container, ".ext-input-search");
            addToggler(container, ".ext-archive-toggler", ".ext-input-search");

            const toggler = container.querySelector(".ext-archive-toggler");
            if (toggler) {
			    const newValue = showArchived ? "Show active" : "Show archived";
                (newValue !== toggler.innerHTML) && (toggler.innerHTML = newValue);
            }
            // Add archive button
            getItems().filter((getItem) => !getItem.classList.contains("ext-input-search")).forEach((item) => {
                const panel = item.querySelector(".right-1") || item.querySelector(".flex-1 .absolute");
                const parent = item;
                const chatName = parent?.innerText;
                // do search
                if (chatName && !localeIncludes(chatName, q)) {
                    item.style.display = "none";
                } else {
                    if (panel?.children?.length === 2 || panel?.children?.length === 0) {
                        const btn = document.createElement("button");
                        btn.innerHTML = archiveSVG;
                        panel.appendChild(btn);

                        btn.onclick = () => {
                            if (archivedChats.includes(chatName)) {
                                archivedChats = archivedChats.filter((name) => name !== chatName);
                            } else {
                                archivedChats.push(chatName);
                            }
                            localStorage.setItem("archivedChats", JSON.stringify(archivedChats));
                            btn.style.transform = archivedChats.includes(chatName) ? "rotate(180deg)" : "";
                            parent.style.display = archivedChats.includes(chatName) ? "none" : "";
                        };

                        btn.style.transform = archivedChats.includes(chatName) ? "rotate(180deg)" : "";
                    }
                    parent && (parent.style.display = (archivedChats.includes(chatName) && !showArchived) ? "none" : "");
                }
            });

        }, 500);
        setInterval(() => {
            // auto loading
            const button = [...getContainer().querySelectorAll("button")].find((buttonOne) => buttonOne.innerText === "Show more");
            if (button) {
                button.click();
            }

        }, 1500);
    }
    //* *

};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}
