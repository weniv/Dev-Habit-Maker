const settingBtn = document.querySelector(".setting-btn");
const shareBtn = document.querySelector(".share-btn")
const settingModal = document.querySelector(".setting");
const shareModal = document.querySelector(".share");

const cancelBtns = document.querySelectorAll(".cancel-btn");
const setBtn = document.querySelector(".set-btn");
const progressBar = document.querySelector(".progress-bar");
const app = document.getElementsByClassName("table-item-wrap")[0];
const challengeTable = document.querySelector(".challenge-table");
const selectSticker = document.querySelector(".select-sticker");
const searchInput = document.querySelector(".search-input");

let stickers;
let selectedItem;
let appData = {};
let stickerData = {}

async function getData() {
    const data = await fetch("src/js/data.json");
    stickerData = await data.json();
}
 
function setStickerElement(data) {
    const stickerList = document.querySelector(".sticker-list");
    const items = data.map((i)=>`
    <li class="sticker-item" id='${i.name}'>
        <img src="${i.img}" alt="sticker" class="sticker">
    </li>`);

    stickerList.innerHTML = "";

    for(let item of items){
        stickerList.innerHTML += item;
    }
}

async function initStickerList() {
    await getData();
    setStickerElement(stickerData);
    stickers = document.querySelectorAll(".sticker");
    stickers.forEach((item,idx)=>{
        const idx1 = idx;
        item.addEventListener("click", ()=>{
            setSticker(idx1);
        });
    });
    init();
}

async function searchSticker(e) {
    const keyword = e.target.value;
    if (stickerData){
        stickerData.forEach(item => {
            if(!item.name.includes(keyword)){
                document.getElementById(item.name).style.display = "none"; 
            } else if(item.name.includes(keyword)){
                document.getElementById(item.name).style.display = "flex"; 
            }
        });
    }
}

searchInput.addEventListener("keyup",searchSticker);
const saveBtn = document.querySelector('#img-capture-btn');

window.addEventListener("keydown",function(e) {
    if(e.keyCode===13){
        e.preventDefault();
    }
});

setBtn.addEventListener("click", setChallenge);

settingBtn.addEventListener("click", function() {
    settingModal.classList.add("active");
});

shareBtn.addEventListener("click", function() {
    shareModal.classList.add("active");
});

[...cancelBtns].forEach(btn => {
    btn.addEventListener("click", function() {
        settingModal.classList.remove("active");
        shareModal.classList.remove("active");
    });
});

function createDom(dom="div", id="", className="", child="") {
    const el = document.createElement(dom);

    el.className = className;
    el.id = id;
    el.append(child);

    return el;
}

function progressCheck() {
    const items = document.getElementsByClassName("table-item");
    let count = 0;
    [...items].forEach(item => {
        count += item.dataset.value > -1 ? 1 : 0;
    });
    progressBar.style.width = `${count/items.length*100}%`;
}

function saveAppData() {
    localStorage.setItem("habitChallengeData", JSON.stringify(appData));
    progressCheck();
}

//일정에 도장찍기
function setSticker(idx) {
    const selectedDom = document.getElementById(`item${selectedItem+1}`);
    selectedDom.dataset.value = idx;
    
    selectedDom.innerHTML = `
        <div class="img-wrapper">
            <img src="${stickers[idx].src}" alt="sticker" class="sticker">
        </div>`;

    const selected = document.querySelector(".selected");
    if(selected) {
        selected.classList.remove("selected");
    }
    if(selectSticker.classList.contains("active")){
        selectSticker.classList.remove("active");
    }

        
    const sticker = selectedDom.querySelector(".sticker");
    sticker.addEventListener('click', addModalEvt);

    appData['data'][selectedItem+1] = idx;
    saveAppData();
    setTimeout(setTable, 1300);
}

//챌린지 설정
function setChallenge() {
    const challengeSetting = new FormData(document.getElementById("setChallengeForm"));
    const datas = Array.from(challengeSetting);
    
    for (const i in datas) {
        if (Object.hasOwnProperty.call(datas, i)) {
            const data = datas[i];
            appData[data[0]] = data[1];
        }
    }

    settingModal.classList.remove("active");
    document.getElementsByClassName("challenge-title")[0].innerHTML = appData.challengeName;
    document.getElementById("start-date").innerHTML = appData.startDate;

    setTable();
    saveAppData();
}

