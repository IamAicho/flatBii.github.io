//--------------------------------顯示時間-----------------------------------
// const logContainer = document.getElementById("logContainer");
// const logEntry = document.createElement("p");
// logEntry.textContent = currentTime;
// logContainer.appendChild(logEntry);

// 獲取當前時間的函數，返回格式為「HH:MM:SS.SSS」的時間字符串
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}


// 更新時間顯示的函數
function updateTime() {
    const currentTime = getCurrentTime();
    document.getElementById("timeDisplay").textContent = `現在的時間：${currentTime}`;
    setTimeout(updateTime, 1); // Update time every millisecond
}
updateTime(); // Start updating time on page load



//---------------------------BLE 連接 ESP32_JY901------------------------------
// 獲取頁面元素
const connectButton = document.getElementById('connectButton');
const dataDisplayJY901 = document.getElementById('dataDisplayJY901');
const saveButton = document.getElementById('saveButton'); // 添加保存按钮
saveButton.disabled = true;

var servJY901_uuid = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'.toLowerCase();
var charJY901_uuid = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'.toLowerCase();

let bluetoothDevice;
let characteristicJY901;
let receivedData = ''; // 用于存储接收到的数据

// 连接蓝牙设备
document.addEventListener('DOMContentLoaded', function () { // 原生 JavaScript 寫法
    // 在這裡放置你的程式碼，確保它在 DOM 載入完畢後執行
    connectButton.addEventListener('click', async () => {
        try {
            bluetoothDevice = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'ESP32_BLE_JY901' }],
                optionalServices: [servJY901_uuid]
            });
            console.log('Connecting to Bluetooth Device...(JY901)');
            const server = await bluetoothDevice.gatt.connect();
            const service = await server.getPrimaryService(servJY901_uuid);
            characteristicJY901 = await service.getCharacteristic(charJY901_uuid);

            connectButton.disabled = true;
            dataDisplayJY901.innerHTML = '連接成功！等待數據...';
            saveButton.disabled = false;
            console.log('Connected to ESP32_JY901.');

            // 监听特征值变化
            characteristicJY901.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
            await characteristicJY901.startNotifications();
        } catch (error) {
            console.error('Error connecting to ESP32_JY901!!', error);
            dataDisplayJY901.innerHTML = '請再連接一次！';
        }
    });
});



//----------------------------BLE 連接 ESP32_Audio-------------------------------
const scanButton = document.getElementById('scanButton');
const dataDisplayScan = document.getElementById('dataDisplayScan');

var servAudio_uuid = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'.toLowerCase();
var charAudio_uuid = '6e400004-b5a3-f393-e0a9-e50e24dcca9e'.toLowerCase();
let device;
let characteristicAudio;
let valueStr;  // 傳給ESP32_Audio的字串指令

document.addEventListener('DOMContentLoaded', function () {
    // 在這裡放置你的程式碼，確保它在 DOM 載入完畢後執行
    scanButton.addEventListener('click', connectGATT);
    async function connectGATT() {
        try {
            device = await navigator.bluetooth.requestDevice({
                // filters: [{ services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] }]
                // acceptAllDevices: true,
                filters: [{ namePrefix: 'ESP32_BLE_Audio' }],
                optionalServices: [servAudio_uuid]
            });
            console.log('Connecting to Bluetooth Device...(Audio)');
            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(servAudio_uuid);
            characteristicAudio = await service.getCharacteristic(charAudio_uuid);

            scanButton.disabled = true;
            dataDisplayScan.innerHTML = '掃描成功！請先連接投影畫面。';
            console.log('Connected to ESP32_Audio.');
        } catch (error) {
            console.error('Error connecting to ESP32_Audio!!', error);
            dataDisplayScan.innerHTML = '請再掃描一次！';
        }
    }
});



