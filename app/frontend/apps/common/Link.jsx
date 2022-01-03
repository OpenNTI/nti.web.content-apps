import LinkUI from "@mui/material/Link";
import { Link as LinkRouter } from "@reach/router";
import styled from "@emotion/styled";

const StyledLink = styled(LinkRouter)`
	color: inherit;
	text-decoration: none;
`;

const Link = ({ to, ...props }) => (
	<StyledLink to={to}>
		<LinkUI as="span" underline="none" {...props} />
	</StyledLink>
);

export default Link;
