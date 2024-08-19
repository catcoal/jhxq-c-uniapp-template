interface AudioItem {
    src: string;
    isPlaying: boolean;
    context: UniApp.InnerAudioContext | null;
    roles: string;
    location: string;
    content: string;
    scrollText: string;
    scrollPosition: number;
    scrollOffset: number; // 新增
    scrollAnimationFrame: number; // 新增
}