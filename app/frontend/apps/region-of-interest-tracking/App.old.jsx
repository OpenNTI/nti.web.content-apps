import { useState, useRef, useReducer } from "react";
import AllOutIcon from "@mui/icons-material/AllOut";
import Button from "@mui/material/Button";
import styled from "@emotion/styled";
import objectTracker from "@cloud-annotations/object-tracking";

export const path = "roi-tracking";
export const name = "Region of Interest Tracking";
export const description =
	"Track areas of interest as they move through a video";
export const Icon = AllOutIcon;

const ALWAYS_NEW_VALUE = () => Date.now();

const Container = styled.div`
	position: relative;
`;

const StyledVideo = styled.video`
	width: 100%;
`;

const Box = styled.div`
	position: absolute;
	border: 2px solid blue;
`;

const getBoxStyle = (box) => ({
	position: "absolute",
	border: "2px solid blue",
	top: `${box.y}px`,
	left: `${box.x}px`,
	width: `${box.width}px`,
	height: `${box.height}px`,
});

function useFramesProps(cb) {
	const videoRef = useRef();
	const playing = useRef(false);
	const cbRef = useRef();
	const propsRef = useRef({
		ref: videoRef,

		onPlay: () => {
			playing.current = true;

			const onFrame = () =>
				requestAnimationFrame(() => {
					if (playing.current && cbRef.current) {
						cbRef.current(videoRef.current);
						onFrame();
					}
				});

			onFrame();
		},

		onPause: () => (playing.current = false),
		onEnded: () => (playing.current = false),
		onError: () => (playing.current = false),
	});

	if (cbRef.current !== cb) {
		cbRef.current = cb;
	}

	return propsRef.current;
}

export function App() {
	const [, update] = useReducer(ALWAYS_NEW_VALUE);

	const videoRef = useRef();
	const containerRef = useRef();
	const trackerRef = useRef();

	const getRelativePoint = ({ x, y }) => {
		const containerRect = containerRef.current?.getBoundingClientRect();

		return {
			x: x - containerRect.x,
			y: y - containerRect.y,
		};
	};

	const [target, setTarget] = useState(null);
	const trackedRef = useRef([]);

	const [selected, setSelected] = useState();

	const selectVideo = async (e) => {
		const { filePaths } = await global.localFileSystem.select();

		if (filePaths[0]) {
			setSelected(filePaths[0]);
		}
	};

	const anchorPoint = useRef();
	const getBoxFromAnchor = (focus) => {
		const anchor = anchorPoint.current;

		return {
			x: Math.min(anchor.x, focus.x),
			y: Math.min(anchor.y, focus.y),
			width: Math.abs(focus.x - anchor.x),
			height: Math.abs(focus.y - anchor.y),
		};
	};

	const onMouseDown = (e) => {
		if (trackedRef.current.length > 0) {
			return;
		}

		anchorPoint.current = getRelativePoint({ x: e.clientX, y: e.clientY });
	};

	const onMouseMove = (e) => {
		if (!anchorPoint.current) {
			return;
		}

		setTarget(
			getBoxFromAnchor(getRelativePoint({ x: e.clientX, y: e.clientY }))
		);
	};

	const onMouseUp = (e) => {
		if (!anchorPoint.current) {
			return;
		}

		trackedRef.current = [
			getBoxFromAnchor(getRelativePoint({ x: e.clientX, y: e.clientY })),
		];

		anchorPoint.current = null;
		containerRef.current.querySelector("video")?.play();

		update();
	};

	const frameProps = useFramesProps(async (frame) => {
		const tracked = trackedRef.current;
		console.log("Got Frame!", tracked);

		if (tracked.length === 0) {
			return;
		}
		if (tracked.length === 1 && !trackerRef.current) {
			const initial = tracked[0];

			trackerRef.current = objectTracker.init(frame, [
				initial.x,
				initial.y,
				initial.width,
				initial.height,
			]);
			return;
		}

		const [x, y, width, height] = await trackerRef.current.next(frame);

		trackedRef.current = [...tracked, { x, y, width, height }];
		console.log("Tracked: ", trackedRef.current);

		update();
	});

	const box =
		trackedRef.current.length > 0
			? trackedRef.current[trackedRef.current.length - 1]
			: target;

	return (
		<>
			<Button onClick={selectVideo}>Select Video</Button>
			<br />
			<Container
				ref={containerRef}
				onMouseDown={onMouseDown}
				onMouseMove={onMouseMove}
				onMouseUp={onMouseUp}
			>
				{selected && (
					<StyledVideo
						{...frameProps}
						src={`nti://local-file?path=${selected}`}
						width="1920px"
						height="960px"
					/>
				)}
				{box && <div style={getBoxStyle(box)} />}
			</Container>
		</>
	);
}
