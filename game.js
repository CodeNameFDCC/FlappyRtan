//#region Canvas

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;
const offscreenCtx = offscreenCanvas.getContext('2d');

//#endregion 

//#region 오디오 파일
const jumpSound = new Audio("./sounds/jump.mp3");
const bgmSound = new Audio("./sounds/bgm.mp3");
const scoreSound = new Audio("./sounds/score.mp3");
const defeatSound = new Audio("./sounds/defeat1.mp3");

//#endregion

//#region 이미지 파일
const rtanImages = [
    './images/rtan_0.png',
    './images/rtan_1.png',
    './images/rtan_2.png',
    './images/rtan_3.png',
    './images/rtan_4.png']
    .map(src => {
        const img = new Image();
        img.src = src;
        return img;
    });
const rtanHurt = new Image();
rtanHurt.src = "./images/rtan_hurt.png";
const pipeImage = new Image();
pipeImage.src = "./images/pipe_2.png";
const bgImage = new Image();
bgImage.src = "./images/bg.jpg";
const gameStartImage = new Image();
gameStartImage.src = "./images/game_start.png";
const gameOverImage = new Image();
gameOverImage.src = "./images/game_over.png";
//#endregion

//#region HTML 요소
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const endScreen = document.getElementById("endScreen");
const restartButton = document.getElementById("restartButton");
const scoreText = document.getElementById("scoreText");
//#endregion

window.onload = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const imageWidth = 240;
    const imageHeight = 240;
    const imageX = canvas.width / 2 - imageWidth / 2;
    const imageY = 15;

    ctx.drawImage(gameStartImage, imageX, imageY, imageWidth, imageHeight);

};





//#region 게임 상태 변수
let gameState = "start";
let score = 0;
let frame = 0;
let pipes = [];
let currentFrame = 0;
let lastFrameTime = 0; // 마지막 프레임 시간
let deltaTime = 0;
let gameTimer = 0;
let level = 0;// 난이도
let animationChangeTime = 0;
let pipeSpawnTime = 0;

const animationChangeInterval = 0.1;
const pipeSpawnInterval = 5;
const gravity = 60;
const jump = -70;
const pipeWidth = 50;
const pipeGap = 120;
const maxLevel = 70;

//#endregion

//#region 르탄
const rtan = {
    x: 50,
    y: 150,
    width: 30,
    height: 30,
    velocity: 0
};

//#endregion

//#region 키보드 입력 이벤트
document.addEventListener("keydown", () => {
    if (gameState === "playing") {
        jumpSound.currentTime = 0;
        jumpSound.play();
        rtan.velocity = jump;
    }
});
//#endregion

//#region 마우스 입력 이벤트
document.addEventListener("mousedown", () => {
    if (gameState === "playing") {
        jumpSound.currentTime = 0;
        jumpSound.play();
        rtan.velocity = jump;
    }
});
//#endregion

//#region 파이프 생성 함수
function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
    pipes.push({
        x: canvas.width,
        y: pipeHeight
    });
}
//#endregion

//#region 충돌 감지 함수
function detectCollision(pipe) {
    const birdBox = {
        top: rtan.y,
        bottom: rtan.y + rtan.height,
        left: rtan.x,
        right: rtan.x + rtan.width
    };

    const pipeBoxTop = {
        top: 0,
        bottom: pipe.y,
        left: pipe.x,
        right: pipe.x + pipeWidth
    };

    const pipeBoxBottom = {
        top: pipe.y + pipeGap,
        bottom: canvas.height,
        left: pipe.x,
        right: pipe.x + pipeWidth
    };

    return (
        (birdBox.right > pipeBoxTop.left &&
            birdBox.left < pipeBoxTop.right &&
            birdBox.bottom > pipeBoxTop.top &&
            birdBox.top < pipeBoxTop.bottom) ||
        (birdBox.right > pipeBoxBottom.left &&
            birdBox.left < pipeBoxBottom.right &&
            birdBox.bottom > pipeBoxBottom.top &&
            birdBox.top < pipeBoxBottom.bottom)
    );
}
//#endregion

//#region 게임 초기화 함수
function initGame() {
    bgmSound.volume = 0.5;
    jumpSound.volume = 0.2;
    defeatSound.volume = 0.5;
    rtan.y = 150;
    rtan.velocity = 0;
    pipes = [];
    score = 0;
    frame = 0;
    level = 0;
    gameTimer = 0;
    lastFrameTime = 0;
    currentFrame = 0;
    bgmSound.currentTime = 0;
    bgmSound.play();
}
//#endregion

//#region 게임 오버 함수
function gameOver() {
    bgmSound.pause();
    defeatSound.play();
    gameState = "end";
    scoreText.textContent = "Score: " + score;
    endScreen.style.display = "flex";
}
//#endregion

