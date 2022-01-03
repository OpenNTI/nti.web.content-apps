import { useCallback, useEffect, useRef, useState, useReducer } from "react";
import styled from "@emotion/styled";
import Draggable from "react-draggable";

import Observable from "../common/Observable";

const ALWAYS_NEW_VALUE = () => Date.now();

const Overlay = styled.div`
	position: absolute;
	inset: 0;
`;

const pointFromEvent = (e) => ({ x: e.clientX, y: e.clientY });
const getRelativePoint = ({ x, y }, container) => {
	const containerRect = container?.getBoundingClientRect();

	return {
		x: x - containerRect.x,
		y: y - containerRect.y,
	};
};

const getBox = (point1, point2) => {
	return {
		x: Math.min(point1.x, point2.x),
		y: Math.min(point1.y, point2.y),
		width: Math.abs(point1.x - point2.x),
		height: Math.abs(point1.y - point2.y),
	};
};

const getBoxStyles = (box) => ({
	position: "absolute",
	border: "2px solid blue",
	top: `${box.y}px`,
	left: `${box.x}px`,
	width: `${box.width}px`,
	height: `${box.height}px`,
});

const getSizeStyles = (box) => ({
	position: "absolute",
	inset: 0,
	border: "2px solid blue",
	width: `${box.width}px`,
	height: `${box.height}px`,
});

export function createRegion(frame, region) {
	return new Observable({
		label: "New Region",
		locations: {
			[frame.timestamp]: {
				frameSize: { width: frame.width, height: frame.height },
				position: { x: region.x, y: region.y },
				size: { width: region.width, height: region.height },
			},
		},
	});
}

function fixPrecision(n) {
	return Math.round((n + Number.EPSILON) * 1000) / 1000;
}

function deserializeRegions(regions) {}

function serializeRegion(region) {
	region = region.getData();

	return {
		label: region.label,
		locations: Object.entries(region.locations).reduce(
			(acc, [timestamp, location]) => {
				const { width: frameWidth, height: frameHeight } =
					location.frameSize;

				const centerX = frameWidth / 2;
				const centerY = frameHeight / 2;

				const xPer = (location.position.x - centerX) / frameWidth;
				const yPer = (location.position.y - centerY) / frameHeight;
				const widthPer = location.size.width / frameWidth;
				const heightPer = location.size.height / frameHeight;

				return [
					...acc,
					{
						timestamp: parseFloat(timestamp, 10),
						points: [
							{ x: fixPrecision(xPer), y: fixPrecision(yPer) },
							{
								x: fixPrecision(xPer + widthPer),
								y: fixPrecision(yPer),
							},
							{
								x: fixPrecision(xPer + widthPer),
								y: fixPrecision(yPer + heightPer),
							},
							{
								x: fixPrecision(xPer),
								y: fixPrecision(yPer + heightPer),
							},
						],
					},
				];
			},
			[]
		),
	};
}

function serializeRegions(regions) {
	return {
		regions: regions.map(serializeRegion),
	};
}

export function NewRegionOverlay({ onNewRegion }) {
	const [target, setTarget] = useState();

	const container = useRef();
	const anchorPoint = useRef();

	const onMouseDown = useCallback((e) => {
		anchorPoint.current = getRelativePoint(
			pointFromEvent(e),
			container.current
		);
	}, []);

	const onMouseUp = useCallback(
		(e) => {
			if (!anchorPoint.current) {
				return;
			}

			onNewRegion?.(
				getBox(
					anchorPoint.current,
					getRelativePoint(pointFromEvent(e), container.current)
				)
			);
			anchorPoint.current = null;
			setTarget(null);
		},
		[onNewRegion]
	);

	const onMouseMove = useCallback((e) => {
		if (!anchorPoint.current) {
			return;
		}

		setTarget(
			getBox(
				anchorPoint.current,
				getRelativePoint(pointFromEvent(e), container.current)
			)
		);
	}, []);

	return (
		<Overlay
			ref={container}
			onMouseDown={onMouseDown}
			onMouseMove={onMouseMove}
			onMouseUp={onMouseUp}
		>
			{target && <div style={getBoxStyles(target)} />}
		</Overlay>
	);
}

export function RegionOverlay({ region, frame }) {
	const data = region.useData();
	const { locations } = data;
	const location = locations[frame.timestamp];

	useEffect(() => {
		//if we have a location we're good to go
		if (location) {
			return;
		}

		//otherwise copy the previous frame's location
		const target = frame.timestamp;
		const timestamps = Object.keys(locations).filter((t) => t < target);
		const closest = timestamps[timestamps.length - 1];

		if (!closest) {
			throw new Error("No frame info for region.");
		}

		region.setData({
			locations: {
				...locations,
				[target]: locations[closest],
			},
		});
	}, [frame, locations, location, region]);

	const onDrag = useCallback(
		(e, { x, y }) => {
			console.log("Updating Location: ", x, y);
			region.setData({
				locations: {
					...locations,
					[frame.timestamp]: {
						...location,
						position: { x, y },
					},
				},
			});
		},
		[region, location, locations, frame]
	);

	if (!location) {
		return null;
	}

	const { position, size } = location;

	return (
		<Draggable
			position={position}
			onDrag={onDrag}
			onStop={onDrag}
			bounds="parent"
		>
			<div style={getSizeStyles(size)} />
		</Draggable>
	);
}

export function RegionsRaw({ regions }) {
	const [, update] = useReducer(ALWAYS_NEW_VALUE);

	useEffect(() => {
		const uns = regions.map((r) => r.subscribe(update));

		return () => uns.forEach((u) => u());
	}, [regions]);

	return <pre>{JSON.stringify(serializeRegions(regions), null, 2)}</pre>;
}

export function RegionListItem({ region, onChange }) {}
