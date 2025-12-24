export async function extractFramesFromVideo(videoFile: File, intervalSeconds: number = 2, maxFrames: number = 10): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const frames: string[] = [];
        const videoUrl = URL.createObjectURL(videoFile);

        video.src = videoUrl;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";

        video.onloadedmetadata = async () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const duration = video.duration;

            // Calculate timestamps
            let currentTime = 0;
            const timestamps: number[] = [];
            while (currentTime < duration && timestamps.length < maxFrames) {
                timestamps.push(currentTime);
                currentTime += intervalSeconds;
            }
            // Always include a frame near the end if not covered, to catch end-cards
            if (duration > 1 && timestamps[timestamps.length - 1] < duration - 1) {
                timestamps.push(duration - 0.5);
            }

            const captureFrame = async (time: number) => {
                return new Promise<void>((res) => {
                    const onSeek = () => {
                        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                        // Convert to base64 JPEG with quality 0.6 to save size
                        const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
                        frames.push(dataUrl.split(",")[1]); // Remove 'data:image/jpeg;base64,' prefix
                        video.removeEventListener("seeked", onSeek);
                        res();
                    };
                    video.addEventListener("seeked", onSeek);
                    video.currentTime = time;
                });
            };

            // Process sequentially
            for (const time of timestamps) {
                await captureFrame(time);
            }

            URL.revokeObjectURL(videoUrl);
            resolve(frames);
        };

        video.onerror = (e) => {
            URL.revokeObjectURL(videoUrl);
            reject(e);
        };
    });
}