//#region 게임 루프
function gameLoop() {
    if (gameState === "playing") {
        deltaTime = ((frame - lastFrameTime) / 1000) ; // 밀리초를 초 단위로 변환
        lastFrameTime = frame;
        gameTimer += deltaTime;

        offscreenCtx.clearRect(0, 0, canvas.width, canvas.height);
        offscreenCtx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

        // 새의 속도 및 위치 업데이트
        rtan.velocity += gravity * deltaTime;
        rtan.y += rtan.velocity * deltaTime;

        // 새 애니메이션 갱신 0.1초 마다

        if (animationChangeTime > animationChangeInterval) {

            currentFrame = (currentFrame + 1) % rtanImages.length;
            animationChangeTime = 0;
        }
        else {
            animationChangeTime += deltaTime;
        }
        offscreenCtx.drawImage(rtanImages[currentFrame], rtan.x, rtan.y, rtan.width, rtan.height);

        // 파이프 생성 5초 마다
        if (pipeSpawnTime >= pipeSpawnInterval) {
            pipeSpawnTime = 0;
            createPipe();
        }
        else
            pipeSpawnTime += deltaTime;

        updatePipes();

        // 새가 바닥에 닿았을 경우 게임 종료
        if (rtan.y <= 0) {
            rtan.y = 0;
        }
        if (rtan.y + rtan.height >= canvas.height) {
            gameOver();
        }
        const text = "Score: " + score;
        const text_pos =
        {
            x: 10,
            y: 30
        };//이것은 Text 위치여

        offscreenCtx.fillStyle = "white"; // 점수 텍스트 색상
        offscreenCtx.font = "20px Arial"; // 텍스트 폰트 및 크기
        offscreenCtx.strokeStyle = "black"; // 외각 색상
        offscreenCtx.lineWidth = 2; //외각 라인 크기
        offscreenCtx.strokeText(text, text_pos.x, text_pos.y) // 외각 적용
        offscreenCtx.fillText(gameTimer, 100, text_pos.y) // 외각 적용
        offscreenCtx.fillText(text, text_pos.x, text_pos.y); // 화면에 점수 표시 (x=10, y=30 위치에 표시)

        // 캔버스를 한 번에 그리기 (더블 버퍼링)
        ctx.clearRect(0, 0, canvas.width, canvas.height);//비워준 다음
        ctx.drawImage(offscreenCanvas, 0, 0);//그린다 이미 모두 그려진 캔버스를

        frame++;//프레임 증가
        requestAnimationFrame(gameLoop); // 다음 프레임 호출
    }
    else {
        ctx.drawImage(rtanHurt, rtan.x, rtan.y, rtan.width * 2, rtan.height * 2);// 이건 큰 의미는 없다 이미지가 너무 작아 그래서 키우자 2배로
        ctx.drawImage(gameOverImage, 0, 50, 250, 128);//게임 오버 이미지도 그려주자
    }
}
//#endregion

//#region 파이프 업데이트
function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= 50 * deltaTime; // 파이프 이동
        const resultGap = pipeGap - Math.min(level * 5, maxLevel);
        // 파이프를 그리기
        offscreenCtx.drawImage(pipeImage, pipe.x, 0, pipeWidth, pipe.y);
        offscreenCtx.drawImage(pipeImage, pipe.x, pipe.y + resultGap, pipeWidth, canvas.height);

        // 충돌 감지
        if (detectCollision(pipe)) {
            gameOver();
        }

        // 화면 밖으로 나간 파이프는 표시하지 않음
        if (pipe.x + pipeWidth < 0) {
            pipe.outOfBounds = true; // 삭제 대신 사망 플래그를 추가
            score += 10; //점수 올리고
            if (score % 50 === 0) {
                level++;
                console.log(level);
            }
            scoreSound.play();//점수 사운드
        } else {
            // 화면에 있는 파이프만 그리기
            offscreenCtx.drawImage(pipeImage, pipe.x, 0, pipeWidth, pipe.y);
            offscreenCtx.drawImage(pipeImage, pipe.x, pipe.y + resultGap, pipeWidth, canvas.height);
        }
    });

    // 파이프 배열에서 제거는 나중에 한 번에 처리
    pipes = pipes.filter(pipe => !pipe.outOfBounds);
}
//#endregion

//#region 게임 시작 이벤트
startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    gameState = "playing";
    initGame();
    gameLoop(0);
});
//#endregion

//#region 게임 재시작 이벤트
restartButton.addEventListener("click", () => {
    endScreen.style.display = "none";
    gameState = "playing";
    initGame();
    gameLoop(0);
});
//#endregion
