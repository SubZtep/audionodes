/** @jsx jsx */
import { jsx } from "@emotion/core"
import { Fragment, ChangeEvent } from "react"
import { useDispatch, useSelector } from "react-redux"
import { NodeComponentProps } from "react-flow-renderer"
import useAudioNodeDefs from "../../../hooks/useAudioNodeDefs"
import { selectEditMode } from "../../../features/ux/uxSlice"
import {
  setAnalyser,
  selectAnalyser,
  Analyser,
} from "../../../features/activeSound/activeSoundSlice"
import { FormGrid, H1, DataRow, DataKey, NodeBody } from "./styled"
import HandleOutputs from "./HandleOutputs"
import HandleInputs from "./HandleInputs"

const fftSizes = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768] as const
export type FFTSize = typeof fftSizes[number]

export default ({ id }: NodeComponentProps) => {
  const editMode = useSelector(selectEditMode)
  const defs = useAudioNodeDefs("AnalyserNode")
  const dispatch = useDispatch()
  const analyser: Analyser = useSelector(selectAnalyser)(id) || {
    id,
    fftSize: fftSizes[6],
    color: "#d66853",
    lineWidth: 2,
  }

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
          <FormGrid>
            <label htmlFor={`a1${id}`}>FFT Size</label>
            <select id={`a1${id}`} value={analyser.fftSize} onChange={setFFTSize}>
              {fftSizes.map(fft => (
                <option key={fft} value={fft}>
                  {fft}
                </option>
              ))}
            </select>
            <label htmlFor={`a2{id}`}>Colour</label>
            <input id={`a2${id}`} type="color" value={analyser.color} onChange={setColor} />
            <label htmlFor={`a3${id}`}>Line Width</label>
            <input
              id={`a3${id}`}
              type="number"
              min={1}
              value={analyser.lineWidth}
              onChange={setLineWidth}
            />
          </FormGrid>
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
