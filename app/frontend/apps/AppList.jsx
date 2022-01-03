import styled from "@emotion/styled";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import Link from "./common/Link";

export function AppList({ apps }) {
	return (
		<div>
			{apps.map((app, key) => (
				<Card
					key={key}
					style={{ background: "white" }}
					raised
					elevation={3}
				>
					<Link to={app.path}>
						<CardContent>{app.name}</CardContent>
					</Link>
				</Card>
			))}
		</div>
	);
}
