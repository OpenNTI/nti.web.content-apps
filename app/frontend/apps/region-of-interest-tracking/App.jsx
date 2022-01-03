import { useCallback, useState } from "react";
import AllOutIcon from "@mui/icons-material/AllOut";

import Select from "./Select";
import Frames from "./Frames";
import {
	NewRegionOverlay,
	RegionOverlay,
	createRegion,
	RegionsRaw,
} from "./Region";

export const path = "roi-tracking";
export const name = "Region of Interest Tracking";
export const description =
	"Track areas of interest as they move through a video";
export const Icon = AllOutIcon;

export function App() {
	const [src, setSrc] = useState();
	const [frame, setFrame] = useState();

	const [regions, setRegions] = useState([]);

	const onNewRegion = useCallback(
		(region) => {
			setRegions([...regions, createRegion(frame, region)]);
		},
		[frame, regions]
	);

	return (
		<div>
			{!src && <Select onSelect={setSrc} />}
			{frame && <div>{frame.id}</div>}
			{src && (
				<Frames src={src} onChange={setFrame}>
					<NewRegionOverlay onNewRegion={onNewRegion} />
					{regions.map((r, key) => (
						<RegionOverlay region={r} frame={frame} key={key} />
					))}
				</Frames>
			)}
			<RegionsRaw regions={regions} />
		</div>
	);
}
