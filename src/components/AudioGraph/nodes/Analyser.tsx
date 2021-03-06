/** @jsx jsx */
import { jsx } from "@emotion/core"
import { useDispatch, useSelector } from "react-redux"
import { NodeComponentProps } from "react-flow-renderer"
import { useMemo, useEffect, Fragment, ChangeEvent } from "react"
import { H1, DataRow, DataKey, NodeBody } from "../elems/styled"
import useAudioNodeDefs from "../../../hooks/useAudioNodeDefs"
import { selectEditMode } from "../../../features/ux/uxSlice"
import { Analyser, fftSizes, FFTSize } from "../../../audio.d"
import {
  setAnalyser,
  delAnalyser,
  selectAnalyser,
} from "../../../features/activeSound/activeSoundSlice"
import HandleOutputs from "../elems/HandleOutputs"
import HandleInputs from "../elems/HandleInputs"
import { WidgetRows } from "../../../styled"

export default ({ id, data }: NodeComponentProps) => {
  const basic: Analyser = useMemo(
    () => ({
      id,
      connectIds: data?.connectIds ?? [],
      fftSize: data?.fftSize ?? fftSizes[6],
      color: data?.color ?? "#d66853",
      lineWidth: data?.lineWidth ?? 2,
    }),
    [id, data]
  )
  const editMode = useSelector(selectEditMode)
  const defs = useAudioNodeDefs("AnalyserNode")
  const dispatch = useDispatch()
  const analyser: Analyser = useSelector(selectAnalyser)(id) || basic

  useEffect(() => {
    dispatch(setAnalyser(analyser))
    return () => void dispatch(delAnalyser(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setFFTSize = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setAnalyser({ ...analyser, fftSize: +event.currentTarget.value as FFTSize }))
  }

  const setColor = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setAnalyser({ ...analyser, color: event.currentTarget.value }))
  }

  const setLineWidth = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setAnalyser({ ...analyser, lineWidth: event.currentTarget.valueAsNumber }))
  }

  return (
    <Fragment>
      <HandleInputs numberOfInputs={defs.numberOfInputs} />
      <H1>Analyser #{id}</H1>

      <NodeBody>
        {editMode ? (
          <WidgetRows>
            <div>
              <label htmlFor={`a1${id}`} css={{ flexGrow: 1 }}>
                FFT Size
              </label>
              <select id={`a1${id}`} value={analyser.fftSize} onChange={setFFTSize}>
                {fftSizes.map(fft => (
                  <option key={fft} value={fft}>
                    {fft}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`a2{id}`} css={{ flexGrow: 1 }}>
                Colour
              </label>
              <input id={`a2${id}`} type="color" value={analyser.color} onChange={setColor} />
            </div>
            <div>
              <label htmlFor={`a3${id}`} css={{ flexGrow: 1 }}>
                Line Width
              </label>
              <input
                id={`a3${id}`}
                type="range"
                min={1}
                max={50}
                value={analyser.lineWidth}
                onChange={setLineWidth}
              />
            </div>
          </WidgetRows>
        ) : (
          <Fragment>
            <DataRow>
              <DataKey>FFT Size:</DataKey> {analyser.fftSize}
            </DataRow>
            <DataRow>
              <DataKey>Line:</DataKey>
              <div
                css={{ height: analyser.lineWidth, backgroundColor: analyser.color, width: "100%" }}
              ></div>
            </DataRow>
          </Fragment>
        )}
      </NodeBody>

      <HandleOutputs numberOfOutputs={defs.numberOfOutputs} />
    </Fragment>
  )
}
