import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit"
import activeSoundSlice from "./features/activeSound/activeSoundSlice"
import setupAudioMiddleware from "./scripts/setupAudioMiddleware"
import soundsSlice from "./features/sounds/soundsSlice"
import uxSlice from "./features/ux/uxSlice"

const store = configureStore({
  reducer: {
    activeSound: activeSoundSlice,
    sounds: soundsSlice,
    ux: uxSlice,
  },
  middleware: [...getDefaultMiddleware(), setupAudioMiddleware],
})

export default store
export type RootState = ReturnType<typeof store.getState>
