export function displayDialogue(text, onDisplayEnd) {
    const dialogueUI = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");

    dialogueUI.style.display = "block";
    requestAnimationFrame(() => { dialogueUI.style.opacity = "1"; });

    let index = 0;
    let currentText = "";
    const intervalRef = setInterval(() => { 
        if (index < text.length) {
            currentText += text[index];
            dialogue.innerHTML = currentText;
            index++;
            return;
        }
        clearInterval(intervalRef);
    }, 5);


    const closeBtn = document.getElementById("close");
    function onCloseBtnClick() {
        onDisplayEnd();
        dialogueUI.style.opacity = "0";
        setTimeout(() => { dialogueUI.style.display = "none"; }, 180);
        dialogue.innerHTML = "";
        clearInterval(intervalRef);
        closeBtn.removeEventListener("click", onCloseBtnClick);
    }

    closeBtn.addEventListener("click", onCloseBtnClick);
}

export function setCamScale(k) {
    const desiredGameWidth = 1920 / 2;
    const actualWidth = window.innerWidth;
    const scale = Math.max(1, Math.floor(actualWidth / desiredGameWidth));
    k.camScale(scale);
}