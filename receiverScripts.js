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
    setTimeout(updateTime, 1); // Update time every millisecond
}
updateTime(); // Start updating time on page load



//----------------------------當成功連接到控制方的連結---------------------------------
// 初始化連接和消息的計數器。
let connectionIdx = 0;
let messageIdx = 0;

// 函式：添加一個新的展示連接。
function addConnection(connection) {
    // 為連接分配唯一的連接ID。
    connection.connectionId = ++connectionIdx;
    // 添加一條新連接的消息到列表中。
    // addMessage('New connection #' + connectionIdx);

    // 監聽連接的 "message" 事件，當收到消息時觸發。
    connection.addEventListener('message', function (event) {
        messageIdx++;
        // 解析收到的 JSON 格式的消息。
        const data = JSON.parse(event.data);
        // 構造要添加到列表的信息。
        // const logString = 'Message ' + messageIdx + ' from connection #' + connection.connectionId + ': ' + data.message;
        // 添加消息到列表中，如果提供了語言，則也指定語言。
        // addMessage(logString, data.lang);


        if (data.message === 'playVideo') { // 收到播放指令
            // 向連接發送回覆消息。

            //-------------------------隨機播放影片-------------------------------
            // 取得影片播放器和播放按鈕的 DOM 元素
            var videoPlayer = document.getElementById('videoPlayer');
            var playButton = document.getElementById('playVideo');
            // 取得重整按鈕的 DOM 元素
            var refreshButton = document.getElementById('refreshButton');
            // 影片檔案的路徑
            var videos = [
                'video/LD1.mp4',
                'video/LU1.mp4',
                'video/RD1.mp4',
                'video/RU1.mp4',
                'video/LD2.mp4',
                'video/LU2.mp4',
                'video/RD2.mp4',
                'video/RU2.mp4',
                'video/LD3.mp4',
                'video/LU3.mp4',
                'video/RD3.mp4',
                'video/RU3.mp4'
            ];
            // 記錄當前播放的影片索引
            var currentVideoIndex = 0;
            // 記錄當前播放的聲音方向
            var currentVideoName = '';
            // 複製一份影片路徑陣列，用於每次隨機播放
            var shuffledVideos = shuffleArray(videos.slice());

            // 隨機排序陣列的函式
            function shuffleArray(array) {
                var currentIndex = array.length, randomIndex, temporaryValue;

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
            }

            if (currentVideoIndex < shuffledVideos.length) {
                // 將播放器的影片路徑設定為隨機排序後的路徑
                videoPlayer.src = shuffledVideos[currentVideoIndex];
                console.log('START.');
                console.log('No.' + (currentVideoIndex + 1) + ': ' + shuffledVideos[currentVideoIndex]);
                // 判斷該播放的聲音方向
                let videoName = shuffledVideos[currentVideoIndex];
                if (videoName.includes("LD")) {
                    currentVideoName = 'LD';
                    console.log(currentVideoName);
                } else if (videoName.includes("LU")) {
                    currentVideoName = 'LU';
                    console.log(currentVideoName);
                } else if (videoName.includes("RD")) {
                    currentVideoName = 'RD';
                    console.log(currentVideoName);
                } else if (videoName.includes("RU")) {
                    currentVideoName = 'RU';
                    console.log(currentVideoName);
                }
                videoPlayer.load();
                connection.send('Played: ' + currentVideoName);
                videoPlayer.play();
            }

            // 影片播放結束事件
            videoPlayer.addEventListener('ended', playNextVideo);

            // 播放下一個影檔
            function playNextVideo() {
                currentVideoIndex++;
                // 如果還有影片待播放
                if (currentVideoIndex < shuffledVideos.length) {
                    videoPlayer.src = shuffledVideos[currentVideoIndex];
                    console.log('No.' + (currentVideoIndex + 1) + ': ' + shuffledVideos[currentVideoIndex]);
                    // 判斷該播放的聲音方向
                    let videoName = shuffledVideos[currentVideoIndex];
                    if (videoName.includes("LD")) {
                        currentVideoName = 'LD';
                        console.log(currentVideoName);
                    } else if (videoName.includes("LU")) {
                        currentVideoName = 'LU';
                        console.log(currentVideoName);
                    } else if (videoName.includes("RD")) {
                        currentVideoName = 'RD';
                        console.log(currentVideoName);
                    } else if (videoName.includes("RU")) {
                        currentVideoName = 'RU';
                        console.log(currentVideoName);
                    }
                    videoPlayer.load();
                    connection.send('Played: ' + currentVideoName);
                    videoPlayer.play();
                } else {
                    // 所有影檔播放完畢，將索引歸零並重新整理播放順序
                    connection.send('Stop playing!!');
                    currentVideoIndex = 0;
                    currentVideoName = '';
                    shuffledVideos = shuffleArray(videos.slice());
                    console.log('END.')
                }
            }

        }
    });

    // 監聽連接的 "close" 事件，當連接關閉時觸發。
    connection.addEventListener('close', function (event) {
        // 添加關閉連接的消息。
        // addMessage('Connection #' + connection.connectionId + ' closed, reason = ' + event.reason);
    });
};

// 函式：將消息添加到消息列表。
// function addMessage(content, language) {
//     // 創建一個列表項元素。
//     const listItem = document.createElement("li");
//     // 如果提供了語言，則設定該語言。
//     if (language) {
//         listItem.lang = language;
//     }
//     // 將內容設置為列表項的文本內容。
//     listItem.textContent = content;
//     // 將列表項添加到消息列表中。
//     document.querySelector("#message-list").appendChild(listItem);
// };


// 監聽 DOMContentLoaded 事件，在文檔加載完成後執行初始化。
document.addEventListener('DOMContentLoaded', function () {
    // 檢查是否支援展示接收功能。
    if (navigator.presentation.receiver) {
        // 獲取展示連接列表。
        navigator.presentation.receiver.connectionList.then(list => {
            // 將現有的連接添加到列表中。
            list.connections.map(connection => addConnection(connection));
            // 監聽連接可用事件，當有新的連接可用時觸發。
            list.addEventListener('connectionavailable', function (event) {
                // 添加新的連接到列表中。
                addConnection(event.connection);
            });
        });
    }
});





