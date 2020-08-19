/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable array-callback-return */
/** @jsx jsx */
import { jsx } from "@emotion/core"
import { toast } from "react-toastify"
import { useRef, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconButton } from "../../styled"
import Widget from "../misc/Widget"
import {
  setBPM,
  setNotesPerBeat,
  setBeatsPerBar,
  setBars,
  refreshSoundNames,
  selectBars,
  selectStepsPerBar,
  selectBPM,
} from "../../features/sounds/soundsSlice"
import { loadSound } from "../../scripts/audio"
import { wavHeader } from "../../scripts/wav"
import { audioContext } from "../../scripts/audio"

export default () => {
  const fileInput = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch()
  const bars = useSelector(selectBars)
  const stepsPerBar = useSelector(selectStepsPerBar) //FIXME: selectNotesPerBeat + selectBeatsPerBar
  const BPM = useSelector(selectBPM)

  const loadSerialized = (readed: string, filename?: string) => {
    localStorage.clear()
    const data = JSON.parse(readed)
    Object.entries(data).forEach(([key, value]) => {
      if (key === "sequencer") {
        dispatch(setBPM((value as any).BPM))
        dispatch(setNotesPerBeat((value as any).notesPerBeat))
        dispatch(setBeatsPerBar((value as any).beatsPerBar))
        dispatch(setBars((value as any).bars))
      } else {
        localStorage.setItem(key, JSON.stringify(value))
      }
    })
    dispatch(refreshSoundNames())
    toast.info(`${filename ?? "File"} loaded`)
  }

  const loadFile = (ev: Event) => {
    // @ts-ignore
    const files: FileList = ev.target.files
    if (files.length === 1) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = () => {
        //TODO: Validation
        loadSerialized(reader.result as string, file.name)
      }
      reader.readAsText(file)
    }
  }

  const loadDefaultSave = async () => {
    const filename = "Synth-1597604407952.json"
    try {
      const res = await fetch(`${window.location.pathname}/samples/${filename}`)
      if (res.ok) {
        loadSerialized(await res.text(), filename)
      }
    } catch (e) {
      toast.error(`${filename} failed to load. ${e}`)
    }
  }

  useEffect(() => {
    fileInput.current!.onchange = loadFile

    if (localStorage.length === 0) {
      loadDefaultSave()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveBlob = (blob: Blob, filename: string) => {
    let url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    document.body.appendChild(a)
    a.style.display = "none"
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
    a.remove()
  }

  const saveFile = (): void => {
    const data: any = {}
    Object.keys(localStorage).map(key => {
      data[key] = JSON.parse(localStorage.getItem(key)!)
    })
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json;charset=utf-8",
      })
      saveBlob(blob, `Synth-${new Date().getTime()}.json`)
    }
  }

  const renderMusic = async () => {
    const offlineCtx = new OfflineAudioContext(
      2,
      audioContext.sampleRate * 30,
      audioContext.sampleRate
    )
    // const offlineCtx = audioContext

    // const stepsPerBar = 16
    const bps = BPM / 60
    const stepsPerBeat = stepsPerBar / 2 // / 4
    let lengthOfStep = bps / stepsPerBeat

    Object.values(bars).forEach(bar => {
      const sound = loadSound(bar.soundName, offlineCtx)
      if (sound !== null) {
        bar.steps.forEach((step, index) => {
          if (step !== null) {
            sound.play(step, lengthOfStep * (index + 1))
          }
        })
      }
    })

    const buffer = await offlineCtx.startRendering()
    saveBlob(
      new Blob([Buffer.from(wavHeader(2, 44_100, 32, buffer.length)), buffer.getChannelData(0)]),
      "lol.wav"
    )
  }

  return (
    <Widget title="File System">
      <div>
        <IconButton onClick={() => fileInput.current!.click()}>
          <FontAwesomeIcon icon={["fad", "folder-open"]} fixedWidth size="lg" />
        </IconButton>
        <IconButton onClick={saveFile} title="Save To File">
          <FontAwesomeIcon icon={["fad", "save"]} fixedWidth size="lg" />
        </IconButton>
        <IconButton onClick={renderMusic}>
          <FontAwesomeIcon icon={["fad", "file-music"]} fixedWidth size="lg" />
        </IconButton>
        <input type="file" ref={fileInput} css={{ display: "none" }} />
      </div>
    </Widget>
  )
}