function addModalEvt(item, idx) {
    item.addEventListener("click", function(){
        const activeTableItem = challengeTable.querySelector(".selected");

        if(item.classList.contains("selected")){
            item.classList.remove("selected");
            selectSticker.classList.remove("active");
        } else {
            if(activeTableItem){
                activeTableItem.classList.remove("selected");
            }
            item.classList.add("selected");
            selectSticker.classList.add("active");
            stickerStyle(idx, item);
        }

        window.onclick = function(e) {
            if((e.target != item) && e.target.className != "search-input") {
                if(e.target.className != "sticker"){
                    item.classList.remove("selected");
                    selectSticker.classList.remove("active");
                }
            }
        };
    }, {capture: true});
}

function setTable() {
    app.innerHTML = "";
    for (const key in appData.data) {
        if (Object.hasOwnProperty.call(appData.data, key)) {
            const stamp = appData.data[key];
            const el = createDom(dom="div", id=`item${key}`,className="table-item", child= stamp==-1 ? key : stickers[stamp].cloneNode());
            el.setAttribute('data-value', stamp);
            app.append(el);
        }

        if (key == appData.challengeTerm){
            break;
        }
    }

    const tableItem = document.querySelectorAll(".table-item");

    tableItem.forEach((item, idx) => {
        addModalEvt(item,idx);
    });
    
}

function init() {
    // 최초 데이터 없을때 초기화
    if (!localStorage.getItem("habitChallengeData")){
        const defaultData = {};
        [...Array(60)].forEach((k, i) => {
            defaultData[i + 1] = -1;
        });

        const date = new Date;

        localStorage.setItem("habitChallengeData", JSON.stringify({
            challengeName:"Please set a title",
            data:defaultData,
            challengeTerm:25,
            startDate:date.toDateString()
        }));
    }

    appData = JSON.parse(localStorage.getItem("habitChallengeData"));
    document.getElementById("challenge-name").value = appData.challengeName;
    document.getElementById(`day_${appData.challengeTerm}`).checked = true;
    document.getElementById('');
    document.getElementsByClassName("challenge-title")[0].innerHTML = appData.challengeName;
    document.getElementById("start-date").innerHTML = appData.startDate;

    setTable();
    progressCheck();
}


// 초기화 버튼
const resetBtn = document.querySelector(".reset-btn");
const confirmMsg = document.querySelector(".confirm-msg");

resetBtn.addEventListener("click", function(){
    confirmMsg.style.display = "block";
    resetBtn.innerText = "Yes!";

    if (resetBtn.classList.contains("check")){
        const defaultData = {};
        [...Array(60)].forEach((k, i) => {
            defaultData[i+1] = -1;
        });

        const date = new Date;

        localStorage.setItem("habitChallengeData", JSON.stringify({
            challengeName:"Please set a title",
            data:defaultData,
            challengeTerm:25,
            startDate:date.toDateString()
        }));

        appData = JSON.parse(localStorage.getItem("habitChallengeData"));
        document.getElementById("challenge-name").value = appData.challengeName;
        document.getElementById(`day_${appData.challengeTerm}`).checked = true;
        document.getElementById('');
        document.getElementsByClassName("challenge-title")[0].innerHTML = appData.challengeName;
        document.getElementById("start-date").innerHTML = appData.startDate;
        
        confirmMsg.style.display = "none";

        setTable();
        progressCheck();

        settingModal.classList.remove("active");
        resetBtn.innerText = "Reset";
        resetBtn.classList.remove("check");
    } else {
        resetBtn.classList.add("check");
    }
});

// 스티커 추가 이벤트
const tableItem = document.querySelectorAll(".table-item");


