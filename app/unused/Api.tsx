/* import { Client, QueryResult } from "pg";
import { Item } from "./Item";
import { Slot } from "./Slot";


export interface Api {
	searchForSlot(searchTerm: string): Promise<QueryResult<any>>;
	searchForItem(searchTerm: string): Item[];
	getItem(location: string): Item;
	getSlot(location: string): Slot;
	getItemList(): Item[];
	getSlotList(): Slot[];
}

export class SqliteApi implements Api {
	searchForSlot(searchTerm: string): Promise<QueryResult<any>> {
		throw new Error("Method not implemented.");
	}

	searchForItem(searchTerm: string): Item[] {
		throw new Error("Method not implemented.");
	}
	getItem(location: string): Item {
		throw new Error("Method not implemented.");
	}
	getSlot(location: string): Slot {
		throw new Error("Method not implemented.");
	}

	getItemList(): Item[] {
		throw new Error("Method not implemented.");
	}
	getSlotList(): Slot[] {
		throw new Error("Method not implemented.");
	}

}

export class PostgreApi implements Api {
	client: Client

	
	constructor() {
		this.client = new Client({
			user: 'tbyler',
			host: 'localhost',
			database: 'millertechWarehouseOne',
			password: '',
			port: 5432,
		});
		this.client.connect();
	}

	searchForSlot(searchTerm: string): Promise<QueryResult<any>> {
		const result = this.client.query("SELECT * FROM slots")
		return result
	}
	searchForItem(searchTerm: string): Item[] {
		return []
	}
	getItem(location: string): Item {
		throw new Error("Method not implemented.");
	}
	getSlot(location: string): Slot {
		throw new Error("Method not implemented.");
	}

	getItemList(): Item[] {
		throw new Error("Method not implemented.");
	}
	getSlotList(): Slot[] {
		throw new Error("Method not implemented.");
	}
	
}

export class TestApi implements Api {
	searchForSlot(searchTerm: string): Promise<QueryResult<any>> {
		throw new Error("Method not implemented.");
	}

	searchForItem(searchTerm: string): Item[] {
		throw new Error("Method not implemented.");
	}
	getItem(location: string): Item {
		throw new Error("Method not implemented.");
	}
	getSlot(location: string): Slot {
		throw new Error("Method not implemented.");
	}
	getItemList(): Item[] {
		var items: Item[] = [
			{
				name: "Fortnite",
				primarySlot: "A-8",
				slots: ["A-8", "A-12"],
				quantity: [50, 25],
				description: ""
			},
			{
				name: "Abby",
				primarySlot: "C-16",
				slots: ["C-16, B-18, A-2"],
				quantity: [40, 10, 15],
				description: ""
			}
		]

		return items
	}
	getSlotList(): Slot[] {
		var slots: Slot[] = [
			{
				xPos: 1,
				yPos: 3,
				zPos: 4,
				name: "A-2",
				items: ["1234, 4321"],
			},
			{
				xPos: 2,
				yPos: 3,
				zPos: 2,
				name: "B-4",
				items: ["1234, 4321"],
			}
		]

		return slots
	}
	
} */