//----------------------------------匯出收到JY901訊號的時間----------------------------------------
// 处理特征值变化事件
function handleCharacteristicValueChanged(event) {
    const value = event.target.value;
    // 解析传感器数据，假设数据为UTF-8编码字符串
    const data = new TextDecoder().decode(value);
    // 取得收到數據的時間
    const currentTime = getCurrentTime();
    // 显示数据
    dataDisplayJY901.innerHTML = `接收到數據：${data}`;
    // 更新接收到的数据
    receivedData += currentTime + ', ' + data + '\n';
}
// 保存数据到txt文件
saveButton.addEventListener('click', () => {
    if (receivedData) {
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



//----------------------------------匯出影檔播放的時間----------------------------------------
document.getElementById('exportButton').addEventListener('click', function () {
    var contentElement = document.getElementById('logContainer');
    var paragraphElements = contentElement.querySelectorAll('p');

    var textContent = "";
    paragraphElements.forEach(function (paragraph) {
        textContent += paragraph.textContent + "\n"; // 換行分隔段落
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
        // For Internet Explorer
        window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        // For modern browsers
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.textContent = '下載匯出的內容';
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
});



//--------------------------------開啟投影--------------------------------------
// 創建一個 PresentationRequest 對象，指定要展示的內容為 ['receiver.html']。
const presentationRequest = new PresentationRequest(['receiver.html']);
// 將這個展示請求設置為在瀏覽器菜單中的 "Cast" 選項的默認展示請求。
navigator.presentation.defaultRequest = presentationRequest;
// 用於存儲展示連接的變數。
let presentationConnection;

/* Availability monitoring */
// 獲取可用的展示設備列表。
presentationRequest.getAvailability()
    .then(availability => {
        // console.log('Available presentation displays: ' + availability.value);
        // 監聽可用性變化事件，當展示設備可用性發生變化時觸發。
        availability.addEventListener('change', function () {
            console.log('> Available presentation displays: ' + availability.value);
        });
    })
    .catch(error => {
        console.log('Presentation availability not supported, ' + error.name + ': ' +
            error.message);
    });

// "start" 按鈕的點擊事件。
document.querySelector('#start').addEventListener('click', function () {
    console.log('Starting presentation request...');
    // 開始展示請求，並在成功時獲取展示連接。
    presentationRequest.start()
        .then(connection => {
            console.log('> Connected to ' + connection.url + ', id: ' + connection.id);
            log('ID: ' + connection.id);
        })
        .catch(error => {
            console.log('> ' + error.name + ': ' + error.message);
            log('Connect failed.');
        });
});
// "connectionavailable" 事件，當有展示連接可用時觸發。
presentationRequest.addEventListener('connectionavailable', function (event) {
    // 存儲可用的展示連接。
    presentationConnection = event.connection;

    // 監聽展示連接的 "message" 事件，當收到消息時觸發。
    presentationConnection.addEventListener('message', function (event) {
        console.log('> ' + event.data);
        log('> ' + event.data);

        // 判斷該播放的聲音方向
        let videoName = event.data;
        if (videoName.includes("LD")) {
            console.log(videoName);
            ldSpeaker();
        } else if (videoName.includes("LU")) {
            console.log(videoName);
            luSpeaker();
        } else if (videoName.includes("RD")) {
            console.log(videoName);
            rdSpeaker();
        } else if (videoName.includes("RU")) {
            console.log(videoName);
            ruSpeaker();
        } else {
            console.log(videoName);
            closeLED();
        }

        const currentTime = getCurrentTime();
        const logContainer = document.getElementById("logContainer");
        const logEntry = document.createElement("p");
        async function ldSpeaker() {
            if (!characteristicAudio) return;
            valueStr = 'LD';
            await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
            console.log('Command sent: ' + valueStr);
            logEntry.textContent = currentTime + ", " + valueStr;
            logContainer.appendChild(logEntry);
        }
        async function luSpeaker() {
            if (!characteristicAudio) return;
            valueStr = 'LU';
            await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
            console.log('Command sent: ' + valueStr);
            logEntry.textContent = currentTime + ", " + valueStr;
            logContainer.appendChild(logEntry);
        }
        async function rdSpeaker() {
            if (!characteristicAudio) return;
            valueStr = 'RD';
            await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
            console.log('Command sent: ' + valueStr);
            logEntry.textContent = currentTime + ", " + valueStr;
            logContainer.appendChild(logEntry);
        }
        async function ruSpeaker() {
            if (!characteristicAudio) return;
            valueStr = 'RU';
            await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
            console.log('Command sent: ' + valueStr);
            logEntry.textContent = currentTime + ", " + valueStr;
            logContainer.appendChild(logEntry);
        }

        async function closeLED() {
            if (!characteristicAudio) return;
            valueStr = 'end';
            await characteristicAudio.writeValue(new TextEncoder().encode(valueStr));
            console.log('Command sent: ' + valueStr);
        }


    });
    // 監聽展示連接的 "close" 事件，當展示連接關閉時觸發。
    presentationConnection.addEventListener('close', function () {
        console.log('> Connection closed.');
        log('> Connection closed. Need to reconnect!!');
    });
    // 監聽展示連接的 "terminate" 事件，當展示連接終止時觸發。
    presentationConnection.addEventListener('terminate', function () {
        console.log('> Connection terminated.');
        log('> Connection terminated.');
    });
});

// "terminate" 按鈕的點擊事件。
document.querySelector('#terminate').addEventListener('click', function () {
    console.log('Terminating connection...');
    presentationConnection.terminate();
});
// "close" 按鈕的點擊事件。
document.querySelector('#close').addEventListener('click', function () {
    console.log('Closing connection...');
    presentationConnection.close();
});
// "reconnect" 按鈕的點擊事件。
document.querySelector('#reconnect').addEventListener('click', () => {
    // 從輸入框獲取要重新連接的展示的 ID。
    const presentationId = document.querySelector('#presentationId').value.trim();

    // 重新連接到指定的展示，並在成功時獲得新的展示連接。
    presentationRequest.reconnect(presentationId)
        .then(connection => {
            console.log('Reconnected to ' + connection.id);
            log('Reconnected to ' + connection.id);
        })
        .catch(error => {
            console.log('Presentation.reconnect() error, ' + error.name + ': ' + error.message);
            log('Reconnect failed. Please enter the ID.');
        });
});

// "playButton" 按鈕的點擊事件。
document.querySelector('#playVideo').addEventListener('click', function () {
    const message = 'playVideo';
    presentationConnection.send(JSON.stringify({ message }));
    console.log('> Sent the message to receiver: ' + message);
    log('> Sent the message to receiver: ' + message);
    console.log('Start playing!!');
    log('Start playing!!');
});

// const playVideoButton = document.getElementById('playVideo');
// playVideoButton.addEventListener('click', () => {
//     const message = 'playVideo';
//     presentationConnection.send(JSON.stringify({ message }));
//     console.log('> Sent the message: ' + message);
//     log('> Sent the message: ' + message);
// });




