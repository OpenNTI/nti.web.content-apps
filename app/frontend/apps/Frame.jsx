import AppBar from "@mui/material/AppBar";
import AppsIcon from "@mui/icons-material/Apps";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import Link from "./common/Link";

export function Frame({ component: Cmp, active, ...otherProps }) {
	return (
		<>
			<Box sx={{ flexGrow: 1 }}>
				<AppBar position="sticky">
					<Toolbar>
						<Link to="/">
							<IconButton
								size="large"
								edge="start"
								color="inherit"
								sx={{ mr: 0.5 }}
							>
								<AppsIcon />
							</IconButton>
						</Link>
						<Typography
							variant="h6"
							component="div"
							sx={{ flexGrow: 1 }}
						>
							NTI Content Apps
						</Typography>
					</Toolbar>
				</AppBar>
			</Box>
			<Box sx={{ padding: "2rem 1rem" }}>
				<Cmp {...otherProps} />
			</Box>
		</>
	);
}
