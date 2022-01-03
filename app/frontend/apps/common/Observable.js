import EventEmitter from "events";
import { useEffect, useReducer } from "react";

const ALWAYS_NEW_VALUE = () => Date.now();

export default class Observable extends EventEmitter {
	#data = null;

	constructor(data) {
		super();
		this.#data = data;
	}

	getData() {
		return this.#data;
	}

	setData(data) {
		this.#data = { ...this.#data, ...data };
		this.emit("update");
	}

	subscribe(fn) {
		this.addListener("update", fn);

		return () => this.removeListener("update", fn);
	}

	useData() {
		const [, update] = useReducer(ALWAYS_NEW_VALUE);

		useEffect(() => this.subscribe(update));

		return this.getData();
	}
}