// 스티커 선택창 스타일 변경
// tableItem를 클릭할 때마다 스티커 선택창 위치가 변경됨.
function stickerStyle(idx, item){
    // margin 값을 포함한 tableItem의 height값
    const height = parseInt(item.offsetHeight, 10) + parseInt(window.getComputedStyle(item).getPropertyValue("margin-bottom"), 10);

    // tableItem의 절대좌표 구하기
    const clientRect = item.getBoundingClientRect();
    const relativeTop = clientRect.top;
    const scrolledTopLength = window.pageYOffset;
    const absoluteTop = scrolledTopLength + relativeTop;

    selectSticker.style.top = `${absoluteTop+height}px`;

    selectedItem = idx;
}

//스크린샷 기능
async function screenShot() {
    shareModal.classList.remove("active");

    const padding = 5;
    const cv = await html2canvas(document.body);
    const ratio =  cv.width/ document.body.getBoundingClientRect().width;
    const left = document.querySelector(".challenge-table").offsetLeft * ratio;
    const top = document.querySelector(".contents-header").offsetTop * ratio;
    const height = document.querySelector(".challenge-table").offsetHeight*ratio + document.querySelector(".contents-header").offsetHeight * ratio + top;
    const width = document.querySelector(".challenge-table").offsetWidth*ratio;
    const canvas = document.createElement("canvas");
    const imgData = cv.getContext("2d").getImageData(left-left/padding, top-top/padding, width+((left*2)/padding), height+((top*2)/padding));
    canvas.width = imgData.width;
    canvas.height = imgData.height;
    canvas.getContext("2d").putImageData(imgData, 0, 0);

    if (navigator.msSaveBlob) {
        var blob = canvas.msToBlob();
        return navigator.msSaveBlob(blob, 'myChallenge.jpg');
    } else {
        const img = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
        const vDom = document.createElement('a');
        vDom.href = img;
        vDom.download = "myChallenge.jpg";
        vDom.click();
    }
}

// sns 공유
function shareFacebook() {
    let url = window.location.href;
    let facebook = 'http://www.facebook.com/sharer/sharer.php?u=';
    let link = facebook + url;
    window.open(link);
    shareModal.classList.remove("active");
}

function shareTwitter() {
    let url = window.location.href;
    let sendText = "하루 한 번 챌린지!"; // 전달할 텍스트
    let twitter = "https://twitter.com/intent/tweet?text="
    window.open(twitter + sendText + "&url=" + url);
    shareModal.classList.remove("active");
}

function shareKakao() {
    Kakao.Link.sendDefault({
        objectType: 'feed',
        content: {
            title: "Day Habit Challenge",
            description: "하루하루 천천히 습관 만들기 도전!", 
            imageUrl: "https://weniv.github.io/30daysChallengeHabit/src/img/thumbnail.png",
            link: {
                    mobileWebUrl: "http://habitmaker.co.kr",
                    webUrl: "http://habitmaker.co.kr"
            }
        }
    })

    shareModal.classList.remove("active");
}

saveBtn.addEventListener('click',screenShot);

Kakao.init('551505ed5b3d098a365d690f62520040');

// github 버튼 이벤트
const githubBtn = document.querySelector(".github-btn");
const githubInfoMsg = document.querySelector(".github-info-msg");
const mainbuttons = document.querySelector(".main-buttons");

githubBtn.addEventListener("click", function(){
    if(githubBtn.classList.contains("capture")){
        githubBtn.classList.remove("capture");
        githubInfoMsg.innerHTML = "<p>Increase the page horizontally for <span>Github upload</span></p>";
        challengeTable.classList.remove("github");
        mainbuttons.classList.remove("github");
        selectSticker.classList.remove("github");
    } else {
        githubBtn.classList.add("capture");
        githubInfoMsg.innerHTML = "<p>Go back to the original screen.</p>";
        challengeTable.classList.add("github");
        mainbuttons.classList.add("github");
        selectSticker.classList.add("github");
    }
});

// 모달창 닫기
window.onclick = function(e) {
    if(settingModal) {
        if(e.target == settingModal) {
            settingModal.classList.remove("active");
        }
    }

    if(shareModal) {
        if(e.target == shareModal) {
            shareModal.classList.remove("active");
        }
    }

    if(e.target != resetBtn) {
        confirmMsg.style.display = "none";
        resetBtn.innerText = "Reset";
        resetBtn.classList.remove("check");
    }
};

initStickerList();