import { ThemeProvider, createTheme } from "@mui/material/styles";

export const ThemeOptions = {
	palette: {
		type: "light",
		primary: {
			main: "#3fb34f",
			contrastText: "#ffebee",
		},
		secondary: {
			main: "#924aff",
		},
		text: {
			primary: "#494949",
			secondary: "#757474",
		},
		error: {
			main: "#750000",
		},
		warning: {
			main: "#fa8700",
		},
		info: {
			main: "#3fb3f6",
		},
		background: {
			default: "rgba(0, 0, 0, 0.3)",
		},
	},
};

const Theme = createTheme(ThemeOptions);

export const NTThemeProvider = (props) => (
	<ThemeProvider theme={Theme} {...props} />
);
