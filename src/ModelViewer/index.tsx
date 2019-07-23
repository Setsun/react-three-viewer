import * as React from 'react';
import { useRef } from 'react';
import { Canvas, useThree, useRender, extend } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import PlayCircle from 'react-feather/dist/icons/play-circle';
import PauseCircle from 'react-feather/dist/icons/pause-circle';
import PlusCircle from 'react-feather/dist/icons/plus-circle';
import MinusCircle from 'react-feather/dist/icons/minus-circle';
import Repeat from 'react-feather/dist/icons/repeat';

import BaseModelViewer from '../base';

extend({ OrbitControls });

type Props = {
  src: string;
  type: 'gtlf' | 'obj' | 'fbx' | 'collada';
  aspect?: [number, number];
};

const BaseButton = ({ children, ...rest }: any) => (
  <button
    style={{ background: 'none', border: 'none', margin: 0, display: 'flex' }}
    {...rest}
  >
    {children}
  </button>
);

const ProgressBar = ({ progress, style, ...rest }) => (
  <progress
    max={100}
    value={progress}
    style={{ display: 'block', ...style }}
    {...rest}
  />
);

function CameraControls(props) {
  const controls = useRef();
  const { camera } = useThree();

  useRender(() => {
    controls.current && controls.current.update();
  }, false);

  return <orbitControls ref={controls} args={[camera]} {...props} />;
}

const SeekButton = ({ progress }) => (
  <button
    style={{
      position: 'absolute',
      left: `calc(${progress}% - 4px)`,
      height: '100%',
      border: 'none',
      borderRadius: '3px',
      padding: 0,
      margin: 0,
      width: '8px',
      cursor: 'pointer',
    }}
  />
);

const PlayButton = ({ isPlaying, play, pause }) => (
  <BaseButton onClick={isPlaying ? pause : play}>
    {isPlaying ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
  </BaseButton>
);

const SpeedControls = ({ timeScale, setTimeScale }) => (
  <>
    <BaseButton
      onClick={() => {
        setTimeScale(Math.max(0.25, timeScale - 0.25));
      }}
    >
      <MinusCircle size={16} />
    </BaseButton>

    <BaseButton
      onClick={() => {
        setTimeScale(Math.min(5, timeScale + 0.25));
      }}
    >
      <PlusCircle size={16} />
    </BaseButton>
  </>
);

const LoopControls = ({ loopMode, setLoopMode }) => (
  <BaseButton>
    <Repeat size={16} />
  </BaseButton>
);

const ControlBar = ({
  progress,
  timeScale,
  loopMode,
  isPlaying,
  play,
  pause,
  seek,
  setTimeScale,
  setLoopMode,
}) => (
  <div style={{ display: 'flex', width: '100%' }}>
    <PlayButton play={play} pause={pause} isPlaying={isPlaying} />

    <SpeedControls timeScale={timeScale} setTimeScale={setTimeScale} />

    {/* <LoopControls loopMode={loopMode} setLoopMode={setLoopMode} /> */}

    <div style={{ position: 'relative', width: '100%', display: 'flex' }}>
      <ProgressBar
        progress={progress}
        style={{ width: '100%', cursor: 'pointer' }}
        onClick={e => {
          const left = e.currentTarget.getBoundingClientRect().left;
          const width = e.currentTarget.offsetWidth;
          const mouseX = e.clientX;
          const percent = ((mouseX - left) / width) * 100;

          seek(percent);
        }}
      />

      <SeekButton progress={progress} />
    </div>
  </div>
);

const ModelViewer = ({ src, type, aspect, ...rest }: Props) => (
  <BaseModelViewer src={src} type={type}>
    {({
      model,
      modelCenter,
      modelProgress,
      modelError,
      isPlaying,
      loopMode,
      timeScale,
      animationProgress,
      play,
      pause,
      seek,
      setLoopMode,
      setTimeScale,
      setClipAction,
    }) => (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {modelProgress < 100 && !modelError && (
          <ProgressBar
            progress={modelProgress}
            style={{ position: 'absolute' }}
          />
        )}

        <div
          style={{
            position: 'relative',
            paddingBottom: `${(aspect[1] / aspect[0]) * 100}%`,
            width: '100%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <Canvas {...rest}>
              <CameraControls
                camera={modelCenter}
                enableDamping
                enablePan
                dampingFactor={0.1}
                rotateSpeed={0.1}
                maxPolarAngle={Math.PI / 2}
              />

              <ambientLight intensity={0.5} />
              <spotLight intensity={0.8} position={[250, 250, -250]} />
              <spotLight intensity={0.8} position={[250, 250, 250]} />
              <spotLight intensity={0.8} position={[-250, 250, 250]} />

              {model && <primitive object={model.scene || model} />}
            </Canvas>
          </div>
        </div>

        <ControlBar
          progress={animationProgress}
          loopMode={loopMode}
          timeScale={timeScale}
          isPlaying={isPlaying}
          play={play}
          pause={pause}
          seek={seek}
          setTimeScale={setTimeScale}
          setLoopMode={setLoopMode}
        />
      </div>
    )}
  </BaseModelViewer>
);

ModelViewer.defaultProps = {
  aspect: [16, 9],
};

export default ModelViewer;