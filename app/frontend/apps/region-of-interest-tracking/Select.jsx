import Button from "@mui/material/Button";
import { useCallback } from "react";

export default function Select({ onSelect }) {
	const onClick = useCallback(async () => {
		const { filePaths } = await global.localFileSystem.select();

		if (filePaths[0]) {
			onSelect(filePaths[0]);
		}
	}, [onSelect]);

	return <Button onClick={onClick}>Select a Video</Button>;
}
