// @ts-ignore
export const audioContext = new (window.AudioContext || window.webkitAudioContext)()

export const ctime = audioContext.currentTime
export const destination = audioContext.destination
