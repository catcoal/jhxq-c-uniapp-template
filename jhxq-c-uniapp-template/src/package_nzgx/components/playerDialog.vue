<script setup lang='ts'>
import { setPageOverflow } from '@/utils/uniUtils';
import audioplay from '@/package_nzgx/pages/player/components/audioplay.vue';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useMemberStore } from '@/package_nzgx/stores'
import { useWebSocketStore } from '@/package_nzgx/stores'
import { allClues } from '@/package_nzgx/services/clues';
const memberStore = useMemberStore()
const webSocketStore = useWebSocketStore();
import type { DmDialog } from '@/package_nzgx/types/dialog'
import { onShow } from '@dcloudio/uni-app';
const props = defineProps<{ dialogObj: DmDialog, userInfo: Object }>()
const emit = defineEmits(["update:show", "confirm", "cancel", "page"]);
const jump = (url: string) => {
    emit('page', url);
}
const userName = ref('')
watch(() => props, (value) => {
    setPageOverflow(value ? 'hidden' : 'auto');
})

onUnmounted(() => {
    setPageOverflow('auto');
})
const updateInfo = (info: any) => {
    webSocketStore.gameSend(
        info
    )
}
const userIndex = computed(() => memberStore.virtualRoleId - 1)
const changeTeamName = () => {
    if (userName.value === '') return
    const newInfo = memberStore.info
    newInfo.characters[userIndex.value].user = userName.value
    webSocketStore.updateInfo(userName.value, memberStore.info.characters[memberStore.virtualRoleId - 1].playerAvatar)
    updateInfo(newInfo)
}
const close = () => {
    emit('update:show', false);
    emit('cancel');
}
const updateClues = () => {
    const newInfo = memberStore.info
    newInfo.characters[userIndex.value].cueset.clues.forEach(element => {
        element.isNew = false
        element.type = 0
    });
    updateInfo(newInfo)
}
const confirm = () => {
    emit('confirm', { type: props.dialogObj.type, content: '' });

    if (props.dialogObj.type === 'changeTeamName') {
        changeTeamName()
    }
    if (props.dialogObj.type === 'getClues') {
        updateClues()
        jump('CueSet')
    }
    if (props.dialogObj.type === 'newTask') {
        const newInfo = memberStore.info
        newInfo.characters[userIndex.value].mask.slice(-1)[0].isNew = false
        updateInfo(newInfo)
        jump('ZfMap')
    }
    if (props.dialogObj.type === 'newTask2') {
        const newInfo = memberStore.info
        newInfo.characters[userIndex.value].mask.slice(-1)[0].isNew = false
        updateInfo(newInfo)
        // jump('ZfMap')
    }
    if (props.dialogObj.type === 'success') {
        memberStore.info.characters[userIndex.value].cueset.clues.slice(-1)[0].type = 2
        updateInfo(memberStore.info)
    }
    if (props.dialogObj.type === 'error') {
        const newInfo = memberStore.info
        newInfo.characters[userIndex.value].mask.slice(-1)[0].isError = false
        updateInfo(newInfo)
    }
    if (props.dialogObj.type === 'submit') {
        memberStore.info.flow[memberStore.info.teamInfo.flowIndex].inner.find((item: { title: string; }) => item.title === '卦灵').content[props.dialogObj.gltype!].usersSubmit[userIndex.value] = props.dialogObj.glstatus + 1
        updateInfo(memberStore.info)
    }
}
const zstselectIndex = ref<number>()
const zstSelectUser = (index: number) => {
    zstselectIndex.value = index
}
const durationList = {
    clue19: { duration: 15 },
    clue20: { duration: 13 },
    clue38: { duration: 24 },
    clue39: { duration: 8 },
    clue40: { duration: 10 },
    clue41: { duration: 12 },
}
watch(
    () => props.dialogObj.type,
    (value) => {
        if(value === 'voice'){
            audioList.value = [{
            roles: allClues[props.dialogObj.clue!].name,
            location: allClues[props.dialogObj.clue!].content1,
            content: allClues[props.dialogObj.clue!].content2,
            src: allClues[props.dialogObj.clue!].url + '.mp3',
            isPlaying: false,
            context: null,
            isRead: true,
            duration: durationList[props.dialogObj.clue!]?.duration,
            scrollText: allClues[props.dialogObj.clue!].content2,
            scrollPosition: 0,
            scrollOffset: 0,
            scrollAnimationFrame: 0
        }]
        }
    }
)
watch(
    () => props.dialogObj.dialogVisible,
    (value) => {
        if (props.dialogObj.type ==='changeTeamName'){
            userName.value = memberStore.info.characters[memberStore.virtualRoleId - 1].user
        }
    }
)
const audioList = ref()
</script>

