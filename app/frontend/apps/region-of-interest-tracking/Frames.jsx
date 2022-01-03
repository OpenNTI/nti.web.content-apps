import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import styled from "@emotion/styled";
import Typography from "@mui/material/Typography";

const Container = styled.div`
	position: relative;
`;

const Mask = styled.div`
	position: absolute;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Overlay = styled.div`
	position: absolute;
	inset: 0;
`;

const Controls = styled.div`
	display: flex;
	gap: 1rem;
	flex-direction: row;
	align-items: center;
	margin-bottom: 2rem;
`;

const Video = styled.video`
	max-width: 100%;
`;

const Frame = styled.canvas`
	max-width: 100%;
`;

function FrameProcessor({ src, setFrames }) {
	const videoRef = useRef();

	const onCanPlay = useCallback(
		(e) => {
			const video = e.target;
			const track = video.captureStream().getVideoTracks()[0];
			const processor = new MediaStreamTrackProcessor(track);
			const reader = processor.readable.getReader();

			let frames = [];

			const readFrame = async () => {
				const { done, value } = await reader.read();

				if (value) {
					const bitmap = await createImageBitmap(value);
					const seconds = value.timestamp * 1e-6;

					frames.push({
						id: frames.length,
						timestamp:
							Math.round((seconds + Number.EPSILON) * 100) / 100,
						width: value.codedWidth,
						height: value.codedHeight,
						bitmap,
					});

					value.close();
				}

				if (!done && !video.ended) {
					readFrame();
				} else {
					setFrames(frames);
				}
			};

			video.play();
			readFrame();
		},
		[src]
	);

	return (
		<Container>
			<Video src={src} ref={videoRef} muted onCanPlay={onCanPlay} />
			<Mask>Processing...</Mask>
		</Container>
	);
}

export default function Frames({ src, onChange, children }) {
	const canvasRef = useRef();

	const [frames, setFrames] = useState();
	const [current, setCurrent] = useState(0);
	const [step, setStepState] = useState(15);
	const frame = frames?.[current];

	const setStep = useCallback(
		(e) => setStepState(parseInt(e.target.value, 10)),
		[setStepState]
	);

	useEffect(() => {
		/**@type HTMLCanvasElement */
		const canvas = canvasRef.current;

		if (!frame || !canvas) {
			return;
		}

		onChange(frame);

		const ctx = canvas.getContext("2d");

		canvas.width = frame.width;
		canvas.height = frame.height;

		ctx.drawImage(frame.bitmap, 0, 0, frame.width, frame.height);
	}, [frame]);

	const previous = useCallback(
		() => setCurrent(Math.max(0, current - step)),
		[current, step]
	);

	const next = useCallback(
		() => setCurrent(Math.min(frames.length - 1, current + step)),
		[current, frames, step]
	);

	if (!frames) {
		return <FrameProcessor src={src} setFrames={setFrames} />;
	}

	return (
		<>
			<Controls>
				<TextField
					inputProps={{
						step: 1,
						type: "number",
						inputMode: "numeric",
						pattern: "[0-9]*",
					}}
					size="small"
					value={step}
					onChange={setStep}
					label="Step"
				/>
				<Button onClick={previous} variant="contained">
					Previous
				</Button>
				<Button onClick={next} variant="contained">
					Next
				</Button>
				<Typography variant="subtitle2">
					Time: {frame?.seconds}s
				</Typography>
			</Controls>
			<Container>
				<Frame ref={canvasRef} />
				<Overlay>{children}</Overlay>
			</Container>
		</>
	);
}
