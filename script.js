// 更新時間顯示的函數
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    $("#displayTime").text(`現在的時間：${hours}:${minutes}:${seconds}.${milliseconds}`);
    setTimeout(updateTime, 1); // Update time every millisecond
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}
// Start updating time on page load
$(function () {
    updateTime();
});


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



//--------------------------------開啟投影--------------------------------------
// 創建一個 PresentationRequest 對象，指定要投影的內容為 ['presentation.html']。
const presentationRequest = new PresentationRequest(['presentation.html']);
// 將這個投影請求設置為在瀏覽器菜單中的 "Cast" 選項的默認投影請求。
navigator.presentation.defaultRequest = presentationRequest;
// 用於存儲投影連接的變數。
let presentationConnection;

// 獲取可用的投影設備列表。
presentationRequest.getAvailability()
    .then(availability => {
        // 當投影設備可用性發生變化時觸發。
        availability.addEventListener('change', function () {
            console.log('> 可支援投影： ' + availability.value);
        });
    })
    .catch(error => {
        $("#displayState_Audio").text('掃描成功！可以連接投影畫面了。');
        console.log('> 不支援投影，' + error.name + ': ' + error.message);
        log('> 不支援投影');
    });

// 點擊按鈕, 開啟投影畫面
$("#start").on('click', function () {
    $("#displayState_Presentate").text('開啟投影中...');
    console.log('開啟投影畫面中...');
    presentationRequest.start()
        .then(connection => {
            $("#displayState_Presentate").text('投影成功！');
            console.log('> 已連接到' + connection.url + ', ID: ' + connection.id);
            log('> 已連接到投影畫面，可以開始播放了！');
        })
        .catch(error => {
            $("#displayState_Presentate").text('投影失敗，請在開啟一次！');
            console.error('開啟失敗！' + error.message);
            console.log('> 開啟失敗！' + error.message);
        });
});

let num = 0;
// 定義收到上下左右訊息的函式
async function downSpeaker() {
    let currentTime = updateTime();
    if (!characteristicAudio) return;
    valueStr = 'DOWN';
    console.log('> 傳送給ESP32_Audio: ' + valueStr);
    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));

    $("#videoNameContainer").append($("<p>").text(num + ', ' + currentTime + ', ' + valueStr));
}
async function leftSpeaker() {
    let currentTime = updateTime();
    if (!characteristicAudio) return;
    valueStr = 'LEFT';
    console.log('> 傳送給ESP32_Audio: ' + valueStr);
    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));

    $("#videoNameContainer").append($("<p>").text(num + ', ' + currentTime + ', ' + valueStr));
}
async function rightSpeaker() {
    let currentTime = updateTime();
    if (!characteristicAudio) return;
    valueStr = 'RIGHT';
    console.log('> 傳送給ESP32_Audio: ' + valueStr);
    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));

    $("#videoNameContainer").append($("<p>").text(num + ', ' + currentTime + ', ' + valueStr));
}
async function upSpeaker() {
    let currentTime = updateTime();
    if (!characteristicAudio) return;
    valueStr = 'UP';
    console.log('> 傳送給ESP32_Audio: ' + valueStr);
    await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));

    $("#videoNameContainer").append($("<p>").text(num + ', ' + currentTime + ', ' + valueStr));
}

