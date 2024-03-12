document.addEventListener("DOMContentLoaded", function () {
    const fontLink = document.getElementById('font-link');
    const fontOptions = document.getElementById('font-options');
    const musicDirectory = "music/playlist";

    const audioElement = document.getElementById("backgroundMusic");
    const volumeSlider = document.getElementById("volume-slider");
    const volumeContainer = document.getElementById("volume-container");
    const volumeBar = document.getElementById("volume-bar");
    const siteInfoElement = document.getElementById("site-info");
	
    let isFirstClick = true;
    let previousSong = null;

    fontLink.addEventListener('click', function () {
        if (fontOptions.style.display === 'block') {
            fontOptions.style.display = 'none';
        } else {
            fontOptions.style.display = 'block';
        }
    });

    volumeSlider.addEventListener("input", function () {
        const volume = parseFloat(this.value);
        audioElement.volume = volume;
        updateVolumeBarWidth(volume);
    });

    function updateVolumeBarWidth(volume) {
        if (volumeBar) {
            volumeBar.style.width = `${volume * 100}%`;
        }
    }

    function getRandomSong() {
        return fetch(`${musicDirectory}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch music files. HTTP status ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(data, 'text/html');
                const links = Array.from(htmlDoc.querySelectorAll('a')).map(link => link.getAttribute('href'));
                const musicFiles = links.filter(file => file.endsWith('.mp3') || file.endsWith('.ogg') || file.endsWith('.wav'));

                if (musicFiles.length === 0) {
                    throw new Error('No valid music files found in the directory.');
                }

                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * musicFiles.length);
                } while (randomIndex === previousSong);

                previousSong = randomIndex;
                return musicFiles[randomIndex];
            });
    }

    function playSong(songFile) {
        const titleWithoutExtension = songFile.replace(/\.[^/.]+$/, "");

        audioElement.src = `${musicDirectory}/${songFile}`;

        if (siteInfoElement) {
            const decodedTitle = decodeURIComponent(titleWithoutExtension);
            siteInfoElement.innerHTML = `<em>${decodedTitle}</em>`;
        } else {
            throw new Error('Element with ID "site-info" not found in the document.');
        }

        audioElement.load();
        audioElement.play();
    }

    function playNextRandomSong() {
        getRandomSong()
            .then(songFile => {
                audioElement.volume = 0.1; // Reset volume when playing a new song
                playSong(songFile);
            })
            .catch(error => {
                console.error("Error fetching or processing music files:", error);
            });
    }

    // Play the first random song on user click (only once)
    document.body.addEventListener("click", function () {
        if (isFirstClick) {
            playNextRandomSong();
            isFirstClick = false;
        }
    });

    // Automatically play the next random song when the current one ends
    audioElement.addEventListener("ended", function () {
        playNextRandomSong();
    });
});
