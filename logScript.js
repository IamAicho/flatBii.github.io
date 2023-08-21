var ChromeSamples = {
    log: function () {
        var line = Array.prototype.slice.call(arguments).map(function (argument) {
            return typeof argument === 'string' ? argument : JSON.stringify(argument);
        }).join(' ');

        document.querySelector('#log').textContent += line + '\n';
    },

    clearLog: function () {
        document.querySelector('#log').textContent = '';
    },

    setStatus: function (status) {
        document.querySelector('#status').textContent = status;
    },

    setContent: function (newContent) {
        var content = document.querySelector('#content');
        while (content.hasChildNodes()) {
            content.removeChild(content.lastChild);
        }
        content.appendChild(newContent);
    }
};

log = ChromeSamples.log;

// Add a global error event listener early on in the page load, to help ensure that browsers
// which don't support specific functionality still end up displaying a meaningful message.
window.addEventListener('error', function (error) {
    if (ChromeSamples && ChromeSamples.setStatus) {
        console.error(error);
        ChromeSamples.setStatus(error.message + ' (Your browser may not support this feature.)');
        error.preventDefault();
    }
});