//當成功連接投影後，執行此函式
presentationRequest.addEventListener('connectionavailable', function (event) {

    // 存儲可用的投影連接。
    presentationConnection = event.connection;
    // 監聽投影連接的 "message" 事件，當收到消息時觸發。
    presentationConnection.addEventListener('message', function (event) {
        // console.log('收到後, 回傳的字串: ' + event.data);

        // 判斷傳來的 message (播放的聲音方向)
        let sentMessage = event.data;
        if (sentMessage.includes("DOWN")) {
            downSpeaker();
            num++;
            console.log('> ' + num + '.聲源:下方');
            log('> ' + num + '.聲源:下方');
            videoPlayer.src = 'video/D_500.mp4';
            videoPlayer.play();
        } else if (sentMessage.includes("LEFT")) {
            leftSpeaker();
            num++;
            console.log('> ' + num + '.聲源:左方');
            log('> ' + num + '.聲源:左方');
            videoPlayer.src = 'video/L_500.mp4';
            videoPlayer.play();
        } else if (sentMessage.includes("RIGHT")) {
            rightSpeaker();
            num++;
            console.log('> ' + num + '.聲源:右方');
            log('> ' + num + '.聲源:右方');
            videoPlayer.src = 'video/R_500.mp4';
            videoPlayer.play();
        } else if (sentMessage.includes("UP")) {
            upSpeaker();
            num++;
            console.log('> ' + num + '.聲源:上方');
            log('> ' + num + '.聲源:上方');
            videoPlayer.src = 'video/U_500.mp4';
            videoPlayer.play();
        } else if (sentMessage.includes("Stop")) {
            presentationConnection.terminate();
            log('> ' + sentMessage);
        } else {
            console.log('> ' + sentMessage);
            log('> ' + sentMessage);
        }

    });
    // 監聽投影連接的 "terminate" 事件，當關閉投影時觸發。
    presentationConnection.addEventListener('terminate', function () {
        $("#displayState_Presentate").text('已關閉投影畫面。');
        console.log('> 已關閉投影畫面。');
        log('> 已關閉投影畫面。');
        videoPlayer.pause();
        videoPlayer.src = '';
    });

});

// 點擊按鈕, 關閉投影畫面
$("#terminate").on('click', function () {
    presentationConnection.terminate();
    $("#displayState_Presentate").text('關閉投影畫面中...');
    console.log('關閉投影畫面中...');
});



// 點擊按鈕, 開始測試
$("#playVideo").on('click', function () {
    const message = 'playVideo';
    // 傳字串指令到投影頁面
    presentationConnection.send(JSON.stringify({ message }));
    console.log('> 傳送給投影頁的字串：' + message);
    // log('> 傳送給投影頁的字串：' + message);
    // console.log('開始測試！');
});

$("#leftSpeaker").on('click', function () {
    const message = 'playVideoL';
    presentationConnection.send(JSON.stringify({ message }));
    console.log('> 傳送給投影頁的字串：' + message);
    leftSpeaker();
    videoPlayer.src = 'video/L_500.mp4';
    videoPlayer.play();
});
$("#rightSpeaker").on('click', function () {
    const message = 'playVideoR';
    presentationConnection.send(JSON.stringify({ message }));
    console.log('> 傳送給投影頁的字串：' + message);
    rightSpeaker();
    videoPlayer.src = 'video/R_500.mp4';
    videoPlayer.play();
});
$("#upSpeaker").on('click', function () {
    const message = 'playVideoU';
    presentationConnection.send(JSON.stringify({ message }));
    console.log('> 傳送給投影頁的字串：' + message);
    upSpeaker();
    videoPlayer.src = 'video/U_500.mp4';
    videoPlayer.play();
});
$("#downSpeaker").on('click', function () {
    const message = 'playVideoD';
    presentationConnection.send(JSON.stringify({ message }));
    console.log('> 傳送給投影頁的字串：' + message);
    downSpeaker();
    videoPlayer.src = 'video/D_500.mp4';
    videoPlayer.play();
});



