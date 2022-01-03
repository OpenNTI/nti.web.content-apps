import {
	createMemorySource,
	createHistory,
	LocationProvider,
	Router,
} from "@reach/router";

import { Frame } from "./Frame";
import { AppList } from "./AppList";
import { NTThemeProvider } from "./Theme";
import * as ROITracking from "./region-of-interest-tracking/App";

const source = createMemorySource();
const history = createHistory(source);

const Apps = [ROITracking];

export function Root() {
	return (
		<NTThemeProvider>
			<LocationProvider history={history}>
				<Router>
					<Frame
						path={ROITracking.path}
						active={ROITracking}
						component={ROITracking.App}
					/>
					<Frame path="/" component={AppList} apps={Apps} />
				</Router>
			</LocationProvider>
		</NTThemeProvider>
	);
}