<template>
    <view class="dialog-mask" :class="{ show: dialogObj.dialogVisible }" v-if="dialogObj.dialogVisible">
        <view class="dialog-inner">
            <view class="dialog-header">
                <image v-if="!dialogObj.hideCloseIcon" class="close-icon" @tap="close"
                    src="https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/close_icon.png" :mode="'widthFix'" />
            </view>
            <text class="hyshtj font-player-gradient1 dialog-title">{{ dialogObj.title }}</text>
            <view
                v-show="dialogObj.type === '个人线索发放+个人问题' || dialogObj.type === 'getClues' || dialogObj.type === 'success' || dialogObj.type === 'matchResult' || dialogObj.type === 'error' || dialogObj.type === 'submit' || dialogObj.type === 'newReplay' || dialogObj.type === 'changeTeamName'"
                class="dialog-content font-player-gradient1 ">
                {{ dialogObj.content }}
            </view>
            <view v-show="dialogObj.type === 'newTask' || dialogObj.type === 'newTask2'"
                class="dialog-content font-player-gradient1 " style="font-size: 25rpx;line-height: 200%;">
                {{ dialogObj.content }}
                <view>请在获得足够线索后，寻找DM回答</view>
            </view>
            <view v-if="dialogObj.type === 'changeTeamName'">
                <view class="input-box flex-row-center">
                    <input type="text" maxlength="10" style="text-align: center;" v-model="userName">
                </view>
            </view>
            <view class="flex-row-center" style="height: 200rpx;" v-if="dialogObj.type === 'voice'">
                <audioplay :audioList="audioList" :isDialog="true" />
            </view>
            <view class="dialog-control">
                <view @tap="confirm" class="theme-button button">
                    <view class="theme-button-clear"></view>
                    <view class="hyshtj font-player-gradient2"> {{ dialogObj.confirmText || '确认' }}</view>
                </view>
                <!-- <button v-if="dialogObj.showCancel" @tap="close" class="theme-button cancel-button">{{
                    dialogObj.cancelText || '取消'
                }}</button> -->
            </view>
        </view>
    </view>
</template>

<style scoped>
.close-icon {
    width: 70rpx;
    height: 70rpx;
}

.dialog-mask {
    position: fixed;
    z-index: 99999;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40rpx;
    box-sizing: border-box;
    opacity: 0;
    pointer-events: none;
    transition: .3s ease;
    transition-property: opacity;
}

.dialog-mask.show {
    opacity: 1;
    pointer-events: unset;
}

.dialog-mask.show>.dialog-inner {
    transform: translateY(0px);
}

.dialog-inner {
    width: 100%;
    /* max-width: 600rpx; */
    /* background-color: #FFF;
    border-radius: 24px; */
    display: flex;
    align-items: center;
    flex-direction: column;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/player_dialog_bg.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    padding: 40rpx 50rpx 90rpx 50rpx;
    box-sizing: border-box;
    transform: translateY(20px);
    transition: .3s ease;
    transition-property: transform;
}

.dialog-header {
    width: 95%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.dialog-header>text {
    font-size: 34rpx;
    font-weight: bold;
}

.dialog-header>image {
    width: 48rpx;
    min-width: 48rpx;
    height: 48rpx;
}

.dialog-title {
    margin-top: 40rpx;
    font-size: 40rpx;
}

.dialog-content {
    padding: 20rpx 30rpx;
    color: #747474;
    font-size: 28rpx;
    font-weight: 600;
    text-align: center;
}

.dialog-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24rpx;
    margin-top: 40rpx;
}

.theme-button {
    width: 245rpx;
    line-height: 94.5rpx;
    font-size: 28rpx;
    border-radius: 16px;
    font-weight: bold;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/player_dialog_btn1.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
}

.cancel-button {
    background: #D8D8D8;
    color: #FFFFFF;
}

.theme-button-clear {
    position: absolute;
    width: 185rpx;
    height: 95.5rpx;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/player_dialog_btn2.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    filter: brightness(100) contrast(100%) opacity(0.5);
}

.input-box {
    width: 500rpx;
    height: 100rpx;
    background: url('https://applet.cdn.wanjuyuanxian.com/nzgx/static/img/dialog_input_bg.png') no-repeat;
    background-size: 100% 100%;
    background-position: center;
    font-weight: 600;
    color: #842800;
}
</style>
<style>
@import url("@/package_nzgx/static/fonts/stylesheet.css");
@import url("@/package_nzgx/styles/common.css");

.almm {
    font-family: 'Alimama ShuHeiTi';
}

.hyshtj {
    font-family: 'hyshtj';
}
</style>