/*
//----------------------------BLE 連接 ESP32_JY901-------------------------------
let deviceJY901;
var servJY901_uuid = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'.toLowerCase();
var charJY901_uuid = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'.toLowerCase();
let characteristicJY901;

// 存儲接收到的數據
let timeArray = [];
let receivedDataX = [];
let receivedDataY = [];
let receivedDataZ = [];
let i = 0;
let receivedData = '';

$(function () {
    $("#scanJY901").on('click', async function () {
        console.log('尋找 ESP32_BLE_JY901...')
        try {
            deviceJY901 = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'ESP32_BLE_JY901' }],
                optionalServices: [servJY901_uuid]
            });
            $("#displayState_JY901").text('配對中...');
            console.log('連接 ESP32_BLE_JY901 中...');
            const server = await deviceJY901.gatt.connect();
            const service = await server.getPrimaryService(servJY901_uuid);
            characteristicJY901 = await service.getCharacteristic(charJY901_uuid);
            $("#displayState_JY901").text('掃描成功！可以開始播放了。');
            console.log('> 已連接到 ESP32_JY901 。');
            // 監聽特徵值變化
            characteristicJY901.addEventListener('characteristicvaluechanged', function (event) {
                const valueJY901 = event.target.value;
                const currentTime2 = updateTime();
                // 解析感測器數據, 預設數據為UFT-8編碼字符串
                let dataJY901 = new TextDecoder().decode(valueJY901);
                $("#dataJY901").text(dataJY901);

                if (i == 0) {
                    timeArray[i] = i / 20;
                    receivedDataX[i] = dataJY901.split(',')[0];
                    receivedDataY[i] = dataJY901.split(',')[1];
                    receivedDataZ[i] = dataJY901.split(',')[2];
                    i++;
                } else {
                    timeArray[i] = i / 20;
                    receivedDataX[i] = dataJY901.split(',')[0] - receivedDataX[0];
                    receivedDataY[i] = dataJY901.split(',')[1] - receivedDataY[0];
                    receivedDataZ[i] = dataJY901.split(',')[2] - receivedDataZ[0];
                    i++;
                }

                let currentTime = updateTime();
                receivedData += currentTime + ', ' + dataJY901 + '\n';
            });
            await characteristicJY901.startNotifications();
        } catch (error) {
            $("#displayState_JY901").text('連接失敗，請再掃描一次！');
            console.error('連接 ESP32_JY901 失敗!!', error);
            console.log('> 連接 ESP32_JY901 失敗!!', error);
        }
    });

    $("#disconnectJY901").on('click', async function () {
        if (deviceJY901) {
            // 斷開連線
            deviceJY901.gatt.disconnect();
            $("#displayState_JY901").text('已斷開連接！');
            console.log('> 已斷開與 ESP32_JY901 的連線。');
            console.log(timeArray);
            receivedDataX[0] = 0;
            receivedDataY[0] = 0;
            receivedDataZ[0] = 0;
            console.log(receivedDataX);
            console.log(receivedDataY);
            console.log(receivedDataZ);

            plot();
        }
    });

});



function plot() {
    let data = [{
        x: timeArray,
        y: receivedDataX,
        name: 'DataX',
        marker: {
            color: 'red',
        }
    }, {
        x: timeArray,
        y: receivedDataY,
        name: 'DataY',
        marker: {
            color: 'blue'
        }
    }, {
        x: timeArray,
        y: receivedDataZ,
        name: 'DataZ',
        marker: {
            color: 'green'
        }
    }];

    let layout = {
        // title: '加速規訊號圖',
        xaxis: { title: 'time' },
        yaxis: { title: 'angle', range: [-100, 120] },
        margin: { t: 1 }
    };


    Plotly.plot(ploted, data, layout);
}




//---> 匯出收到JY901訊號的時間
$("#exportJY901data").on('click', function () {
    if (receivedData) {
        console.log(receivedData);
        const blob = new Blob([receivedData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // 生成带年月日和时间的文件名
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const fileName = `sensorData_${year}${month}${day}_${hours}${minutes}.txt`;

        a.download = fileName;
        a.click();
        //   a.download = 'sensor_data.txt';
        //   a.click();
    } else {
        alert('尚未接收到數據。');
    }
});
*/


//---> 匯出影檔播放的時間
$("#exportAudioName").on('click', function () {
    let contentElement = $('#videoNameContainer');
    let paragraphElements = contentElement.find('p');
    let textContent = "";
    paragraphElements.each(function () {
        textContent += $(this).text() + "\n"; // 換行分隔段落
    });

    // 生成带年月日和时间的文件名
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    var blob = new Blob([textContent], { type: 'text/plain' });
    const filename = `Audio_playbackTime_${year}${month}${day}_${hours}${minutes}.txt`;

    if (window.navigator.msSaveOrOpenBlob) {
        // For Internet Explorer (使用 Internet Explorer 專用的方法下載檔案)
        window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        // For modern browsers
        // 建立一個 <a> 元素用於下載檔案
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob); // 設定下載 URL
        link.download = filename; // 設定檔名
        link.textContent = '下載匯出的內容'; // 設定顯示文字
        link.style.display = 'none';  // 隱藏 <a> 元素

        // 將 <a> 元素附加到文件主體中
        document.body.appendChild(link);
        // 模擬點擊 <a> 元素來觸發下載
        link.click();

        // 移除 <a> 元素
        document.body.removeChild(link);
        // 釋放 URL 物件
        URL.revokeObjectURL(link.href);
    }

});



