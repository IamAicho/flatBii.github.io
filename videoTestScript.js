//----------------------------BLE 連接 ESP32_Audio-------------------------------
let deviceAudio;
var servAudio_uuid = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'.toLowerCase();
var charAudio_uuid = '6e400004-b5a3-f393-e0a9-e50e24dcca9e'.toLowerCase();
let characteristicAudio;
let valueStr;  // 傳給ESP32_Audio的字串指令

$(function () {
    $("#scanAudio").on('click', async function () {
        console.log('尋找 ESP32_BLE_Audio...')
        try {
            deviceAudio = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'ESP32_BLE_Audio' }],
                optionalServices: [servAudio_uuid]
            });
            $("#displayState_Audio").text('配對中...');
            console.log('連接 ESP32_BLE_Audio 中...');
            const server = await deviceAudio.gatt.connect();
            const service = await server.getPrimaryService(servAudio_uuid);
            characteristicAudio = await service.getCharacteristic(charAudio_uuid);
            $("#displayState_Audio").text('掃描成功！可以連接投影畫面了。');
            console.log('> 已連接到 ESP32_Audio 。');
        } catch (error) {
            $("#displayState_Audio").text('連接失敗，請再掃描一次！');
            console.error('連接 ESP32_Audio 失敗!!', error);
            console.log('> 連接 ESP32_Audio 失敗!!', error);
        }
    });

});

// 定義收到上下左右訊息的函式
async function downSpeaker() {
    if (!characteristicAudio) return;
    valueStr = 'DOWN';
    log('> 傳送給ESP32_Audio: ' + valueStr);
    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
}
async function leftSpeaker() {
    if (!characteristicAudio) return;
    valueStr = 'LEFT';
    log('> 傳送給ESP32_Audio: ' + valueStr);
    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
}
async function rightSpeaker() {
    if (!characteristicAudio) return;
    valueStr = 'RIGHT';
    log('> 傳送給ESP32_Audio: ' + valueStr);
    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
}
async function upSpeaker() {
    if (!characteristicAudio) return;
    valueStr = 'UP';
    log('> 傳送給ESP32_Audio: ' + valueStr);
    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
}



// 影片檔案的路徑
var videos = [
    'video/D_500.mp4',
    'video/L_500.mp4',
    'video/R_500.mp4',
    'video/U_500.mp4'
];

// 隨機排序陣列的函式
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex, temporaryValue;

    while (currentIndex !== 0) {
        // 隨機挑選一個索引
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // 交換目前索引和隨機選中的索引的元素
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

// 記錄當前播放的影片索引
let currentVideoIndex = 0;
// 記錄當前播放的聲音方向
let currentVideoName = '';

let shuffledVideos = shuffleArray(videos.slice());
// 播放下一個影檔
function playNextVideo() {
    // 將播放器的影片路徑設定為隨機排序後的路徑
    videoPlayer.src = shuffledVideos[currentVideoIndex];
    
    let videoName = videoPlayer.src;
    if (currentVideoIndex < shuffledVideos.length) {
        // 判斷該播放的聲音方向
        if (videoName.includes('video/D')) {
            downSpeaker();
            currentVideoName = '下方';
        } else if (videoName.includes('video/L')) {
            leftSpeaker();
            currentVideoName = '左方';
        } else if (videoName.includes('video/R')) {
            rightSpeaker();
            currentVideoName = '右方';
        } else if (videoName.includes('video/U')) {
            upSpeaker();
            currentVideoName = '上方';
        }
        videoPlayer.load();
        videoPlayer.play();
        currentVideoIndex++;
        console.log(currentVideoIndex + '. ' + String(videoName));
        log(currentVideoIndex + '. ' + currentVideoName);


        // 影片播放結束事件
        let loopVideos = document.getElementById("videoPlayer");
        loopVideos.onended = function () {
            // alert("The video has ended");
            playNextVideo();
        };
        // videoPlayer.addEventListener('ended', playNextVideo);
    } else {
        // 所有影檔播放完畢，將索引歸零並重新整理播放順序
        videoPlayer.src = '';
        currentVideoIndex = 0;
        currentVideoName = '';
        console.log('> 結束播放');
        log('> 結束播放');
    }
};

$("#playVideo").on('click', function () {
    console.log('開始播放');
    log('> 開始播放');
    playNextVideo();
});

$("#pauseVideo").on('click', function () {
    videoPlayer.pause();
    videoPlayer.src = '';
    currentVideoIndex = 0;
    currentVideoName = '';
    shuffledVideos = shuffleArray(videos.slice());
    console.log('> 結束播放');
    log('> 結束播放');
});

$("#cleanLog").on('click', function () {
    console.log('清除播放狀態(LOG)');
    chromeSamples.clearLog();
});



$("#leftSpeaker").on('click', function () {
    leftSpeaker();
    log('左方聲音');
    videoPlayer.src = 'video/L_500.mp4';
    videoPlayer.play();
    onendedVideo();
});
$("#rightSpeaker").on('click', function () {
    rightSpeaker();
    log('右方聲音');
    videoPlayer.src = 'video/R_500.mp4';
    videoPlayer.play();
    onendedVideo();
});
$("#upSpeaker").on('click', function () {
    upSpeaker();
    log('上方聲音');
    videoPlayer.src = 'video/U_500.mp4';
    videoPlayer.play();
    onendedVideo();
});
$("#downSpeaker").on('click', function () {
    downSpeaker();
    log('下方聲音');
    videoPlayer.src = 'video/D_500.mp4';
    videoPlayer.play();
    onendedVideo();
});

function onendedVideo(string) {
    let oneVideo = document.getElementById("videoPlayer");
    oneVideo.onended = function () {
        log('END');
    };
}


